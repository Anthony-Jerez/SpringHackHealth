import * as React from 'react'
import { Text, TextInput, Button, View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [userName, setUserName] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
		username: userName,
        email_address: emailAddress,
        password: password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/setup');

      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
	return (
		<>
			<Text style={styles.title}>Verify your email</Text>
			<Text style={styles.subtitle}>We've sent a verification code to your email address</Text>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					value={code}
					placeholder="Enter verification code"
					onChangeText={(code) => setCode(code)}
					keyboardType="number-pad"
					autoFocus
				/>
			</View>

			<TouchableOpacity style={styles.button} onPress={onVerifyPress} activeOpacity={0.8}>
				<Text style={styles.buttonText}>Verify</Text>
			</TouchableOpacity>
		</>
	)
  }

  return (
	<>
		<Text style={styles.title}>Create Account</Text>
		<Text style={styles.subtitle}>Sign up to get started</Text>

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
				autoCapitalize="none"
				value={userName}
				placeholder="Username"
				onChangeText={(username) => setUserName(username)}
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

		<TouchableOpacity style={styles.button} onPress={onSignUpPress} activeOpacity={0.8}>
			<Text style={styles.buttonText}>Create Account</Text>
		</TouchableOpacity>
	</>
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
	  color: "#666",
	  marginBottom: 24,
	  textAlign: "center",
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
	},
	buttonText: {
	  color: "#333",
	  fontSize: 16,
	  fontWeight: "600",
	},
  })