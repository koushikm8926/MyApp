import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, ChevronRight, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import {
  EMPTY_COMPLETED_SUBLOCATION_IDS,
  SUBLOCATIONS_PER_ZONE,
  useZoneProgressStore,
  zoneProgressCounts,
} from '../../store/useZoneProgressStore';

export default function ZoneDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const holdId = route.params?.holdId || 'unknown-hold';
  const zoneId = route.params?.zoneId || '';
  const zoneTitle = route.params?.zoneTitle || 'Zone Details';

  const completedByZone = useZoneProgressStore((s) => s.completedByZone);
  const completedIdsForZone =
    useZoneProgressStore((s) => s.completedByZone[zoneId]) ?? EMPTY_COMPLETED_SUBLOCATION_IDS;

  const sublocations = useMemo(
    () =>
      Array.from({ length: SUBLOCATIONS_PER_ZONE }, (_, i) => {
        const id = `sub-${i + 1}`;
        const completed = completedIdsForZone.includes(id);
        return {
          id,
          title: `Sublocation ${i + 1}`,
          status: completed ? ('completed' as const) : ('pending' as const),
        };
      }),
    [completedIdsForZone]
  );

  const { completed: completedCount, total: totalCount, pct: progressPercentage } =
    zoneProgressCounts(completedByZone, zoneId, SUBLOCATIONS_PER_ZONE);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#3B82F6', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{zoneTitle}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Zone Progress</Text>
              <Text style={styles.progressSubtitle}>{completedCount} of {totalCount} Completed</Text>
            </View>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>{progressPercentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} 
            />
          </View>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>{SUBLOCATIONS_PER_ZONE} Sublocations</Text>
          
          {sublocations.map((item) => {
            const isCompleted = item.status === 'completed';
            
            return (
              <View 
                key={item.id}
              >
                <TouchableOpacity 
                  style={[styles.cardContainer, isCompleted && styles.cardCompleted]} 
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Sublocation', { 
                    holdId,
                    sublocationId: item.id, 
                    title: item.title,
                    zoneTitle,
                    zoneId,
                  })}
                >
                  <View style={styles.card}>
                    <View style={[styles.iconContainer, isCompleted && styles.iconCompleted]}>
                      {isCompleted ? (
                        <CheckCircle2 size={24} color="#10B981" />
                      ) : (
                        <MapPin size={24} color="#3B82F6" />
                      )}
                    </View>
                    
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDescription}>
                        {isCompleted ? 'Inspection complete' : 'Tap to add attributes & photos'}
                      </Text>
                    </View>
                    
                    <View style={styles.chevronContainer}>
                      <Text style={[styles.statusText, isCompleted ? styles.statusCompleted : styles.statusPending]}>
                        {isCompleted ? 'Done' : 'Start'}
                      </Text>
                      <ChevronRight size={20} color={isCompleted ? "#10B981" : "#3B82F6"} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  percentageBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCompleted: {
    backgroundColor: '#ECFDF5',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  chevronContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  statusPending: {
    color: '#3B82F6',
  },
  statusCompleted: {
    color: '#10B981',
  },
});
