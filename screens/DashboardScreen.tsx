import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../src/store';
import { logoutUser } from '../src/store/slices/authSlice';
import { clearPersistedData } from '../src/utils/persistUtils';

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            dispatch(logoutUser());
            console.log('User logged out successfully');
            // Optional: Clear all persisted data
            await clearPersistedData();
          }
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will logout and clear all saved data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearPersistedData();
            dispatch(logoutUser());
          }
        },
      ]
    );
  };

  const handleFeaturePress = (feature: string) => {
    Alert.alert(feature, `${feature} feature coming soon!`);
  };

  // Calculate how long user has been logged in
  const getLoginDuration = () => {
    if (user?.createdAt) {
      const loginTime = new Date(user.createdAt);
      const now = new Date();
      const diff = now.getTime() - loginTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `Logged in for ${hours}h ${minutes}m`;
      } else {
        return `Logged in for ${minutes}m`;
      }
    }
    return '';
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.loginDuration}>{getLoginDuration()}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Persistence Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>✅ Auto-Login Enabled</Text>
        <Text style={styles.infoText}>
          You'll stay logged in even after closing the app
        </Text>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Today's Status</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>Not Started</Text>
            <Text style={styles.statusLabel}>Work Status</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>0</Text>
            <Text style={styles.statusLabel}>Jobs Done</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[styles.actionCard, styles.checkInCard]}
          onPress={() => handleFeaturePress('Check In')}
        >
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionTitle}>Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.documentsCard]}
          onPress={() => handleFeaturePress('Documents')}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionTitle}>Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.jobsCard]}
          onPress={() => handleFeaturePress('Jobs')}
        >
          <Text style={styles.actionIcon}>💼</Text>
          <Text style={styles.actionTitle}>Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.payrollCard]}
          onPress={() => handleFeaturePress('Payroll')}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionTitle}>Payroll</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <Text style={styles.noActivityText}>No recent activity</Text>
        <Text style={styles.noActivitySubtext}>
          Start by checking in to begin your work day
        </Text>
      </View>

      {/* Debug Section - Remove in production */}
      <TouchableOpacity style={styles.clearDataButton} onPress={handleClearAllData}>
        <Text style={styles.clearDataText}>Clear All App Data (Debug)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  loginDuration: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
  },
  logoutText: {
    color: '#F44336',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 10,
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  statusTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    color: '#E3F2FD',
    fontSize: 12,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  checkInCard: {
    backgroundColor: '#E3F2FD',
  },
  documentsCard: {
    backgroundColor: '#F3E5F5',
  },
  jobsCard: {
    backgroundColor: '#E8F5E9',
  },
  payrollCard: {
    backgroundColor: '#FFF3E0',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  noActivityText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noActivitySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  clearDataButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearDataText: {
    color: '#f44336',
    fontSize: 12,
  },
});