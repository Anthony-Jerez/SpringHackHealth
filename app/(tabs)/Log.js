// In NutrientLogScreen.js (log.js)
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, FlatList, TextInput, 
  SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { nutrients } from './nutrientData';
import { globalStyles } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getItem, setItem, getAllItems } from '../utils/AsyncStorage';
import Constants from 'expo-constants';

export default function NutrientLogScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [amount, setAmount] = useState('');
  const [loggedNutrients, setLoggedNutrients] = useState([]);

  // New states for custom goal
  const [customGoalModalVisible, setCustomGoalModalVisible] = useState(false);
  const [selectedGoalNutrient, setSelectedGoalNutrient] = useState(null);
  const [goalAmount, setGoalAmount] = useState('');

	const trackedNutrients = nutrients.map(n => n.id); // Extract valid IDs

  // Load logged nutrients on mount
  useEffect(() => {
    const loadLoggedNutrients = async () => {
      try {
        const storedLogs = await getItem('loggedNutrients');
        if (storedLogs) {
          setLoggedNutrients(storedLogs);
        }
      } catch (error) {
        console.error('Error loading nutrient logs:', error);
      }
    };

    loadLoggedNutrients();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded || !isSignedIn) return null;

  const handleSelectNutrient = (nutrient) => setSelectedNutrient(nutrient);
  const handleSelectGoalNutrient = (nutrient) => setSelectedGoalNutrient(nutrient);

  const handleLogNutrient = async () => {
    if (!selectedNutrient || !amount) return;
    
    const amountValue = parseFloat(amount);
    
    const newLogEntry = {
      id: Date.now().toString(),
      nutrientId: selectedNutrient.id,
      name: selectedNutrient.name,
      amount: amountValue,
      unit: selectedNutrient.unit,
      timestamp: new Date(),
    };

    // Update logs array
    const updatedLogs = [...loggedNutrients, newLogEntry];
    setLoggedNutrients(updatedLogs);

    try {
      // Save to AsyncStorage - both the logs and the individual nutrient value
      await setItem('loggedNutrients', updatedLogs);
      
      // Update or create the individual nutrient entry for the StatsBar
      const currentValue = await getItem(selectedNutrient.name.toLowerCase()) || 0;
      const newValue = currentValue + amountValue;
      await setItem(selectedNutrient.name.toLowerCase(), newValue);
    } catch (error) {
      console.error('Error saving nutrient log:', error);
    }

    setSelectedNutrient(null);
    setAmount('');
    setModalVisible(false);
  };

  // New function to handle setting custom goals
  const handleSetCustomGoal = async () => {
    if (!selectedGoalNutrient || !goalAmount) return;
    
    const goalValue = parseFloat(goalAmount);
    if (isNaN(goalValue) || goalValue <= 0) return;
    
    try {
      // Store the custom goal in AsyncStorage with a specific key format
      const goalKey = `${selectedGoalNutrient.id}-goal`;
      await setItem(goalKey, goalValue);
      
      // Store visible nutrient goals for StatsBar display
      const visibleNutrients = await getItem('visibleNutrients') || [];
      
      // Check if this nutrient is already in the visible list
      if (!visibleNutrients.some(item => item.id === selectedGoalNutrient.id)) {
        visibleNutrients.push({
          id: selectedGoalNutrient.id,
          name: selectedGoalNutrient.name,
          unit: selectedGoalNutrient.unit,
          maxValue: goalValue
        });
        await setItem('visibleNutrients', visibleNutrients);
      } else {
        // Update the existing entry
        const updatedVisibleNutrients = visibleNutrients.map(item => {
          if (item.id === selectedGoalNutrient.id) {
            return {
              ...item,
              maxValue: goalValue
            };
          }
          return item;
        });
        await setItem('visibleNutrients', updatedVisibleNutrients);
      }
      
      // Reset the form and close the modal
      setSelectedGoalNutrient(null);
      setGoalAmount('');
      setCustomGoalModalVisible(false);
    } catch (error) {
      console.error('Error saving custom goal:', error);
    }
  };

  const calculateDailyTotal = (nutrientId) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayLogs = loggedNutrients.filter(
      log => new Date(log.timestamp).setHours(0, 0, 0, 0) === today && log.nutrientId === nutrientId
    );

    return todayLogs.reduce((total, log) => total + log.amount, 0);
  };

  const getPercentage = (nutrientId) => {
    const nutrient = nutrients.find(n => n.id === nutrientId);
    if (!nutrient || !nutrient.recommendedDaily) return 0;

    const total = calculateDailyTotal(nutrientId);
    return Math.round((total / nutrient.recommendedDaily) * 100);
  };

  const fetchData = async () => {
		const storedData = await getAllItems();
		console.log("Stored Data:", storedData); // Debugging
  
		// 1️⃣ Aggregate `loggedNutrients` to sum amounts by `nutrientId`
		const aggregatedNutrients = {};
		if (storedData.loggedNutrients) {
			storedData.loggedNutrients.forEach((log) => {
				const nutrientKey = log.nutrientId.toLowerCase().trim(); // Normalize key
				const amount = parseFloat(log.amount) || 0;
  
				if (trackedNutrients.includes(nutrientKey)) {
					aggregatedNutrients[nutrientKey] = (aggregatedNutrients[nutrientKey] || 0) + amount;
				}
			});
		}
  
		// 2️⃣ Merge with individual AsyncStorage values (if present)
		Object.keys(storedData).forEach((key) => {
			const normalizedKey = key.toLowerCase().trim();
			if (trackedNutrients.includes(normalizedKey) && !aggregatedNutrients[normalizedKey]) {
				aggregatedNutrients[normalizedKey] = parseFloat(storedData[key]) || 0;
			}
		});
  
		console.log("Aggregated Nutrient Data:", aggregatedNutrients); // Debugging
		return aggregatedNutrients;
	};

  const generateGoalWithAI = async () => {
	
	try {
		const { manifest } = Constants;

		const storedData = await getAllItems();
		console.log(storedData);

		const nutritionalInfo = await fetchData();

		console.log('nutritional info', nutritionalInfo);

		const nutritionalInfoString = Object.entries(nutritionalInfo)
			.map(([key, value]) => `${key}: ${value}`)
			.join("\n");

		const message = `I'm ${storedData['height']} and weight about ${storedData['weight']}.
		Here are my nutritional information: ${nutritionalInfoString}
		`

		console.log("message to send", message);

		const baseUrl = 
      		manifest?.debuggerHost?.split(':').shift() || 'localhost';

		const apiUrl = `http://localhost:8081/api/goal`;
    	console.log('Attempting to fetch from:', apiUrl);

		const response = await fetch(apiUrl, {
			method: 'POST',
			// headers: {
			// 	'Content-Type': 'application/json',
			// },
			body: JSON.stringify({ content: message })
		});
		const airesponse = await response.json();
		console.log("AI RESPONSE:", airesponse);
		await setItem("AI-Generated-Goal", airesponse.response);
	} catch (error) {
		console.error('Failed to reach /api/goal', error);
	}
  }

  return (
    <SafeAreaView style={[globalStyles.container, styles.overrideContainer]}>
      <Text style={[globalStyles.title, styles.overrideTitle]}>Nutrient Tracker</Text>

      {/* Custom Goal Button */}
      <TouchableOpacity 
        style={[globalStyles.authButton, styles.customGoalButton]} 
        onPress={() => setCustomGoalModalVisible(true)}
      >
        <Text style={[globalStyles.authButtonText, styles.customGoalButtonText]}>Set Custom Goal</Text>
      </TouchableOpacity>

		{/* Custom Goal Button */}
		<TouchableOpacity 
			style={[globalStyles.authButton, styles.aiButton]} 
			onPress={generateGoalWithAI}
		>
			<Text style={[globalStyles.authButtonText, styles.aiButtonText]}>Generate AI Goal</Text>
		</TouchableOpacity>

      <TouchableOpacity 
        style={[globalStyles.authButton, styles.logButton]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[globalStyles.authButtonText, styles.logButtonText]}>Log Nutrients</Text>
      </TouchableOpacity>

      <Text style={[globalStyles.sectionTitle, styles.sectionTitle]}>Today's Intake</Text>

      {loggedNutrients.length > 0 ? (
        <FlatList
          data={loggedNutrients}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[globalStyles.logItem, styles.logItem]}>
              <Text style={styles.logItemName}>{item.name}</Text>
              <Text style={styles.logItemAmount}>{item.amount} {item.unit}</Text>
              <Text style={styles.logItemPercentage}>
                {getPercentage(item.nutrientId)}% of daily
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={[globalStyles.emptyText, styles.emptyText]}>
          No nutrients logged today. Tap "Log Nutrients" to get started!
        </Text>
      )}

      {/* Nutrient Selection Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[globalStyles.modalContainer, styles.modalContainer]}
        >
          <View style={[globalStyles.modalContent, styles.modalContent]}>
            <Text style={globalStyles.modalTitle}>Log a Nutrient</Text>

            {selectedNutrient ? (
              <View style={styles.amountContainer}>
                <Text style={styles.selectedNutrientText}>
                  {selectedNutrient.name} ({selectedNutrient.unit})
                </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={`Amount in ${selectedNutrient.unit}`}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity 
                    style={[globalStyles.modalButton, styles.cancelButton]}
                    onPress={() => setSelectedNutrient(null)}
                  >
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[globalStyles.modalButton, styles.confirmButton]}
                    onPress={handleLogNutrient}
                  >
                    <Text style={styles.confirmButtonText}>Log Nutrient</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={nutrients}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.nutrientItem}
                    onPress={() => handleSelectNutrient(item)}
                  >
                    <Text style={styles.nutrientItemName}>{item.name}</Text>
                    <Text style={styles.nutrientItemType}>{item.type}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity 
              style={[globalStyles.closeButton, styles.closeButton]}
              onPress={() => {
                setSelectedNutrient(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Goal Modal */}
      <Modal animationType="slide" transparent visible={customGoalModalVisible}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[globalStyles.modalContainer, styles.modalContainer]}
        >
          <View style={[globalStyles.modalContent, styles.modalContent]}>
            <Text style={globalStyles.modalTitle}>Set Custom Goal</Text>

            {selectedGoalNutrient ? (
              <View style={styles.amountContainer}>
                <Text style={styles.selectedNutrientText}>
                  {selectedGoalNutrient.name} ({selectedGoalNutrient.unit})
                </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={`Goal amount in ${selectedGoalNutrient.unit}`}
                  keyboardType="numeric"
                  value={goalAmount}
                  onChangeText={setGoalAmount}
                />
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity 
                    style={[globalStyles.modalButton, styles.cancelButton]}
                    onPress={() => setSelectedGoalNutrient(null)}
                  >
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[globalStyles.modalButton, styles.confirmButton]}
                    onPress={handleSetCustomGoal}
                  >
                    <Text style={styles.confirmButtonText}>Set Goal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={nutrients}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.nutrientItem}
                    onPress={() => handleSelectGoalNutrient(item)}
                  >
                    <Text style={styles.nutrientItemName}>{item.name}</Text>
                    <Text style={styles.nutrientItemType}>{item.type}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity 
              style={[globalStyles.closeButton, styles.closeButton]}
              onPress={() => {
                setSelectedGoalNutrient(null);
                setCustomGoalModalVisible(false);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Existing styles...
  customGoalButton: {
    backgroundColor: '#007BFF', // Blue color for custom goal
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  customGoalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  logButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  logItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  logItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logItemAmount: {
    fontSize: 14,
    marginTop: 4,
  },
  logItemPercentage: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  amountContainer: {
    padding: 15,
  },
  selectedNutrientText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    color: '#333',
  },
  nutrientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutrientItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutrientItemType: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
	aiButton: {
		backgroundColor: '#007BFF', // Blue color for custom goal
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
		marginBottom: 10,
	},
	aiButtonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});