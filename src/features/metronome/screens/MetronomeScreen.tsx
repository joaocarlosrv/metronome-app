import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BPM_MAX, BPM_MIN, COLORS, FONTS } from '../../../constants/theme';
import {
  DEFAULT_BPM,
  DEFAULT_METRONOME_SETTINGS,
  SettingsPanelTab,
} from '../../../domain/metronome/config';
import { BeatDots } from '../components/BeatDots';
import { BpmKnob } from '../components/BpmKnob';
import { PanelSettings, SettingsPanel } from '../components/SettingsPanel';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useMetronome } from '../hooks/useMetronome';

export default function MetronomeScreen() {
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [settings, setSettings] = useState<PanelSettings>(DEFAULT_METRONOME_SETTINGS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<SettingsPanelTab>('sound');

  const { preview } = useAudioEngine();

  const metState = {
    bpm,
    beats: settings.beats,
    subdiv: settings.subdiv,
    soundId: settings.soundId,
    volume: settings.volume,
    polyEnabled: settings.polyEnabled,
    poly1: settings.poly1,
    poly2: settings.poly2,
    accelEnabled: settings.accelEnabled,
    accelStartBpm: settings.accelStartBpm,
    accelEndBpm: settings.accelEndBpm,
    accelStep: settings.accelStep,
    accelIntervalSec: settings.accelIntervalSec,
  };

  const {
    isPlaying,
    currentBeat,
    accelProgress,
    accelStatusText,
    togglePlay,
    tapTempo,
  } = useMetronome(metState, { onBpmChange: setBpm });

  const handleBpmChange = useCallback((value: number) => {
    setBpm(Math.max(BPM_MIN, Math.min(BPM_MAX, value)));
  }, []);

  const handleSettingsChange = useCallback((patch: Partial<PanelSettings>) => {
    setSettings(previous => ({ ...previous, ...patch }));
  }, []);

  const openPanel = useCallback((tab: SettingsPanelTab) => {
    setPanelTab(tab);
    setPanelOpen(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.container}>
        <View style={styles.topbar}>
          <Pressable onPress={() => openPanel('beats')} hitSlop={12} style={styles.iconButton}>
            <View style={styles.listIcon}>
              <View style={styles.listLine} />
              <View style={[styles.listLine, styles.shortLine]} />
              <View style={[styles.listLine, styles.tinyLine]} />
            </View>
          </Pressable>

          <View style={styles.logo}>
            <View style={styles.logoMark}>
              <View style={[styles.logoBar, styles.logoBarTall]} />
              <View style={[styles.logoBar, styles.logoBarShort]} />
              <View style={[styles.logoBar, styles.logoBarTall]} />
            </View>
            <Text style={styles.logoText}>METROPULSE</Text>
          </View>

          <Pressable onPress={() => openPanel('sound')} hitSlop={12} style={styles.iconButton}>
            <Text style={styles.menuText}>...</Text>
          </Pressable>
        </View>

        <Text style={styles.timeSig}>{settings.beats}/4</Text>

        <BeatDots
          beats={settings.beats}
          currentBeat={currentBeat}
          isPlaying={isPlaying}
        />

        <View style={styles.dividerRow}>
          <View style={styles.divLine} />
          <Pressable onPress={() => openPanel('beats')} hitSlop={12}>
            <Text style={styles.gearText}>SET</Text>
          </Pressable>
          <View style={styles.divLine} />
        </View>

        <View style={styles.bpmRow}>
          <Pressable
            onPress={() => {
              handleBpmChange(bpm - 1);
              Haptics.selectionAsync();
            }}
            onLongPress={() => {
              handleBpmChange(bpm - 5);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            hitSlop={12}
          >
            <Text style={styles.bpmAdj}>-</Text>
          </Pressable>

          <View style={styles.bpmCenter}>
            <Text style={styles.bpmNum}>{bpm}</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
          </View>

          <Pressable
            onPress={() => {
              handleBpmChange(bpm + 1);
              Haptics.selectionAsync();
            }}
            onLongPress={() => {
              handleBpmChange(bpm + 5);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            hitSlop={12}
          >
            <Text style={styles.bpmAdj}>+</Text>
          </Pressable>
        </View>

        <BpmKnob bpm={bpm} onBpmChange={handleBpmChange} onTap={tapTempo} />

        <View style={styles.bottomBar}>
          <Pressable style={styles.bottomAction} onPress={() => openPanel('sound')} hitSlop={8}>
            <Text style={styles.bottomActionText}>SOUND</Text>
          </Pressable>

          <Pressable
            style={[styles.playBtn, isPlaying && styles.playBtnActive]}
            onPress={togglePlay}
          >
            <Text style={[styles.playIcon, isPlaying && styles.playIconActive]}>
              {isPlaying ? 'STOP' : 'PLAY'}
            </Text>
          </Pressable>

          <Pressable style={styles.bottomAction} onPress={() => openPanel('poly')} hitSlop={8}>
            <Text style={styles.bottomActionText}>POLY</Text>
          </Pressable>
        </View>
      </View>

      <SettingsPanel
        visible={panelOpen}
        initialTab={panelTab}
        settings={settings}
        onChange={handleSettingsChange}
        onPreview={preview}
        accelProgress={accelProgress}
        accelStatusText={accelStatusText}
        onClose={() => setPanelOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 40,
    paddingBottom: 8,
  },
  iconButton: {
    minWidth: 32,
    alignItems: 'center',
  },
  listIcon: {
    gap: 6,
  },
  listLine: {
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: COLORS.text2,
  },
  shortLine: {
    width: 12,
  },
  tinyLine: {
    width: 9,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 18,
  },
  logoBar: {
    width: 3,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
  },
  logoBarTall: {
    height: 14,
  },
  logoBarShort: {
    height: 8,
  },
  logoText: {
    fontFamily: FONTS.light,
    fontSize: 13,
    letterSpacing: 3,
    color: COLORS.text2,
  },
  menuText: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    color: COLORS.text2,
    lineHeight: 18,
  },
  timeSig: {
    fontFamily: FONTS.thin,
    fontSize: 40,
    letterSpacing: 2,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 6,
  },
  divLine: {
    width: 80,
    height: 1,
    backgroundColor: COLORS.text3,
    opacity: 0.4,
  },
  gearText: {
    fontSize: 12,
    letterSpacing: 2,
    color: COLORS.text3,
    fontFamily: FONTS.regular,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
  },
  bpmAdj: {
    fontFamily: FONTS.thin,
    fontSize: 32,
    color: COLORS.text2,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bpmCenter: {
    alignItems: 'center',
    minWidth: 130,
  },
  bpmNum: {
    fontFamily: FONTS.thin,
    fontSize: 78,
    color: COLORS.white,
    lineHeight: 82,
    letterSpacing: -2,
  },
  bpmLabel: {
    fontFamily: FONTS.light,
    fontSize: 14,
    letterSpacing: 3,
    color: COLORS.text3,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 34,
    paddingBottom: 20,
    marginTop: 'auto',
  },
  bottomAction: {
    padding: 7,
  },
  bottomActionText: {
    fontSize: 13,
    color: COLORS.text3,
    fontFamily: FONTS.regular,
    letterSpacing: 1,
  },
  playBtn: {
    minWidth: 92,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: COLORS.text3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  playBtnActive: {
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  playIcon: {
    fontSize: 16,
    color: COLORS.text2,
    fontFamily: FONTS.semi,
  },
  playIconActive: {
    color: COLORS.accent,
  },
});

