import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { useGameTick } from '@/features/game/useGameTick';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Untere Tab-Leiste. Die Icons sind als Emojis umgesetzt, damit die App
 * ohne zusätzliche Icon-Bibliothek läuft (bewusste Platzhalter, bis
 * eigene Grafiken entstehen).
 */
function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{symbol}</Text>;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  // Der Herzschlag des Spiels läuft hier – genau einmal für alle Tabs.
  useGameTick();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('game.tabs.island'),
          tabBarIcon: ({ color }) => <TabIcon symbol="🏝️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="expeditions"
        options={{
          title: t('game.tabs.expeditions'),
          tabBarIcon: ({ color }) => <TabIcon symbol="🪂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="kingdom"
        options={{
          title: t('game.tabs.kingdom'),
          tabBarIcon: ({ color }) => <TabIcon symbol="📜" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <TabIcon symbol="👤" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <TabIcon symbol="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}
