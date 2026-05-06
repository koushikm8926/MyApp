import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { databaseService, InspectionRecord, PhotoRecord } from '../../services/databaseService';
import { Calendar, ArrowLeft, Shield, Image as ImageIcon, Ship, PaintBucket, Droplets, Users, Wrench, Package, CloudUpload, Hash } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 64) / 3;

export default function InspectionDetails() {
  const route = useRoute<any>();
  const { id } = route.params || {};
  const [inspection, setInspection] = useState<InspectionRecord | null>(null);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadData = async () => {
      try {
        const inspectionData = await databaseService.getInspectionById(id);
        const photoData = await databaseService.getPhotos(id as string);
        
        setInspection(inspectionData);
        setPhotos(photoData);
      } catch (err) {
        console.error('Failed to load inspection details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!inspection) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Inspection not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const data = JSON.parse(inspection.data || '{}');
  const particulars = data.vesselParticulars || {};
  const standards = data.cleaningStandards || {};
  const waterData = data.daysFreshWater || {};
  const crewListData = data.crewList || {};
  const equipmentData = data.cleaningEquipment || {};
  const cargoHistory = data.lastCargoHistory || {};

  const renderInfoRow = (label: string, value: string | boolean | number | undefined) => {
    const isEmpty = value === undefined || value === null || value === '';
    
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, isEmpty && styles.placeholderValue]}>
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
        </Text>
      </View>
    );
  };

  const renderSection = (title: string, icon: any, color: string, children: React.ReactNode) => (
    <View style={styles.reportSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBg, { backgroundColor: color + '15' }]}>
          {React.createElement(icon, { size: 20, color: color })}
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const hasData = (obj: any) => obj && Object.keys(obj).length > 0 && Object.values(obj).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Seamless Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.badgeText}>OFFICIAL REPORT</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
        
        <View style={styles.headerMain}>
          <Text style={styles.vehicleTitle}>{inspection.vehicleName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Hash size={12} color="#64748B" />
              <Text style={styles.metaBadgeText}>{inspection.vehiclePlate}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Calendar size={12} color="#64748B" />
              <Text style={styles.metaBadgeText}>{new Date(inspection.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: inspection.status === 'uploaded' ? '#ECFDF5' : '#FFFBEB' }]}>
              <Text style={[styles.statusTagText, { color: inspection.status === 'uploaded' ? '#10B981' : '#F59E0B' }]}>
                {inspection.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {renderSection('Vessel Particulars', Ship, '#3B82F6', (
          <View style={styles.gridContainer}>
            {hasData(particulars) ? (
              <>
                {renderInfoRow('Vessel Name', particulars.vesselName)}
                {renderInfoRow('IMO Number', particulars.imoNumber)}
                {renderInfoRow('Vessel Type', particulars.vesselType)}
                {renderInfoRow('Flag', particulars.flag)}
                {renderInfoRow('Gross Tonnage', particulars.grossTonnage)}
                {renderInfoRow('DWT', particulars.dwt)}
                {renderInfoRow('Year Built', particulars.yearBuilt)}
              </>
            ) : (
              <Text style={styles.pendingText}>No vessel particulars recorded.</Text>
            )}
          </View>
        ))}

        {renderSection('Crew List', Users, '#8B5CF6', (
          <View style={styles.gridContainer}>
            {hasData(crewListData) ? (
              <>
                {renderInfoRow('Total Crew', crewListData.totalCrew)}
                {renderInfoRow('Master', crewListData.masterName)}
                {renderInfoRow('Chief Officer', crewListData.chiefOfficerName)}
                {renderInfoRow('Nationality', crewListData.nationality)}
              </>
            ) : (
              <Text style={styles.pendingText}>No crew details recorded.</Text>
            )}
          </View>
        ))}

        {renderSection('Cleaning Equipment', Wrench, '#F59E0B', (
          <View style={styles.gridContainer}>
            {hasData(equipmentData) ? (
              <>
                {renderInfoRow('High Pressure', equipmentData.highPressureMachines)}
                {renderInfoRow('Chemicals (L)', equipmentData.chemicalsQuantity)}
                {renderInfoRow('Brushes/Brooms', equipmentData.brushesBrooms)}
                {renderInfoRow('Scrapers', equipmentData.scrapers)}
              </>
            ) : (
              <Text style={styles.pendingText}>No equipment inventory recorded.</Text>
            )}
          </View>
        ))}

        {renderSection('Cargo History', Package, '#0EA5E9', (
          <View style={styles.gridContainer}>
            {hasData(cargoHistory) ? (
              <>
                {renderInfoRow('Last Cargo', cargoHistory.lastCargo)}
                {renderInfoRow('2nd Last', cargoHistory.secondLastCargo)}
                {renderInfoRow('3rd Last', cargoHistory.thirdLastCargo)}
              </>
            ) : (
              <Text style={styles.pendingText}>No cargo history recorded.</Text>
            )}
          </View>
        ))}

        {renderSection('Cleaning Standards', PaintBucket, '#10B981', (
          <View style={styles.gridContainer}>
            {hasData(standards) ? (
              <>
                {renderInfoRow('Required Level', 
                  standards.standard === 'hospital' ? 'Hospital Clean' :
                  standards.standard === 'grain' ? 'Grain Clean' :
                  standards.standard === 'normal' ? 'Normal Clean' :
                  standards.standard
                )}
                {renderInfoRow('Chemical Wash', standards.chemicalWash)}
                {renderInfoRow('Surveyor Req.', standards.surveyorRequired)}
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksLabel}>Additional Remarks</Text>
                  <Text style={[styles.remarksValue, (standards.remarks === undefined || standards.remarks === '') && styles.placeholderValue]}>
                    {standards.remarks || 'No additional remarks provided.'}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.pendingText}>No cleaning standards selected.</Text>
            )}
          </View>
        ))}

        {renderSection('Days & Fresh Water', Droplets, '#3B82F6', (
          <View style={styles.gridContainer}>
            {hasData(waterData) ? (
              <>
                {renderInfoRow('Total Quantity', waterData.waterQuantity ? `${waterData.waterQuantity} MT` : undefined)}
                {renderInfoRow('Source', waterData.source)}
                {renderInfoRow('Days Since Cleaning', waterData.cleaningDays)}
                {renderInfoRow('Est. Remaining Days', waterData.remainingDays)}
                {renderInfoRow('Quality Check', waterData.quality)}
              </>
            ) : (
              <Text style={styles.pendingText}>No water inventory data recorded.</Text>
            )}
          </View>
        ))}

        {/* Photos Section */}
        <View style={styles.reportSection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#3B82F615' }]}>
              <ImageIcon size={20} color="#3B82F6" />
            </View>
            <Text style={styles.sectionTitle}>Inspection Photos</Text>
            <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>{photos.length}</Text>
            </View>
          </View>
          
          {photos.length > 0 ? (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <TouchableOpacity key={photo.id} style={styles.photoItem}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <View style={styles.photoLabel}>
                    <Text style={styles.photoTypeText}>{photo.type}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ImageIcon size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>No photos attached to this report.</Text>
            </View>
          )}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>

      {/* Modern Upload Button */}
      <TouchableOpacity style={styles.exportFab} activeOpacity={0.9}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <CloudUpload size={22} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.fabText}>Upload Data</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#F8FAFC',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  headerMain: {
    alignItems: 'center',
    paddingTop: 8,
  },
  vehicleTitle: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
  },
  reportSection: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoRow: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
  },
  placeholderValue: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  remarksBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  remarksLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  remarksValue: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
  },
  photoCount: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3B82F6',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: PHOTO_SIZE,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  photoTypeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  footerSpace: {
    height: 120,
  },
  exportFab: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  fabGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  pendingText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  backLink: {
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  backLinkText: {
    color: '#3B82F6',
    fontWeight: '800',
  },
});
