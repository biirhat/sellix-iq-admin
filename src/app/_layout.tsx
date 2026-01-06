// import '@/global.css';
import {
 AppThemeProvider } from "@/contexts/app-theme-context";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "@/contexts/AuthProvidere";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function Routes() {
  const { session, isLoading } = useAuth();

  if (isLoading) return <ActivityIndicator color={"red"} style={{ flex: 1 }} />; // or splash screen
  return (
    
      <Stack>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: true,
            title: "Create an account",
            headerBackTitle: " ",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>


  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <HeroUINativeProvider>
            <PaperProvider>
              <KeyboardProvider>
                <AppThemeProvider>
                  <Routes />
                </AppThemeProvider>
              </KeyboardProvider>
            </PaperProvider>
          </HeroUINativeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
