import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function RootLayout() {
  const tabBarBg = useThemeColor("default");

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: tabBarBg },
        headerTintColor: useThemeColor("foreground"),
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="apptheme"
        options={{
          headerShown: true,
          title: "App Theme",
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="company"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="employees"
        options={{
          headerShown: false,
        }}
      />
      {/* User screens moved into their own layout folder */}
    </Stack>
  );
}
