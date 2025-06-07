import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../src/store';
import { signUpUser, clearError } from '../src/store/slices/authSlice';

export default function SignUpScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Test@1234'); // Default for testing
  const [confirmPassword, setConfirmPassword] = useState('Test@1234'); // Default for testing

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, needsConfirmation, confirmationEmail } = useSelector((state: RootState) => state.auth);

  // Navigate to confirmation screen when signup is successful
  useEffect(() => {
    if (needsConfirmation && confirmationEmail) {
      console.log('Navigating to confirmation screen...');
      navigation.navigate('Confirmation');
    }
  }, [needsConfirmation, confirmationEmail, navigation]);

  useEffect(() => {
    if (error) {
      let errorMessage = error;
      
      if (error.includes('UsernameExistsException')) {
        errorMessage = 'An account with this email already exists';
      } else if (error.includes('InvalidPasswordException')) {
        errorMessage = 'Password does not meet requirements';
      } else if (error.includes('InvalidParameterException')) {
        errorMessage = 'Invalid email or password format';
      }
      
      Alert.alert('Sign Up Error', errorMessage, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const handleSignUp = async () => {
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Check password requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      Alert.alert(
        'Password Requirements',
        'Password must contain:\n• Uppercase letter\n• Lowercase letter\n• Number\n• Special character'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      console.log('Signing up user:', email);
      
      // Call the signup API
      const result = await dispatch(signUpUser({ 
        email: email.toLowerCase().trim(), 
        password, 
        fullName 
      })).unwrap();
      
      console.log('Signup result:', result);
      
      // Show success message

      if (result.needsConfirmation) {
        console.log('Navigating to ConfirmationScreen...');
        navigation.navigate('Confirmation');
      }
    } catch (error) {
      console.error('Signup error:', error);
    
      // Error handling is done in the useEffect above
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join DigiCount to get started</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 8 chars with upper, lower, number & special"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
                autoComplete="password-new"
                textContentType="newPassword"
              />
              <Text style={styles.passwordHint}>
                Must contain: uppercase, lowercase, number, and special character
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
                autoComplete="password-new"
              />
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]} 
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loadingText}>Creating account...</Text>
                </View>
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity 
              style={[styles.googleButton, isLoading && styles.googleButtonDisabled]} 
              disabled={isLoading}
            >
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 16,
    color: '#666',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  loginLink: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});