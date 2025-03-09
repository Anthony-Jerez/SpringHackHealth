import LevelAnimation from '../components/LevelAnimation';
import { Avatar } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import StatsBar from '../components/StatsBar';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SignOutButton } from '../utils/SignOutButton';
import { useUser } from '@clerk/clerk-expo';
import { globalStyles } from '../styles/globalStyles';
import { useEffect, useState, useCallback } from 'react';
import { getAllItems } from '../utils/AsyncStorage'; // Import your function
import { useFocusEffect } from 'expo-router';
import { nutrients } from '../(tabs)/nutrientData'; // Import the nutrient list

export default function WelcomeView() {
	const { user } = useUser();

	const [nutrientData, setNutrientData] = useState({});
	const trackedNutrients = nutrients.map(n => n.id); // Extract valid IDs

	// Function to fetch & process data
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
		setNutrientData(aggregatedNutrients);
	};

	// 🔄 Fetch data every time the user navigates back to the screen
	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, [])
	);

	// ✅ Wrap content inside ScrollView for scrolling
	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<SignOutButton />
			<Text style={globalStyles.greeting}>Hello, {user?.username}!</Text>

			{/* Animated Avatar */}
			<Animated.View entering={FadeInDown.duration(1000)}>
				<Avatar.Image
					size={120}
					source={{
						uri: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Brian',
					}}
				/>
			</Animated.View>

			{/* Title */}
			<Text style={globalStyles.title}>Home</Text>

			{/* Render StatsBars with margin for spacing */}
			<View style={styles.statsContainer}>
				{/* {Object.entries(nutrientData).map(([key, value]) => (
					<StatsBar key={key} label={key} value={value} maxValue={100} />
				))} */}
				{Object.entries(nutrientData).map(([key, value]) => {
					const nutrient = nutrients.find(n => n.id === key);
					return nutrient ? (
						<StatsBar key={key} label={nutrient.name} value={value} maxValue={nutrient.recommendedDaily} />
					) : null;
				})}
			</View>

			{/* Add extra spacing below to prevent overlapping */}
			<View style={{ height: 100 }} />

			<LevelAnimation level={1} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		padding: 20,
		alignItems: 'center',
	},
	statsContainer: {
		width: '100%', // Ensures proper alignment
		alignItems: 'center',
		marginBottom: 20, // Adds space before LevelAnimation
	},
});