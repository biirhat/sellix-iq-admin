import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { VStack } from "@/components/ui/vstack";
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
      <VStack>
        <Button title="Create account" onPress={() => router.push('/(app)/(tabs)')} className="mt-4" />
      </VStack>
    </ThemedView>
  );
}