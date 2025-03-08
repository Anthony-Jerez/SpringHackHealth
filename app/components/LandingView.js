import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, Dimensions ,Image} from "react-native"
import { Link } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function LandingView() {
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="dark" />
			<ImageBackground
				source={{ uri: '/placeholder.svg?height=800&width=400' }}
				style={styles.backgroundImage}
				imageStyle={styles.backgroundImageStyle}
			>

      <View style={styles.microMeterContainer}>
                  <Text style={styles.microMeterTitle}>MicroMeter</Text>
                  <Image 
                    source={require('../assets/images/DrMariowVitamin.png')} 
                    style={{ width: 100, height: 150 }}
                  />
      </View>

				<View style={styles.overlay}>
					<View style={styles.contentContainer}>
						<View style={styles.headerContainer}>
							<Text style={styles.title}>
								Welcome to SpringHackHealth
							</Text>
							<Text style={styles.subtitle}>
								Your journey begins here. Connect, share, and
								explore.
							</Text>
						</View>

						<View style={styles.buttonContainer}>
							<Link href="/(auth)/sign-in" asChild>
								<TouchableOpacity
									style={styles.signInButton}
									activeOpacity={0.8}
								>
									<Text style={styles.signInText}>
										Sign In
									</Text>
								</TouchableOpacity>
							</Link>

							<Link href="/(auth)/sign-up" asChild>
								<TouchableOpacity
									style={styles.signUpButton}
									activeOpacity={0.8}
								>
									<Text style={styles.signUpText}>
										Create Account
									</Text>
								</TouchableOpacity>
							</Link>
						</View>

						<View style={styles.footerContainer}>
							<Text style={styles.footerText}>
								By continuing, you agree to our Terms of Service
								and Privacy Policy
							</Text>
						</View>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImageStyle: {
    opacity: 0.15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: height * 0.15,
    paddingBottom: height * 0.08,
  },
  headerContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  microMeterContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF', // Card-like background
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Ensures shadow on Android
  },
  microMeterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
    fontFamily: 'monospace',
  },
  microMeterImage: {
    width: 50, 
    height: 50,
    borderRadius: 10,
  },
  signInButton: {
    backgroundColor: "#BBDBD1",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: "transparent",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#BBDBD1",
  },
  signUpText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
  footerContainer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
})