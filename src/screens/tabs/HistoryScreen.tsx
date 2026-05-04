import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CheckCircle2, Clock, ChevronRight, Image as ImageIcon, ClipboardList, Search, Filter, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { databaseService } from '../../services/databaseService';
import { LinearGradient } from 'react-native-linear-gradient';

export default function History() {
  const { inspections, isLoading, loadInspections } = useInspectionStore();
  const { user } = useAuthStore();
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchPhotos = async () => {
      const photoMap: Record<string, string> = {};
      for (const inspection of inspections) {
        if (!photoMap[inspection.id]) {
          const itemPhotos = await databaseService.getPhotos(inspection.id);
          if (itemPhotos.length > 0) {
            photoMap[inspection.id] = itemPhotos[0].uri;
          }
        }
      }
      setPhotos(prev => ({ ...prev, ...photoMap }));
    };

    if (inspections.length > 0) {
      fetchPhotos();
    }
  }, [inspections]);

  const onRefresh = useCallback(() => {
    if (user) loadInspections(user.id);
  }, [user]);

  const filteredInspections = inspections.filter(item => 
    item.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'uploaded':
        return { color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2, label: 'COMPLETED' };
      case 'pending':
        return { color: '#F59E0B', bg: '#FFFBEB', icon: Clock, label: 'PENDING' };
      default:
        return { color: '#0787e2', bg: '#EEF2FF', icon: Clock, label: 'DRAFT' };
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const status = getStatusConfig(item.status);
    const StatusIcon = status.icon;

    return (
      <View>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => {
            if (item.status === 'uploaded') {
              navigation.navigate('InspectionDetails', { id: item.id });
            } else {
              navigation.navigate('InspectionChecklist', { id: item.id });
            }
          }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.thumbnailContainer}>
              {photos[item.id] ? (
                <Image source={{ uri: photos[item.id] }} style={styles.thumbnail} />
              ) : (
                <View style={styles.placeholderThumbnail}>
                  <ImageIcon size={24} color="#94A3B8" />
                </View>
              )}
              <View style={[styles.statusMiniBadge, { backgroundColor: status.color }]} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.vehicleName} numberOfLines={1}>{item.vehicleName || 'Untitled Inspection'}</Text>
              <View style={styles.dateRow}>
                <Calendar size={12} color="#94A3B8" />
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <StatusIcon size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Photos</Text>
                <Text style={styles.detailValue}>12</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>Full</Text>
              </View>
            </View>
            <View style={styles.viewAction}>
              <Text style={styles.viewText}>View</Text>
              <ChevronRight size={16} color="#0787e2" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Inspection History</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vehicles..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color="#0787e2" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && inspections.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0787e2" />
        </View>
      ) : filteredInspections.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <ClipboardList size={64} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No inspections found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? `No results for "${searchQuery}"` : "You haven't performed any inspections yet."}
            </Text>
            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.startBtnText}>Start New Inspection</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredInspections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#0787e2" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 16,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  placeholderThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusMiniBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  detailDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0787e2',
    marginRight: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateContainer: {
    alignItems: 'center',
    width: '100%',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  startBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
