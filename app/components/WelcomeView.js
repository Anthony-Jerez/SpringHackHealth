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

  const trackedNutrients = nutrients.map(n => n.id); // Extract valid IDs
  const [aiGoal, setAIGoal] = useState(''); // State for AI goal
  
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
  
  // Function to fetch & process data
	const fetchData = async () => {
		const storedData = await getAllItems();
		console.log("Stored Data:", storedData); // Debugging

		const storedAIGoal = await getItem("AI-Generated-Goal");
		if (storedAIGoal) {
			setAIGoal(storedAIGoal);
		}

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
<<<<<<< HEAD
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style="dark" />
=======
		<SafeAreaView style={styles.container}>
			<StatusBar style="dark" />
			{/* Header Section */}
			<View style={styles.header}>
				<Animated.View entering={FadeIn.duration(800)}>
					<View style={styles.userInfoContainer}>
						<Animated.View
							entering={FadeInDown.duration(1000).delay(200)}
						>
							<Avatar.Image
								size={60}
								source={{
									uri: 'https://api.dicebear.com/9.x/pixel-art/png?seed=Brian', // expo doesn't natively support svg so png instead
								}}
								style={styles.avatar}
							/>
						</Animated.View>
>>>>>>> 6abd2ff3af3112304fbf732564bb3ce11593ecac

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
				{/* Dashboard Card */}
				<Animated.View
					style={styles.dashboardCard}
					entering={FadeInDown.duration(800).delay(300)}
				>
					<View style={styles.cardHeader}>
						<Text style={styles.cardTitle}>
							Your Nutrition Dashboard
						</Text>
						<Text style={styles.cardSubtitle}>
							Daily nutrient tracking
						</Text>
					</View>

					{/* Level Display */}
					<View style={styles.levelContainer}>
						<LevelAnimation level={1} />
					</View>

					{/* Nutrient goals from user */}
					{visibleNutrients.length > 0 ? (
						<View style={styles.statsContainer}>
							<Text style={styles.sectionTitle}>
								Your Nutrient Goals
							</Text>
							{visibleNutrients.map((nutrient) => (
								<View
									key={nutrient.id}
									style={styles.statBarWrapper}
								>
									<StatsBar
										label={`${nutrient.name} (${nutrient.unit})`}
										storageKey={nutrient.name.toLowerCase()}
										maxValue={nutrient.maxValue}
									/>
									<TouchableOpacity
										style={styles.removeButton}
										onPress={() =>
											handleRemoveNutrient(nutrient.id)
										}
									>
										<Text style={styles.removeButtonText}>
											×
										</Text>
									</TouchableOpacity>
								</View>
							))}
						</View>
					) : (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>
								No custom nutrient goals set yet. Go to the
								"Log" tab and tap "Set Custom Goal" to get
								started!
							</Text>
						</View>
					)}

					{/* ✅ AI-Generated Goal Section */}
					<View style={styles.aiGoalContainer}>
						<Text style={styles.sectionTitle}>AI-Generated Goal</Text>
						{aiGoal ? (
							<Text style={styles.aiGoalText}>{aiGoal}</Text>
						) : (
							<Text style={styles.emptyText}>No AI goal generated yet.</Text>
						)}
					</View>

					{/* Stats Section */}
					<View style={styles.statsSection}>
						<Text style={styles.sectionTitle}>
							Today's Nutrients
						</Text>

						<View style={styles.statsContainer}>
							{Object.entries(nutrientData).length > 0 ? (
								Object.entries(nutrientData).map(
									([key, value]) => {
										const nutrient = nutrients.find(
											(n) => n.id === key
										);
										return nutrient ? (
											<StatsBar
												key={key}
												label={nutrient.name}
												value={value}
												maxValue={
													nutrient.recommendedDaily
												}
											/>
										) : null;
									}
								)
							) : (
								<View style={styles.emptyStateContainer}>
									<Text style={styles.emptyStateText}>
										No nutrients logged yet today.
									</Text>
									<Text style={styles.emptyStateSubtext}>
										Add nutrients to see your progress!
									</Text>
								</View>
							)}
						</View>
					</View>
				</Animated.View>

				{/* Add extra spacing below */}
				<View style={{ height: 20 }} />
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


