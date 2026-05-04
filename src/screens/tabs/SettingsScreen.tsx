import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, Cloud, Info, LogOut, ChevronRight, Moon, Globe, HelpCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

interface SettingItemProps {
  icon: any;
  label: string;
  value?: boolean;
  type?: 'chevron' | 'switch';
  onValueChange?: (value: boolean) => void;
}

const SettingItem = ({ icon: Icon, label, value, type = 'chevron', onValueChange }: SettingItemProps) => {
  const handlePress = () => {
    if (type === 'switch' && onValueChange) {
      onValueChange(!value);
    } else if (type === 'chevron') {
      console.log('Navigate to', label);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color="#0787e2" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {type === 'switch' ? (
          <Switch 
            value={value} 
            onValueChange={onValueChange}
            trackColor={{ false: '#eee', true: '#C7D2FE' }}
            thumbColor={value ? '#0787e2' : '#f4f3f4'}
          />
        ) : (
          <ChevronRight size={20} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function Settings() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();
  
  // App States
  const [autoSync, setAutoSync] = useState(true);
  const [syncCellular, setSyncCellular] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation handles auth state automatically
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connectivity</Text>
          <View style={styles.groupCard}>
            <SettingItem 
              icon={Cloud} 
              label="Auto-Sync Data" 
              type="switch" 
              value={autoSync} 
              onValueChange={setAutoSync}
            />
            <View style={styles.divider} />
            <SettingItem 
              icon={Globe} 
              label="Sync over Cellular" 
              type="switch" 
              value={syncCellular}
              onValueChange={setSyncCellular}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.groupCard}>
            <SettingItem 
              icon={Bell} 
              label="Notifications" 
              type="switch" 
              value={notifications} 
              onValueChange={setNotifications}
            />
            <View style={styles.divider} />
            <SettingItem 
              icon={Moon} 
              label="Dark Mode" 
              type="switch" 
              value={darkMode} 
              onValueChange={setDarkMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.groupCard}>
            <SettingItem icon={HelpCircle} label="Help Center" />
            <View style={styles.divider} />
            <SettingItem icon={Shield} label="Privacy & Security" />
            <View style={styles.divider} />
            <SettingItem icon={Info} label="About Version 1.0.0" />
          </View>
        </View>

        {/* Logout */}
        <View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0787e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileEmail: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginLeft: 64,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F0',
    padding: 18,
    borderRadius: 20,
    marginTop: 10,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
});
