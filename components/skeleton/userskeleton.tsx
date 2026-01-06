import { Card } from "heroui-native";
import React from "react";
import { View } from "react-native";

const SkeletonBlock = ({ className }: { className: string }) => (
  <View className={`bg-zinc-200 dark:bg-zinc-800 rounded-md ${className}`} />
);

const UserCardSkeleton = () => (
  <Card className="p-4 m-2">
    <View className="flex-row items-center gap-4">
      <View className="w-[60px] h-[60px] rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <View className="flex-1 gap-2">
        <SkeletonBlock className="w-3/4 h-5" />
        <SkeletonBlock className="w-1/2 h-4" />
        <SkeletonBlock className="w-1/4 h-5 mt-1" />
      </View>
    </View>
  </Card>
);

export const UsersSkeleton = () => {
  return (
    <View className="flex-1 bg-background p-2 pt-6">
      {/* Header Skeleton */}
      <View className="px-4 mb-4">
        <SkeletonBlock className="w-1/3 h-8 mb-6" />
        {/* Stats Skeleton */}
        <View className="flex-row justify-between gap-2 mb-4">
          <SkeletonBlock className="h-24 flex-1" />
          <SkeletonBlock className="h-24 flex-1" />
          <SkeletonBlock className="h-24 flex-1" />
        </View>
        {/* Search Skeleton */}
        <SkeletonBlock className="h-14 w-full" />
      </View>

      {/* List Skeleton */}
      <UserCardSkeleton />
      <UserCardSkeleton />
      <UserCardSkeleton />
      <UserCardSkeleton />
    </View>
  );
};
