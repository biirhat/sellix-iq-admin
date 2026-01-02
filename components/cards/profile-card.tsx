// /* eslint-disable react-native/no-inline-styles */
import { useAuth } from "@/contexts/AuthProvidere";
import { Image } from "expo-image";
import { Card, PressableFeedback } from "heroui-native";
import { View } from "react-native";
import { AppText } from "../app-text";

export const CardContent = ({ className = "" }) => {
  const { user } = useAuth();
  const profileAny = (user?.profile ?? {}) as Record<string, any>;
  const email = profileAny.email ?? user?.email ?? "email@example.com";
  const ordersCount = 12; // placeholder, replace with real query later
  const avatar =
    profileAny.avatar_url ??
    "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo2.jpg";

  return (
    <View className={`${className}`}>
      <PressableFeedback
        feedbackVariant="ripple"
        className="w-full rounded-3xl overflow-hidden"
        animation={{ ripple: { backgroundColor: { value: "#67e8f9" } } }}
      >
        <Card className="p-4">
          <View className="flex-row items-center gap-4">
            <Image
              source={{ uri: avatar }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
            />

            <View className="flex-1">
              <AppText className="text-xl text-foreground font-bold">
                {user?.profile?.username}
              </AppText>
              <AppText className="text-sm text-muted mb-2">{email}</AppText>

              <View className="flex-row items-center gap-3">
                <View className=" px-3 py-2 rounded-lg">
                  <AppText className="font-medium text-default-foreground ">
                    {ordersCount} Orders
                  </AppText>
                </View>
                <View className=" px-3 py-2 rounded-lg">
                  <AppText className="font-medium text-default-foreground">
                    {user?.profile?.role ?? "user"}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </PressableFeedback>
    </View>
  );
};
