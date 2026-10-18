import type { MissionType, Tone } from '../engine/types';

export const MISSION_TYPES: MissionType[] = [
  'Infiltration',
  'Theft/Extraction',
  'Wet work',
  'Smash-and-grab',
  'Deception/Social engineering',
  'Sabotage',
  'Protection/Escort',
  'Reconnaissance',
  'Data run',
  'Rescue',
  'Negotiation-gone-wrong',
];

/** Each phrase assumes a trailing "{location}" clause gets appended by the assembler. */
export const VERB_PHRASES: Record<MissionType, string[]> = {
  Infiltration: [
    'slip past security and reach the heart of',
    'get someone inside, unnoticed, deep into',
    'bypass three layers of access control inside',
  ],
  'Theft/Extraction': [
    'steal {asset} from',
    'quietly walk {asset} out of',
    'lift {asset} without anyone noticing it\'s gone from',
  ],
  'Wet work': [
    'eliminate a target holed up in',
    'make someone disappear, permanently, inside',
    'settle an old debt in blood somewhere in',
  ],
  'Smash-and-grab': [
    'hit fast, grab {asset}, and be gone before backup arrives at',
    'kick the door in on {asset} at',
    'make a loud, deliberate mess getting {asset} out of',
  ],
  'Deception/Social engineering': [
    'con their way past the front desk of',
    'pose as inspectors to get full access to',
    'talk their way into a position of trust inside',
  ],
  Sabotage: [
    'disable {asset} and make it look like an accident at',
    'quietly wreck {asset} buried deep inside',
    'cut the right cable at exactly the wrong time in',
  ],
  'Protection/Escort': [
    'keep a nervous VIP alive on a run through',
    'escort a shipment that everyone seems to want, straight through',
    'babysit someone far too important for their own safety across',
  ],
  Reconnaissance: [
    'case and map the security of',
    'quietly scope out every entrance and camera in',
    'gather intel before anyone else gets a run at',
  ],
  'Data run': [
    'crack a host hidden somewhere inside',
    'pull a data core out of',
    'trace a signal back to its source deep inside',
  ],
  Rescue: [
    'pull someone out of',
    'get a hostage clear of',
    'break someone loose from',
  ],
  'Negotiation-gone-wrong': [
    'sit in on a deal that\'s already going sideways at',
    'play middleman in a trade nobody quite trusts at',
    'babysit a handoff that smells like a setup at',
  ],
};

export const ASSET_WORDS = [
  'a data core', 'a prototype unit', 'a client ledger', 'an evidence locker',
  'a shipment manifest', 'a cultural relic', 'an experimental formula', 'a signed contract',
  'a biometric key', 'a cryptographic seed', 'a cold-storage sample case', 'a set of financial records',
];

export const DEADLINE_CLAUSES = [
  'before the next security shift change',
  'before a scheduled audit catches the gap',
  'before a rival crew gets the same idea',
  'before the target moves it somewhere harder to reach',
  'within the next 36 hours, no exceptions',
  'before the client\'s patience — or cover story — runs out',
];

export const FIXER_DESCRIPTORS = [
  'a nervous independent fixer who won\'t give a real name',
  'a face no one on the team recognizes, claiming to work for someone important',
  'a voice-only contact routed through three layers of anonymizers',
  'an old contact calling in a favor nobody remembers owing',
  'a walk-in client who pays cash and asks no questions in return',
];

export const COMPLICATIONS_GENERAL = [
  'A second crew is already working the same target.',
  'The target has a defense nobody briefed the party on.',
  'A beat cop or rent-a-cop patrol is on a schedule the party doesn\'t know.',
  'The job requires a specialist skill none of the party obviously has.',
  'Comms get jammed or compromised at the worst possible moment.',
  'An innocent bystander ends up in the wrong place at the wrong time.',
  'The extraction route from the plan is suddenly blocked or gone.',
  'Someone on the inside is playing both sides.',
];

export const COMPLICATIONS_BY_TONE: Record<Tone, string[]> = {
  'Gritty noir': [
    'Everyone involved is lying about something, including the client.',
    'The "simple" job turns out to be cleanup for someone else\'s mistake.',
    'An old favor comes due at exactly the wrong moment.',
  ],
  'Pulpy action': [
    'A chase breaks out through a crowded, chaotic space.',
    'Something explodes well ahead of schedule.',
    'Reinforcements arrive faster — and louder — than anyone expected.',
  ],
  'Corporate intrigue': [
    'Two departments of the same corp are quietly working against each other.',
    'A non-disclosure clause makes simply talking about the job dangerous.',
    'The real decision-maker isn\'t the person the party was told to deal with.',
  ],
  'Horror-tinged': [
    'Something in the location isn\'t behaving like it should.',
    'A survivor of a prior incident is still inside, and isn\'t right anymore.',
    'The official explanation for what happened here doesn\'t add up.',
  ],
  'Comedic chaos': [
    'The plan survives contact with reality for about ninety seconds.',
    'A case of mistaken identity spirals completely out of control.',
    'The target turns out to be far more ridiculous than advertised.',
  ],
};

export const TITLE_TEMPLATES: Record<MissionType, string[]> = {
  Infiltration: ['Quiet Access', 'Inside the Walls', 'Past the Gate'],
  'Theft/Extraction': ['Clean Lift', 'Gone By Morning', 'Light Fingers'],
  'Wet work': ['Last Appointment', 'No Witnesses', 'Settling Accounts'],
  'Smash-and-grab': ['Loud and Fast', 'In and Gone', 'Broken Glass'],
  'Deception/Social engineering': ['False Face', 'Borrowed Name', 'The Long Con'],
  Sabotage: ['Quiet Failure', 'Scheduled Malfunction', 'The Weak Link'],
  'Protection/Escort': ['Dead Weight', 'Safe Passage', 'Eyes on the Package'],
  Reconnaissance: ['Eyes Only', 'The Long Look', 'Mapping the Dark'],
  'Data run': ['Ghost in the Host', 'Deep Dive', 'Signal Trace'],
  Rescue: ['Last Exit', 'Breaking the Lock', 'Out of Time'],
  'Negotiation-gone-wrong': ['Bad Faith', 'The Handoff', 'No Good Deal'],
};

export const OUTLIER_NOTES_PURE = [
  'This one doesn\'t connect to anything else in the campaign — a clean break for pacing, or just a change of scenery. Play it straight.',
  'A pure flavor run: good for a session that needs a breather, or a new player\'s first job. No hidden strings.',
];

export const OUTLIER_NOTES_RED_HERRING = [
  'This looks like it should tie into the wider plot. It doesn\'t. Let the party suspect it anyway, then let it go nowhere — that\'s the joke.',
  'Dress this one with a detail that echoes the main thread (a similar logo, a similar name). It\'s a coincidence. Let them doubt that.',
];

export const THREAD_NOTE_PLANT = [
  'Plant the seed here and nothing more: a logo, a name, a frequency, a face in the background. Don\'t call attention to it — the party shouldn\'t clock it as important yet.',
  'Somewhere in this job, drop one small, easy-to-miss detail that will matter later. A receipt. A scheduling conflict. A name overheard on a comm channel.',
  'Hide a single loose thread in the paperwork or the Matrix traffic from this job — nothing a player would think to chase yet.',
  'One NPC here knows more than they let on. They won\'t volunteer it, and the party has no reason yet to ask.',
];

export const THREAD_NOTE_DEVELOP = [
  'The detail from an earlier job resurfaces here, slightly clearer but still deniable. The party should feel like they\'re noticing a pattern, not being told one.',
  'This mission quietly confirms the earlier thread without spelling it out — the same fixer, the same shell company, the same signature on two unrelated jobs.',
  'A second, independent detail lines up with the first one from a prior job. Still circumstantial — let the party argue about whether it means anything.',
  'Someone in this job slips and nearly says the wrong name. Have them catch themselves if the party doesn\'t notice; let it land if they do.',
];

export const THREAD_NOTE_PAYOFF = [
  'This is where it pays off: the earlier thread becomes impossible to ignore. Let the party put it together themselves in the debrief, if you can stand to wait that long.',
  'The connection planted earlier finally resolves here — the same hand has been on the scale the whole campaign.',
  'Every loose thread from earlier jobs ties off here. Make the reveal land on something the party actually saw, not just heard about.',
];
