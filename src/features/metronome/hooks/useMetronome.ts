import { useCallback, useEffect, useRef, useState } from 'react';

import { BPM_MAX, BPM_MIN } from '../../../constants/theme';
import { MetronomeSettings } from '../../../domain/metronome/config';
import { calculateTapTempo } from '../../../engine/tap';
import { useAudioEngine } from './useAudioEngine';

export interface MetronomeState extends MetronomeSettings {
  bpm: number;
}

export interface MetronomeControls {
  isPlaying: boolean;
  currentBeat: number;
  polyBeat1: number;
  polyBeat2: number;
  accelProgress: number;
  accelStatusText: string;
  togglePlay: () => void;
  tapTempo: () => void;
}

interface UseMetronomeOptions {
  onBpmChange?: (bpm: number) => void;
}

const LOOKAHEAD_MS = 100;
const SCHEDULE_INTERVAL_MS = 25;

export function useMetronome(
  state: MetronomeState,
  options: UseMetronomeOptions = {},
): MetronomeControls {
  const { init, playBeat, setVolume } = useAudioEngine();

  const stateRef = useRef(state);
  const onBpmChangeRef = useRef(options.onBpmChange);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { onBpmChangeRef.current = options.onBpmChange; }, [options.onBpmChange]);
  useEffect(() => { setVolume(state.volume); }, [setVolume, state.volume]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [polyBeat1, setPolyBeat1] = useState(0);
  const [polyBeat2, setPolyBeat2] = useState(0);
  const [accelProgress, setAccelProgress] = useState(0);
  const [accelStatusText, setAccelStatusText] = useState('');

  const isPlayingRef = useRef(false);
  const schedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drawRef = useRef<number | null>(null);
  const accelRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextNoteMs = useRef(0);
  const curBeatRef = useRef(0);
  const curSubRef = useRef(0);
  const pb1Ref = useRef(0);
  const pb2Ref = useRef(0);
  const accelT0Ref = useRef(0);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => { init(); }, [init]);

  const syncBpm = useCallback((bpm: number) => {
    const nextBpm = Math.max(BPM_MIN, Math.min(BPM_MAX, bpm));
    stateRef.current = { ...stateRef.current, bpm: nextBpm };
    onBpmChangeRef.current?.(nextBpm);
  }, []);

  const stopScheduler = useCallback(() => {
    if (schedRef.current) { clearInterval(schedRef.current); schedRef.current = null; }
    if (drawRef.current) { cancelAnimationFrame(drawRef.current); drawRef.current = null; }
    if (accelRef.current) { clearInterval(accelRef.current); accelRef.current = null; }
  }, []);

  const scheduler = useCallback(() => {
    const current = stateRef.current;
    const msPerBeat = (60 / (current.bpm * current.subdiv)) * 1000;
    const now = performance.now();

    while (nextNoteMs.current < now + LOOKAHEAD_MS) {
      const beat = curBeatRef.current;
      const sub = curSubRef.current;

      const isAccent = beat === 0 && sub === 0;
      const isBeat = sub === 0;
      const isSub = !isBeat;
      const isPoly1 = current.polyEnabled && pb1Ref.current === 0 && isBeat;
      const isPoly2 = current.polyEnabled && pb2Ref.current === 0 && isBeat;

      playBeat(current.soundId, isAccent, isSub, isPoly1, isPoly2);

      curSubRef.current = (sub + 1) % current.subdiv;
      if (curSubRef.current === 0) {
        curBeatRef.current = (beat + 1) % current.beats;
        pb1Ref.current = (pb1Ref.current + 1) % current.poly1;
        pb2Ref.current = (pb2Ref.current + 1) % current.poly2;
      }

      nextNoteMs.current += msPerBeat;
    }
  }, [playBeat]);

  const drawLoop = useCallback(() => {
    setCurrentBeat(curBeatRef.current);
    setPolyBeat1(pb1Ref.current);
    setPolyBeat2(pb2Ref.current);
    if (isPlayingRef.current) {
      drawRef.current = requestAnimationFrame(drawLoop);
    }
  }, []);

  const startAccel = useCallback(() => {
    accelT0Ref.current = performance.now();
    if (accelRef.current) {
      clearInterval(accelRef.current);
    }

    accelRef.current = setInterval(() => {
      const current = stateRef.current;
      const elapsed = (performance.now() - accelT0Ref.current) / 1000;
      const steps = Math.floor(elapsed / current.accelIntervalSec);
      const newBpm = Math.min(
        current.accelStartBpm + steps * current.accelStep,
        current.accelEndBpm,
      );

      syncBpm(newBpm);

      const totalSec =
        ((current.accelEndBpm - current.accelStartBpm) / current.accelStep) *
        current.accelIntervalSec;

      setAccelProgress(totalSec > 0 ? Math.min(1, elapsed / totalSec) : 1);
      const remaining = Math.round(current.accelIntervalSec - (elapsed % current.accelIntervalSec));

      if (newBpm >= current.accelEndBpm) {
        setAccelStatusText('Final BPM reached');
        clearInterval(accelRef.current!);
        accelRef.current = null;
      } else {
        setAccelStatusText(
          `${newBpm} BPM -> next: ${Math.min(newBpm + current.accelStep, current.accelEndBpm)} in ${remaining}s`,
        );
      }
    }, 200);
  }, [syncBpm]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopScheduler();
      setCurrentBeat(-1);
      setAccelStatusText('');
      setAccelProgress(0);
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    curBeatRef.current = 0;
    curSubRef.current = 0;
    pb1Ref.current = 0;
    pb2Ref.current = 0;
    nextNoteMs.current = performance.now();

    schedRef.current = setInterval(scheduler, SCHEDULE_INTERVAL_MS);
    drawRef.current = requestAnimationFrame(drawLoop);

    if (stateRef.current.accelEnabled) {
      syncBpm(stateRef.current.accelStartBpm);
      startAccel();
    }
  }, [drawLoop, scheduler, startAccel, stopScheduler, syncBpm]);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    tapTimesRef.current = tapTimesRef.current.filter(time => now - time < 3000);
    tapTimesRef.current.push(now);

    const bpm = calculateTapTempo(tapTimesRef.current, BPM_MIN, BPM_MAX);
    if (bpm !== null) {
      syncBpm(bpm);
    }
  }, [syncBpm]);

  useEffect(() => () => stopScheduler(), [stopScheduler]);

  return {
    isPlaying,
    currentBeat,
    polyBeat1,
    polyBeat2,
    accelProgress,
    accelStatusText,
    togglePlay,
    tapTempo,
  };
}

