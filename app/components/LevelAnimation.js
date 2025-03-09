import React from 'react';
import LottieView from 'lottie-react-native';
import { View, StyleSheet } from 'react-native';
import { levelAnimation } from '../../animation';

const LevelAnimation = ({ level }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={levelAnimation[level] || levelAnimation[1]} // Fallback to level 1
        autoPlay
        loop
        style={styles.animation}
        resizeMode="contain" // Prevents stretching
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120, // Fixed width
    height: 120, // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Prevents any overflow
  },
  animation: {
    width: 100, // Set a max width for animation
    height: 100, // Set a max height
  },
});

export default LevelAnimation;
