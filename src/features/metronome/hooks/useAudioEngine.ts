import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";

import { SoundId } from "../../../domain/metronome/config";

const accentAudio = require("../../../assets/audio/accent.wav");
const beatAudio = require("../../../assets/audio/beat.wav");

const engineState = {
  initialized: false,
  volume: 0.8,
};

function impactForSound(soundId: SoundId, isAccent: boolean) {
  if (soundId === "drum" || isAccent) {
    return Haptics.ImpactFeedbackStyle.Medium;
  }

  if (soundId === "woodblock" || soundId === "stick") {
    return Haptics.ImpactFeedbackStyle.Light;
  }

  return Haptics.ImpactFeedbackStyle.Soft;
}

function trigger(task: Promise<unknown>) {
  void task.catch(() => undefined);
}
export function useAudioEngine() {
  const initializedRef = useRef(engineState.initialized);
  const accentSoundRef = useRef<Audio.Sound | null>(null);
  const beatSoundRef = useRef<Audio.Sound | null>(null);

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

    const { sound: accentSound } = await Audio.Sound.createAsync(accentAudio, {
      volume: engineState.volume,
    });
    const { sound: beatSound } = await Audio.Sound.createAsync(beatAudio, {
      volume: engineState.volume,
    });

    accentSoundRef.current = accentSound;
    beatSoundRef.current = beatSound;
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
      const sound = isAccent ? accentSoundRef.current : beatSoundRef.current;

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
      const sound = accentSoundRef.current ?? beatSoundRef.current;

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

    if (accentSoundRef.current) {
      trigger(accentSoundRef.current.setVolumeAsync(nextVolume));
    }

    if (beatSoundRef.current) {
      trigger(beatSoundRef.current.setVolumeAsync(nextVolume));
    }
  }, []);

  return { init, playBeat, preview, setVolume };
}
