import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, FlatList, TextInput, 
  SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { nutrients } from './nutrientData';
import { globalStyles } from '../styles/globalStyles';

export default function NutrientLogScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth(); // ✅ Prevent premature navigation
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [amount, setAmount] = useState('');
  const [loggedNutrients, setLoggedNutrients] = useState([]);

  useEffect(() => {
    if (!isLoaded) return; // ✅ Prevents premature navigation
    if (!isSignedIn) {
      router.replace('/'); // ✅ Redirect unauthorized users
    }
  }, [isSignedIn, isLoaded]);

  // Prevents rendering while Clerk is still determining authentication status
  if (!isLoaded || !isSignedIn) return null;

  const handleSelectNutrient = (nutrient) => setSelectedNutrient(nutrient);

  const handleLogNutrient = () => {
    if (!selectedNutrient || !amount) return;
    
    const newLogEntry = {
      id: Date.now().toString(),
      nutrientId: selectedNutrient.id,
      name: selectedNutrient.name,
      amount: parseFloat(amount),
      unit: selectedNutrient.unit,
      timestamp: new Date(),
    };

    setLoggedNutrients([...loggedNutrients, newLogEntry]);
    setSelectedNutrient(null);
    setAmount('');
    setModalVisible(false);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});

