import React, { useState, useEffect, useCallback } from 'react';
import { Avatar } from 'react-native-paper';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from 'expo-router';
import { getItem, setItem, getAllItems } from '../utils/AsyncStorage';
import LevelAnimation from '../components/LevelAnimation';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import StatsBar from '../components/StatsBar';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { SignOutButton } from '../utils/SignOutButton';
import { globalStyles } from '../styles/globalStyles';
import { nutrients } from '../(tabs)/nutrientData'; // Import the nutrient list
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

		// 2️⃣ Merge with individual AsyncStorage values (if present)
		Object.keys(storedData).forEach((key) => {
			const normalizedKey = key.toLowerCase().trim();
			if (trackedNutrients.includes(normalizedKey) && !aggregatedNutrients[normalizedKey]) {
				aggregatedNutrients[normalizedKey] = parseFloat(storedData[key]) || 0;
			}
		});

		console.log("Aggregated Nutrient Data:", aggregatedNutrients); // Debugging
		setNutrientData(aggregatedNutrients);
	};

	// 🔄 Fetch data every time the user navigates back to the screen
	useFocusEffect(
		useCallback(() => {
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
		backgroundColor: '#f5f5f5',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: '#BBDBD1',
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
		backgroundColor: '#fff',
		borderWidth: 2,
		borderColor: '#fff',
	},
	userTextContainer: {
		marginLeft: 12,
	},
	welcomeText: {
		fontSize: 14,
		color: '#555',
		fontWeight: '500',
	},
	usernameText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
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
	cardHeader: {
		marginBottom: 16,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
	},
	cardSubtitle: {
		fontSize: 14,
		color: '#888',
		marginTop: 4,
	},
	levelContainer: {
		alignItems: 'center',
		marginVertical: 16,
		paddingVertical: 16,
		borderRadius: 12,
		backgroundColor: '#f9fcfb',
		borderWidth: 1,
		borderColor: '#BBDBD1',
	},
	statsSection: {
		marginTop: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#555',
		marginBottom: 12,
	},
	statsContainer: {
		width: '100%',
		alignItems: 'center',
		gap: 12,
	},
  statBarWrapper: {
    flexDirection: 'row', // Align children horizontally
    alignItems: 'center', // Vertically center children
    justifyContent: 'space-between', // Space out children
    marginBottom: 12,
  },
	emptyStateContainer: {
		alignItems: 'center',
		padding: 24,
	},
	emptyStateText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#666',
		textAlign: 'center',
	},
	emptyStateSubtext: {
		fontSize: 14,
		color: '#888',
		marginTop: 8,
		textAlign: 'center',
	},
  removeButton: {
    backgroundColor: '#FF6B6B', // Light red color
    width: 18,
    height: 18,
    borderRadius: 15, // Makes it circular
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  removeButtonText: {
    color: '#FFF', // White text
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20, // Ensures the "×" is centered vertically
  },
});