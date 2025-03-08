import { tokenCache } from '../cache';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { UserProvider } from './context/UserContext'; // Import UserContext

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        {/* Wrap the entire app with UserProvider */}
        <UserProvider>
          <Slot />
        </UserProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
