// app/index.tsx
import { CardContent } from "@/components/cards/profile-card";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useAuth } from "@/contexts/AuthProvidere";
import Feather from "@expo/vector-icons/Feather";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Card, cn, ScrollShadow } from "heroui-native";
import type { FC } from "react";
import React from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { withUniwind } from "uniwind";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedView = Animated.createAnimatedComponent(View);
const StyledFeather = withUniwind(Feather);

type HomeCardProps = {
  id: string | number;
  role: string[];
  title: string;
  imageLight: string;
  imageDark: string;
  path: string;
};

export default function Index() {
  const { user } = useAuth();
  console.log( user?.profile?.username);
  console.log( user?.profile?.role );
  
  const { isDark } = useAppTheme();
  const router = useRouter();
  const { height } = useWindowDimensions();

  const cards: HomeCardProps[] = [
    {
      id: 1,
      role:["super_admin"], // both can access
      title: "Companies",
      imageLight:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-components-light.png",
      imageDark:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-components-dark.png",
      path: "company",
    },
    {
      id: 2,
      role:["super_admin"], // both can access
      title: "Users",
      imageLight:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-themes-light.png",
      imageDark:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-themes-dark.png",
      path: "users",
    },
    {
      id: 3,
      role:["super_admin", "company_admin"], // both can access
      title: "Add Employee",
      imageLight:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-showcases-light.png",
      imageDark:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-showcases-dark-1.png",
      path: "employees",
    },
    {
      id: 4,
      role:["super_admin", "company_admin"], // both can access
      title: "Products",
       imageLight:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-components-light.png",
      imageDark:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/heroui-native-example/home-components-dark.png",
       path: "products",
    }
  ];
const availableCards = cards.filter(card =>
  card.role.includes(user?.profile?.role ?? "")
);

  const HomeCard: FC<HomeCardProps & { index: number }> = ({
    title,
    imageLight,
    imageDark,
    path,
    index,
  }) => {
    const rLightImageStyle = useAnimatedStyle(() => ({
      opacity: isDark ? 0 : withTiming(0.35),
    }));

    const rDarkImageStyle = useAnimatedStyle(() => ({
      opacity: isDark ? withTiming(0.35) : 0,
    }));

    return (
      <AnimatedPressable
        entering={FadeInDown.duration(300)
          .delay(index * 100)
          .easing(Easing.out(Easing.ease))}
        onPress={() => router.push(path)}
        className="flex-1 m-2 pt-4"
      >
        <Card
          className={cn(
            "p-0 h-40 border border-zinc-200 overflow-hidden",
            isDark && "border-zinc-900"
          )}
        >
          {/* Background images */}
          <AnimatedView entering={FadeIn} className="absolute inset-0">
            <AnimatedImage
              source={{ uri: imageLight }}
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
              style={rLightImageStyle}
            />
            <AnimatedImage
              source={{ uri: imageDark }}
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
              style={rDarkImageStyle}
            />
          </AnimatedView>

          {/* Center Icon */}
          <View className="flex-1 items-center justify-center">
            <View className="size-10 rounded-full bg-background/25 items-center justify-center">
              <StyledFeather
                name="arrow-up-right"
                size={20}
                className="text-foreground"
              />
            </View>
          </View>

          {/* Bottom Center Title */}
          <View className="pb-3 items-center">
            <Card.Title className="text-base text-foreground/90">
              {title}
            </Card.Title>
          </View>
        </Card>
      </AnimatedPressable>
    );
  };

  return (
    <ScrollShadow
      size={height * 0.12}
      LinearGradientComponent={LinearGradient}
      className="flex-1 bg-background pt-4"
    >
      <FlashList
        data={availableCards}
        keyExtractor={(item) => item.title}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<CardContent />}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 32,
        }}
        renderItem={({ item, index }) => <HomeCard {...item} index={index} />}
      />
    </ScrollShadow>
  );
}
