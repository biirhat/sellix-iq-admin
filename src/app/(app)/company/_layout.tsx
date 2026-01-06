import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { PressableFeedback, useThemeColor } from "heroui-native";

export default function EmployeeLayout() {
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
        headerBackTitle: " ",
        headerBackButtonDisplayMode: "minimal",
        headerLeft: headerLeft,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Companies' ,headerShown:true}} />
      <Stack.Screen name="company-add" options={{ title: 'Add Company' }} />
      <Stack.Screen name="company-edit/[id]" options={{ title: 'Edit Company' }} />
    </Stack>
  );
}
