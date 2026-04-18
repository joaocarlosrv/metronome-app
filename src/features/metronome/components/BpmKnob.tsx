import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { BPM_MAX, BPM_MIN, COLORS, FONTS } from '../../../constants/theme';

interface KnobProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onTap: () => void;
}

const KNOB_SIZE = 280;
const INNER_SIZE = 240;
const TICK_COUNT = 48;
const TICK_RADIUS = 130;

function Ticks({ bpm }: { bpm: number }) {
  const lit = Math.round(((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) * TICK_COUNT);

  return (
    <View pointerEvents="none" style={styles.tickLayer}>
      {Array.from({ length: TICK_COUNT }).map((_, index) => {
        const isMajor = index % 4 === 0;
        return (
          <View
            key={index}
            style={[
              styles.tick,
              {
                height: isMajor ? 10 : 7,
                backgroundColor: index < lit ? COLORS.accent : COLORS.tick,
                transform: [
                  { rotate: `${(index / TICK_COUNT) * 360}deg` },
                  { translateY: -TICK_RADIUS },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export function BpmKnob({ bpm, onBpmChange, onTap }: KnobProps) {
  const startY = useSharedValue(0);
  const startBpm = useSharedValue(bpm);
  const innerScale = useSharedValue(1);

  const updateBpm = useCallback(
    (value: number) => {
      const next = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(value)));
      if (next !== bpm) {
        onBpmChange(next);
        Haptics.selectionAsync();
      }
    },
    [bpm, onBpmChange],
  );

  const dragGesture = Gesture.Pan()
    .onStart(event => {
      startY.value = event.absoluteY;
      startBpm.value = bpm;
    })
    .onUpdate(event => {
      const delta = startY.value - event.absoluteY;
      runOnJS(updateBpm)(startBpm.value + delta * 0.7);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)();
    innerScale.value = withSpring(1, { damping: 18, stiffness: 260 }, () => {
      innerScale.value = withSpring(1, { damping: 20, stiffness: 280 });
    });
    runOnJS(Haptics.selectionAsync)();
  });

  const innerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={Gesture.Simultaneous(dragGesture, tapGesture)}>
        <Animated.View style={styles.outer}>
          <Ticks bpm={bpm} />
          <Animated.View style={[styles.inner, innerAnimStyle]}>
            <Text style={styles.tapLabel}>TAP</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    position: 'relative',
  },
  outer: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 18,
  },
  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: COLORS.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  tickLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: 2,
    borderRadius: 999,
    top: KNOB_SIZE / 2 - 5,
  },
  tapLabel: {
    fontFamily: FONTS.light,
    fontSize: 14,
    letterSpacing: 5,
    color: COLORS.text3,
    textTransform: 'uppercase',
  },
  minLabel: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    fontFamily: FONTS.light,
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.text3,
    textTransform: 'uppercase',
  },
  maxLabel: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    fontFamily: FONTS.light,
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.text3,
    textTransform: 'uppercase',
  },
});
