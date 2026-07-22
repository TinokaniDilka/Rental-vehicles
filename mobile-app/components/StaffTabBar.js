import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const DEFAULT_TABS = [
  { id: 'dashboard', icon: 'grid-outline', activeIcon: 'grid', label: 'Dashboard' },
  { id: 'vehicles', icon: 'car-outline', activeIcon: 'car', label: 'Vehicles' },
  { id: 'bookings', icon: 'calendar-outline', activeIcon: 'calendar', label: 'Bookings' },
  { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
];

function StaffTabButton({ tab, focused, onPress, onLayout }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
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
          <Ionicons
            name={focused ? tab.activeIcon : tab.icon}
            size={focused ? 18 : 16}
            color={focused ? '#FFF5EB' : '#888888'}
          />
          {focused && <Text style={styles.tabLabelActive}>{tab.label}</Text>}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// tabs: optional override, defaults to the staff dashboard's 4 pages.
// activeTab: current activePage string. onTabPress: setActivePage.
export default function StaffTabBar({ activeTab, onTabPress, tabs = DEFAULT_TABS }) {
  const tabLayouts = useRef({});
  const hasMeasuredInitial = useRef(false);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const handleTabLayout = (tabId, event) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[tabId] = { x, width };

    if (!hasMeasuredInitial.current && tabId === activeTab) {
      indicatorX.setValue(x);
      indicatorWidth.setValue(width);
      hasMeasuredInitial.current = true;
    }
  };

  useEffect(() => {
    const layout = tabLayouts.current[activeTab];
    if (!layout) return;

    Animated.parallel([
      Animated.spring(indicatorX, { toValue: layout.x, useNativeDriver: false, speed: 16, bounciness: 8 }),
      Animated.spring(indicatorWidth, { toValue: layout.width, useNativeDriver: false, speed: 16, bounciness: 8 }),
    ]).start();
  }, [activeTab]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.glowBehind} pointerEvents="none" />

      <View style={styles.barRow}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { width: indicatorWidth, transform: [{ translateX: indicatorX }] },
          ]}
        />

        {tabs.map((tab) => (
          <StaffTabButton
            key={tab.id}
            tab={tab}
            focused={activeTab === tab.id}
            onPress={() => onTabPress(tab.id)}
            onLayout={(e) => handleTabLayout(tab.id, e)}
          />
        ))}
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
    backgroundColor: 'rgba(255, 140, 66, 0.18)',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.28)',
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
    backgroundColor: 'rgba(255, 140, 66, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 163, 102, 0.45)',
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
  tabLabelActive: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF5EB',
    marginTop: 2,
  },
});