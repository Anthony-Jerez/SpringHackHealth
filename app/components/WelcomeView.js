import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from 'expo-router';
import { getItem, setItem, getAllItems } from '../utils/AsyncStorage';
import StatsBar from '../components/StatsBar';
import LevelAnimation from '../components/LevelAnimation';
import { SignOutButton } from '../utils/SignOutButton';
import { globalStyles } from '../styles/globalStyles';

export default function WelcomeView() {
  const { user } = useUser();
  const [visibleNutrients, setVisibleNutrients] = useState([]);
  const [nutrientData, setNutrientData] = useState({});
  
  // Only track these nutrients
  const trackedNutrients = ['magnesium', 'Vitamin B12', 'iodine', 'calcium', 'iron', 'vitamin D', 'vitamin A'];
  
  useEffect(() => {
    // Load visible nutrients from AsyncStorage
    const loadVisibleNutrients = async () => {
      try {
        const nutrients = await getItem('visibleNutrients');
        if (nutrients) {
          setVisibleNutrients(nutrients);
        }
      } catch (error) {
        console.error('Error loading visible nutrients:', error);
      }
    };
    
    loadVisibleNutrients();
    const interval = setInterval(loadVisibleNutrients, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stored nutrient data
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const storedData = await getAllItems();
        const filteredData = Object.keys(storedData)
          .filter(key => trackedNutrients.includes(key.toLowerCase()))
          .reduce((obj, key) => {
            obj[key] = storedData[key];
            return obj;
          }, {});
        setNutrientData(filteredData);
      };
      fetchData();
    }, [])
  );

  const handleRemoveNutrient = async (nutrientId) => {
    try {
      const updatedNutrients = visibleNutrients.filter(item => item.id !== nutrientId);
      setVisibleNutrients(updatedNutrients);
      await setItem('visibleNutrients', updatedNutrients);
    } catch (error) {
      console.error('Error removing nutrient:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SignOutButton />
      <Text style={globalStyles.greeting}>Hello, {user?.username}!</Text>
      
      {/* Animated Avatar */}
      <Animated.View entering={FadeInDown.duration(1000)}>
        <Avatar.Image
          size={120}
          source={{ uri: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=' + (user?.username || 'User') }}
        />
      </Animated.View>
      
      <Text style={styles.welcomeTitle}>Welcome to NutriTrack</Text>
      
      {visibleNutrients.length > 0 ? (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Nutrient Goals</Text>
          {visibleNutrients.map((nutrient) => (
            <View key={nutrient.id} style={styles.statBarWrapper}>
              <StatsBar
                label={`${nutrient.name} (${nutrient.unit})`}
                storageKey={nutrient.name.toLowerCase()}
                maxValue={nutrient.maxValue}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveNutrient(nutrient.id)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No custom nutrient goals set yet. Go to the "Log" tab and tap "Set Custom Goal" to get started!
          </Text>
        </View>
      )}

      {/* Render StatsBar for each valid nutrient */}
      {Object.entries(nutrientData).map(([key, value]) => (
        <StatsBar key={key} label={key} value={value} maxValue={100} />
      ))}
      
      <LevelAnimation level={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statBarWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
});
