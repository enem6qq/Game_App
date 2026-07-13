import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';

type Props = RNTextProps & {
  variant?: Variant;
  muted?: boolean;
  color?: string;
};

/**
 * Text-Komponente, die automatisch Farbe und Größe aus dem Theme nimmt.
 * Immer diese statt des rohen <Text> verwenden – so bleibt alles konsistent.
 */
export function Text({ variant = 'body', muted, color, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <RNText
      style={[
        theme.typography[variant],
        { color: color ?? (muted ? theme.colors.textMuted : theme.colors.text) },
        style,
      ]}
      {...rest}
    />
  );
}
