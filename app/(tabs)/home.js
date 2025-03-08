import { StyleSheet, View } from 'react-native';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { globalStyles } from '../styles/globalStyles';
import LandingView from '../components/LandingView';
import WelcomeView from '../components/WelcomeView';

export default function HomeScreen() {

  return (
    <View style={globalStyles.container}>
      <SignedIn>
		<WelcomeView />
      </SignedIn>

      <SignedOut>
        <LandingView/>
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
 
});
