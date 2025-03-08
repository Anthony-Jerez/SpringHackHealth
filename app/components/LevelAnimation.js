import React from 'react';
import LottieView from 'lottie-react-native';
import { View, StyleSheet } from 'react-native';
import { levelAnimation } from '../../animation';
import { useRef } from 'react';

const LevelAnimation = ({ level }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={levelAnimation[level] || levelAnimation[1]} // Fallback to level 1
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
});

export default LevelAnimation;