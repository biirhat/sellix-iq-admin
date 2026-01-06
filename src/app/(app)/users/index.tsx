import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { DeleteConfirmationDialog } from "@/components/dialog/DeleteConfirmationDialog";
import { UsersSkeleton } from "@/components/skeleton/userskeleton";
import { useDeleteUser, useUsers } from "@/helpers/hooks/use-user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Button,
    Card,
    Popover,
    PressableFeedback,
    ScrollShadow,
} from "heroui-native";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const router = useRouter();
  const { data: users, isLoading, refetch, isRefetching } = useUsers();
  const { showSuccess, showError } = useCustomToast();

  const { mutate: deleteUserMutation, isPending: isDeleting } = useDeleteUser();
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const handleDelete = () => {
    if (!userToDelete) return;

    // Close the confirmation dialog first so it can animate out
    const target = userToDelete;
    setUserToDelete(null);

    // Wait a short moment for animations to complete before mutating
    setTimeout(() => {
      deleteUserMutation(target.id, {
        onSuccess: () => {
          showSuccess("User deleted", `${target.username} has been removed.`);
        },
        onError: (error) => {
          showError("Deletion failed", error.message);
        },
      });
    }, 180);
  };

  const stats = useMemo(() => {
    const totalUsers = users?.length ?? 0;
    const companyAdmins =
      users?.filter((u) => u.role === "company_admin").length ?? 0;
    const representatives =
      users?.filter((u) => u.role === "representative").length ?? 0;
    return { totalUsers, companyAdmins, representatives };
  }, [users]);

  // compute counts per role generically (avoids strict union type comparisons)
  const roleCountsMap = useMemo(() => {
    const map: Record<string, number> = {};
    (users ?? []).forEach((u: any) => {
      const r = String((u as any).role ?? "");
      map[r] = (map[r] ?? 0) + 1;
    });
    return map;
  }, [users]);

  const roleConfigs = useMemo(
    () => [
      {
        id: "all",
        label: "Total Users",
        icon: "people-outline",
        count: stats.totalUsers,
        bg: "bg-blue-100",
        iconClass: "text-blue-500",
      },
      {
        id: "super_admin",
        label: "Super Admin",
        icon: "shield-checkmark-outline",
        count: roleCountsMap["super_admin"] ?? 0,
        bg: "bg-violet-100",
        iconClass: "text-violet-500",
      },
      {
        id: "company_admin",
        label: "Com Admin",
        icon: "business-outline",
        count: roleCountsMap["company_admin"] ?? 0,
        bg: "bg-emerald-100",
        iconClass: "text-emerald-500",
      },
      {
        id: "driver",
        label: "Driver",
        icon: "car-outline",
        count: roleCountsMap["driver"] ?? 0,
        bg: "bg-sky-100",
        iconClass: "text-sky-500",
      },
      {
        id: "representative",
        label: "Staff",
        icon: "person-outline",
        count: roleCountsMap["representative"] ?? 0,
        bg: "bg-orange-100",
        iconClass: "text-orange-500",
      },
      {
        id: "ban",
        label: "Banned",
        icon: "ban",
        count: (roleCountsMap["ban"] ?? 0) + (roleCountsMap["banned"] ?? 0),
        bg: "bg-red-100",
        iconClass: "text-red-500",
      },
    ],
    [stats.totalUsers, roleCountsMap]
  );

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const q = searchQuery.trim().toLowerCase();
    return users.filter((user: any) => {
      const r = String(user.role ?? "");
      const matchesRole =
        roleFilter === "all"
          ? true
          : roleFilter === "ban"
          ? r === "ban" || r === "banned"
          : r === roleFilter;

      if (!matchesRole) return false;

      if (!q) return true;
      return (
        String(user.username ?? "")
          .toLowerCase()
          .includes(q) ||
        String(user.email ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [users, searchQuery, roleFilter]);

  const StatCard = ({
    title,
    value,
    icon,
    bg,
    iconClass,
    onPress,
    isSelected,
  }: any) => (
    <Pressable onPress={onPress} className="m-2">
      <View
        className={`bg-surface rounded-xl p-4 items-center justify-center ${
          isSelected ? "ring-2 ring-primary" : "border border-divider/10"
        }`}
        style={{ width: 120, height: 100 }}
      >
        <View
          className={`w-10 h-10 rounded-full ${bg} items-center justify-center mb-2 shadow-sm opacity-95 border-2 border-white dark:border-zinc-800`}
        >
          <Ionicons
            name={icon}
            size={18}
            className={`${iconClass} opacity-80`}
          />
        </View>
        <Text className="text-lg font-bold text-foreground">{value}</Text>
        <Text className="text-muted text-xs text-center mt-1">{title}</Text>
      </View>
    </Pressable>
  );

  // Simple (non-animated) avatar renderer to avoid Reanimated host-instance issues
  const SimpleAvatar = ({ uri, username, size = 60 }: any) => {
    const initial = (username?.charAt(0) ?? "U").toUpperCase();
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        }}
        className="items-center justify-center bg-zinc-200 dark:bg-zinc-800"
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-lg font-bold text-foreground">{initial}</Text>
          </View>
        )}
      </View>
    );
  };

  const UserCard = ({ user }: { user: any }) => {
    const theme = ROLE_THEMES[user.role] || ROLE_THEMES.default;
    return (
      <Popover>
        <Popover.Trigger asChild>
          <PressableFeedback
            className="m-2 w-full rounded-3xl overflow-hidden"
            feedbackVariant="ripple"
          >
            <Card className="p-4">
              <View className="flex-row items-center gap-4">
                <SimpleAvatar uri={user.avatar_url} username={user.username} size={60} />
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold text-foreground"
                    numberOfLines={1}
                  >
                    {user.username}
                  </Text>
                  <Text className="text-sm text-muted mb-2">{user.email}</Text>
                  <View className="flex-row items-center">
                    {/* 🌈 لێرەدا ڕەنگی باکگراوند و تێکستەکە بەپێی ڕۆڵەکە دەگۆڕێت */}
                    <View className={`px-3 py-1 rounded-2xl ${theme.bg}`}>
                      <Text
                        className={`font-black text-[10px] uppercase  ${theme.text}`}
                      >
                        {theme.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </PressableFeedback>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Overlay className="bg-black/20" />
          <Popover.Content presentation="bottom-sheet">
            <View className="gap-2 p-2">
              <Popover.Title className="text-center">
                {user.username}
              </Popover.Title>

              <Popover.Close asChild>
                <Pressable
                  onPress={() => router.push(`/(app)/users/user-edit/${user.id}`)}
                  className="flex-row items-center p-3 rounded-lg"
                >
                  <View className="size-10 items-center justify-center rounded-full bg-yellow-500/10">
                    <StyledIonicons
                      name="pencil-outline"
                      size={20}
                      className="text-yellow-500"
                    />
                  </View>
                  <Text className="text-foreground text-base ml-3">
                    Edit User
                  </Text>
                </Pressable>
              </Popover.Close>

              <Popover.Close asChild>
                <Pressable
                  onPress={() => setUserToDelete(user)}
                  className="flex-row items-center p-3 rounded-lg"
                >
                  <View className="size-10 items-center justify-center rounded-full bg-red-500/10">
                    <StyledIonicons
                      name="trash-outline"
                      size={20}
                      className="text-red-500"
                    />
                  </View>
                  <Text className="text-red-500 text-base ml-3">
                    Delete User
                  </Text>
                </Pressable>
              </Popover.Close>

              <Popover.Close asChild>
                <Button variant="secondary" size="lg" className="mt-2">
                  Cancel
                </Button>
              </Popover.Close>
            </View>
          </Popover.Content>
        </Popover.Portal>
      </Popover>
    );
  };

  if (isLoading) {
    return <UsersSkeleton />;
  }

  return (
    <>
      <ScrollShadow
        size={100}
        LinearGradientComponent={LinearGradient}
        className="flex-1 bg-background"
      >
        <View className="flex-1 relative">
          <FlatList
            data={filteredUsers}
            renderItem={({ item }) => <UserCard user={item} />}
            keyExtractor={(item, index) => String(item?.id ?? `${item?.username ?? item?.email ?? 'user'}_${index}`)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 6 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={Platform.OS === "ios" ? "#4F46E5" : undefined}
                colors={Platform.OS === "android" ? ["#4F46E5"] : undefined}
              />
            }
            ListHeaderComponent={
              <View className="px-4 pt-6">
                <Text className="text-3xl font-bold text-foreground mb-4">
                  Users
                </Text>

                <View className="mb-4">
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={roleConfigs}
                    renderItem={({ item }) => (
                      <StatCard
                        title={item.label}
                        value={item.count}
                        icon={item.icon}
                        bg={item.bg}
                        iconClass={item.iconClass}
                        onPress={() => setRoleFilter(item.id)}
                        isSelected={roleFilter === item.id}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                  />
                </View>

                <View className="mb-4 relative">
                  <TextInput
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="h-14 bg-surface border border-divider/50 rounded-xl pl-12 pr-4 text-foreground"
                    placeholderTextColor="gray"
                  />
                  <View className="absolute left-4 top-0 bottom-0 justify-center">
                    <Ionicons name="search-outline" size={20} color="#888" />
                  </View>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Ionicons
                  name="people-outline"
                  size={64}
                  className="text-muted/40"
                />
                <Text className="text-muted text-lg font-medium mt-4">
                  No users found
                </Text>
                <Text className="text-muted text-center mt-2">
                  {searchQuery
                    ? "Try a different search term."
                    : "Add a new user to get started."}
                </Text>
              </View>
            }
          />

          <View style={{ position: "absolute", right: 18, bottom: 30 }}>
            <Button
              size="lg"
              isIconOnly
              onPress={() => router.push("/(app)/users/userAdd")}
              style={{
                shadowColor: "#4F46E5",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Ionicons name="add" size={24} color="white" />
            </Button>
          </View>
        </View>
      </ScrollShadow>
      <DeleteConfirmationDialog
        isOpen={!!userToDelete}
        onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}
        onConfirm={handleDelete}
        title={`Delete ${userToDelete?.username}`}
        description="Are you sure you want to delete this user? This will also remove their access."
        isLoading={isDeleting}
      />
    </>
  );
}

// Role theme mapping for consistent role chips
const ROLE_THEMES: Record<string, { bg: string; text: string; label: string }> = {
  super_admin: { bg: "bg-violet-100", text: "text-violet-600", label: "Super Admin" },
  company_admin: { bg: "bg-emerald-100", text: "text-emerald-600", label: "Com Admin" },
  driver: { bg: "bg-blue-100", text: "text-blue-600", label: "Driver" },
  representative: { bg: "bg-orange-100", text: "text-orange-600", label: "Staff" },
  ban: { bg: "bg-red-100", text: "text-red-600", label: "Banned" },
  banned: { bg: "bg-red-100", text: "text-red-600", label: "Banned" },
  default: { bg: "bg-slate-100", text: "text-slate-600", label: "User" },
};
