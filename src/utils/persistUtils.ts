import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistor } from '../store';

export const clearPersistedData = async () => {
  try {
    // Purge the persistor
    await persistor.purge();
    
    // Clear AsyncStorage
    await AsyncStorage.clear();
    
    console.log('Persisted data cleared successfully');
  } catch (error) {
    console.error('Error clearing persisted data:', error);
  }
};

export const getPersistedState = async () => {
  try {
    const persistedState = await AsyncStorage.getItem('persist:root');
    if (persistedState) {
      return JSON.parse(persistedState);
    }
    return null;
  } catch (error) {
    console.error('Error getting persisted state:', error);
    return null;
  }
};