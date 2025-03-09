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

export default function NutrientLogScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [amount, setAmount] = useState('');
  const [loggedNutrients, setLoggedNutrients] = useState([]);

  // States for setting custom goals
  const [customGoalModalVisible, setCustomGoalModalVisible] = useState(false);
  const [selectedGoalNutrient, setSelectedGoalNutrient] = useState(null);
  const [goalAmount, setGoalAmount] = useState('');

  // ✅ AI Goal Modal State
  const [aiGoalModalVisible, setAiGoalModalVisible] = useState(false);
  
  // ✅ Added states for user metrics
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // ✅ AI Goal Function - Placeholder for AI recommendations
  const handleGenerateAiGoal = async () => {
    try {
      const loggedData = await getItem('loggedNutrients') || [];
      const currentGoals = await getItem('visibleNutrients') || [];

      // Save user metrics
      await setItem('userMetrics', {
        sex,
        height,
        weight
      });

      // TODO: Implement AI model to generate recommended goals
      const recommendedGoals = [
        { id: 'protein', name: 'Protein', unit: 'g', maxValue: 100 },
        { id: 'fiber', name: 'Fiber', unit: 'g', maxValue: 30 }
      ];

      // Save AI-generated goals
      await setItem('aiRecommendedGoals', recommendedGoals);

      setAiGoalModalVisible(false);
      console.log("AI Goal Recommendations:", recommendedGoals);
      console.log("User Metrics:", { sex, height, weight });
      
    } catch (error) {
      console.error('Error generating AI goals:', error);
    }
  };

  // Load user metrics on mount
  useEffect(() => {
    const loadUserMetrics = async () => {
      try {
        const storedMetrics = await getItem('userMetrics');
        if (storedMetrics) {
          setSex(storedMetrics.sex || '');
          setHeight(storedMetrics.height || '');
          setWeight(storedMetrics.weight || '');
        }
      } catch (error) {
        console.error('Error loading user metrics:', error);
      }
    };

    loadUserMetrics();
  }, []);

  // Add the debugging useEffect here
  useEffect(() => {
    const checkStorage = async () => {
      const allData = await getAllItems();
      console.log("All AsyncStorage data:", allData);
      
      // Specifically check visibleNutrients
      const visibleNuts = await getItem('visibleNutrients');
      console.log("Visible nutrients:", visibleNuts);
    };

    checkStorage();
  }, []);

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
      
      // Debug: Log all stored data
      const storedData = await getAllItems();
      console.log(JSON.stringify(storedData, null, 2));
    } catch (error) {
      console.error('Error saving nutrient log:', error);
    }

    setSelectedNutrient(null);
    setAmount('');
    setModalVisible(false);
  };

  // Function to handle setting custom goals
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

  return (
    <SafeAreaView style={[globalStyles.container, styles.overrideContainer]}>
      <Text style={[globalStyles.title, styles.overrideTitle]}>Nutrient Tracker</Text>

      {/* ✅ AI Goal Button */}
      <TouchableOpacity 
        style={[globalStyles.authButton, styles.aiGoalButton]} 
        onPress={() => setAiGoalModalVisible(true)}
      >
        <Text style={[globalStyles.authButtonText, styles.aiGoalButtonText]}>AI Goal</Text>
      </TouchableOpacity>

      {/* Custom Goal Button */}
      <TouchableOpacity 
        style={[globalStyles.authButton, styles.customGoalButton]} 
        onPress={() => setCustomGoalModalVisible(true)}
      >
        <Text style={[globalStyles.authButtonText, styles.customGoalButtonText]}>Set Custom Goal</Text>
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

      {/* ✅ AI Goal Modal - Updated with Sex, Height, Weight inputs */}
      <Modal animationType="slide" transparent visible={aiGoalModalVisible}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[globalStyles.modalContainer, styles.modalContainer]}
        >
          <View style={[globalStyles.modalContent, styles.modalContent]}>
            <Text style={globalStyles.modalTitle}>AI Recommended Goals</Text>
            
            <Text style={styles.aiInfoText}>
              Please provide your information to get personalized nutrition goals:
            </Text>
            
            <View style={styles.aiRecommendationsContainer}>
              {/* Sex Input */}
              <View style={styles.metricInputContainer}>
                <Text style={styles.metricLabel}>Sex:</Text>
                <TextInput
                  style={styles.metricInput}
                  placeholder="Male/Female"
                  value={sex}
                  onChangeText={setSex}
                />
              </View>
              
              {/* Height Input */}
              <View style={styles.metricInputContainer}>
                <Text style={styles.metricLabel}>Height (cm):</Text>
                <TextInput
                  style={styles.metricInput}
                  placeholder="e.g., 175"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              
              {/* Weight Input */}
              <View style={styles.metricInputContainer}>
                <Text style={styles.metricLabel}>Weight (kg):</Text>
                <TextInput
                  style={styles.metricInput}
                  placeholder="e.g., 70"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity 
                style={[globalStyles.modalButton, styles.cancelButton]}
                onPress={() => setAiGoalModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[globalStyles.modalButton, styles.confirmButton]}
                onPress={handleGenerateAiGoal}
              >
                <Text style={styles.confirmButtonText}>Generate Goals</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[globalStyles.closeButton, styles.closeButton]}
              onPress={() => setAiGoalModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  overrideContainer: {
    // Add any container overrides here
  },
  overrideTitle: {
    // Add any title overrides here
  },
  // ✅ AI Goal Button Styles
  aiGoalButton: {
    backgroundColor: '#8A2BE2', // Purple AI button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  aiGoalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiInfoText: {
    fontSize: 16,
    marginVertical: 15,
    lineHeight: 22,
  },
  aiRecommendationsContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  // ✅ Styles for the new metric inputs
  metricInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '500',
    width: 100,
  },
  metricInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  placeholderText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
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
});