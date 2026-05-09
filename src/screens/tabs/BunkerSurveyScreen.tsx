import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Fuel, Droplets, Thermometer, Activity, Plus, History, ChevronRight, Lock } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/theme';

export default function BunkerSurveyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const FuelCard = ({ type, amount, unit, change, status }: any) => (
    <View style={styles.fuelCard}>
      <View style={styles.fuelCardHeader}>
        <View style={styles.fuelTypeWrapper}>
          <Fuel size={20} color={COLORS.primary} />
          <Text style={styles.fuelTypeText}>{type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status === 'Good' ? '#ECFDF5' : '#FFFBEB' }]}>
          <Text style={[styles.statusBadgeText, { color: status === 'Good' ? '#10B981' : '#F59E0B' }]}>{status}</Text>
        </View>
      </View>
      <View style={styles.fuelAmountRow}>
        <Text style={styles.fuelAmount}>{amount}</Text>
        <Text style={styles.fuelUnit}>{unit}</Text>
      </View>
      <View style={styles.fuelTrend}>
        <Activity size={14} color={COLORS.textSecondary} />
        <Text style={styles.fuelTrendText}>{change} since last survey</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bunker Survey</Text>
          <Text style={styles.headerSubtitle}>Fuel management and oil inventory</Text>
        </View>

        <TouchableOpacity style={styles.actionCard} activeOpacity={0.9}>
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View>
              <Text style={styles.actionTitle}>New Survey</Text>
              <Text style={styles.actionDesc}>Record current fuel levels and tank states</Text>
            </View>
            <View style={styles.actionIcon}>
              <Plus size={28} color={COLORS.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Inventory</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.fuelGrid}>
            <FuelCard type="VLSFO" amount="1,240.5" unit="MT" change="-4.2" status="Good" />
            <FuelCard type="LSMGO" amount="185.2" unit="MT" change="+12.0" status="Warning" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tank Temperatures</Text>
          </View>
          <View style={styles.tempList}>
            {[
              { tank: 'Storage Tank 1', temp: '45.2', status: 'Stable' },
              { tank: 'Storage Tank 2', temp: '46.8', status: 'Heating' },
              { tank: 'Settling Tank', temp: '82.5', status: 'Optimal' },
            ].map((item, i) => (
              <View key={i} style={styles.tempItem}>
                <View style={styles.tempIconWrapper}>
                  <Thermometer size={18} color={COLORS.textSecondary} />
                </View>
                <View style={styles.tempInfo}>
                  <Text style={styles.tankName}>{item.tank}</Text>
                  <Text style={styles.tankStatus}>{item.status}</Text>
                </View>
                <Text style={styles.tempValue}>{item.temp}°C</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Surveys</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyList}>
            {[
              { date: 'May 08, 2024', port: 'Singapore', by: 'Chief Engineer' },
              { date: 'May 02, 2024', port: 'Shanghai', by: '2nd Engineer' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <History size={18} color={COLORS.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyPort}>{item.port} • {item.by}</Text>
                </View>
                <ChevronRight size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Locked Overlay */}
      <View style={[StyleSheet.absoluteFill, styles.lockedOverlay]}>
        <LinearGradient
          colors={['rgba(248, 250, 252, 0.5)', 'rgba(248, 250, 252, 0.95)']}
          style={styles.lockedGradient}
        >
          <View style={styles.lockCard}>
            <View style={styles.lockIconCircle}>
              <Lock size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.lockTitle}>Module Locked</Text>
            <Text style={styles.lockSubtitle}>This module is currently unavailable. Please complete the Hold Cleaning inspection first to unlock the Bunker Survey.</Text>
            <TouchableOpacity 
              style={styles.upgradeBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.upgradeBtnText}>Start Hold Cleaning</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  actionCard: {
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  actionGradient: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  actionDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontWeight: '500',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  fuelGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fuelCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  fuelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fuelTypeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fuelTypeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  fuelAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  fuelAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  fuelUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  fuelTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fuelTrendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  tempList: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  tempItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tempIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tempInfo: {
    flex: 1,
  },
  tankName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  tankStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tempValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  historyList: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  historyPort: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  lockedOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockCard: {
    backgroundColor: COLORS.white,
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 12,
  },
  lockSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  upgradeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  }
});
