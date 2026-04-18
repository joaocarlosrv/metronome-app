import * as Haptics from 'expo-haptics';
import { useCallback, useRef } from 'react';

import { SoundId } from '../../../domain/metronome/config';

function impactForSound(soundId: SoundId, isAccent: boolean) {
  if (soundId === 'drum' || isAccent) {
    return Haptics.ImpactFeedbackStyle.Medium;
  }

  if (soundId === 'woodblock' || soundId === 'stick') {
    return Haptics.ImpactFeedbackStyle.Light;
  }

  return Haptics.ImpactFeedbackStyle.Soft;
}

export function useAudioEngine() {
  const volRef = useRef(0.8);

  const init = useCallback(async () => undefined, []);

  const emitPulse = useCallback((style: Haptics.ImpactFeedbackStyle) => {
    if (volRef.current <= 0) {
      return;
    }
    Haptics.impactAsync(style);
  }, []);

  const playBeat = useCallback(
    (soundId: SoundId, isAccent: boolean, isSubdiv = false, isPoly1 = false, isPoly2 = false) => {
      if (isAccent || (!isSubdiv && !isPoly1 && !isPoly2)) {
        emitPulse(impactForSound(soundId, isAccent));
        return;
      }

      if (isSubdiv) {
        Haptics.selectionAsync();
      }

      if (isPoly1 || isPoly2) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      }
    },
    [emitPulse],
  );

  const preview = useCallback((soundId: SoundId) => {
    emitPulse(impactForSound(soundId, true));
  }, [emitPulse]);

  const setVolume = useCallback((value: number) => {
    volRef.current = Math.max(0, Math.min(1, value));
  }, []);

  return { init, playBeat, preview, setVolume };
}

