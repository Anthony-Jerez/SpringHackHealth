// In StatsBar.js - Update to handle removals

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// StatsBar Component
export default function StatsBar({ label, storageKey, maxValue, value: propValue }) {
  const [value, setValue] = useState(propValue || 0);

  // Use either the prop value or fetch from AsyncStorage
  useEffect(() => {
    // If value is provided as prop, use it
    if (propValue !== undefined) {
      setValue(propValue);
      return;
    }
    
    // Otherwise fetch from storage
    const fetchData = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(storageKey);
        if (storedValue !== null) {
          setValue(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error(`Error fetching ${storageKey} from storage:`, error);
      }
    };

    fetchData();

    // Listen for storage updates (when another component changes it)
    const interval = setInterval(fetchData, 1000); // Poll every second
    return () => clearInterval(interval);
  }, [storageKey, propValue]);

  // Calculate the percentage of intake
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Retro Bar Container */}
      <Svg height="20" width="220">
        {/* Background */}
        <Rect x="0" y="0" width="220" height="20" fill="#000" stroke="white" strokeWidth="2" />
        {/* Filled Bar */}
        <Rect x="2" y="2" width={`${(percentage / 100) * 216}`} height="16" fill="limegreen" />
      </Svg>

      {/* Display Value */}
      <Text style={styles.valueText}>
        {value} / {maxValue}
      </Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'black',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});