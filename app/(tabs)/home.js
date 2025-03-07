import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Animated Avatar with Pixel Art Style */}
      <Animated.View entering={FadeInDown.duration(1000)}>
        <Avatar.Image 
          size={120} 
          source={{ uri: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Brian' }} 
        />
      </Animated.View>

      {/* Title Text */}
      <Text style={styles.title}>Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5', // Light background for better contrast
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10, // Adds spacing between avatar and text
  },
});
