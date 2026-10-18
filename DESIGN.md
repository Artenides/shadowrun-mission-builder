# Shadowrun Anarchy 2.0 — Campaign & Mission Generator
### Design Document v1

## 1. Purpose

A browser-based tool for GMs ("DMs") running **Shadowrun: Anarchy 2.0** campaigns. The DM answers a short questionnaire about their table and setting; the tool generates a set of connected missions ("runs") that form a loose campaign arc, with some missions deliberately left as flavorful outliers. Each mission includes a type, a location-appropriate description, likely complications, how it ties into the wider story, and optional NPC stat blocks.

## 2. Constraints that shape every decision

- **Hosting:** GitHub Pages only — static files (HTML/CSS/JS), no server, no database, $0/month.
- **Confidentiality:** The DM should not be able to trivially extract "the list of all missions" or "the generation recipe" from the site. Per the chosen architecture (see §3), this is handled by *not having* a flat content list in the first place, plus standard build-time obfuscation — **not** by any kind of real access control, which is impossible on a static site.
- **Breadth:** The tool must stay useful after hundreds of generations — no obvious repeats, no "I've seen this one before" feeling.
- **Input budget:** No more than ~10–15 questions. Every question must measurably change the output or it gets cut.
- **Output budget:** A DM should be able to generate a usable campaign in under two minutes of reading.

## 3. Architecture decision: static-only, generative-not-stored

We're going with **pure client-side generation**, accepting that any sufficiently motivated person can read the shipped JS. We mitigate this not by hiding code (impossible on GitHub Pages) but by **removing the thing worth stealing**:

> There is no file called `missions.json` containing finished missions. There is no list of "the 200 missions this tool can produce." There are only small, reusable *fragments* (location beats, complication beats, twist beats, faction motifs, NPC archetypes) that get procedurally assembled, cross-linked, and worded at generation time from a seeded RNG plus the DM's answers.

This matters for the "don't let people download the database" requirement: even a full source dump only gives someone the equivalent of a box of Lego bricks, not a shelf of finished models. The number of *fragments* might be ~300–500 total; the number of *distinct campaigns* they can produce is combinatorial (fragment combinations × thread-graph shapes × seed-driven wording variants), practically uncountable and not enumerable by just reading the arrays.

Secondary, defense-in-depth measures (not the primary defense, but worth doing):
- Production build via bundler (Vite/esbuild) with minification — flattens descriptive file/variable names into `a`, `b`, `c…`.
- Fragment tables split across many small modules, tagged with opaque IDs rather than human-readable keys in the shipped bundle (readable names only exist in source, not in the built output).
- No comments, no dev sourcemaps published to the `gh-pages` branch/output.
- Text fragments are *templates* with blanks, not full sentences, so raw extraction without the assembly code is low-value.
- Right-click/devtools blocking is explicitly **not** used — it's ineffective, breaks accessibility, and annoys legitimate users for zero real security benefit.

We are explicit with ourselves that this is "speed-bump," not "safe." The real anti-dump property comes from generative design, not from obscuring code.

## 4. DM Questionnaire

Fifteen inputs — the full budget — mixing select/slider/multi-select/optional-text so the form is fast to fill but expressive. Each is tagged with which generation stage it feeds.

| # | Question | Type | Feeds |
|---|---|---|---|
| 1 | Party composition (choose all that apply): Street Samurai / Mage / Decker / Rigger / Face / Adept / Technomancer / Mixed-generalist | multi-select | mission type weighting, NPC opposition design |
| 2 | Party size | number (1–8) | encounter scaling, NPC count |
| 3 | Power/Street-cred tier: Street-level / Professional / Veteran / Elite | single-select | threat tier, stakes, antagonist scale |
| 4 | Continent/region: North America / South America / Europe / Asia / Africa / Oceania & Pacific Rim / Off-grid (orbital, matrix-deep, astral) | single-select | location flavor tables, city generation (§5) |
| 5 | Urban vs. frontier lean (slider: Megacity sprawl ↔ Wastes/Barrens/rural) | slider | location sub-tables, travel complications, city tier (§5) |
| 6 | Number of missions (3–10) | number | campaign length, thread-graph size |
| 7 | Campaign tone: Gritty noir / Pulpy action / Corporate intrigue / Horror-tinged / Comedic chaos | single-select | tone weighting on description/complication wording |
| 8 | Primary antagonist flavor: Megacorp / Organized crime (mob/yakuza/triad) / Gang / Insect spirits or horror / Government-black-ops / Dragon/high-powered-metahuman / Let the tool decide | single-select | faction web generation, stakeholder mix (§5) |
| 9 | Moral complexity: Clear-cut villains / Shades of grey / DM wants at least one "the real client is the bad guy" twist | single-select | twist-fragment selection |
| 10 | Outlier ratio: Tightly woven (few/no outliers) ↔ Loosely connected (several standalone flavor runs) | slider | thread-graph density |
| 11 | Include NPC stat blocks? | toggle | NPC generation stage on/off |
| 12 | NPC crunch level: Quick reference only / Full Anarchy stat blocks | single-select (shown if #11 is on) | NPC detail depth |
| 13 | Optional seed phrase / campaign name (free text, blank = random) | optional text | RNG seed, flavor title |
| 14 | Home city name (optional — leave blank to generate one) | optional text | city name override (§5) |
| 15 | City scope: Single anchor city (missions orbit one city) / Multiple cities & roaming jobs | single-select | city generation scope, thread-web geography (§5, §6) |

With this pair added, the budget from §2 is maxed out deliberately — a named home city with real stakeholders does more for mission grounding than any further individual mission-level dial would, so it earned the last two slots. Rejected candidates: specific corp names (generated instead, see §5.5), exact calendar year/timeline placement, individual character backstories, magic-vs-tech setting ratio (folded into tone/antagonist flavor instead).

## 5. The City

A city isn't just flavor text — it's where the mission engine gets its nouns. Instead of each mission inventing a generic "a megacorp" and "a local fixer," the whole campaign shares one small, consistently-named cast of places and stakeholders. That reuse is also *how* the non-obvious mission connections promised in §1 actually get built in practice: two missions feel connected because they turn out to touch the same corp's supply chain or the same fixer working both sides — not because of an arbitrary invisible tag.

### 5.1 When it's generated

Once per campaign, inside Campaign Skeleton (pipeline stage [1], §6) — before any individual mission is assembled. In a single-city campaign (Q15), every mission pulls its NPCs, locations, and hooks from this one generated city. In a multi-city/roaming campaign, a thinner secondary city profile is generated per away-mission, and outliers (Q10) may skip the stakeholder pool entirely for a clean break from the main arc.

### 5.2 City profile schema

```
CITY PROFILE
Name:                procedurally generated, region-flavored
                      (or DM-supplied override, Q14)
Region/Country:       inherited from Q4
Tier:                 Megacity Sprawl | Major Metro | Mid-size Hub | Frontier Town
Population:           tier-appropriate range (e.g., Megacity: 8-25M)
Metahuman mix:        % Human / Elf / Dwarf / Ork / Troll (tier + region weighted)
Awakened fraction:    rough % of population magically active (flavor stat)
Economic engine:      1-2 tags, e.g. "Matrix/data hub", "Heavy manufacturing",
                      "Arms & logistics", "Entertainment/media", "Resource
                      extraction", "Black-market transit point"
Ambience tags:        2-3 flavor tags, e.g. "corp-controlled", "gang-fractured",
                      "magical nexus", "media capital", "heavily surveilled",
                      "lawless barrens-heavy"
Districts:            4-6 named zones (see 5.3)
Stakeholders:         4-6 named factions (see 5.4)
```

### 5.3 Districts

Each district is a named sub-location with its own flavor and mission-type affinity, so location fragments (pipeline stage [3], §6) pull from a city-specific pool instead of a generic one. Example shape — actual names are generated per campaign, not picked from this table:

| District role | Flavor | Favored mission types |
|---|---|---|
| Corporate core/spire | Glass towers, private security, extraterritorial law | Infiltration, Data run, Deception |
| Docks/transit zone | Smuggling, cargo, union politics | Smash-and-grab, Theft/Extraction |
| Entertainment strip | Clubs, fixers, gossip, surveillance blind spots | Deception, Negotiation-gone-wrong |
| The Barrens/Warrens | Gang turf, minimal authority presence | Wet work, Protection/Escort |
| Underground/Below | Service tunnels, maglev, old sprawl, Matrix nodes | Reconnaissance, Horror-tinged runs |
| Mixed-use sprawl | Residential blocks, markets, everyday life | Rescue, Social engineering |

District count scales with city tier — a Frontier Town might only generate 2–3.

### 5.4 Stakeholders

Generated once per city, then reused as the pool of clients/targets/antagonists/rivals across every mission in that city.

```
STAKEHOLDER
Name:              generated (corp name generator / gang name generator /
                   person-name generator depending on type)
Type:              AAA Megacorp | AA Corp | Local corp | Organized crime
                   (mob/yakuza/triad/cartel) | Street gang | Government/
                   municipal authority | Wildcard (media conglomerate,
                   magical lodge/order, insect-spirit front, dragon-backed
                   shell, etc.)
Local power level: Dominant | Established | Rising | Fringe
Disposition:       toward the party's likely employer (friendly/neutral/
                   hostile) — generated, not fixed
Known assets:      1-2 tags (private security force, blackmail archive,
                   corrupt city council seat, docks monopoly, etc.)
Secret agenda:     hidden variable consumed by the thread web (§6) — what
                   this stakeholder actually wants, often misaligned with
                   their public face
Relationship:      at least one tagged link to another stakeholder
                   (rivalry, alliance, debt, infiltration)
```

Per city tier, generate roughly: 1–2 megacorps/AA corps, 1–2 organized crime or gang powers, 1 government/authority entity, 1 wildcard faction (weighted by Q8's antagonist flavor). Frontier Towns skew toward gangs/local corp/government only, skipping megacorps unless an absentee-landlord megacorp angle is specifically interesting.

### 5.5 How the city feeds mission generation

- **Locations** (pipeline stage [3]) pull from this city's district pool instead of a generic region table — missions read as set in a real place, not generic flavor text.
- **Clients/antagonists** in mission hooks are drawn from the stakeholder pool rather than invented fresh per mission — this is what makes thread-web connections (§6) feel earned instead of arbitrary.
- **Threat scaling**: city tier + stakeholder power level feed directly into NPC threat tier (§8) — a Dominant AAA corp's security response looks nothing like a Fringe gang's.
- **Outliers** can still be set outside the home city entirely (a travel job, an extraction from a rival sprawl, an astral/Matrix-only job with no fixed geography) — these intentionally skip the stakeholder pool, reinforcing that they're flavor, not connective tissue.

### 5.6 Generation method (staying consistent with §3's anti-database principle)

City names, corp names, gang names, and district names are built the same combinatorial way as everything else — syllable/affix generators and prefix+industry+suffix tables, not a hand-picked list of "50 pre-made cities." A handful of fragment pools (name syllables, corp-industry tags, gang-naming conventions per region) produce effectively unlimited distinct cities, so there's no finite "city database" to extract any more than there's a finite "mission database."

### 5.7 Persistence & regeneration

The city profile lives only in memory/the shareable seed URL (per §3's no-backend rule) for the session's duration. The UI exposes per-element regeneration (§9) so a DM who likes their city's name and corps but wants different districts — or vice versa — can re-roll just that slice without starting the whole campaign over.

## 6. Generation pipeline

Deterministic given (inputs + seed), so a DM can share a seed string and regenerate the same campaign without us storing anything server-side.

```
Inputs + Seed
     │
     ▼
[1] Campaign Skeleton
     - generate the City Profile: name, tier, districts, stakeholders (§5)
     - pick antagonist faction(s) (1–2) from the city's stakeholder pool
     - pick a MacGuffin/objective class (data, person, artifact, territory, revenge)
     - pick a hidden sponsor/fixer motive (may diverge from stated job)
     - decide act count from mission count (3 acts for 6+, 2 for fewer)
     │
     ▼
[2] Thread Web (the "non-obvious connections" layer)
     - build a small graph over mission slots
     - assign 2–4 hidden link types: shared stakeholder, recurring NPC,
       recurring district/object, rumor-payoff, false-flag client
     - stagger reveals: a link is planted as a minor, easy-to-miss detail
       in an early mission and only becomes legible 2–3 missions later
     - mark a DM-controlled fraction of missions (from Q10) as outliers:
       either "unconnected flavor" or "red herring that LOOKS connected but isn't"
     │
     ▼
[3] Per-mission assembly (loop over mission slots)
     - assign mission type (avoid same type twice in a row; weight by party comp)
     - pick a district from the City Profile matching mission type affinity (§5.3),
       or a fresh location for outliers set outside the home city
     - pick complication fragments (1–3) matching tone + power tier
     - pick narrative-tie fragment per the thread web (or "no connection" for outliers)
     - render templates → prose via slot-filling (see §7 wording model)
     │
     ▼
[4] NPC population (if enabled)
     - derive threat tier from power tier + stakeholder power level (§5.4) + mission type
     - generate 1 named antagonist/contact + mook squad profile per mission as relevant
     - crunch level per Q12
     │
     ▼
[5] Narrative pass
     - write the 1–2 sentence "how this fits the wider arc" line per mission,
       referencing the thread web assignment
     - write campaign-level summary blurb
     │
     ▼
Rendered campaign (client-side only, nothing persisted)
```

### Wording model (§7 below)
Rather than full pre-written sentences, fragments are **templates with typed slots**:

```
"{client} wants the party to {verb_phrase} from {location_noun_phrase}
 before {deadline_clause}, but {complication}."
```

Slots draw from independently-rotated pools (clients, verbs, locations, deadlines, complications), each pool itself organized by region/tone/tier tags. This is what makes the *combinatorics* argument in §3 real rather than cosmetic — the "content" worth protecting is the cross product of pools, not any single list.

## 7. Mission output schema

Each generated mission renders as a card with:

- **Title** (short, flavorful, auto-generated)
- **Type** — one of: Infiltration, Theft/Extraction, Wet work, Smash-and-grab, Deception/Social engineering, Sabotage, Protection/Escort, Reconnaissance, Data run (pure Matrix), Rescue, Negotiation-gone-wrong
- **Location** — a specific district of the campaign's city (§5.3), or a named away-location for outliers, rather than anything generic
- **Hook/Description** — 2–4 sentences, what the client (usually a city stakeholder, §5.4) says the job is
- **Complications** — 1–3 bullet twists/obstacles that can surface during play (not just combat — social, legal, magical, environmental)
- **Narrative thread note** (DM-only framing, clearly labeled as such in the UI) — how this mission secretly connects (or doesn't) to the wider arc, so the DM has the answer key even though players shouldn't be told directly
- **NPCs** (optional, collapsed by default) — see §8

## 8. NPC stat blocks (Anarchy 2.0-flavored)

Kept lightweight, matching Anarchy's narrative dice-pool system rather than full Shadowrun 5/6E crunch:

```
NAME / ROLE TAG  (e.g., "Lead Enforcer — Human, ganger captain")
Threat Tier:      Mook | Named | Boss
Dice Pool:        XD6           (single aggregate pool, tier-scaled)
Soak:             X
Condition Boxes:  X   [□□□□□□]
Edge:             X (Named/Boss only)
Special:          1–2 tagged abilities in plain language
                  ("Called shot specialist: +1D on ranged called shots",
                   "Ares Predator, 2x grenades")
Quick line:       one-sentence personality/behavior note for improv
```

Mook squads are generated as a single statline with a headcount rather than individual blocks, matching Anarchy's "mob" handling. Quick-reference mode (Q12) shows only Dice Pool/Soak/Condition/Special; full mode adds Edge and gear notes.

## 9. UI/UX flow

1. **Landing** — one-paragraph pitch + "Build a campaign" button.
2. **Wizard** — the 15 questions, grouped into 4 short steps (Party & Power / Setting & Tone / City / Shape & Extras) so it doesn't feel like one long form.
3. **Generating** — brief animated transition (purely cosmetic; generation is near-instant client-side).
4. **Campaign view** — campaign title + 1-paragraph overarching summary at top, then a **City Dossier** card (name, population, tier, districts, stakeholders — §5) that stays pinned/collapsible for reference, then mission cards in a vertical timeline, collapsed to title+type+one-liner by default, expandable for full detail. A toggle shows/hides the "narrative thread note" layer (DM spoiler) separately from player-facing text.
5. **Regenerate single mission** — button per card to re-roll just that mission while keeping its thread-web role (so connections stay intact but flavor changes). The City Dossier has its own regenerate-by-element controls (name only / districts only / stakeholders only / everything) per §5.7.
6. **Export** — "Copy as Markdown" and "Print/PDF view" (browser print stylesheet), both including the City Dossier alongside the missions. A "Share seed" button copies a URL with inputs+seed encoded in the query string — no backend storage needed, and regenerating from that URL reproduces the identical campaign and city.

## 10. Tech stack recommendation

- **Build tool:** Vite (fast, trivial static output, easy minification, works great with GitHub Pages via `gh-pages` branch or GitHub Actions deploy).
- **UI:** Plain React (or Preact for smaller bundle) + a small component set; no backend framework needed.
- **State:** Local component state + URL query string for shareable seeds; no persistence layer, no localStorage dependency for core function (localStorage only for minor last-used-inputs convenience).
- **RNG:** A small seeded PRNG (e.g., mulberry32 or xorshift, a few lines, MIT-licensed implementations are trivial to vend in-house) — deterministic campaigns from seed, no external dependency needed.
- **Styling:** Tailwind or plain CSS, dark theme fitting Shadowrun aesthetic.
- **Deployment:** GitHub Actions workflow builds on push to `main` and publishes `dist/` to the `gh-pages` branch (or native Pages "deploy from Action" mode). Zero manual steps after setup.

## 11. Content authoring pipeline (how we keep adding variety without turning it back into a database)

- Content lives in source as small, tagged modules, e.g. `locations/urban.na.ts`, `complications/social.ts`, `npc/archetypes.gangs.ts`, `cities/names.ts`, `corps/names.ts`.
- Every fragment carries tags (region, tone, tier, mission-type affinity) used by weighted selection — not a flat list consumed in order.
- Rule of thumb when authoring: **a fragment should be a reusable beat, not a finished scene.** If a fragment only makes sense in one specific mission or one specific city, it's written wrong — generalize it or split it into composable pieces.
- Periodically review generated output distributions (which fragments fire most) via a local-only debug seed-sweep script (not shipped to production) to catch over/under-weighted pools — keeps the game feeling varied rather than converging on "favorite" combinations.

## 12. Testing / QA for variety

- Automated seed-sweep script (dev-only, run locally, not deployed): generate N campaigns across the input space, assert no two mission *cards* (and no two city profiles) are character-for-character identical, and flag fragment pools whose top entry fires disproportionately often.
- Manual read-through pass per release for narrative coherence of the thread-web (connections should be inferable but not stated outright).

## 13. Roadmap / nice-to-haves (not in v1)

- Printable "campaign dossier" PDF export with simple layout, including the City Dossier.
- A "complexity dial" that also varies sentence length/vocabulary for different tables (new DMs vs. veteran groups).
- Community-contributed fragment packs (would need review to avoid them becoming a dumped "database" of finished missions/cities rather than composable beats).
- Optional faction relationship diagram (simple auto-laid-out graph) visualizing the city's stakeholder web and thread web for the DM's own reference.
- Multiple named cities per region, generated once and cached in the seed so a DM can reuse a favorite city across several different campaigns.

## 14. Open questions for next pass

- Exact fragment-pool sizes per category (first content-authoring pass will tell us if ~300–500 fragments feels sufficiently varied, or if we need more before launch) — city/corp/gang name generators included.
- Whether "Off-grid" region (Q4) needs meaningfully different mission-type weighting (e.g., less smash-and-grab, more infiltration/astral) — likely yes, flag for content design. Off-grid campaigns may need a non-city "Home Base" variant of §5 (an orbital habitat, a Matrix host, a ship) instead of a literal city.
- Final visual identity/branding (not blocking — can ship with a clean generic dark theme first).
