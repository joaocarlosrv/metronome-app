import { SoundId } from "./config";

export interface SoundPack {
  label: string;
  files: {
    accent: number;
    beat: number;
  };
}

export const SOUND_PACKS: Record<SoundId, SoundPack> = {
  stick: {
    label: "Stick",
    files: {
      accent: require("../../assets/audio/Stick/accent.wav"),
      beat: require("../../assets/audio/Stick/beat.wav"),
    },
  },
  clave: {
    label: "Clave",
    files: {
      accent: require("../../assets/audio/Clave/accent.wav"),
      beat: require("../../assets/audio/Clave/beat.wav"),
    },
  },
  cowbell: {
    label: "Cowbell",
    files: {
      accent: require("../../assets/audio/Cowbell/accent.wav"),
      beat: require("../../assets/audio/Cowbell/beat.wav"),
    },
  },
};

export const SOUND_OPTIONS = (Object.entries(SOUND_PACKS) as [SoundId, SoundPack][])
  .map(([id, pack]) => ({
    id,
    label: pack.label,
  }));
