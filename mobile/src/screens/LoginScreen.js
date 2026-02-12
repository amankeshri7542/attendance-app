import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { loginEmployee, loginAdmin } from '../services/api';

const LoginScreen = ({ onLogin, onAdminLogin }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!userId.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isAdmin) {
                const data = await loginAdmin(userId.trim(), password);
                onAdminLogin(data);
            } else {
                const data = await loginEmployee(userId.trim().toUpperCase(), password);
                onLogin(data);
            }
        } catch (err) {
            setError(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={[styles.logoCircle, isAdmin && styles.logoCircleAdmin]}>
                        <MaterialIcons name={isAdmin ? "admin-panel-settings" : "fingerprint"} size={48} color="#fff" />
                    </View>
                    <Text style={styles.title}>{isAdmin ? 'Admin Portal' : 'Staff Attendance'}</Text>
                    <Text style={styles.subtitle}>
                        {isAdmin ? 'Manage attendance & staff' : 'Sign in to mark your attendance'}
                    </Text>
                </View>

                {error ? (
                    <View style={styles.errorBox}>
                        <MaterialIcons name="error-outline" size={18} color="#e11d48" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, !isAdmin && styles.toggleBtnActive]}
                        onPress={() => { setIsAdmin(false); setError(''); }}
                    >
                        <Text style={[styles.toggleText, !isAdmin && styles.toggleTextActive]}>Staff</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, isAdmin && styles.toggleBtnActive]}
                        onPress={() => { setIsAdmin(true); setError(''); }}
                    >
                        <Text style={[styles.toggleText, isAdmin && styles.toggleTextActive]}>Admin</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{isAdmin ? 'Username' : 'Employee ID'}</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="person" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={isAdmin ? "e.g. admin" : "e.g. EMP001"}
                                placeholderTextColor="#94a3b8"
                                value={userId}
                                onChangeText={setUserId}
                                autoCapitalize={isAdmin ? "none" : "characters"}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{isAdmin ? 'Password' : 'PIN'}</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={isAdmin ? "Enter Password" : "Enter 4-digit PIN"}
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                                keyboardType={isAdmin ? "default" : "number-pad"}
                                maxLength={isAdmin ? 50 : 4}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isAdmin && styles.loginButtonAdmin, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.loginButtonText}>{isAdmin ? 'Admin Login' : 'Sign In'}</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f1f5' },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
    logoContainer: { alignItems: 'center', marginBottom: 24 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 24, backgroundColor: '#1a227f',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        shadowColor: '#1a227f', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8
    },
    logoCircleAdmin: { backgroundColor: '#0f172a', shadowColor: '#0f172a' },
    title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: '500' },
    errorBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, gap: 8
    },
    errorText: { color: '#e11d48', fontSize: 12, fontWeight: '500', flex: 1 },
    toggleContainer: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 4, marginBottom: 24,
        borderWidth: 1, borderColor: '#e2e8f0'
    },
    toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    toggleBtnActive: { backgroundColor: '#f1f5f9' },
    toggleText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    toggleTextActive: { color: '#1e293b' },
    form: { gap: 16 },
    inputGroup: { gap: 6 },
    label: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0'
    },
    inputIcon: { paddingLeft: 14 },
    input: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    loginButton: {
        backgroundColor: '#1a227f', borderRadius: 14, paddingVertical: 16, flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8,
        shadowColor: '#1a227f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
    },
    loginButtonAdmin: { backgroundColor: '#0f172a', shadowColor: '#0f172a' },
    loginButtonDisabled: { opacity: 0.7 },
    loginButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default LoginScreen;
