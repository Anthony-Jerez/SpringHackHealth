import { Text, View, StyleSheet } from "react-native";
import { Link } from 'expo-router';

export default function LandingView() {
	return (
		<>
			<View>
				<Link href="/(auth)/sign-in">
					<Text>Sign in</Text>
				</Link>
				<Link href="/(auth)/sign-up">
					<Text>Sign up</Text>
				</Link>
			</View>
		</>
	)
}