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
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

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

		const message = `
		I'm a young adult that is ${storedData['height']} cm tall and weight about ${storedData['weight']}.
		Here are my nutritional information: 
		${nutritionalInfoString}
		`

		console.log("message to send", message);

		const baseUrl = 
      		manifest?.debuggerHost?.split(':').shift() || 'localhost';

		const apiUrl = `http://bzywtj0-anonymous-8069.exp.direct/api/goal`;
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrient Tracker</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
          <View style={styles.actionButtonInner}>
            <MaterialCommunityIcons name="food-apple" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Log Nutrients</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.goalButton]}
          onPress={() => setCustomGoalModalVisible(true)}
        >
          <View style={styles.actionButtonInner}>
            <Ionicons name="flag" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Set Goal</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.aiButton]} onPress={generateGoalWithAI}>
          <View style={styles.actionButtonInner}>
            <FontAwesome5 name="robot" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>AI Goal</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Today's Intake Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Intake</Text>
          <Text style={styles.sectionSubtitle}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {loggedNutrients.length > 0 ? (
          <FlatList
            data={loggedNutrients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const percentage = getPercentage(item.nutrientId)
              return (
                <View style={styles.logItem}>
                  <View style={styles.logItemHeader}>
                    <Text style={styles.logItemName}>{item.name}</Text>
                    <Text style={styles.logItemAmount}>
                      {item.amount} {item.unit}
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${Math.min(percentage, 100)}%` },
                        percentage > 100
                          ? styles.progressBarExceeded
                          : percentage >= 80
                            ? styles.progressBarNearComplete
                            : null,
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.logItemPercentage,
                      percentage > 100
                        ? styles.percentageExceeded
                        : percentage >= 80
                          ? styles.percentageNearComplete
                          : null,
                    ]}
                  >
                    {percentage}% of daily goal
                  </Text>
                </View>
              )
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No nutrients logged today</Text>
            <Text style={styles.emptySubtext}>Tap "Log Nutrients" to get started!</Text>
          </View>
        )}
      </View>

      {/* Nutrient Selection Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log a Nutrient</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setSelectedNutrient(null)
                  setModalVisible(false)
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

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
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedNutrient(null)}>
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleLogNutrient}>
                    <Text style={styles.confirmButtonText}>Log Nutrient</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={nutrients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.nutrientItem} onPress={() => handleSelectNutrient(item)}>
                    <Text style={styles.nutrientItemName}>{item.name}</Text>
                    <Text style={styles.nutrientItemType}>{item.type}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Goal Modal */}
      <Modal animationType="slide" transparent visible={customGoalModalVisible}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Custom Goal</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setSelectedGoalNutrient(null)
                  setCustomGoalModalVisible(false)
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

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
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedGoalNutrient(null)}>
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleSetCustomGoal}>
                    <Text style={styles.confirmButtonText}>Set Goal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FlatList
                data={nutrients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.nutrientItem} onPress={() => handleSelectGoalNutrient(item)}>
                    <Text style={styles.nutrientItemName}>{item.name}</Text>
                    <Text style={styles.nutrientItemType}>{item.type}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  backgroundColor: "#f5f5f5",
	},
	header: {
	  backgroundColor: "#BBDBD1",
	  paddingVertical: 16,
	  paddingHorizontal: 20,
	  borderBottomLeftRadius: 20,
	  borderBottomRightRadius: 20,
	  shadowColor: "#000",
	  shadowOffset: { width: 0, height: 2 },
	  shadowOpacity: 0.1,
	  shadowRadius: 4,
	  elevation: 3,
	},
	headerTitle: {
	  fontSize: 24,
	  fontWeight: "bold",
	  color: "#333",
	  textAlign: "center",
	},
	actionButtonsContainer: {
	  flexDirection: "row",
	  justifyContent: "space-between",
	  padding: 16,
	  marginTop: 8,
	},
	actionButton: {
	  flex: 1,
	  backgroundColor: "#BBDBD1",
	  borderRadius: 12,
	  padding: 12,
	  marginHorizontal: 4,
	  shadowColor: "#000",
	  shadowOffset: { width: 0, height: 1 },
	  shadowOpacity: 0.1,
	  shadowRadius: 2,
	  elevation: 2,
	},
	actionButtonInner: {
	  alignItems: "center",
	  justifyContent: "center",
	},
	actionButtonText: {
	  color: "#fff",
	  fontWeight: "bold",
	  marginTop: 4,
	  fontSize: 12,
	  textAlign: "center",
	},
	goalButton: {
	  backgroundColor: "#5E8B7E", // Darker shade of the mint green
	},
	aiButton: {
	  backgroundColor: "#2A6877", // Blue-green color
	},
	sectionContainer: {
	  flex: 1,
	  padding: 16,
	},
	sectionHeader: {
	  marginBottom: 16,
	},
	sectionTitle: {
	  fontSize: 20,
	  fontWeight: "bold",
	  color: "#333",
	},
	sectionSubtitle: {
	  fontSize: 14,
	  color: "#888",
	  marginTop: 4,
	},
	listContent: {
	  paddingBottom: 20,
	},
	logItem: {
	  backgroundColor: "white",
	  padding: 16,
	  borderRadius: 12,
	  marginBottom: 12,
	  shadowColor: "#000",
	  shadowOffset: { width: 0, height: 1 },
	  shadowOpacity: 0.1,
	  shadowRadius: 2,
	  elevation: 2,
	},
	logItemHeader: {
	  flexDirection: "row",
	  justifyContent: "space-between",
	  alignItems: "center",
	  marginBottom: 8,
	},
	logItemName: {
	  fontSize: 16,
	  fontWeight: "bold",
	  color: "#333",
	},
	logItemAmount: {
	  fontSize: 14,
	  color: "#666",
	  fontWeight: "500",
	},
	progressBarContainer: {
	  height: 8,
	  backgroundColor: "#f0f0f0",
	  borderRadius: 4,
	  marginBottom: 8,
	  overflow: "hidden",
	},
	progressBar: {
	  height: "100%",
	  backgroundColor: "#BBDBD1",
	  borderRadius: 4,
	},
	progressBarNearComplete: {
	  backgroundColor: "#5E8B7E",
	},
	progressBarExceeded: {
	  backgroundColor: "#E67E22",
	},
	logItemPercentage: {
	  fontSize: 12,
	  color: "#888",
	  textAlign: "right",
	},
	percentageNearComplete: {
	  color: "#5E8B7E",
	  fontWeight: "500",
	},
	percentageExceeded: {
	  color: "#E67E22",
	  fontWeight: "500",
	},
	emptyContainer: {
	  flex: 1,
	  justifyContent: "center",
	  alignItems: "center",
	  padding: 20,
	},
	emptyText: {
	  fontSize: 18,
	  fontWeight: "500",
	  color: "#666",
	  marginTop: 16,
	  textAlign: "center",
	},
	emptySubtext: {
	  fontSize: 14,
	  color: "#888",
	  marginTop: 8,
	  textAlign: "center",
	},
	modalContainer: {
	  flex: 1,
	  justifyContent: "flex-end",
	  backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContent: {
	  backgroundColor: "white",
	  borderTopLeftRadius: 20,
	  borderTopRightRadius: 20,
	  padding: 20,
	  maxHeight: "80%",
	},
	modalHeader: {
	  flexDirection: "row",
	  justifyContent: "space-between",
	  alignItems: "center",
	  marginBottom: 16,
	  paddingBottom: 16,
	  borderBottomWidth: 1,
	  borderBottomColor: "#f0f0f0",
	},
	modalTitle: {
	  fontSize: 20,
	  fontWeight: "bold",
	  color: "#333",
	},
	modalCloseButton: {
	  padding: 4,
	},
	amountContainer: {
	  padding: 16,
	},
	selectedNutrientText: {
	  fontSize: 18,
	  fontWeight: "bold",
	  color: "#333",
	  marginBottom: 16,
	},
	amountInput: {
	  borderWidth: 1,
	  borderColor: "#BBDBD1",
	  borderRadius: 12,
	  padding: 16,
	  marginBottom: 20,
	  fontSize: 16,
	  backgroundColor: "#F9FCFB",
	},
	modalButtonsRow: {
	  flexDirection: "row",
	  justifyContent: "space-between",
	  gap: 12,
	},
	cancelButton: {
	  flex: 1,
	  backgroundColor: "#f0f0f0",
	  padding: 16,
	  borderRadius: 12,
	  alignItems: "center",
	},
	cancelButtonText: {
	  color: "#666",
	  fontWeight: "600",
	},
	confirmButton: {
	  flex: 1,
	  backgroundColor: "#BBDBD1",
	  padding: 16,
	  borderRadius: 12,
	  alignItems: "center",
	},
	confirmButtonText: {
	  color: "#fff",
	  fontWeight: "bold",
	},
	nutrientItem: {
	  padding: 16,
	  borderBottomWidth: 1,
	  borderBottomColor: "#f0f0f0",
	},
	nutrientItemName: {
	  fontSize: 16,
	  fontWeight: "bold",
	  color: "#333",
	},
	nutrientItemType: {
	  fontSize: 14,
	  color: "#888",
	  marginTop: 4,
	},
  })