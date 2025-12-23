import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AppsLayout() {
  return (
    <View className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
          headerTitleAlign: 'center',
          headerTransparent: true,
          headerBlurEffect: 'extraLight',
          headerBackButtonDisplayMode: 'generic',
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
