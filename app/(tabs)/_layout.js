import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { globalStyles } from '../styles/globalStyles'; // ✅ Import Global Styles

export default function TabLayout() {
  const { isSignedIn } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarStyle: globalStyles.tabBar, // ✅ Applies global tab bar styling
        headerStyle: globalStyles.topBar, // ✅ Uses global top bar styling
        headerTitleStyle: globalStyles.topBarTitle, // ✅ Uses global title styling
        headerTitleAlign: 'center', // ✅ Ensures title is centered
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Log"
        options={{
          title: 'Log',
          tabBarIcon: ({ color }) => <FontAwesome name="flag" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
          }}
        />
    </Tabs>
  );
}
