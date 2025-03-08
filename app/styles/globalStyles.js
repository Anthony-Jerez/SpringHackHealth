import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAE8FF', // Lavender Background
  },
  
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000', // Gold for contrast
    marginTop: 15,
    fontFamily: 'monospace', // 🔥 Change this to any desired font
    textAlign:'center',
  },

  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },

  topBar: {
    backgroundColor: '#FFFFFF',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },

  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'monospace', // 🔥 Matches title font
    textAlign:'center',
  },
});
