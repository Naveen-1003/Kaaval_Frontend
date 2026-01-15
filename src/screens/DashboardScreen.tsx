import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, SIZES } from '../constants/theme';

type DashboardProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: { navigation: DashboardProp }) {
  const { user, cases } = useApp();

  const renderHeader = () => (
    <View>
      {/* Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {user?.role === 'investigator' ? 'Officer' : 'Dr.'}</Text>
          <Text style={styles.userRole}>{user?.role.toUpperCase()} • TN POLICE</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.replace('Auth')} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{cases.length}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{cases.filter(c => c.status === 'Verified').length}</Text>
          <Text style={[styles.statLabel, { color: COLORS.success }]}>Verified</Text>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Cases</Text>
        {user?.role === 'investigator' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateCase')}>
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.addBtnText}>New Case</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper style={{ paddingHorizontal: 0 }}> 
      <FlatList
        data={cases}
        keyExtractor={item => item.caseId}
        contentContainerStyle={{ padding: SIZES.padding }}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.caseCard} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Evidence', { caseId: item.caseId })}
          >
            <View style={styles.caseHeader}>
              <Text style={styles.caseId}>{item.caseId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Verified' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(250, 204, 21, 0.2)' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Verified' ? COLORS.success : '#facc15' }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.caseTitle}>{item.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="person" size={12} color={COLORS.textDim} />
                <Text style={styles.metaText}>{item.officer}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={12} color={COLORS.textDim} />
                <Text style={styles.metaText}>{new Date(item.timestamp).toLocaleDateString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.text },
  userRole: { color: COLORS.textDim, fontSize: 12, letterSpacing: 1, marginTop: 4 },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: COLORS.card, padding: 20, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  statLabel: { color: COLORS.textDim, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: SIZES.h3, fontWeight: '600', color: COLORS.text },
  addBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  addBtnText: { color: COLORS.background, fontWeight: 'bold', fontSize: 12, marginLeft: 6 },
  caseCard: { backgroundColor: COLORS.card, padding: 16, borderRadius: SIZES.radius, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  caseId: { color: COLORS.textDim, fontSize: 12, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  caseTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textDim, fontSize: 12 }
});