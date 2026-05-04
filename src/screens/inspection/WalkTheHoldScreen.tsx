import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronRight, Container, CheckCircle2, Circle } from 'lucide-react-native';
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
  
  // For demo purposes, we hold the state here. 
  // All start as pending (0% complete).
  const [holds, setHolds] = useState(INITIAL_HOLDS);

  const completedCount = holds.filter(h => h.status === 'completed').length;
  const totalCount = holds.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#8B5CF6', '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Walk the Hold</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Inspection Progress</Text>
              <Text style={styles.progressSubtitle}>{completedCount} of {totalCount} Holds Completed</Text>
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
          <Text style={styles.sectionTitle}>Cargo Holds</Text>
          
          {holds.map((item, index) => {
            const isCompleted = item.status === 'completed';
            
            return (
              <View 
                key={item.id}
              >
                <TouchableOpacity 
                  style={[styles.cardContainer, isCompleted && styles.cardCompleted]} 
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('HoldDetails', { holdId: item.id, title: item.title })}
                >
                  <View style={styles.card}>
                    <View style={[styles.iconContainer, isCompleted && styles.iconCompleted]}>
                      {isCompleted ? (
                        <CheckCircle2 size={24} color="#10B981" />
                      ) : (
                        <Container size={24} color="#8B5CF6" />
                      )}
                    </View>
                    
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDescription}>{item.description}</Text>
                    </View>
                    
                    <View style={styles.chevronContainer}>
                      <Text style={[styles.statusText, isCompleted ? styles.statusCompleted : styles.statusPending]}>
                        {isCompleted ? 'Done' : 'Start'}
                      </Text>
                      <ChevronRight size={20} color={isCompleted ? "#10B981" : "#8B5CF6"} />
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
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    marginBottom: 16,
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
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
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
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
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
    color: '#8B5CF6',
  },
  statusCompleted: {
    color: '#10B981',
  },
});
