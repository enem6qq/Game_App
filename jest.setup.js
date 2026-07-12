/* eslint-disable no-undef */
// Globale Test-Vorbereitung.

// Reanimated / Gesten-Mocks bei Bedarf hier ergänzen.

// AsyncStorage mocken, damit Tests ohne echtes Gerät laufen.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-secure-store mocken.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));
