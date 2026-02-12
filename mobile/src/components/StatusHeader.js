import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const StatusHeader = () => {
    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.statusItem}>
                <MaterialIcons name="location-on" size={16} color="green" />
                <Text style={styles.statusText}>GPS: Active</Text>
            </View>
            <View style={styles.statusItem}>
                <MaterialIcons name="schedule" size={16} color="#1a227f" />
                <Text style={[styles.statusText, styles.boldText]}>{getCurrentTime()}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(26, 34, 127, 0.05)',
        backgroundColor: 'rgba(246, 246, 248, 0.8)',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        color: 'rgba(26, 34, 127, 0.7)',
        fontSize: 12,
        fontWeight: '500',
    },
    boldText: {
        color: '#1a227f',
        fontWeight: '600',
    },
});

export default StatusHeader;
