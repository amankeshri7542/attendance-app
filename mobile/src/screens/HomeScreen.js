import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import StatusHeader from '../components/StatusHeader';
import ScannerOverlay from '../components/ScannerOverlay';
import HistoryScreen from './HistoryScreen';
import { markAttendance } from '../services/api';

const HomeScreen = ({ employee, onLogout }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
        })();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        setLoading(true);
        setResult(null);

        // Validate that this is the office QR code
        let qrCodeId;
        try {
            const qrData = JSON.parse(data);
            if (qrData.type === 'attendance' && qrData.shopId) {
                qrCodeId = `QR-${qrData.shopId}`;
            } else {
                setLoading(false);
                setResult({ type: 'error', message: 'Invalid QR code. Use the office QR code.' });
                return;
            }
        } catch (e) {
            setLoading(false);
            setResult({ type: 'error', message: 'Invalid QR code format.' });
            return;
        }

        // Refresh location
        let currentLocation = location;
        try {
            currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
        } catch (e) {
            console.log("Could not refresh location", e);
        }

        if (!currentLocation) {
            setLoading(false);
            setResult({ type: 'error', message: 'Location not available. Enable GPS.' });
            return;
        }

        const payload = {
            employeeId: employee._id, // User object has _id, not employeeId (check login/localstorage)
            qrCodeId,
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
            timestamp: new Date().toISOString(),
            type: 'IN'
        };

        try {
            await markAttendance(payload);
            setResult({ type: 'success', message: 'Attendance Marked Successfully!' });
        } catch (error) {
            setResult({ type: 'error', message: error.message || 'Failed to mark attendance' });
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setScanned(false);
        setResult(null);
    };

    if (showHistory) {
        return <HistoryScreen employee={employee} onBack={() => setShowHistory(false)} />;
    }

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.permissionCard}>
                    <MaterialIcons name="camera-alt" size={48} color="#1a227f" />
                    <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
                    <Text style={styles.permissionText}>We need camera access to scan the QR code</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {employee?.name || 'Employee'} 👋</Text>
                    <Text style={styles.empIdText}>{employee?.empId} · {employee?.department}</Text>
                </View>
                <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                    <MaterialIcons name="logout" size={20} color="#e11d48" />
                </TouchableOpacity>
            </View>

            <StatusHeader />

            <View style={styles.cameraContainer}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
                <ScannerOverlay />

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#1a227f" />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                )}

                {result && (
                    <View style={styles.resultOverlay}>
                        <View style={[styles.resultCard, result.type === 'error' && styles.errorCard]}>
                            <MaterialIcons
                                name={result.type === 'success' ? "check-circle" : "error"}
                                size={48}
                                color={result.type === 'success' ? "#10b981" : "#e11d48"}
                            />
                            <Text style={styles.resultTitle}>
                                {result.type === 'success' ? 'Success!' : 'Error'}
                            </Text>
                            <Text style={styles.resultMessage}>{result.message}</Text>
                            <TouchableOpacity onPress={resetScan} style={styles.resultButton}>
                                <Text style={styles.resultButtonText}>Scan Again</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.instruction}>Scan the office QR code to mark attendance</Text>
                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => setShowHistory(true)}
                >
                    <MaterialIcons name="history" size={20} color="#fff" />
                    <Text style={styles.historyBtnText}>View My History</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f1f5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12, backgroundColor: '#f0f1f5',
    },
    greeting: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    empIdText: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 2 },
    logoutBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff1f2',
        justifyContent: 'center', alignItems: 'center',
    },
    cameraContainer: {
        flex: 1, position: 'relative', margin: 20, borderRadius: 24,
        overflow: 'hidden', backgroundColor: '#000',
    },
    footer: { padding: 24, alignItems: 'center', gap: 16 },
    instruction: { color: '#64748b', textAlign: 'center', fontWeight: '600', fontSize: 14 },
    historyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#1a227f', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
        shadowColor: '#1a227f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
    },
    historyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    permissionCard: {
        flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
    },
    permissionTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
    permissionText: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
    permissionButton: {
        backgroundColor: '#1a227f', paddingVertical: 14, paddingHorizontal: 28,
        borderRadius: 14, marginTop: 24,
    },
    permissionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center', alignItems: 'center', zIndex: 20,
    },
    loadingText: { marginTop: 12, color: '#1a227f', fontWeight: '600' },
    resultOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center', alignItems: 'center', zIndex: 30, padding: 20,
    },
    resultCard: {
        backgroundColor: '#fff', padding: 28, borderRadius: 24,
        alignItems: 'center', width: '100%', maxWidth: 300,
    },
    errorCard: {},
    resultTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginTop: 12, marginBottom: 8 },
    resultMessage: { color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    resultButton: {
        backgroundColor: '#1a227f', paddingVertical: 14, paddingHorizontal: 24,
        borderRadius: 12, width: '100%', alignItems: 'center',
    },
    resultButtonText: { color: 'white', fontWeight: '700' },
});

export default HomeScreen;
