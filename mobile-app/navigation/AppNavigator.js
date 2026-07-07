import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Customer Screens
import HomeScreen from '../Home/HomeScreen';
import VehicleListScreen from '../Vehicles/VehicleListScreen';
import VehicleDetailsScreen from '../Vehicles/VehicleDetailsScreen';
import MyBookingsScreen from '../Booking/MyBookingsScreen';
import BookingScreen from '../Booking/BookingScreen';
import PaymentScreen from '../Payment/PaymentScreen';
import ProfileScreen from '../Profile/ProfileScreen';
import LeaveReviewScreen from '../Booking/LeaveReviewScreen';

// Staff Screen
import StaffDashboardScreen from '../Staff/StaffDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Customer Bottom Tab Navigator ─────────────────────────────────────────

const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'rgba(15,23,42,0.97)',
        borderTopColor: 'rgba(99,102,241,0.2)',
        borderTopWidth: 1,
        height: 70,
        paddingBottom: 12,
        paddingTop: 6,
        position: 'absolute',
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#475569',
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
      },
      tabBarIcon: ({ color, focused }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Vehicles: focused ? 'car' : 'car-outline',
          Bookings: focused ? 'calendar' : 'calendar-outline',
          Profile: focused ? 'person' : 'person-outline',
        };
        return (
          <View style={[
            styles.tabIconContainer,
            focused && styles.tabIconContainerActive,
          ]}>
            <Ionicons name={icons[route.name]} size={21} color={color} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="Vehicles" component={VehicleListScreen} options={{ tabBarLabel: 'Vehicles' }} />
    <Tab.Screen name="Bookings" component={MyBookingsScreen} options={{ tabBarLabel: 'Bookings' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

// ─── Staff Navigator (full-screen, own tabs built-in) ──────────────────────

const StaffNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
  </Stack.Navigator>
);

// ─── Root Navigator ─────────────────────────────────────────────────────────

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!user ? (
          // ── Unauthenticated: Auth Stack ──
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'staff' ? (
          // ── Staff: Staff Dashboard (self-contained with own bottom tab bar) ──
          <>
            <Stack.Screen name="StaffMain" component={StaffNavigator} />
          </>
        ) : (
          // ── Customer / Admin fallback: Customer Tab Stack ──
          <>
            <Stack.Screen name="Main" component={CustomerTabs} />
            <Stack.Screen
              name="VehicleDetails"
              component={VehicleDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="LeaveReview"
              component={LeaveReviewScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 38,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
});