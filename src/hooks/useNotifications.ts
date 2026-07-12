import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { logger } from '@/lib/logger';

// Wie sollen Benachrichtigungen erscheinen, während die App offen ist.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Fragt die Erlaubnis für Push-Benachrichtigungen an und liefert den
 * Expo-Push-Token, den du serverseitig speichern kannst, um später
 * Benachrichtigungen an dieses Gerät zu schicken.
 */
export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const listener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotifications()
      .then(setToken)
      .catch((e) => logger.warn('Push-Registrierung übersprungen', e));

    listener.current = Notifications.addNotificationReceivedListener((n) => {
      logger.debug('Benachrichtigung erhalten', n.request.content.title);
    });

    return () => listener.current?.remove();
  }, []);

  return { token };
}

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Standard',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  const { data } = await Notifications.getExpoPushTokenAsync();
  return data;
}
