import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import StatsBar from '../components/StatsBar'; // Import StatsBar

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Animated Avatar */}
      <Animated.View entering={FadeInDown.duration(1000)}>
        <Avatar.Image 
          size={120} 
          source={{ uri: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Brian' }} 
        />
      </Animated.View>

      {/* Title */}
      <Text style={styles.title}>Home</Text>

      {/* Retro Stats Bar for Nutrients */}
      <StatsBar label="Protein" value={50} maxValue={100} />
      <StatsBar label="Vitamin C" value={75} maxValue={100} />
      <StatsBar label="Iron" value={30} maxValue={100} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
});
