import React from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

type Props = ViewProps & {
  /** Bei true wird der Inhalt scrollbar. */
  scroll?: boolean;
};

/**
 * Basis-Container für jeden Screen.
 * Kümmert sich um sichere Ränder (Notch/Statusleiste), Hintergrundfarbe
 * und einheitliches Padding.
 */
export function Screen({ scroll, style, children, ...rest }: Props) {
  const theme = useTheme();

  const content = (
    <View style={[styles.content, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
