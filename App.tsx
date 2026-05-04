import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Car, ClipboardList, Settings as SettingsIcon, LayoutGrid } from 'lucide-react-native';

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
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#0787e2',
        tabBarInactiveTintColor: '#94A3B8',
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
