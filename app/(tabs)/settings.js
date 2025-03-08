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
  const { isSignedIn, isLoaded } = useAuth(); // ✅ Added `isLoaded` to prevent premature navigation
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Show date picker
  const showDatepicker = () => setShowDatePicker(true);

  useEffect(() => {
    if (!isLoaded) return; // ✅ Prevents premature navigation
    if (!isSignedIn) {
      router.replace('/'); // Redirect unauthorized users
    } else {
      loadMeasurements();
    }
  }, [isSignedIn, isLoaded]);

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

  // ✅ Prevents rendering while Clerk is still determining authentication status
  if (!isLoaded) return null;

  return (
    <ScrollView 
      style={globalStyles.container}
      contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }} // ✅ Fix ScrollView layout issue
    >
      {/* Measurements Section */}
      <View style={globalStyles.section}>
        <Text style={globalStyles.title}>Personal Information</Text>
        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Height (cm):</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter height"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>
        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Weight (lb):</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter weight"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>
        {/* Date of Birth */}
        <View style={globalStyles.inputContainer}>
          <Text style={globalStyles.label}>Date of Birth: </Text>
          <TouchableOpacity style={globalStyles.datePickerButton} onPress={showDatepicker}>
            <Text style={globalStyles.dateText}>{formatDate(dob)}</Text>
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
      <View style={globalStyles.section}>
        <Text style={globalStyles.title}>Visual Settings</Text>
        <View style={globalStyles.switchContainer}>
          <Text style={globalStyles.label}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={(value) => setIsDarkMode(value)}
          />
        </View>
        <TouchableOpacity style={globalStyles.authButton} onPress={saveChanges}>
          <Text style={globalStyles.authButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
