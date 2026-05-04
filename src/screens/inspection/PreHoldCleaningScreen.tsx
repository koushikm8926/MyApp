import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronRight, FileText, Ship, PaintBucket, Navigation, Droplets } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const OPTIONS = [
  {
    id: 'pre-inspection',
    title: 'Pre-Inspection Doc',
    description: 'Review and verify pre-inspection documents',
    icon: FileText,
    colors: ['#0787e2', '#45a6f0'],
    iconColor: '#FFF',
    screen: 'PreInspectionDoc',
  },
  {
    id: 'vessel-particular',
    title: 'Vessel Particular',
    description: 'Detailed specifications and details of the vessel',
    icon: Ship,
    colors: ['#10B981', '#34D399'],
    iconColor: '#FFF',
    screen: 'VesselParticular',
  },
  {
    id: 'cleaning-standards',
    title: 'Cleaning Standards',
    description: 'Checklist and protocols for hold cleaning',
    icon: PaintBucket,
    colors: ['#F59E0B', '#FBBF24'],
    iconColor: '#FFF',
    screen: 'CleaningStandards',
  },
  {
    id: 'walk-hold',
    title: 'Walk the Hold',
    description: 'Physical inspection and walk-through of the hold',
    icon: Navigation,
    colors: ['#8B5CF6', '#A78BFA'],
    iconColor: '#FFF',
    screen: 'WalkTheHold',
  },
  {
    id: 'days-fresh-water',
    title: 'Days & Fresh Water',
    description: 'Track fresh water usage and remaining days',
    icon: Droplets,
    colors: ['#3B82F6', '#60A5FA'],
    iconColor: '#FFF',
    screen: 'DaysFreshWater',
  },
];

export default function PreHoldCleaningScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0787e2', '#0787e2', '#45a6f0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pre Hold Cleaning</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.subtitle}>Inspection Sequence</Text>
          <Text style={styles.description}>Follow this step-by-step guide to complete the pre-hold cleaning process efficiently.</Text>
        </View>

        <View style={styles.timelineContainer}>
          {OPTIONS.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === OPTIONS.length - 1;
            return (
              <View 
                key={item.id}
                style={styles.timelineRow}
              >
                <View style={styles.timelineConnector}>
                  <LinearGradient
                    colors={item.colors as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.timelineIconBg}
                  >
                    <Icon size={20} color={item.iconColor} />
                  </LinearGradient>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>
                
                <TouchableOpacity 
                  style={styles.timelineCard} 
                  activeOpacity={item.screen ? 0.7 : 1}
                  onPress={() => item.screen ? navigation.navigate(item.screen as never) : null}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <ChevronRight size={18} color="#94A3B8" />
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
  headerTextContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  timelineContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: 16,
    width: 48,
    zIndex: 10,
  },
  timelineIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 48,
    bottom: -24,
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
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
    lineHeight: 18,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
