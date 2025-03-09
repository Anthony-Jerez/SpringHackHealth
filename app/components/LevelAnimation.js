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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Ensure it takes full width for centering
    height: 150, // Increase height to prevent cropping
  },
  animation: {
    width: 120, // Increase size for better visibility
    height: 150,
    alignSelf: 'center', // Center animation horizontally
  },
});

export default LevelAnimation;
