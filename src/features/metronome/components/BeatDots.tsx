import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '../../../constants/theme';

interface BeatDotsProps {
  beats: number;
  currentBeat: number;
  isPlaying: boolean;
}

function Dot({
  index,
  currentBeat,
  isPlaying,
}: {
  index: number;
  currentBeat: number;
  isPlaying: boolean;
}) {
  const isActive = isPlaying && index === currentBeat;
  const isAccent = index === 0;

  const animStyle = useAnimatedStyle(() => {
    const active = isPlaying && index === currentBeat;
    return {
      backgroundColor: active ? COLORS.accent : COLORS.tick,
      transform: [{ scale: withSpring(active ? 1.4 : 1, { damping: 10 }) }],
      shadowOpacity: withTiming(active && isAccent ? 0.7 : 0, { duration: 80 }),
    };
  }, [currentBeat, index, isPlaying]);

  return (
    <Animated.View
      style={[
        styles.dot,
        animStyle,
        isActive && isAccent && styles.accentShadow,
      ]}
    />
  );
}

export function BeatDots({ beats, currentBeat, isPlaying }: BeatDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: beats }).map((_, index) => (
        <Dot
          key={index}
          index={index}
          currentBeat={currentBeat}
          isPlaying={isPlaying}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginVertical: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accentShadow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 4,
  },
});

