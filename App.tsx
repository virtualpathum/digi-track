// App.tsx
import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState, AppDispatch } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './src/store';


// Redux actions
import { checkAuthStatus } from './src/store/slices/authSlice';

// ─── Screens ────────────────────────────────────────────────────────────────────
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

// Loading screen component
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
    </View>
  );
}

function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, needsConfirmation } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  let initialRoute = 'Home';
  if (needsConfirmation) {
    initialRoute = 'Confirmation';
  } else if (isAuthenticated) {
    initialRoute = 'Dashboard';
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={({ navigation }) => ({
            title: 'Login',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
              </TouchableOpacity>
            ),
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#333',
            headerShadowVisible: false,
            headerBackVisible: false,
          })}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={({ navigation }) => ({
            title: 'Create Account',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
              </TouchableOpacity>
            ),
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#333',
            headerShadowVisible: false,
            headerBackVisible: false,
          })}
        />

        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={({ navigation }) => ({
            title: 'Verify Email',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
              </TouchableOpacity>
            ),
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#333',
            headerShadowVisible: false,
            headerBackVisible: false,
          })}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            headerLeft: () => null,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  // Handle logout inside Dashboard
                }}
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
              </TouchableOpacity>
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <AppNavigator />
  
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}