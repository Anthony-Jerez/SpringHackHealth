import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function SettingsScreen() {
	const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/home'); // Redirect unauthorized users
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return null; // Prevents rendering of settings page
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});