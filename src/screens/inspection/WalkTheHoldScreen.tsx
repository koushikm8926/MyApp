import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const holdsData = [
  { id: 1, location: 'Forward cargo hold', status: 'in_progress', title: 'Hold No. 1' },
  { id: 2, location: 'Mid-forward cargo hold', status: 'not_started', title: 'Hold No. 2' },
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

  const activeHold = holdsData.find(h => h.status === 'in_progress');

  const getButtonLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'Continue';
      case 'completed': return 'Review';
      default: return 'Start';
    }
  };

  const getCardStyle = (status: string) => {
    switch (status) {
      case 'in_progress': return styles.cardActive;
      case 'completed': return styles.cardCompleted;
      default: return styles.card;
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
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >

        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Cargo Inspection</Text>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressCard}>
          <Text style={styles.progressText}>{progressPercent}% Complete</Text>
          <Text style={styles.progressSub}>
            {total - completed} holds remaining
          </Text>

          <View style={styles.dots}>
            {holdsData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index < completed ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* CONTINUE CARD */}
        {activeHold && (
          <TouchableOpacity 
            style={styles.continueCard}
            onPress={() => handleHoldPress(activeHold)}
          >
            <Text style={styles.continueTitle}>Continue Inspection</Text>
            <Text style={styles.continueSub}>
              Resume Hold {activeHold.id}
            </Text>
          </TouchableOpacity>
        )}

        {/* HOLD LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Holds</Text>

          {holdsData.map((hold) => (
            <View key={hold.id} style={[styles.cardBase, getCardStyle(hold.status)]}>
              <View style={styles.row}>
                
                <View>
                  <Text style={styles.holdTitle}>Hold {hold.id}</Text>
                  <Text style={styles.holdSub}>{hold.location}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => handleHoldPress(hold)}
                >
                  <Text style={styles.buttonText}>
                    {getButtonLabel(hold.status)}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    marginRight: 12,
    padding: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  progressCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  progressText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  progressSub: {
    marginTop: 4,
    color: '#6B7280',
  },

  dots: {
    flexDirection: 'row',
    marginTop: 12,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },

  dotActive: {
    backgroundColor: '#4F46E5',
  },

  dotInactive: {
    backgroundColor: '#E5E7EB',
  },

  continueCard: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  continueTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  continueSub: {
    color: '#E0E7FF',
    marginTop: 4,
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },

  cardBase: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  card: {},

  cardActive: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    backgroundColor: '#F0F3FF',
  },

  cardCompleted: {
    opacity: 0.5,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  holdTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  holdSub: {
    color: '#6B7280',
    marginTop: 2,
  },

  button: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  buttonText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});

