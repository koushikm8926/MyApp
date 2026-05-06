import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Car, ClipboardList, Settings as SettingsIcon, LayoutGrid } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

// Stores
import { useAuthStore } from './src/store/useAuthStore';
import { initDatabase } from './src/services/databaseService';

// Screens - Auth
import LoginScreen from './src/screens/auth/LoginScreen';

// Screens - Tabs
import HomeScreen from './src/screens/tabs/HomeScreen';
import HistoryScreen from './src/screens/tabs/HistoryScreen';
import VehiclesScreen from './src/screens/tabs/VehiclesScreen';
import SettingsScreen from './src/screens/tabs/SettingsScreen';


import InspectionScreen from './src/screens/inspection/InspectionScreen';
import InspectionChecklistScreen from './src/screens/inspection/InspectionChecklistScreen';
import InspectionDetailsScreen from './src/screens/inspection/InspectionDetailsScreen';
import PreHoldCleaningScreen from './src/screens/inspection/PreHoldCleaningScreen';
import PreInspectionDocScreen from './src/screens/inspection/PreInspectionDocScreen';
import VesselParticularScreen from './src/screens/inspection/VesselParticularScreen';
import CrewListScreen from './src/screens/inspection/CrewListScreen';
import CleaningEquipmentScreen from './src/screens/inspection/CleaningEquipmentScreen';
import LastCargoScreen from './src/screens/inspection/LastCargoScreen';
import CleaningStandardsScreen from './src/screens/inspection/CleaningStandardsScreen';
import WalkTheHoldScreen from './src/screens/inspection/WalkTheHoldScreen';
import HoldDetailsScreen from './src/screens/inspection/HoldDetailsScreen';
import ZoneDetailsScreen from './src/screens/inspection/ZoneDetailsScreen';
import SublocationScreen from './src/screens/inspection/SublocationScreen';
import DaysFreshWaterScreen from './src/screens/inspection/DaysFreshWaterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 24,
          right: 24,
          elevation: 10,
          backgroundColor: 'transparent',
          borderRadius: 32,
          height: 64,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 25,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 18 : 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.5)']}
            style={{ 
              flex: 1, 
              borderRadius: 32,
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.8)',
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ),
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 10,
          marginTop: -5,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{
          tabBarLabel: 'Vehicles',
          tabBarIcon: ({ color }) => <Car size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Inspection" component={InspectionScreen} />
      <Stack.Screen name="InspectionChecklist" component={InspectionChecklistScreen} />
      <Stack.Screen name="InspectionDetails" component={InspectionDetailsScreen} />
      <Stack.Screen name="PreHoldCleaning" component={PreHoldCleaningScreen} />
      <Stack.Screen name="PreInspectionDoc" component={PreInspectionDocScreen} />
      <Stack.Screen name="VesselParticular" component={VesselParticularScreen} />
      <Stack.Screen name="CrewList" component={CrewListScreen} />
      <Stack.Screen name="CleaningEquipment" component={CleaningEquipmentScreen} />
      <Stack.Screen name="LastCargo" component={LastCargoScreen} />
      <Stack.Screen name="CleaningStandards" component={CleaningStandardsScreen} />
      <Stack.Screen name="WalkTheHold" component={WalkTheHoldScreen} />
      <Stack.Screen name="HoldDetails" component={HoldDetailsScreen} />
      <Stack.Screen name="ZoneDetails" component={ZoneDetailsScreen} />
      <Stack.Screen name="Sublocation" component={SublocationScreen} />
      <Stack.Screen name="DaysFreshWater" component={DaysFreshWaterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        await initialize();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }
    setup();
  }, []);

  if (!isReady || authLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
