import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function RootLayout() {
  const tabBarBg = useThemeColor("default");

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: tabBarBg } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="apptheme"
        options={{
          headerShown: true,
          title: "App Theme",
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal"
        }}
      />
      
      <Stack.Screen
        name="companies"
        options={{
          headerShown: true,
          title: "Companies",
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal"
        }}
      />
      <Stack.Screen
        name="company-add"
        options={{
          headerShown: true,
          title: "Add Company",
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal"
        }}
      />
      <Stack.Screen
        name="company-edit"
        options={{
          headerShown: true,
          title: "Add Company",
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal"
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          headerShown: true,
          title: "Users",
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal"
        }}
      />
      
    </Stack>
  );
}
