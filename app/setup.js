import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SetupScreen() {
  const router = useRouter(); // For navigation

  // Local state to store form values
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [dob, setDob] = useState(new Date());
  const [rank, setRank] = useState('1');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Show date picker
  const showDatepicker = () => setShowDatePicker(true);

  // Save user data and navigate to Home Page
  const handleSubmit = async () => {
	await AsyncStorage.clear();
    const userInfo = { gender, height, weight };
    // Save to AsyncStorage
    await AsyncStorage.setItem('height', height);
    await AsyncStorage.setItem('weight', weight);
    await AsyncStorage.setItem('gender', gender);
    await AsyncStorage.setItem('rank', rank);
    await AsyncStorage.setItem('dob', JSON.stringify(dob));
    // Redirect to home page after submission
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setup Your Profile</Text>

      <Text>Gender:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter gender"
        value={gender}
        onChangeText={setGender}
      />

      <Text>Height (cm):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter height"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />

      <Text>Weight (kg):</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter weight"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

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

      <Button title="Save & Continue" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
  },
  datePickerButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
