//blank page, which can be navigated to at bottom of the page
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { nutrients } from './nutrientData';

export default function NutrientLogScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [amount, setAmount] = useState('');
  const [loggedNutrients, setLoggedNutrients] = useState([]);

  const handleSelectNutrient = (nutrient) => {
    setSelectedNutrient(nutrient);
  };

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

  // Calculate total nutrients logged for the day
  const calculateDailyTotal = (nutrientId) => {
    // Filter today's logs for the specific nutrient
    const today = new Date().setHours(0, 0, 0, 0);
    const todayLogs = loggedNutrients.filter(
      log => new Date(log.timestamp).setHours(0, 0, 0, 0) === today && log.nutrientId === nutrientId
    );
    
    // Sum up the amounts
    return todayLogs.reduce((total, log) => total + log.amount, 0);
  };

  // Get percentage of daily recommended intake
  const getPercentage = (nutrientId) => {
    const nutrient = nutrients.find(n => n.id === nutrientId);
    if (!nutrient || !nutrient.recommendedDaily) return 0;
    
    const total = calculateDailyTotal(nutrientId);
    return Math.round((total / nutrient.recommendedDaily) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nutrient Tracker</Text>
      
      <TouchableOpacity 
        style={styles.logButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.logButtonText}>Log Nutrients</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Today's Intake</Text>
      
      {loggedNutrients.length > 0 ? (
        <FlatList
          data={loggedNutrients}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logItemName}>{item.name}</Text>
              <Text style={styles.logItemAmount}>{item.amount} {item.unit}</Text>
              <Text style={styles.logItemPercentage}>
                {getPercentage(item.nutrientId)}% of daily
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No nutrients logged today. Tap "Log Nutrients" to get started!</Text>
      )}
      
      {/* Nutrient Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log a Nutrient</Text>
            
            {selectedNutrient ? (
              // Amount Entry View
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
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setSelectedNutrient(null)}
                  >
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleLogNutrient}
                  >
                    <Text style={styles.confirmButtonText}>Log Nutrient</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Nutrient Selection View
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
              style={styles.closeButton}
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  nutrientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nutrientItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutrientItemType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#999',
    fontSize: 16,
  },
  amountContainer: {
    padding: 15,
  },
  selectedNutrientText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});