import type { StakeholderType, MissionType } from '../engine/types';

export const NPC_ROLE_TAGS: Record<StakeholderType, string[]> = {
  'AAA Megacorp': ['Corporate Security Lieutenant', 'Black-ICE-backed Decker', 'Executive Protection Lead', 'Internal Affairs Fixer'],
  'AA Corp': ['Site Security Chief', 'Contracted Merc Captain', 'Research Lockdown Officer'],
  'Local Corp': ['Floor Manager', 'Hired Muscle Foreman', 'Logistics Overseer'],
  'Organized Crime': ['Enforcer Captain', 'Consigliere', 'Debt Collector', 'Underboss'],
  'Street Gang': ['Gang Lieutenant', 'Street Muscle', 'Turf Lookout', 'Gang Fixer'],
  'Government/Authority': ['Watch Sergeant', 'Compliance Inspector', 'Black-Ops Handler'],
  Wildcard: ['Cult Adept', 'Hive Thrall', 'Media Fixer', 'Lodge Initiate'],
};

export const NPC_ROLE_TAGS_GENERIC: Record<MissionType, string[]> = {
  Infiltration: ['Night Security Guard', 'Systems Technician'],
  'Theft/Extraction': ['Vault Custodian', 'Warehouse Foreman'],
  'Wet work': ['Hired Gun', 'Bodyguard'],
  'Smash-and-grab': ['Rent-a-Cop', 'Loading Dock Supervisor'],
  'Deception/Social engineering': ['Receptionist', 'Mid-Level Manager'],
  Sabotage: ['Maintenance Lead', 'Plant Engineer'],
  'Protection/Escort': ['Rival Hit Team Leader', 'Convoy Driver'],
  Reconnaissance: ['Patrol Officer', 'Camera Room Operator'],
  'Data run': ['On-Call Decker', 'Server Room Tech'],
  Rescue: ['Captor', 'Jailer'],
  'Negotiation-gone-wrong': ['Rival Negotiator', 'Hired Backup'],
};

export const NPC_QUICK_LINES = [
  'Bored and underpaid — looking for an excuse to clock out early.',
  'Fiercely loyal to their boss, to a fault.',
  'Secretly skimming from the till and paranoid about being caught.',
  'Treats this like a game; thinks they\'re untouchable.',
  'Just wants to survive the shift and go home.',
  'Has a grudge against the people they work for and might be turned.',
  'By-the-book, impossible to bribe.',
  'Nervous, trigger-happy, and new to the job.',
  'Quietly recording everything, for their own protection.',
  'Would rather talk than fight, if given the chance.',
];

export const MOOK_SQUAD_LABELS = [
  'Security Patrol', 'Gang Crew', 'Corporate Response Team', 'Hired Muscle',
  'Checkpoint Guards', 'Enforcer Squad',
];
