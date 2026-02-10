/**
 * MontserratText Component
 * Text component with Montserrat font as default
 */

import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps } from 'react-native';

interface MontserratTextProps extends TextProps {
  weight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
}

export const MontserratText: React.FC<MontserratTextProps> = ({
  weight = '400',
  style,
  ...props
}) => {
  const getFontFamily = () => {
    if (weight === '400' || weight === 'normal') {
      return 'Montserrat';
    }
    return `Montserrat-${weight}`;
  };

  return (
    <RNText
      style={[styles.text, { fontFamily: getFontFamily() }, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Montserrat',
  },
});
