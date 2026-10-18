import { useState } from 'react';
import type { CampaignInputs, MissionType, PartyRole } from '../engine/types';
import {
  PARTY_ROLES,
  POWER_TIERS,
  CITY_SIZES,
  REGIONS,
  CITY_SCOPES,
  TONES,
  ANTAGONIST_FLAVORS,
  MORAL_COMPLEXITIES,
  MISSION_TYPE_OPTIONS,
  OUTLIER_PRESETS,
} from './questions';

interface WizardProps {
  initialInputs: CampaignInputs;
  onGenerate: (inputs: CampaignInputs) => void;
}

const STEPS = ['Party & Power', 'The City', 'Setting & Tone', 'Shape & Extras'];

export default function Wizard({ initialInputs, onGenerate }: WizardProps) {
  const [inputs, setInputs] = useState<CampaignInputs>(initialInputs);
  const [step, setStep] = useState(0);

  function update<K extends keyof CampaignInputs>(key: K, value: CampaignInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRole(role: PartyRole) {
    setInputs((prev) => {
      const has = prev.partyRoles.includes(role);
      const next = has ? prev.partyRoles.filter((r) => r !== role) : [...prev.partyRoles, role];
      return { ...prev, partyRoles: next.length > 0 ? next : [role] };
    });
  }

  function toggleMissionType(type: MissionType) {
    setInputs((prev) => {
      const has = prev.enabledMissionTypes.includes(type);
      const next = has ? prev.enabledMissionTypes.filter((t) => t !== type) : [...prev.enabledMissionTypes, type];
      return { ...prev, enabledMissionTypes: next };
    });
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="wizard">
      <div className="wizard-steps">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`wizard-step-pill${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
            onClick={() => setStep(i)}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="wizard-panel">
        {step === 0 && (
          <section>
            <h2>Party &amp; Power</h2>

            <label className="field-label">Party composition (choose all that apply)</label>
            <div className="chip-grid">
              {PARTY_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`chip${inputs.partyRoles.includes(role) ? ' chip-selected' : ''}`}
                  onClick={() => toggleRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            <label className="field-label" htmlFor="partySize">
              Party size: {inputs.partySize}
            </label>
            <input
              id="partySize"
              type="range"
              min={1}
              max={8}
              value={inputs.partySize}
              onChange={(e) => update('partySize', Number(e.target.value))}
            />

            <label className="field-label">Power / street-cred tier</label>
            <div className="radio-row">
              {POWER_TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  className={`chip${inputs.powerTier === tier ? ' chip-selected' : ''}`}
                  onClick={() => update('powerTier', tier)}
                >
                  {tier}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2>The City</h2>
            <p className="hint">
              Every mission in this campaign shares one generated city and its stakeholders — that shared
              cast is how the hidden connections between jobs actually get built.
            </p>

            <label className="field-label" htmlFor="cityName">
              Home city name (optional — leave blank to generate one)
            </label>
            <input
              id="cityName"
              type="text"
              value={inputs.cityNameOverride}
              onChange={(e) => update('cityNameOverride', e.target.value)}
              placeholder="Leave blank for a generated name"
            />

            <label className="field-label">City size</label>
            <div className="radio-row">
              {CITY_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={`chip${inputs.citySize === size.value ? ' chip-selected' : ''}`}
                  onClick={() => update('citySize', size.value)}
                  title={size.hint}
                >
                  {size.value}
                </button>
              ))}
            </div>

            <label className="field-label">Continent / region</label>
            <div className="radio-row">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  className={`chip${inputs.region === region ? ' chip-selected' : ''}`}
                  onClick={() => update('region', region)}
                >
                  {region}
                </button>
              ))}
            </div>

            <label className="field-label">City scope</label>
            <div className="radio-row">
              {CITY_SCOPES.map((scope) => (
                <button
                  key={scope.value}
                  type="button"
                  className={`chip${inputs.cityScope === scope.value ? ' chip-selected' : ''}`}
                  onClick={() => update('cityScope', scope.value)}
                  title={scope.hint}
                >
                  {scope.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>Setting &amp; Tone</h2>

            <label className="field-label" htmlFor="urbanFrontier">
              Dense sprawl &nbsp;&#8596;&nbsp; wastes / frontier lean
            </label>
            <input
              id="urbanFrontier"
              type="range"
              min={0}
              max={100}
              value={inputs.urbanFrontier}
              onChange={(e) => update('urbanFrontier', Number(e.target.value))}
            />

            <label className="field-label">Campaign tone</label>
            <div className="radio-row">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  className={`chip${inputs.tone === tone ? ' chip-selected' : ''}`}
                  onClick={() => update('tone', tone)}
                >
                  {tone}
                </button>
              ))}
            </div>

            <label className="field-label">Primary antagonist flavor</label>
            <div className="radio-row">
              {ANTAGONIST_FLAVORS.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  className={`chip${inputs.antagonistFlavor === flavor ? ' chip-selected' : ''}`}
                  onClick={() => update('antagonistFlavor', flavor)}
                >
                  {flavor}
                </button>
              ))}
            </div>

            <label className="field-label">Moral complexity</label>
            <div className="radio-row">
              {MORAL_COMPLEXITIES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip${inputs.moralComplexity === m ? ' chip-selected' : ''}`}
                  onClick={() => update('moralComplexity', m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>Shape &amp; Extras</h2>

            <label className="field-label" htmlFor="missionCount">
              Number of missions: {inputs.missionCount}
            </label>
            <input
              id="missionCount"
              type="range"
              min={3}
              max={10}
              value={inputs.missionCount}
              onChange={(e) => update('missionCount', Number(e.target.value))}
            />

            <label className="field-label">Mission types to include</label>
            <div className="chip-grid">
              {MISSION_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`chip${inputs.enabledMissionTypes.includes(type) ? ' chip-selected' : ''}`}
                  onClick={() => toggleMissionType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <label className="field-label">How tightly woven should the campaign be?</label>
            <div className="radio-row">
              {OUTLIER_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`chip${inputs.outlierRatio === preset.value ? ' chip-selected' : ''}`}
                  onClick={() => update('outlierRatio', preset.value)}
                  title={preset.hint}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="field-label toggle-row">
              <input
                type="checkbox"
                checked={inputs.includeNpcs}
                onChange={(e) => update('includeNpcs', e.target.checked)}
              />
              Include NPC stat blocks
            </label>

            {inputs.includeNpcs && (
              <div className="radio-row">
                <button
                  type="button"
                  className={`chip${inputs.npcCrunch === 'quick' ? ' chip-selected' : ''}`}
                  onClick={() => update('npcCrunch', 'quick')}
                >
                  Quick reference
                </button>
                <button
                  type="button"
                  className={`chip${inputs.npcCrunch === 'full' ? ' chip-selected' : ''}`}
                  onClick={() => update('npcCrunch', 'full')}
                >
                  Full Anarchy stat blocks
                </button>
              </div>
            )}

            <label className="field-label" htmlFor="seedPhrase">
              Seed phrase / campaign name (optional)
            </label>
            <input
              id="seedPhrase"
              type="text"
              value={inputs.seedPhrase}
              onChange={(e) => update('seedPhrase', e.target.value)}
              placeholder="Leave blank for a random seed"
            />
          </section>
        )}
      </div>

      <div className="wizard-nav">
        <button type="button" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          Back
        </button>
        {!isLastStep ? (
          <button type="button" className="primary" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
            Next
          </button>
        ) : (
          <button type="button" className="primary" onClick={() => onGenerate(inputs)}>
            Build the campaign
          </button>
        )}
      </div>
    </div>
  );
}
