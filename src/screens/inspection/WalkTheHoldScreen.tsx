import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, ChevronRight, Play } from 'lucide-react-native';

const holdsData = [
  { id: 1, location: 'Forward cargo hold', status: 'completed', title: 'Hold No. 1' },
  { id: 2, location: 'Mid-forward cargo hold', status: 'in_progress', title: 'Hold No. 2' },
  { id: 3, location: 'Center cargo hold', status: 'not_started', title: 'Hold No. 3' },
  { id: 4, location: 'Mid-aft cargo hold', status: 'not_started', title: 'Hold No. 4' },
  { id: 5, location: 'Aft cargo hold', status: 'not_started', title: 'Hold No. 5' },
];

export default function WalkTheHoldScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const total = holdsData.length;
  const completed = holdsData.filter(h => h.status === 'completed').length;
  const progressPercent = Math.round((completed / total) * 100);

  const activeHold = holdsData.find(h => h.status === 'in_progress') || holdsData.find(h => h.status === 'not_started');

  const getButtonLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'Continue';
      case 'completed': return 'Review';
      default: return 'Start';
    }
  };

  const handleHoldPress = (hold: any) => {
    navigation.navigate('HoldDetails', { 
      holdId: `hold-${hold.id}`, 
      title: hold.title 
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Seamless Modern Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Cargo Inspection</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Modern Progress Summary */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeaderRow}>
            <View>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
              <Text style={styles.progressSub}>Overall Completion</Text>
            </View>
            <View style={styles.holdsRemainingBadge}>
              <Text style={styles.holdsRemainingText}>{total - completed} Holds Left</Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Highlighted Active Hold Action */}
        {activeHold && (
          <TouchableOpacity 
            style={styles.activeActionCard}
            onPress={() => handleHoldPress(activeHold)}
            activeOpacity={0.9}
          >
            <View style={styles.activeActionIcon}>
              <Play size={24} color="#FFF" fill="#FFF" />
            </View>
            <View style={styles.activeActionContent}>
              <Text style={styles.activeActionTitle}>
                {activeHold.status === 'not_started' ? 'Start Next Hold' : 'Resume Inspection'}
              </Text>
              <Text style={styles.activeActionSub}>{activeHold.title} • {activeHold.location}</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
        )}

        {/* Hold List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Cargo Holds</Text>

          {holdsData.map((hold) => {
            const isCompleted = hold.status === 'completed';
            const isActive = hold.status === 'in_progress';
            
            return (
              <TouchableOpacity 
                key={hold.id} 
                style={[
                  styles.holdCard,
                  isActive && styles.holdCardActive,
                  isCompleted && styles.holdCardCompleted
                ]}
                onPress={() => handleHoldPress(hold)}
                activeOpacity={0.8}
              >
                <View style={styles.holdCardLeft}>
                  <View style={[
                    styles.statusIndicator,
                    isCompleted ? styles.statusIndicatorCompleted : 
                    isActive ? styles.statusIndicatorActive : null
                  ]}>
                    {isCompleted ? (
                      <CheckCircle2 size={20} color="#10B981" />
                    ) : (
                      <Text style={[
                        styles.statusIndicatorText,
                        isActive && styles.statusIndicatorTextActive
                      ]}>
                        {hold.id}
                      </Text>
                    )}
                  </View>
                  
                  <View>
                    <Text style={[
                      styles.holdTitle,
                      isCompleted && styles.holdTitleCompleted,
                      isActive && styles.holdTitleActive
                    ]}>
                      {hold.title}
                    </Text>
                    <Text style={styles.holdSub}>{hold.location}</Text>
                  </View>
                </View>

                <View style={[
                  styles.actionPill,
                  isActive && styles.actionPillActive,
                  isCompleted && styles.actionPillCompleted
                ]}>
                  <Text style={[
                    styles.actionPillText,
                    isActive && styles.actionPillTextActive,
                    isCompleted && styles.actionPillTextCompleted
                  ]}>
                    {getButtonLabel(hold.status)}
                  </Text>
                </View>
              </TouchableOpacity>
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
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  progressPercent: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    lineHeight: 44,
  },
  progressSub: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  holdsRemainingBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  holdsRemainingText: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  activeActionCard: {
    marginHorizontal: 24,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  activeActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeActionContent: {
    flex: 1,
  },
  activeActionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  activeActionSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  holdCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  holdCardActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
  },
  holdCardCompleted: {
    opacity: 0.8,
  },
  holdCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusIndicatorActive: {
    backgroundColor: '#3B82F6',
  },
  statusIndicatorCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusIndicatorText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  statusIndicatorTextActive: {
    color: '#FFF',
  },
  holdTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  holdTitleActive: {
    color: '#3B82F6',
  },
  holdTitleCompleted: {
    color: '#64748B',
  },
  holdSub: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  actionPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  actionPillActive: {
    backgroundColor: '#EFF6FF',
  },
  actionPillCompleted: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  actionPillTextActive: {
    color: '#3B82F6',
  },
  actionPillTextCompleted: {
    color: '#94A3B8',
  },
});
