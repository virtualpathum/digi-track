// screens/ConfirmationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../src/store';
import { confirmUserSignUp, loginUser, resendCode, clearError } from '../src/store/slices/authSlice';

export default function ConfirmationScreen({ navigation }: any) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [resending, setResending] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, confirmationEmail, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!confirmationEmail) {
      Alert.alert('Error', 'No email address found. Please sign up again.');
      navigation.navigate('SignUp');
    }
  }, [confirmationEmail, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const handleConfirm = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit confirmation code');
      return;
    }

    if (!confirmationEmail) {
      Alert.alert('Error', 'No email address found. Please sign up again.');
      navigation.navigate('SignUp');
      return;
    }

    try {
      // Confirm the email
      await dispatch(confirmUserSignUp({ 
        email: confirmationEmail, 
        code: code.trim() 
      })).unwrap();

      Alert.alert(
        'Success!', 
        'Your email has been verified successfully.',
        [
          {
            text: 'OK',
            onPress: async () => {
              // Try auto-login if password is provided
              if (password) {
                try {
                  await dispatch(loginUser({ 
                    email: confirmationEmail, 
                    password 
                  })).unwrap();
                  // Navigation will be handled by App.tsx based on isAuthenticated
                } catch (loginError) {
                  console.log('Auto-login failed, redirecting to login screen');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }
              } else {
                // No password provided, go to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Confirmation error:', error);
      // Error is handled by useEffect above
    }
  };

  const handleResendCode = async () => {
    if (!confirmationEmail) {
      Alert.alert('Error', 'Email not available to resend code.');
      return;
    }

    setResending(true);
    try {
      await dispatch(resendCode(confirmationEmail)).unwrap();
      Alert.alert('Success', `A new verification code has been sent to ${confirmationEmail}`);
    } catch (error: any) {
      console.error('Resend error:', error);
    } finally {
      setResending(false);
    }
  };

  if (!confirmationEmail) {
    return null; // Will redirect in useEffect
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to{'\n'}
          <Text style={styles.email}>{confirmationEmail}</Text>
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
            autoFocus
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password (for auto-login)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password (optional)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          <Text style={styles.hint}>
            Enter your password to login automatically after verification
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={isLoading || resending}
        >
          {resending ? (
            <ActivityIndicator color="#2196F3" size="small" />
          ) : (
            <Text style={styles.resendText}>Resend Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('SignUp')}
          disabled={isLoading}
        >
          <Text style={styles.backText}>Back to Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  inputContainer: {
    marginBottom: 20,
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
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  resendText: {
    color: '#2196F3',
    fontSize: 16,
  },
  backButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 10,
  },
  backText: {
    color: '#666',
    fontSize: 14,
  },
});