import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { PressableFeedback, useThemeColor } from "heroui-native";
// If HapticTab is a component, import the correct haptic trigger function instead
import * as Haptics from "expo-haptics";

export default function UsersLayout() {
  const tabBarBg = useThemeColor("default");
  const headerBg = useThemeColor("foreground");
  const router = useRouter();
  const HapticTab = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const headerLeft = () => {
    return (
      <PressableFeedback
        onPress={() => {
          router.back();
          HapticTab();
        }}
        feedbackVariant="ripple"
        animation={{ ripple: { backgroundColor: { value: "#67e8f9" } } }}
      >
        <Ionicons name="chevron-back" size={28} color={headerBg} />
      </PressableFeedback>
    );
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: tabBarBg },
        headerTintColor: useThemeColor("foreground"),
        headerLeft: headerLeft,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Users",
          headerShown: true,
          headerBackTitle: " ",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen name="user-add" options={{ title: "Add User" }} />
      <Stack.Screen name="user-edit/[id]" options={{ title: "Edit User" }} />
    </Stack>
  );
}
