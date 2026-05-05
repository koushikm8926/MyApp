import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronRight, ClipboardList, Users, Wrench, Package } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const DOC_OPTIONS = [
  {
    id: 'vessel-particulars',
    title: 'Vessel Particulars',
    description: 'Detailed specifications and technical data',
    icon: ClipboardList,
    colors: ['#0787e2', '#45a6f0'],
    iconColor: '#FFF',
  },
  {
    id: 'crew-list',
    title: 'Crew List',
    description: 'Current onboard personnel and roles',
    icon: Users,
    colors: ['#10B981', '#34D399'],
    iconColor: '#FFF',
  },
  {
    id: 'cleaning-equipments',
    title: 'Cleaning Equipments',
    description: 'Inventory of hold cleaning gear',
    icon: Wrench,
    colors: ['#F59E0B', '#FBBF24'],
    iconColor: '#FFF',
  },
  {
    id: 'last-3-cargos',
    title: 'Last 3 Cargos',
    description: 'History of recent cargo transported',
    icon: Package,
    colors: ['#8B5CF6', '#A78BFA'],
    iconColor: '#FFF',
  },
];

export default function PreInspectionDocScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handlePress = (id: string) => {
    switch (id) {
      case 'vessel-particulars':
        navigation.navigate('VesselParticular' as never);
        break;
      case 'crew-list':
        navigation.navigate('CrewList' as never);
        break;
      case 'cleaning-equipments':
        navigation.navigate('CleaningEquipment' as never);
        break;
      case 'last-3-cargos':
        navigation.navigate('LastCargo' as never);
        break;
      default:
        break;
    }
  };

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
        <Text style={styles.headerTitle}>Pre-Inspection Doc</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.subtitle}>Documentation</Text>
          <Text style={styles.description}>Please review and verify the required documentation before proceeding.</Text>
        </View>

        <View style={styles.optionsList}>
          {DOC_OPTIONS.map((item, index) => {
            const Icon = item.icon;
            return (
              <View 
                key={item.id}
              >
                <TouchableOpacity 
                  style={styles.cardContainer} 
                  activeOpacity={0.8}
                  onPress={() => handlePress(item.id)}
                >
                  <View style={styles.card}>
                    <LinearGradient
                      colors={item.colors as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconGradient}
                    >
                      <Icon size={24} color={item.iconColor} />
                    </LinearGradient>
                    
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDescription}>{item.description}</Text>
                    </View>
                    
                    <View style={styles.chevronContainer}>
                      <ChevronRight size={20} color="#94A3B8" />
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
  optionsList: {
    paddingHorizontal: 24,
  },
  cardContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
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
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
