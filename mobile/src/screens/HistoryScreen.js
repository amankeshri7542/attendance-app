import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAttendanceHistory } from '../services/api';

const HistoryScreen = ({ employee, onBack }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });

    const fetchHistory = useCallback(async () => {
        try {
            const data = await getAttendanceHistory(employee._id);
            setHistory(data);

            // Calculate stats for this month
            const now = new Date();
            const currentMonth = now.getMonth();
            const monthly = data.filter(d => new Date(d.createdAt).getMonth() === currentMonth);

            // Simplify stats for now
            const present = monthly.filter(d => d.type === 'IN').length;
            const late = monthly.filter(d => d.status === 'Late' || d.isLate).length;

            setStats({ present, late, total: monthly.length });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [employee]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const renderItem = ({ item }) => {
        const time = new Date(item.time);
        const isLate = item.status === 'Late' || item.isLate;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={[styles.badge, item.type === 'IN' ? styles.badgeIn : styles.badgeOut]}>
                        <MaterialIcons name={item.type === 'IN' ? "login" : "logout"} size={16} color={item.type === 'IN' ? "#059669" : "#e11d48"} />
                        <Text style={[styles.badgeText, item.type === 'IN' ? styles.textIn : styles.textOut]}>
                            {item.type === 'IN' ? 'CHECK IN' : 'CHECK OUT'}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>
                        {time.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.timeText}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {item.type === 'IN' && (
                        <Text style={[styles.statusText, isLate ? styles.textLate : styles.textOnTime]}>
                            {isLate ? 'Late' : 'On Time'}
                        </Text>
                    )}
                </View>
                {item.location && (
                    <View style={styles.locationRow}>
                        <MaterialIcons name="location-on" size={14} color="#94a3b8" />
                        <Text style={styles.locationText}>Office</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Attendance</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Monthly Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: '#059669' }]}>{stats.present}</Text>
                    <Text style={styles.statLabel}>Days Worked</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: '#d97706' }]}>{stats.late}</Text>
                    <Text style={styles.statLabel}>Late Marks</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1a227f" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="history" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No attendance history yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0'
    },
    backBtn: { padding: 8, borderRadius: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    statsContainer: {
        flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    statBox: { flex: 1, alignItems: 'center' },
    divider: { width: 1, backgroundColor: '#e2e8f0' },
    statValue: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 4 },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#e2e8f0'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeIn: { backgroundColor: '#ecfdf5' },
    badgeOut: { backgroundColor: '#fff1f2' },
    badgeText: { fontSize: 11, fontWeight: '700' },
    textIn: { color: '#059669' },
    textOut: { color: '#e11d48' },
    dateText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    timeText: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
    statusText: { fontSize: 13, fontWeight: '600' },
    textLate: { color: '#d97706' },
    textOnTime: { color: '#059669' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    locationText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 16, color: '#94a3b8', fontSize: 16, fontWeight: '500' }
});

export default HistoryScreen;
