export type SoundId = 'click' | 'ping' | 'stick' | 'woodblock' | 'drum';

export interface MetronomeSettings {
  beats: number;
  subdiv: number;
  volume: number;
  soundId: SoundId;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  polyEnabled: boolean;
  poly1: number;
  poly2: number;
  accelEnabled: boolean;
  accelStartBpm: number;
  accelEndBpm: number;
  accelStep: number;
  accelIntervalSec: number;
}

export type SettingsPanelTab = 'sound' | 'poly' | 'accel' | 'beats';

export const DEFAULT_BPM = 120;

export const DEFAULT_METRONOME_SETTINGS: MetronomeSettings = {
  beats: 4,
  subdiv: 1,
  volume: 0.8,
  soundId: 'click',
  soundEnabled: true,
  hapticsEnabled: false,
  polyEnabled: false,
  poly1: 3,
  poly2: 4,
  accelEnabled: false,
  accelStartBpm: 60,
  accelEndBpm: 160,
  accelStep: 5,
  accelIntervalSec: 30,
};
