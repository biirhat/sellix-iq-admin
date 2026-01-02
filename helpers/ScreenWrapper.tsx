// components/ScreenWrapper.tsx
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function ScreenWrapper({ children, className = '' }: ScreenWrapperProps) {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 25;

  return (
    <View 
      className={`flex-1 p-1 bg-background ${className}`}
      style={{ paddingTop }}
    >
      {children}
    </View>
  );
}