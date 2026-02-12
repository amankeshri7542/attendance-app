import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminDashboard from './src/screens/AdminDashboard';

const STORAGE_KEY_EMP = '@employee_data';
const STORAGE_KEY_ADMIN = '@admin_data';

export default function App() {
  const [user, setUser] = useState(null); // { type: 'employee' | 'admin', data: ... }
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const adminData = await AsyncStorage.getItem(STORAGE_KEY_ADMIN);
      if (adminData) {
        setUser({ type: 'admin', data: JSON.parse(adminData) });
        setChecking(false);
        return;
      }

      const empData = await AsyncStorage.getItem(STORAGE_KEY_EMP);
      if (empData) {
        setUser({ type: 'employee', data: JSON.parse(empData) });
      }
    } catch (e) {
      console.log('Error reading stored login', e);
    } finally {
      setChecking(false);
    }
  };

  const handleEmployeeLogin = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_EMP, JSON.stringify(data));
      setUser({ type: 'employee', data });
    } catch (e) { console.error(e); }
  };

  const handleAdminLogin = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(data));
      setUser({ type: 'admin', data });
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_EMP);
      await AsyncStorage.removeItem(STORAGE_KEY_ADMIN);
      setUser(null);
    } catch (e) { console.error(e); }
  };

  if (checking) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#1a227f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {!user ? (
        <LoginScreen onLogin={handleEmployeeLogin} onAdminLogin={handleAdminLogin} />
      ) : user.type === 'admin' ? (
        <AdminDashboard admin={user.data} onLogout={handleLogout} />
      ) : (
        <HomeScreen employee={user.data} onLogout={handleLogout} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f1f5' },
  splashContainer: { flex: 1, backgroundColor: '#f0f1f5', justifyContent: 'center', alignItems: 'center' },
});
