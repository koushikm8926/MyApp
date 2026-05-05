import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { databaseService, InspectionRecord, PhotoRecord } from '../../services/databaseService';
import { CheckCircle2, Clock, MapPin, Calendar, User, ArrowLeft, Car, Shield, Hash, Image as ImageIcon, ChevronRight, Ship, PaintBucket, FileText, Download } from 'lucide-react-native';
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
        <ActivityIndicator size="large" color="#0787e2" />
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

  const renderInfoRow = (label: string, value: string | boolean | undefined) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, !value && styles.placeholderValue]}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
      </Text>
    </View>
  );

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E293B', '#334155']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.badgeText}>OFFICIAL REPORT</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Download size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerMain}>
          <Text style={styles.vehicleTitle}>{inspection.vehicleName}</Text>
          <View style={styles.plateContainer}>
            <Text style={styles.plateText}>{inspection.vehiclePlate}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.metaInfo}>
          <View style={styles.metaCard}>
            <Calendar size={16} color="#64748B" />
            <Text style={styles.metaText}>{new Date(inspection.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusTag, { backgroundColor: inspection.status === 'uploaded' ? '#DCFCE7' : '#FEF3C7' }]}>
            <Text style={[styles.statusTagText, { color: inspection.status === 'uploaded' ? '#15803D' : '#B45309' }]}>
              {inspection.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {renderSection('Vessel Particulars', Ship, '#10B981', (
          <View style={styles.gridContainer}>
            {renderInfoRow('Vessel Name', particulars.vesselName)}
            {renderInfoRow('IMO Number', particulars.imoNumber)}
            {renderInfoRow('Vessel Type', particulars.vesselType)}
            {renderInfoRow('Flag', particulars.flag)}
            {renderInfoRow('Gross Tonnage', particulars.grossTonnage)}
            {renderInfoRow('DWT', particulars.dwt)}
            {renderInfoRow('Year Built', particulars.yearBuilt)}
          </View>
        ))}

        {renderSection('Cleaning Standards', PaintBucket, '#F59E0B', (
          <View style={styles.gridContainer}>
            {renderInfoRow('Required Level', standards.standard)}
            {renderInfoRow('Chemical Wash', standards.chemicalWash)}
            {renderInfoRow('Surveyor Req.', standards.surveyorRequired)}
            <View style={styles.remarksBox}>
              <Text style={styles.remarksLabel}>Additional Remarks</Text>
              <Text style={[styles.remarksValue, !standards.remarks && styles.placeholderValue]}>
                {standards.remarks || 'No additional remarks provided.'}
              </Text>
            </View>
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
              <Text style={styles.emptyText}>No photos attached to this report.</Text>
            </View>
          )}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>

      <TouchableOpacity style={styles.exportFab}>
        <LinearGradient
          colors={['#0787e2', '#1E40AF']}
          style={styles.fabGradient}
        >
          <FileText size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.fabText}>Generate PDF Report</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 1,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMain: {
    alignItems: 'center',
  },
  vehicleTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  plateContainer: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
  },
  plateText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reportSection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  placeholderValue: {
    color: '#CBD5E1',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  remarksBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  remarksLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 4,
  },
  remarksValue: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  photoCount: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: PHOTO_SIZE,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
  },
  photoTypeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  footerSpace: {
    height: 100,
  },
  exportFab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0787e2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: '#0787e2',
    fontWeight: '700',
  },
});
