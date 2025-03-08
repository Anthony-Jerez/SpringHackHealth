import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, 
	TextInput, 
	Button, 
	View, 
	TouchableOpacity, 
	StyleSheet, 
	KeyboardAvoidingView, 
	Platform, 
	ScrollView, 
	SafeAreaView 
} from 'react-native'
import { StatusBar } from "expo-status-bar"
import React, { useCallback, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'

export const useWarmUpBrowser = () => {
	useEffect(() => {
	  // Preloads the browser for Android devices to reduce authentication load time
	  // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
	  void WebBrowser.warmUpAsync()
	  return () => {
		// Cleanup: closes browser when component unmounts
		void WebBrowser.coolDownAsync()
	  }
	}, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
	useWarmUpBrowser()

	// Use the `useSSO()` hook to access the `startSSOFlow()` method
	const { startSSOFlow } = useSSO()

  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onPressGoogle = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        // Defaults to current path
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive({ session: createdSessionId })
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])

  const onPressApple = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_apple',
        // Defaults to current path
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive({ session: createdSessionId })
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="dark" />
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					<View style={styles.card}>
						{/* Header */}
						<Text style={styles.title}>Sign into SpringHackHealth</Text>
						<Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>

						{/* Social Sign In */}
						<View style={styles.socialButtonsContainer}>
							<TouchableOpacity
								style={[styles.socialButton, styles.googleButton]}
								onPress={onPressGoogle}
								activeOpacity={0.8}
							>
								<Text style={styles.socialButtonText}>Google</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.socialButton, styles.appleButton]}
								onPress={onPressApple}
								activeOpacity={0.8}
							>
								<Text style={styles.socialButtonText}>Apple</Text>
							</TouchableOpacity>
						</View>

						{/* Divider */}
						<View style={styles.dividerContainer}>
							<View style={styles.dividerLine} />
							<Text style={styles.dividerText}>or</Text>
							<View style={styles.dividerLine} />
						</View>

						{/* Email/Password Sign In */}
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								autoCapitalize="none"
								value={emailAddress}
								placeholder="Email address"
								onChangeText={(email) => setEmailAddress(email)}
								keyboardType="email-address"
							/>
						</View>

						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								value={password}
								placeholder="Password"
								secureTextEntry={true}
								onChangeText={(password) => setPassword(password)}
							/>
						</View>

						<TouchableOpacity style={styles.button} onPress={onSignInPress} activeOpacity={0.8}>
							<Text style={styles.buttonText}>Sign In</Text>
						</TouchableOpacity>

						{/* Sign Up Link */}
						<View style={styles.signUpContainer}>
							<Text style={styles.signUpText}>Don't have an account?</Text>
							<Link href="/sign-up" asChild>
								<TouchableOpacity>
									<Text style={styles.signUpLink}>Sign up</Text>
								</TouchableOpacity>
							</Link>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  backgroundColor: "#f5f5f5",
	},
	keyboardAvoid: {
	  flex: 1,
	},
	scrollContent: {
	  flexGrow: 1,
	  justifyContent: "center",
	  padding: 20,
	},
	card: {
	  backgroundColor: "white",
	  borderRadius: 12,
	  padding: 24,
	  shadowColor: "#000",
	  shadowOffset: { width: 0, height: 2 },
	  shadowOpacity: 0.1,
	  shadowRadius: 4,
	  elevation: 3,
	},
	title: {
	  fontSize: 24,
	  fontWeight: "bold",
	  color: "#333",
	  marginBottom: 8,
	  textAlign: "center",
	},
	subtitle: {
	  fontSize: 14,
	  color: "#888",
	  marginBottom: 24,
	  textAlign: "center",
	},
	socialButtonsContainer: {
	  flexDirection: "row",
	  justifyContent: "space-between",
	  marginBottom: 24,
	},
	socialButton: {
	  flex: 1,
	  height: 48,
	  borderRadius: 8,
	  justifyContent: "center",
	  alignItems: "center",
	  marginHorizontal: 4,
	},
	googleButton: {
	  backgroundColor: "#f2f2f2",
	  borderWidth: 1,
	  borderColor: "#ddd",
	},
	appleButton: {
	  backgroundColor: "#f2f2f2",
	},
	socialButtonText: {
	  fontSize: 14,
	  fontWeight: "600",
	  color: "#333",
	},
	dividerContainer: {
	  flexDirection: "row",
	  alignItems: "center",
	  marginBottom: 24,
	},
	dividerLine: {
	  flex: 1,
	  height: 1,
	  backgroundColor: "#ddd",
	},
	dividerText: {
	  paddingHorizontal: 10,
	  color: "#888",
	  fontSize: 14,
	},
	inputContainer: {
	  marginBottom: 16,
	  borderWidth: 1,
	  borderColor: "#BBDBD1",
	  borderRadius: 8,
	  backgroundColor: "#F9FCFB",
	},
	input: {
	  height: 50,
	  paddingHorizontal: 16,
	  fontSize: 16,
	},
	button: {
	  backgroundColor: "#BBDBD1",
	  height: 50,
	  borderRadius: 8,
	  justifyContent: "center",
	  alignItems: "center",
	  marginTop: 8,
	  marginBottom: 16,
	},
	buttonText: {
	  color: "#333",
	  fontSize: 16,
	  fontWeight: "600",
	},
	signUpContainer: {
	  flexDirection: "row",
	  justifyContent: "center",
	  alignItems: "center",
	  gap: 4,
	},
	signUpText: {
	  color: "#666",
	  fontSize: 14,
	},
	signUpLink: {
	  color: "#BBDBD1",
	  fontWeight: "600",
	  fontSize: 14,
	},
  })