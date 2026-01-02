import { useAuth } from "@/contexts/AuthProvidere";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { LogOut, SunMoon } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView } from "react-native";
import { List } from "react-native-paper";

export default function Settings() {
  const { signOut } = useAuth();
  const router = useRouter();
  const color = useThemeColor("surface-foreground");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    console.log("[UI] logout started");
    try {
      const success = await signOut();
      console.log("[UI] signOut returned:", success);
      if (!success) {
        Alert.alert("Logout", "Could not log out fully — please try again.");
      } else {
        // Only navigate away if sign-out succeeded
        router.replace("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
      Alert.alert("Logout", "An error occurred while logging out.");
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    // <ScreenWrapper>
    <ScrollView className="flex-1 bg-background p-3">
      <List.Section className="p-2 bg-surface rounded-2xl">
        <List.Subheader>Some title</List.Subheader>
        <List.Item
          title="First Item"
          left={() => <SunMoon color={color} size={26} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => router.push("/apptheme")}
        />
        <List.Item
          title="App Theme"
          left={() => <SunMoon color={color} size={26} />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => router.push("/apptheme")}
        />
      </List.Section>

      <List.Section className="p-2 bg-surface rounded-2xl">
        <List.Item
          title="Log Out"
          left={() => <LogOut color={"red"} size={26} />}
          right={() =>
            isLoggingOut ? <ActivityIndicator color={"red"} /> : null
          }
          onPress={logout}
          titleStyle={{ color: "red" }}
          disabled={isLoggingOut}
        />
      </List.Section>
    </ScrollView>
    // </ScreenWrapper>
  );
}
