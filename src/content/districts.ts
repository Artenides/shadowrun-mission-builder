import type { MissionType } from '../engine/types';

export interface DistrictTemplate {
  role: string;
  flavorOptions: string[];
  namePrefix: string[];
  nameNoun: string[];
  missionAffinity: MissionType[];
}

export const DISTRICT_TEMPLATES: DistrictTemplate[] = [
  {
    role: 'Corporate core/spire',
    flavorOptions: [
      'Glass towers, private security checkpoints, and extraterritorial law.',
      'A vertical city of boardrooms where the elevators have better security than the street below.',
    ],
    namePrefix: ['High', 'Spire', 'Crystal', 'Tower', 'Zenith', 'Glass'],
    nameNoun: ['Row', 'Heights', 'Plaza', 'District', 'Quarter', 'Reach'],
    missionAffinity: ['Infiltration', 'Data run', 'Deception/Social engineering'],
  },
  {
    role: 'Docks/transit zone',
    flavorOptions: [
      'Cargo cranes, container mazes, and union politics that run deeper than the water.',
      'A customs choke point where everything worth smuggling eventually passes through.',
    ],
    namePrefix: ['Low', 'Salt', 'Iron', 'Rust', 'Grey', 'Tide'],
    nameNoun: ['Docks', 'Wharf', 'Yards', 'Harbor', 'Pier', 'Flats'],
    missionAffinity: ['Smash-and-grab', 'Theft/Extraction', 'Sabotage'],
  },
  {
    role: 'Entertainment strip',
    flavorOptions: [
      'Clubs, fixers, and gossip, with just enough surveillance blind spots to matter.',
      'Neon-soaked nightlife where every bartender is somebody\'s informant.',
    ],
    namePrefix: ['Neon', 'Velvet', 'Silver', 'Midnight', 'Pulse', 'Amber'],
    nameNoun: ['Strip', 'Row', 'Lane', 'Quarter', 'Promenade', 'Circuit'],
    missionAffinity: ['Deception/Social engineering', 'Negotiation-gone-wrong'],
  },
  {
    role: 'The Barrens/Warrens',
    flavorOptions: [
      'Gang turf with minimal authority presence and a lot of unwritten rules.',
      'Collapsed infrastructure and improvised law, held together by whoever\'s strongest this week.',
    ],
    namePrefix: ['The', 'Old', 'Far', 'Lower', 'Outer', 'Broken'],
    nameNoun: ['Barrens', 'Warrens', 'Flats', 'Hollow', 'Sprawl', 'Ruins'],
    missionAffinity: ['Wet work', 'Protection/Escort', 'Rescue'],
  },
  {
    role: 'Underground/Below',
    flavorOptions: [
      'Service tunnels, maglev lines, and old sprawl layers nobody bothered to demolish.',
      'A buried layer of the city, half infrastructure and half rumor, where the Matrix nodes run deep.',
    ],
    namePrefix: ['Under', 'Deep', 'Sub', 'Hollow', 'Dark', 'Low'],
    nameNoun: ['Below', 'Tunnels', 'Undercity', 'Depths', 'Line', 'Conduit'],
    missionAffinity: ['Reconnaissance', 'Data run', 'Wet work'],
  },
  {
    role: 'Mixed-use sprawl',
    flavorOptions: [
      'Residential blocks, markets, and everyday life that the job is about to disrupt.',
      'Ordinary neighborhoods stacked on top of each other, with ordinary people caught in the middle.',
    ],
    namePrefix: ['East', 'West', 'North', 'South', 'Central', 'Old'],
    nameNoun: ['Commons', 'Blocks', 'Market', 'Fields', 'Terrace', 'Grounds'],
    missionAffinity: ['Rescue', 'Protection/Escort', 'Negotiation-gone-wrong'],
  },
];
