import type { CityProfile } from '../engine/types';

interface CityDossierProps {
  city: CityProfile;
  onRegenerateCityName: () => void;
}

export default function CityDossier({ city, onRegenerateCityName }: CityDossierProps) {
  return (
    <div className="city-dossier">
      <div className="city-header">
        <h2>
          {city.name}{' '}
          <button
            type="button"
            className="icon-button"
            title="Regenerate just the city name"
            onClick={onRegenerateCityName}
          >
            ⟲
          </button>
        </h2>
        <p className="city-tagline">
          {city.tier} · ~{city.population} people · {city.region}
        </p>
      </div>

      <p className="city-ambience">{city.ambienceTags.join(' · ')}</p>
      <p className="city-economy">Economy: {city.economicEngine.join(', ')}</p>
      <p className="city-demographics">
        {city.metahumanMix.human}% Human · {city.metahumanMix.elf}% Elf · {city.metahumanMix.dwarf}% Dwarf ·{' '}
        {city.metahumanMix.ork}% Ork · {city.metahumanMix.troll}% Troll · ~{city.awakenedFraction}% Awakened
      </p>

      <details className="city-section" open>
        <summary>Districts ({city.districts.length})</summary>
        <ul>
          {city.districts.map((d) => (
            <li key={d.id}>
              <strong>{d.name}</strong> — {d.role}. {d.flavor}
            </li>
          ))}
        </ul>
      </details>

      <details className="city-section">
        <summary>Stakeholders ({city.stakeholders.length})</summary>
        <ul>
          {city.stakeholders.map((s) => {
            const relTarget = s.relationship ? city.stakeholders.find((o) => o.id === s.relationship!.targetId) : null;
            return (
              <li key={s.id}>
                <strong>{s.name}</strong> — {s.type}, {s.powerLevel}, {s.disposition.toLowerCase()} toward the
                party's employer.
                {relTarget && (
                  <>
                    {' '}
                    {s.relationship!.kind} with {relTarget.name}.
                  </>
                )}
                <br />
                Assets: {s.knownAssets.join(', ')}.
                <br />
                <span className="dm-only">Secretly, they {s.secretAgenda}.</span>
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}
