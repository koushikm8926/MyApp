import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronRight, Container, CheckCircle2, ShieldCheck, Box } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const INITIAL_HOLDS = [
  { id: 'hold-1', title: 'Hold No. 1', status: 'pending', description: 'Forward cargo hold' },
  { id: 'hold-2', title: 'Hold No. 2', status: 'pending', description: 'Mid-forward cargo hold' },
  { id: 'hold-3', title: 'Hold No. 3', status: 'pending', description: 'Center cargo hold' },
  { id: 'hold-4', title: 'Hold No. 4', status: 'pending', description: 'Mid-aft cargo hold' },
  { id: 'hold-5', title: 'Hold No. 5', status: 'pending', description: 'Aft cargo hold' },
];

export default function WalkTheHoldScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [holds, setHolds] = useState(INITIAL_HOLDS);

  const completedCount = holds.filter(h => h.status === 'completed').length;
  const totalCount = holds.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hold Management</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Global Progress</Text>
              <Text style={styles.progressSubtitle}>{completedCount} of {totalCount} Holds Validated</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cargo Holds</Text>
            <ShieldCheck size={20} color="#4F46E5" />
          </View>
          
          {holds.map((item, index) => {
            const isCompleted = item.status === 'completed';
            
            return (
              <TouchableOpacity 
                key={item.id}
                style={[styles.cardContainer, isCompleted && styles.cardCompleted]} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('HoldDetails', { holdId: item.id, title: item.title })}
              >
                <View style={styles.card}>
                  <View style={[styles.iconContainer, isCompleted && styles.iconCompleted]}>
                    {isCompleted ? (
                      <CheckCircle2 size={24} color="#10B981" />
                    ) : (
                      <Box size={24} color="#4F46E5" />
                    )}
                  </View>
                  
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  </View>
                  
                  <View style={styles.statusAction}>
                    <Text style={[styles.statusText, isCompleted ? styles.statusCompleted : styles.statusPending]}>
                      {isCompleted ? 'Done' : 'Inspect'}
                    </Text>
                    <ChevronRight size={18} color={isCompleted ? "#10B981" : "#6366F1"} />
                  </View>
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
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
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
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  percentageBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    color: '#4F46E5',
    fontWeight: '900',
    fontSize: 16,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.9,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
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
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 18,
  },
  statusAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 4,
  },
  statusPending: {
    color: '#6366F1',
  },
  statusCompleted: {
    color: '#10B981',
  },
});
