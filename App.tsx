import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { store, RootState } from './src/store';

// Import screens
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={({ navigation }) => ({
                title: 'Login',
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
                  </TouchableOpacity>
                ),
                headerStyle: {
                  backgroundColor: '#fff',
                },
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
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
                  </TouchableOpacity>
                ),
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#333',
                headerShadowVisible: false,
                headerBackVisible: false,
              })}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              title: 'Dashboard',
              headerLeft: () => null,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}