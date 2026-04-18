import type { MicType } from '../types/studio';
import { micFormFor, type GearForm } from '../components/GearSilhouette';

export type GearCategory = 'microphone' | 'preamp' | 'compressor' | 'equalizer' | 'outboard';

const CATEGORY_DIR: Record<GearCategory, string> = {
  microphone: 'microphones',
  preamp: 'preamps',
  compressor: 'compressors',
  equalizer: 'equalizers',
  outboard: 'outboard',
};

const CATEGORY_FORM: Record<Exclude<GearCategory, 'microphone'>, GearForm> = {
  preamp: 'preamp',
  compressor: 'compressor',
  equalizer: 'equalizer',
  outboard: 'outboard',
};

/** IDs for which a real WebP exists in public/assets/gear/. */
const HAS_IMAGE: ReadonlySet<string> = new Set([
  'mic-akg-c451b', 'mic-akg-c451e', 'mic-akg-d112',
  'mic-at-at4033a', 'mic-atm25',
  'mic-audix-d1', 'mic-audix-d2', 'mic-audix-d4', 'mic-audix-d6',
  'mic-audix-i5', 'mic-audix-om5', 'mic-audix-om6', 'mic-audix-om7',
  'mic-audix-scx25a',
  'mic-beta52a', 'mic-beyer-m201', 'mic-beyer-m422nc', 'mic-beyer-mc930',
  'mic-cascade-fathead2', 'mic-coles-4038',
  'mic-earthworks-ethos',
  'mic-ev-nd357', 'mic-ev-nd468', 'mic-ev-nd478', 'mic-ev-nd767a',
  'mic-ev-nd868', 'mic-ev-nd967', 'mic-ev-re20', 'mic-ev-re200',
  'mic-heil-pr40',
  'mic-sennheiser-md441', 'mic-sm57', 'mic-sm58', 'mic-sm7b', 'mic-sm81',
  'mic-sony-c100', 'mic-stam-sa87-black',
  'mic-telefunken-m80', 'mic-telefunken-m80s', 'mic-telefunken-m81s',
  'mic-telefunken-tf51',
  'mic-umik1', 'mic-wunder-cm7gs',
  'pre-adesigns-mp2a', 'pre-api-3122v', 'pre-chandler-germanium',
  'pre-pueblo-jr22', 'pre-sonicfarm-creamer', 'pre-wunder-peq2r',
]);

/**
 * Resolve a gear ID to either a WebP image path or a silhouette form factor.
 *
 * When a real product image exists in `public/assets/gear/{category}/{id}.webp`,
 * `src` points there. Otherwise the consumer should render the SVG silhouette
 * keyed by `form`.
 */
export function gearImage(
  id: string,
  category: GearCategory,
  micType?: MicType,
): { src: string | null; form: GearForm } {
  const src = HAS_IMAGE.has(id)
    ? `${import.meta.env.BASE_URL}assets/gear/${CATEGORY_DIR[category]}/${id}.webp`
    : null;

  const form: GearForm =
    category === 'microphone' && micType
      ? micFormFor(micType)
      : CATEGORY_FORM[category as Exclude<GearCategory, 'microphone'>] ?? 'outboard';

  return { src, form };
}
