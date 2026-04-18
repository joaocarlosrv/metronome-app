import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { COLORS, FONTS, SOUNDS } from '../../../constants/theme';
import {
  MetronomeSettings,
  SettingsPanelTab,
  SoundId,
} from '../../../domain/metronome/config';

export type PanelSettings = MetronomeSettings;

interface SettingsPanelProps {
  visible: boolean;
  initialTab: SettingsPanelTab;
  settings: PanelSettings;
  onChange: (patch: Partial<PanelSettings>) => void;
  onPreview: (soundId: SoundId) => void;
  accelProgress: number;
  accelStatusText: string;
  onClose: () => void;
}

const tabs: { key: SettingsPanelTab; label: string }[] = [
  { key: 'sound', label: 'Sound' },
  { key: 'beats', label: 'Beats' },
  { key: 'poly', label: 'Poly' },
  { key: 'accel', label: 'Accel' },
];

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={styles.stepperBtn}>
          <Text style={styles.stepperBtnText}>-</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={styles.stepperBtn}>
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SettingsPanel({
  visible,
  initialTab,
  settings,
  onChange,
  onPreview,
  accelProgress,
  accelStatusText,
  onClose,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsPanelTab>(initialTab);

  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [initialTab, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.tabs}>
            {tabs.map(tab => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === 'sound' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sound</Text>
              <View style={styles.soundList}>
                {SOUNDS.map(sound => (
                  <Pressable
                    key={sound.id}
                    onPress={() => {
                      onChange({ soundId: sound.id as SoundId });
                      onPreview(sound.id as SoundId);
                    }}
                    style={[
                      styles.soundChip,
                      settings.soundId === sound.id && styles.soundChipActive,
                    ]}
                  >
                    <Text style={styles.soundChipText}>{sound.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Stepper
                label="Volume"
                value={Math.round(settings.volume * 10)}
                min={0}
                max={10}
                onChange={value => onChange({ volume: value / 10 })}
              />
            </View>
          )}

          {activeTab === 'beats' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Beat Setup</Text>
              <Stepper
                label="Beats"
                value={settings.beats}
                min={1}
                max={12}
                onChange={value => onChange({ beats: value })}
              />
              <Stepper
                label="Subdivision"
                value={settings.subdiv}
                min={1}
                max={8}
                onChange={value => onChange({ subdiv: value })}
              />
            </View>
          )}

          {activeTab === 'poly' && (
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Enable polyrhythm</Text>
                <Switch
                  value={settings.polyEnabled}
                  onValueChange={value => onChange({ polyEnabled: value })}
                />
              </View>
              <Stepper
                label="Cycle A"
                value={settings.poly1}
                min={2}
                max={12}
                onChange={value => onChange({ poly1: value })}
              />
              <Stepper
                label="Cycle B"
                value={settings.poly2}
                min={2}
                max={12}
                onChange={value => onChange({ poly2: value })}
              />
            </View>
          )}

          {activeTab === 'accel' && (
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Enable acceleration</Text>
                <Switch
                  value={settings.accelEnabled}
                  onValueChange={value => onChange({ accelEnabled: value })}
                />
              </View>
              <Stepper
                label="Start BPM"
                value={settings.accelStartBpm}
                min={30}
                max={300}
                onChange={value => onChange({ accelStartBpm: value })}
              />
              <Stepper
                label="End BPM"
                value={settings.accelEndBpm}
                min={30}
                max={300}
                onChange={value => onChange({ accelEndBpm: value })}
              />
              <Stepper
                label="Step"
                value={settings.accelStep}
                min={1}
                max={20}
                onChange={value => onChange({ accelStep: value })}
              />
              <Stepper
                label="Interval"
                value={settings.accelIntervalSec}
                min={1}
                max={120}
                onChange={value => onChange({ accelIntervalSec: value })}
              />
              <Text style={styles.meta}>Progress: {Math.round(accelProgress * 100)}%</Text>
              <Text style={styles.meta}>{accelStatusText || 'Acceleration idle'}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  panel: {
    backgroundColor: COLORS.panel,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.semi,
    fontSize: 20,
  },
  close: {
    color: COLORS.accent,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.bg3,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  tabTextActive: {
    color: COLORS.bg,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: COLORS.white,
    fontFamily: FONTS.semi,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  value: {
    minWidth: 32,
    color: COLORS.white,
    fontFamily: FONTS.semi,
    fontSize: 16,
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.bg2,
  },
  stepperBtnText: {
    color: COLORS.white,
    fontSize: 18,
  },
  soundList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soundChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.bg2,
  },
  soundChipActive: {
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  soundChipText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
  },
  meta: {
    color: COLORS.text2,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
});

