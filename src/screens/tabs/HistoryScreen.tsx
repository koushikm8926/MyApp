import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput, Platform, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CheckCircle2, Clock, ChevronRight, Image as ImageIcon, ClipboardList, Search, Calendar, Hash, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { databaseService } from '../../services/databaseService';

export default function History() {
  const { inspections, isLoading, loadInspections } = useInspectionStore();
  const { user } = useAuthStore();
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  // Group by Vehicle ID and show only the most 'advanced' inspection per car
  const uniqueInspections = Array.from(
    inspections
      .sort((a, b) => {
        // Prioritize status (uploaded > pending > draft)
        const statusOrder: Record<string, number> = { uploaded: 0, pending: 1, draft: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        // Then prioritize newer ones
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .reduce((map, item) => {
        if (!map.has(item.vehicleId)) {
          map.set(item.vehicleId, item);
        }
        return map;
      }, new Map<string, any>())
      .values()
  );

  const filteredInspections = uniqueInspections.filter(item => {
    const matchesSearch = item.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.vehiclePlate?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'uploaded':
      case 'completed':
        return { color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2, label: 'COMPLETED' };
      case 'pending':
        return { color: '#F59E0B', bg: '#FFFBEB', icon: Clock, label: 'PENDING' };
      default:
        return { color: '#3B82F6', bg: '#EFF6FF', icon: Clock, label: 'DRAFT' };
    }
  };

  const renderFilterChip = (id: string, label: string) => (
    <TouchableOpacity 
      style={[styles.filterChip, statusFilter === id && styles.filterChipActive]}
      onPress={() => setStatusFilter(id)}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterChipText, statusFilter === id && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    // Normalize status strings
    const normalizedStatus = item.status === 'uploaded' ? 'completed' : item.status;
    const status = getStatusConfig(normalizedStatus);
    const StatusIcon = status.icon;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => {
            navigation.navigate('InspectionDetails', { id: item.id });
          }}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View style={styles.thumbnailContainer}>
              {photos[item.id] ? (
                <Image source={{ uri: photos[item.id] }} style={styles.thumbnail} />
              ) : (
                <View style={styles.placeholderThumbnail}>
                  <ImageIcon size={28} color="#94A3B8" />
                </View>
              )}
              <View style={[styles.statusMiniBadge, { backgroundColor: status.color }]} />
            </View>
            
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.vehicleName} numberOfLines={1}>
                  {item.vehicleName || 'Untitled Inspection'}
                </Text>
              </View>
              
              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Hash size={12} color="#64748B" />
                  <Text style={styles.metaBadgeText}>{item.vehiclePlate || 'N/A'}</Text>
                </View>
              </View>
              
              <View style={styles.dateRow}>
                <Calendar size={12} color="#94A3B8" />
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <StatusIcon size={12} color={status.color} />
              <Text style={[styles.statusPillText, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={styles.viewAction}>
              <Text style={styles.viewText}>View Report</Text>
              <ChevronRight size={16} color="#3B82F6" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Seamless Modern Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>History</Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or plate..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {renderFilterChip('all', 'All')}
            {renderFilterChip('completed', 'Completed')}
            {renderFilterChip('pending', 'In Progress')}
            {renderFilterChip('draft', 'Drafts')}
          </ScrollView>
        </View>
      </View>

      {isLoading && inspections.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : filteredInspections.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
              <ClipboardList size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No inspections found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? `No results match "${searchQuery}"` : "You haven't performed any inspections yet."}
            </Text>
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
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#3B82F6" />
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
    backgroundColor: '#F8FAFC',
    zIndex: 10,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterWrapper: {
    marginHorizontal: -24,
  },
  filterScroll: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120, // Space for floating tab bar
  },
  cardWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  placeholderThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusMiniBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 4,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3B82F6',
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
    paddingBottom: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
