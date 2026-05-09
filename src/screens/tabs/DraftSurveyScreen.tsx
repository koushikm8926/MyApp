import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ship, Anchor, Waves, Ruler, Plus, ArrowUpRight, ChevronRight, MapPin } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/theme';

export default function DraftSurveyScreen() {
  const insets = useSafeAreaInsets();

  const DraftRow = ({ label, port, starboard }: any) => (
    <View style={styles.draftRow}>
      <View style={styles.draftLabelCol}>
        <Text style={styles.draftRowLabel}>{label}</Text>
      </View>
      <View style={styles.draftValueCol}>
        <Text style={styles.draftSideLabel}>PORT</Text>
        <Text style={styles.draftValue}>{port}m</Text>
      </View>
      <View style={styles.draftValueCol}>
        <Text style={styles.draftSideLabel}>STBD</Text>
        <Text style={styles.draftValue}>{starboard}m</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Draft Survey</Text>
          <Text style={styles.headerSubtitle}>Displacement and cargo weight calculation</Text>
        </View>

        <TouchableOpacity style={styles.actionCard} activeOpacity={0.9}>
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.actionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View>
              <Text style={styles.actionTitle}>Measure Draft</Text>
              <Text style={styles.actionDesc}>Record current vessel draft readings</Text>
            </View>
            <View style={styles.actionIcon}>
              <Plus size={28} color={COLORS.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.vesselStatusCard}>
          <View style={styles.statusHeader}>
            <Ship size={20} color={COLORS.primary} />
            <Text style={styles.statusTitle}>Current Trim</Text>
            <View style={styles.trimBadge}>
              <Text style={styles.trimBadgeText}>0.45m Aft</Text>
            </View>
          </View>
          <View style={styles.displacementRow}>
            <View>
              <Text style={styles.dispLabel}>Displacement</Text>
              <Text style={styles.dispValue}>42,560.8 MT</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.dispLabel}>Deadweight</Text>
              <Text style={styles.dispValue}>34,120.4 MT</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Draft Readings</Text>
            <View style={styles.waterInfo}>
              <Waves size={14} color={COLORS.primary} />
              <Text style={styles.waterText}>Density: 1.025</Text>
            </View>
          </View>
          <View style={styles.draftTable}>
            <DraftRow label="FORWARD" port="10.25" starboard="10.28" />
            <DraftRow label="MIDSHIP" port="10.50" starboard="10.52" />
            <DraftRow label="AFT" port="10.70" starboard="10.73" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Key Parameters</Text>
          </View>
          <View style={styles.paramGrid}>
            {[
              { icon: Ruler, label: 'LBP', value: '185.00 m' },
              { icon: Anchor, label: 'Constants', value: '350.0 MT' },
              { icon: ArrowUpRight, label: 'TPC', value: '45.2 t/cm' },
              { icon: MapPin, label: 'Port', value: 'Rotterdam' },
            ].map((item, i) => (
              <View key={i} style={styles.paramCard}>
                <item.icon size={18} color={COLORS.textSecondary} />
                <Text style={styles.paramLabel}>{item.label}</Text>
                <Text style={styles.paramValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.reportBtn}>
          <Text style={styles.reportBtnText}>Generate Survey Report</Text>
          <ChevronRight size={20} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 24,
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
  vesselStatusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
    marginLeft: 10,
    flex: 1,
  },
  trimBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trimBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  displacementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dispLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  dispValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
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
  waterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  waterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
  },
  draftTable: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  draftLabelCol: {
    flex: 1,
  },
  draftRowLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  draftValueCol: {
    alignItems: 'center',
    marginLeft: 20,
  },
  draftSideLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  draftValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  paramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paramCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  paramLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 8,
  },
  paramValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 2,
  },
  reportBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  reportBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  }
});
