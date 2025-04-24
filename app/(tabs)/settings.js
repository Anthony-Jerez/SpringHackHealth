import { 
  Text, View, TextInput, Switch, ScrollView, TouchableOpacity 
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from "@react-native-community/datetimepicker";
import { globalStyles } from '../styles/globalStyles'; // ✅ Import Global Styles

export default function SettingsScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Show date picker
  const showDatepicker = () => setShowDatePicker(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/');
    } else {
      loadMeasurements();
    }
  }, [isSignedIn, isLoaded]);

  const loadMeasurements = async () => {
    const savedHeight = await AsyncStorage.getItem('height');
    const savedWeight = await AsyncStorage.getItem('weight');
    const savedDob = await AsyncStorage.getItem('dob');
    const savedGender = await AsyncStorage.getItem('gender');
    if (savedHeight) setHeight(savedHeight);
    if (savedWeight) setWeight(savedWeight);
    if (savedDob) setDob(new Date(JSON.parse(savedDob)));
    if (savedGender) setGender(savedGender);
  };

  const saveChanges = async () => {
    await AsyncStorage.setItem('height', height);
    await AsyncStorage.setItem('weight', weight);
    await AsyncStorage.setItem('dob', JSON.stringify(dob));
    await AsyncStorage.setItem('gender', gender);
    alert('Changes saved!');
  };

  if (!isLoaded) return null;

  return (
    <ScrollView 
      style={styles.container} // ✅ Uses globalStyles for background only
      contentContainerStyle={styles.scrollContainer} // ✅ Local styles for layout
    >
      {/* Measurements Section */}
      <View style={styles.section}>
        <Text style={styles.title}>Personal Information</Text>
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
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter gender"
            value={gender}
            onChangeText={setGender}
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
                setShowDatePicker(false);
                if (selectedDate) {
                  setDob(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>
      
      {/* Visual Settings Section 
      <View style={styles.section}>
        <Text style={styles.title}>Visual Settings</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={(value) => setIsDarkMode(value)}
          />
        </View>
            </View> */}
      <TouchableOpacity style={styles.authButton} onPress={saveChanges}>
        <Text style={styles.authButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  ); 
}

// ✅ Local Styles (Restricts styling outside globalStyles)
const styles = {
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  datePickerButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  authButton: {
    width: 180,
    paddingVertical: 12,
    marginVertical: 8,
    backgroundColor: 'gray',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

