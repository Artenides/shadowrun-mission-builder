import type { Region } from '../engine/types';

export interface RegionNameParts {
  prefixes: string[];
  suffixes: string[];
  epithets: string[];
}

export const CITY_NAME_PARTS: Record<Region, RegionNameParts> = {
  'North America': {
    prefixes: ['Cas', 'Port', 'Fort', 'Sea', 'West', 'Nor', 'Dell', 'Gray', 'Iron', 'Salt', 'Bay', 'Clear'],
    suffixes: ['cade', 'ton', 'burg', 'ridge', 'haven', 'field', 'port', 'fall', 'wood', 'polis', 'view', 'mont'],
    epithets: ['New', 'Old', 'Greater', 'Upper', 'Lower'],
  },
  'South America': {
    prefixes: ['Rio', 'Nova', 'Sao', 'Vera', 'Alto', 'Costa', 'Monte', 'Santa', 'Bela', 'Serra', 'Pedra'],
    suffixes: ['cruz', 'linda', 'vista', 'grande', 'nova', 'verde', 'mar', 'sol', 'brisa', 'dor', 'bela'],
    epithets: ['Nova', 'Alta', 'Baixa'],
  },
  Europe: {
    prefixes: ['Neu', 'Alt', 'Kron', 'Stahl', 'Nord', 'Berg', 'Vest', 'Esch', 'Rhein', 'Dunkel', 'Grau'],
    suffixes: ['stadt', 'burg', 'heim', 'feld', 'hafen', 'mund', 'brück', 'wald', 'dorf', 'gate', 'thal'],
    epithets: ['Neu', 'Alt', 'Groß', 'Klein'],
  },
  Asia: {
    prefixes: ['Shin', 'Hoku', 'Dong', 'Xin', 'Tai', 'Neo', 'Chun', 'Han', 'Sora', 'Ren', 'Kyo'],
    suffixes: ['hama', 'shi', 'jing', 'dao', 'kai', 'gawa', 'ren', 'ton', 'ying', 'zuka', 'machi'],
    epithets: ['Neo', 'Shin', 'Greater'],
  },
  Africa: {
    prefixes: ['Zuri', 'Kano', 'Bomo', 'Addis', 'Luma', 'Niro', 'Saha', 'Veld', 'Kaya', 'Jaba', 'Oyo'],
    suffixes: ['bara', 'kesh', 'toro', 'zuri', 'funda', 'wane', 'gata', 'lume', 'sana', 'kota', 'joro'],
    epithets: ['New', 'Greater', 'Old'],
  },
  'Oceania & Pacific Rim': {
    prefixes: ['Kori', 'Wai', 'Pali', 'Tasma', 'Reef', 'Coral', 'Suva', 'Nalu', 'Mahi', 'Kaha', 'Moana'],
    suffixes: ['nui', 'bay', 'tide', 'reef', 'ara', 'moana', 'lea', 'point', 'cove', 'wharf', 'strand'],
    epithets: ['New', 'Greater', 'Old'],
  },
  'Off-grid': {
    prefixes: ['Hab', 'Node', 'Drift', 'Null', 'Spire', 'Array', 'Vault', 'Relay', 'Echo', 'Void', 'Cradle'],
    suffixes: ['-9', 'Station', 'Platform', 'Reach', 'Anchor', 'Core', 'Loop', 'Point', 'Lattice', 'Berth'],
    epithets: ['New', 'Far', 'Deep'],
  },
};

export const AWAY_LOCATIONS = [
  'a rival sprawl three time zones away, reached by puddle-jumper flight',
  'a transcontinental shuttle somewhere over open ocean',
  'a free port that doesn\'t officially exist on any corporate map',
  'the astral periphery, far from any physical landmark that matters',
  'a Matrix host with no server farm anyone has ever located',
  'a border town that changes hands between two governments every few years',
  'an orbital transfer station, several hours from anywhere with real gravity',
  'a research outpost at the edge of the region, officially abandoned',
];
