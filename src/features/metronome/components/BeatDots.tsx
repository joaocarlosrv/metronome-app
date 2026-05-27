import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "../../../constants/theme";

interface BeatDotsProps {
  beats: number;
  currentBeat: number;
  isPlaying: boolean;
  accentBeat: number;
  onSelectAccent: (beat: number) => void;
}

function Dot({
  accentBeat,
  onSelectAccent,
  index,
  currentBeat,
  isPlaying,
}: {
  accentBeat: number;
  onSelectAccent: (beat: number) => void;
  index: number;
  currentBeat: number;
  isPlaying: boolean;
}) {
  const isAccentSelected = accentBeat === index + 1;
  const isActive = isPlaying && index === currentBeat;
  const isAccent = index === 0;

  const animStyle = useAnimatedStyle(() => {
    const active = isPlaying && index === currentBeat;
    return {
      backgroundColor: active ? COLORS.accent : COLORS.tick,
      transform: [{ scale: active ? withSpring(1.4, { damping: 10 }) : 1 }],
      shadowOpacity: active && isAccent ? withTiming(0.7, { duration: 80 }) : 0,
    };
  }, [currentBeat, index, isPlaying]);

  return (
    <Pressable onPress={() => onSelectAccent(index + 1)} hitSlop={8}>
      <Animated.View
        style={[
          styles.dot,
          animStyle,
          isAccentSelected && styles.accentSelected,
          isActive && isAccent && styles.accentShadow,
        ]}
      />
    </Pressable>
  );
}

export function BeatDots({
  beats,
  currentBeat,
  isPlaying,
  accentBeat,
  onSelectAccent,
}: BeatDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: beats }).map((_, index) => (
        <Dot
          key={index}
          accentBeat={accentBeat}
          onSelectAccent={onSelectAccent}
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    paddingHorizontal: 24,
    marginVertical: 14,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 9,
  },
  accentShadow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 4,
  },
  accentSelected: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
