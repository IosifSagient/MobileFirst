import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="weekly/index"
        options={{
          title: "Dashbooard",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="books.vertical"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="browse/index"
        options={{
          title: "Browse",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="magnifyingglass.circle"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="list/index"
        options={{
          title: "Ingredients",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="list.clipboard"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="gearshape"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
