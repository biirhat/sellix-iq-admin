import { Tabs } from "expo-router";
import React from "react";
import { IconSymbol } from "@/components/icon-symbol";
import { ThemeToggle } from "@/components/theme-toggle";
import { HapticTab } from "@/helpers/hooks/haptic-tab";
import { useThemeColor } from 'heroui-native';
import { View } from 'react-native';

export default function TabLayout() {
  const tabBarBg = useThemeColor('default');
  return (
    <View style={{ flex: 1}}>
      <Tabs
        screenOptions={{
          // tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          headerRight: () => <ThemeToggle />,
          headerTitleAlign: "center",
          headerTitleStyle: { color: useThemeColor('foreground'), fontWeight: '600' },
          tabBarStyle: { backgroundColor: tabBarBg },
          headerBackground: () => <View style={{ flex: 1, backgroundColor: tabBarBg }} />
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gearshape.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
