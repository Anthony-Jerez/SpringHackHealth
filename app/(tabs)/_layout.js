import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

export default function TabLayout() {
  const router = useRouter();
  const { isSignedIn } = useAuth(); // Get authentication state

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2f95dc' }}>
      <Tabs.Screen
        name="BLANK"
        options={{
          title: 'BLANK',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
          tabBarButton: (props) => (
            <Pressable {...props} onPress={() => router.push('/(home)')} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
          tabBarStyle: isSignedIn ? {} : { display: 'none' }, // Hide if not signed in
        }}
      />
    </Tabs>
  );
}
