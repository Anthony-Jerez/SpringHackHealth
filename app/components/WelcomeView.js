import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView 
} from 'react-native';
import { Avatar } from 'react-native-paper';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from 'expo-router';
import { getItem, setItem, getAllItems, removeItem, clear } from '../utils/AsyncStorage';
import LevelAnimation from '../components/LevelAnimation';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import StatsBar from '../components/StatsBar';
import { SignOutButton } from '../utils/SignOutButton';
import { globalStyles } from '../styles/globalStyles';
import { nutrients } from '../(tabs)/nutrientData'; 
import { StatusBar } from 'expo-status-bar';

export default function WelcomeView() {
  const { user } = useUser();
  const [visibleNutrients, setVisibleNutrients] = useState([]);
  const [nutrientData, setNutrientData] = useState({});

  // Extract valid nutrient IDs from the nutrients data
  const trackedNutrients = nutrients.map(n => n.id.toLowerCase());

  // Load visible nutrients from AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const loadVisibleNutrients = async () => {
        try {
          const storedNutrients = await getItem('visibleNutrients');
          setVisibleNutrients(storedNutrients || []);
        } catch (error) {
          console.error('Error loading visible nutrients:', error);
        }
      };
      loadVisibleNutrients();
    }, [])
  );

  // Fetch stored nutrient data whenever the view comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const storedData = await getAllItems();
          console.log("Stored Data:", storedData);

          // Aggregate logged nutrient data
          const aggregatedNutrients = {};
          if (storedData.loggedNutrients) {
            storedData.loggedNutrients.forEach((log) => {
              const nutrientKey = log.nutrientId.toLowerCase().trim();
              const amount = parseFloat(log.amount) || 0;

              if (trackedNutrients.includes(nutrientKey)) {
                aggregatedNutrients[nutrientKey] = (aggregatedNutrients[nutrientKey] || 0) + amount;
              }
            });
          }

          // Merge with individual AsyncStorage values
          Object.keys(storedData).forEach((key) => {
            const nutrient = nutrients.find(
              n => n.id.toLowerCase() === key.toLowerCase() || 
                   n.name.toLowerCase() === key.toLowerCase()
            );

            if (nutrient && typeof storedData[key] === 'number') {
              aggregatedNutrients[nutrient.id.toLowerCase()] = storedData[key];
            }
          });

          console.log("Aggregated Nutrient Data:", aggregatedNutrients);
          setNutrientData(aggregatedNutrients);
        } catch (error) {
          console.error('Error fetching nutrient data:', error);
        }
      };
      
      fetchData();
    }, [])
  );

  // Clear AsyncStorage when the button is pressed
  const handleClearStorage = async () => {
    await clear();
    setVisibleNutrients([]);
    setNutrientData({});
    console.log('AsyncStorage cleared');
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />

      {/* Header Section */}
      <View style={styles.header}>
        <Animated.View entering={FadeIn.duration(800)}>
          <View style={styles.userInfoContainer}>
            <Animated.View entering={FadeInDown.duration(1000).delay(200)}>
              <Avatar.Image
                size={60}
                source={{
                  uri: `https://api.dicebear.com/9.x/pixel-art/png?seed=${user?.username || 'User'}`,
                }}
                style={styles.avatar}
              />
            </Animated.View>

            <View style={styles.userTextContainer}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.usernameText}>
                {user?.username || 'User'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <SignOutButton />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={styles.dashboardCard} entering={FadeInDown.duration(800).delay(300)}>
          {/* Dashboard Header with Clear Button */}
          <View style={styles.dashboardHeader}>
            <Text style={styles.cardTitle}>Your Nutrition Dashboard</Text>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearStorage}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.levelContainer}>
            <LevelAnimation level={1} />
          </View>

          {/* Custom Nutrient Goals */}
          {visibleNutrients.length > 0 ? (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Your Custom Nutrient Goals</Text>
              <View style={styles.statsContainer}>
                {visibleNutrients.map((nutrient) => (
                  <StatsBar
                    key={nutrient.id}
                    label={`${nutrient.name} (${nutrient.unit})`}
                    value={nutrientData[nutrient.id.toLowerCase()] || 0}
                    maxValue={nutrient.maxValue}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No custom nutrient goals set yet.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  userTextContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});


