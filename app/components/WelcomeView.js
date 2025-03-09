import LevelAnimation from '../components/LevelAnimation';
import { Avatar } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import StatsBar from '../components/StatsBar';
import { StyleSheet, View, Text } from 'react-native';
import { SignOutButton } from '../utils/SignOutButton';
import { useUser } from '@clerk/clerk-expo';
import { globalStyles } from '../styles/globalStyles';
import { useEffect, useState, useCallback } from 'react';
import { getAllItems } from '../utils/AsyncStorage'; // Import your function
import { useFocusEffect } from 'expo-router';


export default function WelcomeView() {
	const { user } = useUser();

	const [nutrientData, setNutrientData] = useState({});
  
	// Only track these nutrients
	const trackedNutrients = ['magnesium', 'Vitamin B12', 'iodine', 'calcium', 'iron', 'vitamin D', 'vitamin A'];
  
	// Function to fetch AsyncStorage data
	const fetchData = async () => {
		const storedData = await getAllItems();
		
		// Filter only relevant nutrients
		const filteredData = Object.keys(storedData)
			.filter(key => trackedNutrients.includes(key.toLowerCase())) // Normalize case
			.reduce((obj, key) => {
				obj[key] = storedData[key];
				return obj;
			}, {});

		setNutrientData(filteredData);
	};

	// 🔄 Fetch data every time the user navigates back to the screen
	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, [])
	);

	return (
		<>
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

			{/* Retro Stats Bar for Nutrients */}
			{/* <StatsBar label="Protein" storageKey='protein' maxValue={100} />
			<StatsBar label="Vitamin C" storageKey='vitaminC' maxValue={100} />
			<StatsBar label="Iron" storageKey='iron' maxValue={100} /> */}
			{/* Render StatsBar for each valid nutrient */}
			{Object.entries(nutrientData).map(([key, value]) => (
				<StatsBar key={key} label={key} value={value} maxValue={100} />
			))}
			<LevelAnimation level={1} />
		</>
	);
}

const styles = StyleSheet.create({
	noNutrientsText: {
	  textAlign: 'center',
	  padding: 20,
	  color: '#666',
	  fontStyle: 'italic',
	}
  });