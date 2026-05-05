import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Platform, Image, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, ClipboardCheck, Ship, Layers, ChevronRight, CheckCircle2, Car, Lock, X, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { databaseService } from '../../services/databaseService';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const { inspections, isLoading, loadInspections } = useInspectionStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInspections(user.id);
      loadVehicles(user.id);
    }
  }, [user]);

  const loadVehicles = async (userId: string) => {
    try {
      const data = await databaseService.getVehicles(userId);
      setVehicles(data);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    }
  };

  const handleActionPress = (screen: string | null, locked: boolean) => {
    if (!screen || locked) return;
    setSelectedScreen(screen);
    setModalVisible(true);
  };

  const handleSelectVehicle = (vehicle: any) => {
    setModalVisible(false);
    if (selectedScreen) {
      navigation.navigate(selectedScreen, { 
        vehicleId: vehicle.id, 
        vehicleName: `${vehicle.make} ${vehicle.model}` 
      });
    }
  };

  const recentInspections = inspections.slice(0, 3);
  const totalInspections = inspections.length;
  const pendingInspections = inspections.filter(i => i.status === 'pending' || i.status === 'draft').length;


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#0787e2', '#0787e2', '#45a6f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>Welcome back,</Text>
                <Text style={styles.userNameText}>{user?.name || 'User'}</Text>
              </View>
              <TouchableOpacity style={styles.profileBtn}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256' }} 
                  style={styles.profileAvatar} 
                />
              </TouchableOpacity>
            </View>

          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          


          <View style={styles.secondaryActionsGrid}>
            {[
              { screen: "PreHoldCleaning",  icon: ClipboardCheck, label: "Pre Hold\nCleaning",  color: "#ECFDF5", iconColor: "#10B981", locked: false },
              { screen: null, icon: Ship,           label: "Bunker\nSurvey",    color: "#EFF6FF", iconColor: "#0787e2", locked: true },
              { screen: null, icon: Layers,          label: "Combined\nInsp.",    color: "#FAF5FF", iconColor: "#8B5CF6", locked: true },
            ].map((item, index) => (
              <View 
                key={index}
                style={styles.secondaryActionCardContainer}
              >
                
                  <TouchableOpacity 
                    style={[styles.secondaryActionCard, item.locked && { opacity: 0.6 }]} 
                    onPress={() => handleActionPress(item.screen, item.locked)}
                    activeOpacity={item.screen && !item.locked ? 0.2 : 1}
                  >
                    <View style={[styles.secondaryIconContainer, { backgroundColor: item.color }]}>
                      <item.icon size={22} color={item.iconColor} />
                    </View>
                    <Text style={styles.secondaryActionLabel}>{item.label}</Text>
                    {item.locked && (
                      <View style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Lock size={14} color="#94A3B8" />
                      </View>
                    )}
                  </TouchableOpacity>
                
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentInspections.length > 0 ? (
            recentInspections.map((item, index) => (
              <View 
                key={item.id}
              >
                <TouchableOpacity 
                  style={styles.activityItem}
                  onPress={() => navigation.navigate('Inspection', { id: item.id })}
                >
                  <View style={[styles.activityIcon, { backgroundColor: item.status === 'completed' ? '#ECFDF5' : '#FFFBEB' }]}>
                    <CheckCircle2 size={20} color={item.status === 'completed' ? '#10B981' : '#F59E0B'} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{item.vehicleName}</Text>
                    <Text style={styles.activityDate}>
                      {new Date(item.createdAt).toLocaleDateString()} • {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#CBD5E1" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent inspections</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Vehicle Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom || 24 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Vehicle</Text>
                <Text style={styles.modalSubtitle}>Which vehicle are you inspecting?</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {vehicles.length > 0 ? (
              <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.vehicleList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.vehicleItem}
                    onPress={() => handleSelectVehicle(item)}
                  >
                    <View style={styles.vehicleIconBg}>
                      <Car size={24} color="#0787e2" />
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleMakeModel}>{item.make} {item.model}</Text>
                      <Text style={styles.vehiclePlate}>{item.plate || 'No Plate'} • {item.year || 'N/A'}</Text>
                    </View>
                    <ChevronRight size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyVehicles}>
                <Car size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyVehiclesText}>No vehicles in your garage.</Text>
                <TouchableOpacity 
                  style={styles.addVehicleBtn}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('Vehicles');
                  }}
                >
                  <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.addVehicleBtnText}>Add a Vehicle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    marginTop: 8,
  },
  statsScroll: {
    paddingRight: 24,
  },
  statCard: {
    width: 140,
    height: 100,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  statInfo: {
    marginTop: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#0787e2',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryActionCard: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0787e2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryActionGradient: {
    padding: 20,
  },
  primaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    flex: 1,
    marginLeft: 16,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  primaryActionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  primaryActionChevron: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryActionCardContainer: {
    width: '31%',
  },
  secondaryActionCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  activityDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleList: {
    maxHeight: 400,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vehicleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleMakeModel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyVehicles: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyVehiclesText: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 24,
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0787e2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addVehicleBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
