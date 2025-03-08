import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import StatsBar from '../components/StatsBar';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { SignOutButton } from '../utils/SignOutButton';
import { globalStyles } from '../styles/globalStyles';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <View style={globalStyles.container}>
      <SignedIn>
        <SignOutButton />
        <Text style={globalStyles.greeting}>Hello, {user?.username}!</Text>

        {/* Animated Avatar */}
        <Animated.View entering={FadeInDown.duration(1000)}>
          <Avatar.Image 
            size={120} 
            source={{ uri: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Brian' }} 
          />
        </Animated.View>

        {/* Title */}
        <Text style={globalStyles.title}>Home</Text>

        {/* Retro Stats Bar for Nutrients */}
        <StatsBar label="Protein" value={50} maxValue={100} />
        <StatsBar label="Vitamin C" value={75} maxValue={100} />
        <StatsBar label="Iron" value={30} maxValue={100} />
      </SignedIn>

      <SignedOut>
        {/* ✅ MicroMeter Section moved here */}
        <View style={styles.microMeterContainer}>
          <Text style={styles.microMeterTitle}>MicroMeter</Text>
          <Image 
            source={{ uri: 'https://via.placeholder.com/100' }} // Replace with actual image URL
            style={styles.microMeterImage}
          />
        </View>

        {/* Modern Sign In & Sign Up Buttons */}
        <View style={styles.authButtonContainer}>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/sign-in')}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/sign-up')}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SignedOut>
    </View>
  );
}

// Custom Styles for Sign In & Sign Up Buttons & MicroMeter
const styles = StyleSheet.create({
  authButtonContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  signInButton: {
    width: 200,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: '#4CAF50', // Green Button
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  signUpButton: {
    width: 200,
    paddingVertical: 12,
    backgroundColor: '#FFD700', // Gold Button
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  microMeterContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF', // Card-like background
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Ensures shadow on Android
  },
  microMeterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
    fontFamily: 'monospace',
  },
  microMeterImage: {
    width: 50, 
    height: 50,
    borderRadius: 10,
  },
});
