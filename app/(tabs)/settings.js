import { StyleSheet, Text, View, TextInput, Switch, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function SettingsScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/home'); // Redirect unauthorized users
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return null; // Prevents rendering of settings page
  }

  return (
    <ScrollView style={styles.container}>
      {/* Measurements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm):</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter height"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (lb):</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter weight"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>
      </View>

      {/* Visual Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visual Settings</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={(value) => setIsDarkMode(value)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});