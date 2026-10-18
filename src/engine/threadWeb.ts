import { intBetween, pick, pickN, chance, type Rng } from '../rng/seed';
import type { CampaignInputs, CityProfile, MissionPlan, ThreadLink, RevealStage } from './types';

export interface ThreadWebResult {
  plans: MissionPlan[];
  links: ThreadLink[];
}

const LINK_KINDS = ['Shared Stakeholder', 'Recurring NPC', 'Recurring District', 'Rumor Payoff'] as const;

function revealStageFor(posInCluster: number, clusterSize: number): RevealStage {
  if (clusterSize === 1) return 'payoff';
  if (posInCluster === 0) return 'plant';
  if (posInCluster === clusterSize - 1) return 'payoff';
  return 'develop';
}

/**
 * Decides, for every mission slot, whether it's an outlier and — for the
 * connected majority — which hidden sub-plot cluster and stakeholder it
 * belongs to. Built once per campaign, before any mission is worded, so the
 * wording pass can plant/develop/pay off a connection without the mission
 * loop needing to look ahead or behind.
 */
export function buildThreadWeb(inputs: CampaignInputs, city: CityProfile, rng: Rng): ThreadWebResult {
  const n = inputs.missionCount;
  const indices = Array.from({ length: n }, (_, i) => i);

  const maxOutliers = Math.max(0, Math.floor(n / 2) - (n >= 4 ? 1 : 0));
  const outlierCount = Math.min(maxOutliers, Math.round(n * (inputs.outlierRatio / 100) * 0.6));
  const outlierIndices = new Set(pickN(rng, indices, outlierCount));

  const connectedIndices = indices.filter((i) => !outlierIndices.has(i));

  const plans: MissionPlan[] = indices.map((i) => ({
    missionId: `m${i}`,
    isOutlier: outlierIndices.has(i),
    redHerring: outlierIndices.has(i) ? chance(rng, 0.35) : false,
    clusterId: null,
    stakeholderId: null,
    revealStage: null,
  }));

  const links: ThreadLink[] = [];
  if (connectedIndices.length === 0) {
    return { plans, links };
  }

  const clusterCount =
    connectedIndices.length <= 2 ? 1 : intBetween(rng, 1, Math.min(3, Math.ceil(connectedIndices.length / 2)));
  const shuffled = pickN(rng, connectedIndices, connectedIndices.length);
  const clusters: number[][] = Array.from({ length: clusterCount }, () => []);
  shuffled.forEach((idx, i) => clusters[i % clusterCount].push(idx));
  clusters.forEach((c) => c.sort((a, b) => a - b));

  const candidateStakeholders = city.stakeholders.length > 0 ? city.stakeholders : null;

  clusters.forEach((cluster, ci) => {
    if (cluster.length === 0) return;
    const clusterId = `cluster-${ci}`;
    const stakeholder = candidateStakeholders ? pick(rng, candidateStakeholders) : null;

    cluster.forEach((missionIndex, posInCluster) => {
      const plan = plans[missionIndex];
      plan.clusterId = clusterId;
      plan.stakeholderId = stakeholder ? stakeholder.id : null;
      plan.revealStage = revealStageFor(posInCluster, cluster.length);
    });

    links.push({
      id: `link-${ci}`,
      kind: pick(rng, LINK_KINDS),
      missionIds: cluster.map((i) => `m${i}`),
      stakeholderId: stakeholder ? stakeholder.id : null,
    });
  });

  return { plans, links };
}
