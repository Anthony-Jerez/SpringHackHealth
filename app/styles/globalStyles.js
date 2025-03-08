import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#EAE8FF', // Lavender Background
    padding: 20,
  },
  
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700', // Gold for contrast
    marginTop: 15,
  },
  tabBar: {
    backgroundColor: '#EAE8FF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  authButton: {
    width: 180,
    paddingVertical: 12,
    marginVertical: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700', // Gold border
    borderRadius: 25, // Circular button
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
