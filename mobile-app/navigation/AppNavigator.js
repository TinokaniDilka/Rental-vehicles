import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import EditProfileScreen from '../Profile/EditProfileScreen';import LeaveReviewScreen from '../Booking/LeaveReviewScreen';
import AlertsScreen from '../Alerts/AlertsScreen';

// Staff Screen
import StaffDashboardScreen from '../Staff/StaffDashboardScreen';

// New floating tab bar (Home / Bookings / [FAB: Vehicles] / Alerts / Profile)
import CustomTabBar from '../components/CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Customer Bottom Tab Navigator ─────────────────────────────────────────

const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
    }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Bookings" component={MyBookingsScreen} />
    <Tab.Screen name="Vehicles" component={VehicleListScreen} />
    <Tab.Screen name="Alerts" component={AlertsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─── Staff Navigator (full-screen, own tabs built-in) ──────────────────────

const StaffNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ animation: 'slide_from_right' }}
    />
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
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}