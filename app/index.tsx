import { TextInputContent } from '@/components/custom/text-input-content';
import { ThemedView } from '@/components/themed-view';
import { Button } from 'heroui-native';
import { View } from 'react-native';
import { useAuth } from "@/context/AuthContextProvider";
import { Redirect, useRouter } from "expo-router";
import React from "react";

export default function Index() {
  const { session } = useAuth();
  const router = useRouter();

  // If already logged in, redirect straight to the tabs
  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <ThemedView className="flex-1 justify-center items-center">
      <View style={{ width: '100%', alignItems: 'center' }}>
        <TextInputContent />
        <Button variant="primary" onPress={() => router.push('/(app)/(tabs)')}>
          Create account
        </Button>
      </View>
    </ThemedView>
  );
}