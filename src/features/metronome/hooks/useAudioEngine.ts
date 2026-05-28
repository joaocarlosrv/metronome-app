import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";

import { SoundId } from "../../../domain/metronome/config";
import { SOUND_PACKS, type SoundPack } from "../../../domain/metronome/sounds";

const engineState = {
  initialized: false,
  volume: 0.8,
};

function impactForSound(soundId: SoundId, isAccent: boolean) {
  if (isAccent) {
    return Haptics.ImpactFeedbackStyle.Medium;
  }

  if (soundId === "stick") {
    return Haptics.ImpactFeedbackStyle.Light;
  }

  if (soundId === "cowbell") {
    return Haptics.ImpactFeedbackStyle.Medium;
  }

  return Haptics.ImpactFeedbackStyle.Soft;
}

function trigger(task: Promise<unknown>) {
  void task.catch(() => undefined);
}
export function useAudioEngine() {
  const initializedRef = useRef(engineState.initialized);
  const soundRefs = useRef<
    Record<SoundId, { accent: Audio.Sound | null; beat: Audio.Sound | null }>
  >({
    stick: { accent: null, beat: null },
    clave: { accent: null, beat: null },
    cowbell: { accent: null, beat: null },
  });

  const init = useCallback(async () => {
    if (initializedRef.current) {
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    await Promise.all(
      (Object.entries(SOUND_PACKS) as [SoundId, SoundPack][]).map(
        async ([soundId, pack]) => {
          const { sound: accentSound } = await Audio.Sound.createAsync(
            pack.files.accent,
            {
              volume: engineState.volume,
            },
          );
          const { sound: beatSound } = await Audio.Sound.createAsync(
            pack.files.beat,
            {
              volume: engineState.volume,
            },
          );

          soundRefs.current[soundId] = {
            accent: accentSound,
            beat: beatSound,
          };
        },
      ),
    );

    initializedRef.current = true;
    engineState.initialized = true;
  }, []);

  const emitPulse = useCallback((style: Haptics.ImpactFeedbackStyle) => {
    if (engineState.volume <= 0) {
      return;
    }

    trigger(Haptics.impactAsync(style));
  }, []);

  const playBeat = useCallback(
    async (
      soundId: SoundId,
      isAccent: boolean,
      isSubdiv = false,
      isPoly1 = false,
      isPoly2 = false,
    ) => {
      const pack = soundRefs.current[soundId];
      const sound = isAccent ? pack?.accent : pack?.beat;

      if (sound && engineState.volume > 0) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }

      if (isAccent || (!isSubdiv && !isPoly1 && !isPoly2)) {
        emitPulse(impactForSound(soundId, isAccent));
        return;
      }

      if (isSubdiv) {
        trigger(Haptics.selectionAsync());
      }

      if (isPoly1 || isPoly2) {
        trigger(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid));
      }
    },
    [emitPulse],
  );

  const preview = useCallback(
    async (soundId: SoundId) => {
      const pack = soundRefs.current[soundId];
      const sound = pack?.accent ?? pack?.beat;

      if (sound && engineState.volume > 0) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
      emitPulse(impactForSound(soundId, true));
    },
    [emitPulse],
  );

  const setVolume = useCallback((value: number) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    engineState.volume = nextVolume;

    (Object.values(soundRefs.current) as {
      accent: Audio.Sound | null;
      beat: Audio.Sound | null;
    }[]).forEach(({ accent, beat }) => {
      if (accent) {
        trigger(accent.setVolumeAsync(nextVolume));
      }

      if (beat) {
        trigger(beat.setVolumeAsync(nextVolume));
      }
    });
  }, []);

  return { init, playBeat, preview, setVolume };
}
