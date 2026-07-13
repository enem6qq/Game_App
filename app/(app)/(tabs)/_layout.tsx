import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TabGlyph } from '@/features/game/graphics/icons';
import { useGameTick } from '@/features/game/useGameTick';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Untere Tab-Leiste mit eigenen Vektor-Icons.
 */

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
          tabBarIcon: ({ color }) => <TabGlyph name="insel" color={color} />,
        }}
      />
      <Tabs.Screen
        name="expeditions"
        options={{
          title: t('game.tabs.expeditions'),
          tabBarIcon: ({ color }) => <TabGlyph name="expedition" color={color} />,
        }}
      />
      <Tabs.Screen
        name="kingdom"
        options={{
          title: t('game.tabs.kingdom'),
          tabBarIcon: ({ color }) => <TabGlyph name="reich" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <TabGlyph name="profil" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <TabGlyph name="einstellungen" color={color} />,
        }}
      />
    </Tabs>
  );
}
