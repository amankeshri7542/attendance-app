import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, ScrollView, Modal, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAttendance, getEmployees, createEmployee, updateEmployee, toggleEmployee } from '../services/api';

const AdminDashboard = ({ admin, onLogout }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [loading, setLoading] = useState(false);

    // Date state
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Employee form
    const [showEmpForm, setShowEmpForm] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [empForm, setEmpForm] = useState({ name: '', empId: '', department: '', pin: '' });

    // Logs filters
    const [logFilterEmp, setLogFilterEmp] = useState('');

    // Date picker visibility
    const [showDatePicker, setShowDatePicker] = useState(false);

    const dateStr = selectedDate.toISOString().split('T')[0];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [attRes, empRes] = await Promise.all([
                getAttendance(admin.token, dateStr),
                getEmployees(admin.token)
            ]);
            setAttendance(attRes);
            setEmployees(empRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [admin.token, dateStr]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        if (d <= new Date()) setSelectedDate(d);
    };

    const onDateChange = (event, date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) setSelectedDate(date);
    };

    // --- Calculations ---
    const activeEmps = employees.filter(e => e.isActive);
    const checkedInIds = new Set(attendance.filter(r => r.type === 'IN').map(r => r.employeeId?._id));
    const presentCount = checkedInIds.size;
    const absentList = activeEmps.filter(e => !checkedInIds.has(e._id));
    const absentCount = absentList.length;
    const lateRecords = attendance.filter(r => (r.status === 'Late' || r.isLate) && r.type === 'IN');
    const lateCount = lateRecords.size ? lateRecords.size : lateRecords.length;

    // Group attendance by employee for the logs tab
    const groupedByEmployee = {};
    attendance.forEach(a => {
        const empId = a.employeeId?._id || 'unknown';
        if (!groupedByEmployee[empId]) {
            groupedByEmployee[empId] = { name: a.employeeId?.name || 'Unknown', empCode: a.employeeId?.empId || '', dept: a.employeeId?.department || '', checkIn: null, checkOut: null, status: 'Present', location: null };
        }
        if (a.type === 'IN' && (!groupedByEmployee[empId].checkIn || new Date(a.time) < new Date(groupedByEmployee[empId].checkIn))) {
            groupedByEmployee[empId].checkIn = a.time;
            groupedByEmployee[empId].location = a.location;
            if (a.status === 'Late' || a.isLate) groupedByEmployee[empId].status = 'Late';
        }
        if (a.type === 'OUT' && (!groupedByEmployee[empId].checkOut || new Date(a.time) > new Date(groupedByEmployee[empId].checkOut))) {
            groupedByEmployee[empId].checkOut = a.time;
        }
    });
    let logsData = Object.values(groupedByEmployee);
    if (logFilterEmp) {
        logsData = logsData.filter(l => l.name.toLowerCase().includes(logFilterEmp.toLowerCase()) || l.empCode.toLowerCase().includes(logFilterEmp.toLowerCase()));
    }

    // --- Employee Management ---
    const handleSaveEmployee = async () => {
        if (!empForm.name || !empForm.empId || !empForm.department) {
            Alert.alert('Error', 'Please fill Name, ID, and Department');
            return;
        }
        try {
            if (editingEmp) {
                const payload = { ...empForm };
                if (!payload.pin) delete payload.pin;
                await updateEmployee(editingEmp._id, payload, admin.token);
                Alert.alert('Success', 'Employee updated');
            } else {
                if (!empForm.pin || empForm.pin.length < 4) {
                    Alert.alert('Error', '4-digit PIN is required for new employees');
                    return;
                }
                await createEmployee(empForm, admin.token);
                Alert.alert('Success', 'Employee created');
            }
            setShowEmpForm(false);
            setEditingEmp(null);
            setEmpForm({ name: '', empId: '', department: '', pin: '' });
            fetchData();
        } catch (error) {
            Alert.alert('Error', error.message || 'Operation failed');
        }
    };

    const handleEditEmp = (emp) => {
        setEditingEmp(emp);
        setEmpForm({ name: emp.name, empId: emp.empId, department: emp.department, pin: '' });
        setShowEmpForm(true);
    };

    const handleToggleEmp = async (emp) => {
        try {
            await toggleEmployee(emp._id, admin.token);
            fetchData();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const formatTime = (t) => {
        if (!t) return '--:--';
        return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();

    // ======== DATE PICKER COMPONENT ========
    const DatePickerBar = () => (
        <View>
            <View style={s.dateRow}>
                <TouchableOpacity onPress={() => changeDate(-1)} style={s.dateArrow}>
                    <MaterialIcons name="chevron-left" size={28} color="#1a227f" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={s.dateCenter}>
                    <MaterialIcons name="calendar-today" size={16} color="#64748b" />
                    <Text style={s.dateLabel}>
                        {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeDate(1)} style={[s.dateArrow, isToday && { opacity: 0.3 }]} disabled={isToday}>
                    <MaterialIcons name="chevron-right" size={28} color="#1a227f" />
                </TouchableOpacity>
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                    maximumDate={new Date()}
                    onChange={onDateChange}
                />
            )}
        </View>
    );

    // ======== TAB: OVERVIEW ========
    const renderOverview = () => (
        <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />} showsVerticalScrollIndicator={false}>
            <DatePickerBar />

            {/* Quick Summary */}
            <View style={s.statsRow}>
                <View style={[s.statCard, { backgroundColor: '#ecfdf5' }]}>
                    <Text style={[s.statNum, { color: '#059669' }]}>{presentCount}</Text>
                    <Text style={s.statLabel}>Present</Text>
                </View>
                <View style={[s.statCard, { backgroundColor: '#fff1f2' }]}>
                    <Text style={[s.statNum, { color: '#e11d48' }]}>{absentCount}</Text>
                    <Text style={s.statLabel}>Absent</Text>
                </View>
                <View style={[s.statCard, { backgroundColor: '#fffbeb' }]}>
                    <Text style={[s.statNum, { color: '#d97706' }]}>{lateCount}</Text>
                    <Text style={s.statLabel}>Late</Text>
                </View>
            </View>

            {/* Who Checked In */}
            <Text style={s.sectionTitle}>✅ Checked In ({presentCount})</Text>
            {attendance.filter(r => r.type === 'IN').reduce((acc, r) => {
                if (!acc.seen.has(r.employeeId?._id)) {
                    acc.seen.add(r.employeeId?._id);
                    acc.items.push(r);
                }
                return acc;
            }, { seen: new Set(), items: [] }).items.map(item => (
                <View key={item._id} style={s.personRow}>
                    <View style={[s.avatar, { backgroundColor: (item.status === 'Late' || item.isLate) ? '#fffbeb' : '#ecfdf5' }]}>
                        <Text style={[s.avatarText, { color: (item.status === 'Late' || item.isLate) ? '#d97706' : '#059669' }]}>
                            {(item.employeeId?.name || '?').charAt(0)}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.personName}>{item.employeeId?.name}</Text>
                        <Text style={s.personSub}>{formatTime(item.time)}</Text>
                    </View>
                    {(item.status === 'Late' || item.isLate) && (
                        <View style={s.lateBadge}><Text style={s.lateBadgeText}>LATE</Text></View>
                    )}
                </View>
            ))}

            {/* Who Didn't Come */}
            {absentCount > 0 && (
                <>
                    <Text style={[s.sectionTitle, { marginTop: 20 }]}>❌ Didn't Come ({absentCount})</Text>
                    {absentList.map(emp => (
                        <View key={emp._id} style={s.personRow}>
                            <View style={[s.avatar, { backgroundColor: '#fff1f2' }]}>
                                <Text style={[s.avatarText, { color: '#e11d48' }]}>{emp.name.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.personName}>{emp.name}</Text>
                                <Text style={s.personSub}>{emp.empId} · {emp.department}</Text>
                            </View>
                        </View>
                    ))}
                </>
            )}

            <View style={{ height: 30 }} />
        </ScrollView>
    );

    // ======== TAB: LOGS ========
    const renderLogs = () => (
        <View style={{ flex: 1 }}>
            <DatePickerBar />

            {/* Filter */}
            <View style={s.filterRow}>
                <MaterialIcons name="search" size={20} color="#94a3b8" />
                <TextInput
                    style={s.filterInput}
                    placeholder="Search by name or ID..."
                    placeholderTextColor="#94a3b8"
                    value={logFilterEmp}
                    onChangeText={setLogFilterEmp}
                />
                {logFilterEmp ? (
                    <TouchableOpacity onPress={() => setLogFilterEmp('')}>
                        <MaterialIcons name="close" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Table Header */}
            <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 2 }]}>Name</Text>
                <Text style={[s.th, { flex: 1 }]}>In</Text>
                <Text style={[s.th, { flex: 1 }]}>Out</Text>
                <Text style={[s.th, { flex: 1 }]}>Status</Text>
            </View>

            <FlatList
                data={logsData}
                keyExtractor={(item, i) => i.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
                renderItem={({ item }) => (
                    <View style={s.tableRow}>
                        <View style={{ flex: 2 }}>
                            <Text style={s.cellName}>{item.name}</Text>
                            <Text style={s.cellSub}>{item.empCode}</Text>
                        </View>
                        <Text style={[s.cell, { flex: 1 }]}>{formatTime(item.checkIn)}</Text>
                        <Text style={[s.cell, { flex: 1 }]}>{formatTime(item.checkOut)}</Text>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={[s.statusBadge, item.status === 'Late' ? s.statusLate : s.statusPresent]}>
                                <Text style={[s.statusText, item.status === 'Late' ? s.statusTextLate : s.statusTextPresent]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={s.emptyText}>No records found</Text>}
            />
        </View>
    );

    // ======== TAB: STAFF ========
    const renderStaff = () => (
        <View style={{ flex: 1 }}>
            <View style={s.staffHeader}>
                <View>
                    <Text style={s.staffTitle}>Staff Management</Text>
                    <Text style={s.staffCount}>Total: {employees.length} · Active: {activeEmps.length}</Text>
                </View>
                <TouchableOpacity onPress={() => { setEditingEmp(null); setEmpForm({ name: '', empId: '', department: '', pin: '' }); setShowEmpForm(true); }} style={s.addBtn}>
                    <MaterialIcons name="person-add" size={20} color="#fff" />
                    <Text style={s.addBtnText}>Add</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={employees}
                keyExtractor={item => item._id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
                renderItem={({ item }) => (
                    <View style={[s.empCard, !item.isActive && s.empCardInactive]}>
                        <View style={[s.avatar, { backgroundColor: item.isActive ? '#e0f2fe' : '#f1f5f9' }]}>
                            <Text style={[s.avatarText, { color: item.isActive ? '#0284c7' : '#94a3b8' }]}>{item.name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.empName, !item.isActive && { color: '#94a3b8' }]}>{item.name}</Text>
                            <Text style={s.empDetail}>{item.empId} · {item.department}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleEditEmp(item)} style={s.iconBtn}>
                            <MaterialIcons name="edit" size={20} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleToggleEmp(item)}>
                            <MaterialIcons name={item.isActive ? 'toggle-on' : 'toggle-off'} size={36} color={item.isActive ? '#10b981' : '#cbd5e1'} />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Add/Edit Modal */}
            <Modal visible={showEmpForm} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <Text style={s.modalTitle}>{editingEmp ? 'Edit Employee' : 'New Employee'}</Text>

                        <Text style={s.inputLabel}>Full Name</Text>
                        <TextInput value={empForm.name} onChangeText={t => setEmpForm({ ...empForm, name: t })} style={s.input} placeholder="e.g. Raju Kumar" />

                        <Text style={s.inputLabel}>Employee ID</Text>
                        <TextInput value={empForm.empId} onChangeText={t => setEmpForm({ ...empForm, empId: t })} style={s.input} placeholder="e.g. EMP001" autoCapitalize="characters" />

                        <Text style={s.inputLabel}>Department</Text>
                        <TextInput value={empForm.department} onChangeText={t => setEmpForm({ ...empForm, department: t })} style={s.input} placeholder="e.g. Sales" />

                        <Text style={s.inputLabel}>{editingEmp ? 'Reset PIN (leave blank to keep)' : 'PIN (4 digits)'}</Text>
                        <TextInput
                            value={empForm.pin}
                            onChangeText={t => setEmpForm({ ...empForm, pin: t })}
                            style={s.input}
                            placeholder="••••"
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry={true}
                        />

                        <View style={s.modalBtns}>
                            <TouchableOpacity onPress={() => { setShowEmpForm(false); setEditingEmp(null); }} style={[s.modalBtn, s.cancelBtn]}>
                                <Text style={s.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveEmployee} style={[s.modalBtn, s.saveBtn]}>
                                <Text style={s.saveBtnText}>{editingEmp ? 'Update' : 'Create'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

    // ======== MAIN RENDER ========
    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.headerTitle}>Admin Dashboard</Text>
                <TouchableOpacity onPress={onLogout} style={s.logoutBtn}>
                    <MaterialIcons name="logout" size={20} color="#e11d48" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={s.content}>
                {loading && attendance.length === 0 ? (
                    <ActivityIndicator size="large" color="#1a227f" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {activeTab === 'Overview' && renderOverview()}
                        {activeTab === 'Logs' && renderLogs()}
                        {activeTab === 'Staff' && renderStaff()}
                    </>
                )}
            </View>

            {/* Bottom Tab Bar */}
            <View style={s.tabBar}>
                {[
                    { key: 'Overview', icon: 'dashboard', label: 'Overview' },
                    { key: 'Logs', icon: 'list-alt', label: 'Logs' },
                    { key: 'Staff', icon: 'people', label: 'Staff' },
                ].map(tab => (
                    <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={s.tabItem}>
                        <MaterialIcons name={tab.icon} size={24} color={activeTab === tab.key ? '#1a227f' : '#94a3b8'} />
                        <Text style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// ======== STYLES ========
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    logoutBtn: { padding: 8, backgroundColor: '#fff1f2', borderRadius: 8 },
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

    // Date Picker
    dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 12 },
    dateArrow: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    dateCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    dateLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },

    // Stats
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    statNum: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 2 },

    // Section
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 10 },

    // Person Rows
    personRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, gap: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 14, fontWeight: '700' },
    personName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    personSub: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
    lateBadge: { backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    lateBadgeText: { fontSize: 10, fontWeight: '700', color: '#d97706' },

    // Logs Filter
    filterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', gap: 8 },
    filterInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#1e293b' },

    // Table
    tableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 8, marginBottom: 4 },
    th: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, marginBottom: 4 },
    cellName: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
    cellSub: { fontSize: 11, color: '#94a3b8' },
    cell: { fontSize: 13, color: '#1e293b', fontWeight: '500' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusPresent: { backgroundColor: '#ecfdf5' },
    statusLate: { backgroundColor: '#fffbeb' },
    statusText: { fontSize: 10, fontWeight: '700' },
    statusTextPresent: { color: '#059669' },
    statusTextLate: { color: '#d97706' },

    // Tab Bar
    tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingBottom: 24, paddingTop: 8 },
    tabItem: { flex: 1, alignItems: 'center', gap: 2 },
    tabLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8' },
    tabLabelActive: { color: '#1a227f' },

    // Staff Tab
    staffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    staffTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    staffCount: { fontSize: 12, color: '#64748b', marginTop: 2 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1a227f', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    empCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 8, gap: 12 },
    empCardInactive: { opacity: 0.6 },
    empName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    empDetail: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
    iconBtn: { padding: 6 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#1e293b' },
    inputLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
    input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, fontSize: 15, color: '#1e293b' },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
    modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#f1f5f9' },
    saveBtn: { backgroundColor: '#1a227f' },
    cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 14 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 30, fontSize: 14 },
});

export default AdminDashboard;
