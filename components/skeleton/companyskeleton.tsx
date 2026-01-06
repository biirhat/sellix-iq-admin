import { Card, SkeletonGroup, type SkeletonAnimation } from 'heroui-native';
import React from 'react';
import { View } from 'react-native';

type CompanySkeletonProps = {
  isLoading?: boolean;
  variant?: SkeletonAnimation;
  count?: number;
};

export const CompanySkeleton = ({
  isLoading = true,
  variant = 'shimmer',
  count = 3,
}: CompanySkeletonProps) => {
  return (
    <View className="w-full px-2">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonGroup
          key={idx}
          isLoading={isLoading}
          variant={variant}
          isSkeletonOnly
          className="m-2"
        >
          <Card className="p-4">
            <View className="flex-row items-center gap-4">
              {/* Image */}
              <SkeletonGroup.Item className="w-20 h-20 rounded-xl" />

              {/* Text */}
              <View className="flex-1">
                <SkeletonGroup.Item className="h-4 w-1/2 rounded-md mb-2" />
                <SkeletonGroup.Item className="h-3 w-1/3 rounded-md mb-3" />

                <View className="flex-row items-center gap-2">
                  <SkeletonGroup.Item className="h-6 w-20 rounded-lg" />
                  <SkeletonGroup.Item className="h-6 w-28 rounded-lg" />
                </View>
              </View>
            </View>
          </Card>
        </SkeletonGroup>
      ))}
    </View>
  );
};

export const CompaniesSkeleton = ({
  isLoading = true,
  variant = 'shimmer',
  count = 3,
}: CompanySkeletonProps) => {
  return (
    <View className="flex-1 bg-background relative w-full px-2 pt-6">
      {/* Header */}
      <SkeletonGroup isLoading={isLoading} variant={variant} isSkeletonOnly className="mb-4">
        {/* Title */}
        {/* <SkeletonGroup.Item className="h-8 w-40 rounded-md mb-4" /> */}

        {/* Stats cards (Total / Active / Inactive) */}
        <View className="flex-row gap-3 mb-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-1">
              <View className="bg-surface rounded-xl p-3 items-center">
                <SkeletonGroup.Item className="w-10 h-10 rounded-full mb-2" />
                <SkeletonGroup.Item className="h-6 w-8 rounded-md mb-1" />
                <SkeletonGroup.Item className="h-3 w-16 rounded-md" />
              </View>
            </View>
          ))}
        </View>

        {/* Search bar */}
        <View className="mb-4 px-2">
          <View className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center">
            <SkeletonGroup.Item className="w-5 h-5 rounded-full mr-3" />
            <SkeletonGroup.Item className="h-4 w-78 rounded-md " />
          </View>
        </View>
      </SkeletonGroup>

      {/* List skeletons */}
      <CompanySkeleton isLoading={isLoading} variant={variant} count={count} />

      {/* FAB skeleton */}
      <View style={{ position: 'absolute', right: 18, bottom: 30 }} pointerEvents="none">
        <SkeletonGroup isLoading={isLoading} variant={variant} isSkeletonOnly>
          <SkeletonGroup.Item className="w-14 h-14 rounded-full" />
        </SkeletonGroup>
      </View>
    </View>
  );
};

export default CompanySkeleton;