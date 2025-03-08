import { StyleSheet, Text, View, TextInput, Switch, ScrollView, Button, TouchableOpacity, Platform} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from "@react-native-community/datetimepicker"
import { Picker } from "@react-native-picker/picker"

export default function SettingsScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [dob, setDob] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [sex, setSex] = useState("male")
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

    // Format date for display
    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    }
  
    // Show date picker
    const showDatepicker = () => {
      setShowDatePicker(true)
    }  

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/home'); // Redirect unauthorized users
    } else {
      loadMeasurements();
    }
  }, [isSignedIn]);


  const loadMeasurements = async () => {
    const savedHeight = await AsyncStorage.getItem('height');
    const savedWeight = await AsyncStorage.getItem('weight');
    const savedDob = await AsyncStorage.getItem('dob');
    if (savedHeight) setHeight(savedHeight);
    if (savedWeight) setWeight(savedWeight);
    if (savedDob) setDob(new Date(JSON.parse(savedDob)));
  };

  const saveChanges = async () => {
    await AsyncStorage.setItem('height', height);
    await AsyncStorage.setItem('weight', weight);
    await AsyncStorage.setItem('dob', JSON.stringify(dob));
    alert('Changes saved!');
  };

  if (!isSignedIn) {
    return null; // Prevents rendering of settings page
  }

  return (
    <ScrollView style={styles.container}>
      {/* Measurements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
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
        {/* Date of Birth */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth: </Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={showDatepicker}>
            <Text style={styles.dateText}>{formatDate(dob)}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false); // Close the picker
                if (selectedDate) {
                  setDob(selectedDate); // Update DOB only if selected
                }
              }}
              maximumDate={new Date()}
            />
          )}
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
        <Button title="Save Changes" onPress={saveChanges} />
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
  },
});