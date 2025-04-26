import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { levelAnimation } from '../../animation';

const LevelAnimation = ({ level = 1, token = 0 }) => {
  const [fire, setFire]   = useState(false);
  const [boxW, setBoxW]   = useState(0);   // width of the container view

  // fire once whenever token increments
  useEffect(() => {
    if (token > 0) setFire(true);
  }, [token]);

  return (
    <View
      style={styles.container}
      onLayout={e => setBoxW(e.nativeEvent.layout.width)}
    >
      <LottieView
        source={levelAnimation[level] || levelAnimation[1]}
        autoPlay loop resizeMode="contain" style={styles.animation}
      />

      {fire && boxW > 0 && (
        <ConfettiCannon
          count={200}
          origin={{ x: boxW / 2, y: 0 }}   // centre of THIS box
          explosionSpeed={500}
          fadeOut
          fallSpeed={3000}
          onAnimationEnd={() => setFire(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', height: 150 },
  animation: { width: 120, height: 150 },
});

export default LevelAnimation;
