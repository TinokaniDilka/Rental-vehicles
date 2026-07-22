import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Haptics is optional — wrapped so the app doesn't crash if
// expo-haptics isn't installed yet. Run `npx expo install expo-haptics`
// to enable the tap vibration.
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  Haptics = null;
}

const triggerHaptic = () => {
  if (Haptics && Haptics.impactAsync) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

// Which route is rendered as the raised center button, instead of a
// normal tab. Change this single line if you want a different tab to
// be the FAB.
const FAB_ROUTE_NAME = 'Vehicles';

const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Vehicles: { active: 'car', inactive: 'car-outline' },
  Bookings: { active: 'calendar', inactive: 'calendar-outline' },
  Alerts: { active: 'notifications', inactive: 'notifications-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function AnimatedTabButton({ label, iconName, focused, onPress, onLayout, badgeCount }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  };

  const handlePress = () => {
    triggerHaptic();
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
      style={styles.tabTouchable}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View style={styles.tabInner}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={iconName}
              size={focused ? 18 : 16}
              color={focused ? '#FFF5EB' : '#888888'}
            />
            {badgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
              </View>
            )}
          </View>
          {focused && (
            <Text style={styles.tabLabelActive}>
              {label}
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function FabButton({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 12,
    }).start();
  };

  const handlePress = () => {
    triggerHaptic();
    onPress();
  };

  return (
    <View style={styles.fabWrapper}>
      <Animated.View
        style={[
          styles.fabGlow,
          { opacity: glow, transform: [{ scale: glow.interpolate({ inputRange: [0.6, 1], outputRange: [0.9, 1.15] }) }] },
        ]}
      />
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient
            colors={['#FFA366', '#FF8C42', '#E6732A']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="car" size={19} color="#fff" />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  // Alerts badge count — replace this with your real unread-notifications
  // count (e.g. from context, redux, or a query) once that's wired up.
  const alertsBadgeCount = 2;

  // Measured x/width of each side tab (not the FAB), used to slide the
  // indicator pill to the tapped tab instead of it snapping into place.
  const tabLayouts = useRef({});
  const hasMeasuredInitial = useRef(false);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const fabRoute = state.routes.find(r => r.name === FAB_ROUTE_NAME);
  const sideRoutes = state.routes.filter(r => r.name !== FAB_ROUTE_NAME);
  const fabIndex = state.routes.findIndex(r => r.name === FAB_ROUTE_NAME);
  const fabFocused = state.index === fabIndex;

  const leftRoutes = sideRoutes.slice(0, 2);
  const rightRoutes = sideRoutes.slice(2);

  const focusedRoute = state.routes[state.index];

  const goTo = (routeName, isFocused) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find(r => r.name === routeName)?.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleTabLayout = (routeKey, event) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[routeKey] = { x, width };

    // Snap (don't animate) to the correct position the very first time
    // the currently-focused tab reports its layout, so the pill doesn't
    // fly in from the left on initial mount.
    if (!hasMeasuredInitial.current && routeKey === focusedRoute.key) {
      indicatorX.setValue(x);
      indicatorWidth.setValue(width);
      hasMeasuredInitial.current = true;
    }
  };

  useEffect(() => {
    const layout = tabLayouts.current[focusedRoute.key];
    if (!layout) return;

    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: layout.x,
        useNativeDriver: false,
        speed: 16,
        bounciness: 8,
      }),
      Animated.spring(indicatorWidth, {
        toValue: layout.width,
        useNativeDriver: false,
        speed: 16,
        bounciness: 8,
      }),
    ]).start();
  }, [focusedRoute.key]);

  const renderTab = (route) => {
    const routeIndex = state.routes.findIndex(r => r.key === route.key);
    const isFocused = state.index === routeIndex;
    const icons = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
    const badgeCount = route.name === 'Alerts' ? alertsBadgeCount : 0;

    return (
      <AnimatedTabButton
        key={route.key}
        label={route.name}
        iconName={isFocused ? icons.active : icons.inactive}
        focused={isFocused}
        badgeCount={badgeCount}
        onPress={() => goTo(route.name, isFocused)}
        onLayout={(e) => handleTabLayout(route.key, e)}
      />
    );
  };

  // The FAB has its own always-visible circle, so hide the pill entirely
  // when Vehicles (the FAB route) is the focused tab.
  const showIndicator = !fabFocused;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.glowBehind} pointerEvents="none" />

      <View style={styles.barRow}>
        {showIndicator && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
        )}

        {leftRoutes.map(renderTab)}

        <View style={styles.fabSlot}>
          {fabRoute && <FabButton onPress={() => goTo(fabRoute.name, fabFocused)} />}
        </View>

        {rightRoutes.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 22,
  },
  glowBehind: {
    position: 'absolute',
    left: '50%',
    top: -34,
    width: 120,
    height: 76,
    marginLeft: -60,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    borderRadius: 34,
    height: 60,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 8,
    height: 44,
    backgroundColor: 'rgba(255, 140, 66, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 163, 102, 0.4)',
    borderRadius: 16,
  },
  tabTouchable: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#431407',
  },
  tabLabelActive: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF5EB',
    marginTop: 2,
  },
  fabSlot: {
    width: 50,
    alignItems: 'center',
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -34,
  },
  fabGlow: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 140, 66, 0.4)',
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 150, 0.5)',
  },
});