import * as Haptics from 'expo-haptics';
import { useCallback, useRef } from 'react';

import { SoundId } from '../../../domain/metronome/config';

const engineState = {
  initialized: false,
  volume: 0.8,
};

function impactForSound(soundId: SoundId, isAccent: boolean) {
  if (soundId === 'drum' || isAccent) {
    return Haptics.ImpactFeedbackStyle.Medium;
  }

  if (soundId === 'woodblock' || soundId === 'stick') {
    return Haptics.ImpactFeedbackStyle.Light;
  }

  return Haptics.ImpactFeedbackStyle.Soft;
}

function trigger(task: Promise<unknown>) {
  void task.catch(() => undefined);
}
export function useAudioEngine() {
  const initializedRef = useRef(engineState.initialized);

  const init = useCallback(async () => {
    if (initializedRef.current) {
      return;
    }

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
    (soundId: SoundId, isAccent: boolean, isSubdiv = false, isPoly1 = false, isPoly2 = false) => {
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

  const preview = useCallback((soundId: SoundId) => {
    emitPulse(impactForSound(soundId, true));
  }, [emitPulse]);

  const setVolume = useCallback((value: number) => {
    engineState.volume = Math.max(0, Math.min(1, value));
  }, []);

  return { init, playBeat, preview, setVolume };
}
