import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { useCompanies, useDeleteCompany } from "@/helpers/hooks/use-company";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { ScrollShadow } from "heroui-native";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Platform, Pressable, RefreshControl, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

export default function Companies() {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: companies, isLoading, refetch, isRefetching } = useCompanies();
  const { showSuccess, showError } = useCustomToast();

  const { mutate: deleteCompanyMutation } = useDeleteCompany();
  const [menuVisibleFor, setMenuVisibleFor] = useState<string | null>(null);

  const handleDelete = (company: { id: string; name: string; image_url: string | null }) => {
    Alert.alert(
      `Delete ${company.name}`,
      "Are you sure you want to delete this company? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel", onPress: () => setMenuVisibleFor(null) },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCompanyMutation({ id: company.id, imageUrl: company.image_url }, {
              onSuccess: () => {
                showSuccess("Company deleted", `${company.name} has been removed.`);
                setMenuVisibleFor(null);
              },
              onError: (error) => {
                showError("Deletion failed", error.message);
                setMenuVisibleFor(null);
              },
            });
          },
        },
      ]
    );
  };

  // Calculate stats from the real data
  const stats = useMemo(() => {
    const totalCompanies = companies?.length ?? 0;
    const activeCompanies = companies?.filter(c => c.is_active).length ?? 0;
    const inactiveCompanies = totalCompanies - activeCompanies;
    return { totalCompanies, activeCompanies, inactiveCompanies };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  // Stats Card Component
  const StatCard = ({ title, value, icon, bg, iconClass }: any) => (
    <View
      className="bg-surface rounded-xl p-2 mx-2 "
      style={{ width: (width - 56) / 4 }} // Calculate width for 4 cards with spacing
    >
      <View className="items-center">
        <View className={`w-10 h-10 rounded-full ${bg} items-center justify-center mb-2 shadow-sm opacity-95`}>
          <Ionicons name={icon} size={18} className={`${iconClass} opacity-80`} />
        </View>
        <Text className="text-2xl font-bold text-foreground">{value}</Text>
        <Text className="text-muted text-xs text-center mt-1">{title}</Text>
      </View>
    </View>
  );

  const CompanyCard = ({ company }: any) => (
    <View className="bg-surface m-2 rounded-lg p-4 mb-2 border border-border">
      <View className="flex-row items-center">
        {/* Logo Circle */}
        <View className="relative">
          <Image
            source={{ uri: company.image_url || 'https://via.placeholder.com/150' }}
            className="w-12 h-12 rounded-full"
          />
          <View className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface ${
            company.is_active ? "bg-emerald-500" : "bg-red-500"
          }`} />
        </View>

        {/* Company Info */}
        <View className="flex-1 ml-4">
          <Text className="text-muted font-bold text-base">
            {company.name}
          </Text>
          <Text className="text-muted text-sm mt-1">
            {company.phone}
          </Text>
          <Text className="text-muted text-xs mt-1">
            {formatDate(company.created_at)}
          </Text>
        </View>

        {/* Edit Button */}
        <View>
          <TouchableOpacity
            onPress={() => setMenuVisibleFor(menuVisibleFor === company.id ? null : company.id)}
            className="p-2"
          >
            <Ionicons name="ellipsis-vertical" size={20} className="text-muted-foreground" />
          </TouchableOpacity>

          {menuVisibleFor === company.id && (
            <View className="absolute right-10 top-2 bg-card rounded-md shadow-lg border border-border z-10 w-32">
              <Pressable
                onPress={() => {
                  router.push(`/(app)/company-edit/${company.id}`);
                  setMenuVisibleFor(null);
                }}
                className="flex-row items-center px-4 py-2.5"
              >
                <Ionicons name="pencil-outline" size={16} className="text-muted-foreground mr-3" />
                <Text className="text-foreground">Edit</Text>
              </Pressable>
              <View className="h-px bg-border" />
              <Pressable
                onPress={() => handleDelete(company)}
                className="flex-row items-center px-4 py-2.5"
              >
                <Ionicons name="trash-outline" size={16} className="text-red-500 mr-3" />
                <Text className="text-red-500">Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollShadow
      size={100}
      LinearGradientComponent={LinearGradient}
      className="flex-1 bg-background"
    >
      {/* Main companies list is the scrollable child so its header scrolls with the list */}
      <FlatList
        data={filteredCompanies}
        renderItem={({ item }) => <CompanyCard company={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Platform.OS === 'ios' ? '#F97316' : undefined}
            colors={Platform.OS === 'android' ? ['#F97316'] : undefined}
          />
        }
        ListHeaderComponent={
          <View className="px-2 pb-6">
            {/* Header Title */}
            <View className="pt-6 pb-4">
              <Text className="text-2xl font-bold text-foreground">Company Management</Text>
            </View>

            {/* Top Stats */}
            <View className="mb-4">
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[
                  {
                    title: "Total",
                    value: stats.totalCompanies,
                    icon: "business-outline",
                    bg: "bg-blue-100",
                    iconClass: "text-blue-500",
                  },
                  {
                    title: "Active",
                    value: stats.activeCompanies,
                    icon: "checkmark-circle-outline",
                    bg: "bg-emerald-100",
                    iconClass: "text-emerald-500",
                  },
                  {
                    title: "Inactive",
                    value: stats.inactiveCompanies,
                    icon: "close-circle-outline",
                    bg: "bg-red-100",
                    iconClass: "text-red-500",
                  },
                ]}
                renderItem={({ item }) => <StatCard {...item} />}
                keyExtractor={(item) => item.title}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              />
            </View>

            {/* Search Bar */}
            <View className="mb-4">
              <View className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center">
                <Ionicons name="search-outline" size={18} className="text-muted-foreground mr-3 opacity-80" />
                <TextInput
                  placeholder="Search for company..."
                  placeholderTextColor="#71717a"
                  className="flex-1 text-foreground text-base"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Add Company Button */}
            <View className="mb-6">
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => router.push('/(app)/company-add')}
                style={{
                  borderRadius: 999,
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={['#7dd3fc', '#60a5fa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3 px-5 flex-row items-center justify-center rounded-full"
                >
                  <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center mr-3">
                    <Ionicons name="add" size={18} className="text-white opacity-95" />
                  </View>
                  <Text className="text-white font-semibold text-base">Add New Company</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Count + Filter Row */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-muted-foreground text-sm">
                {filteredCompanies.length} compan{filteredCompanies.length !== 1 ? 'ies' : 'y'}
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-primary text-sm font-medium mr-1">Filter</Text>
                <Ionicons name="filter-outline" size={16} className="text-primary" />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Ionicons name="business-outline" size={64} className="text-muted-foreground/40" />
            <Text className="text-muted-foreground text-lg font-medium mt-4">No companies found</Text>
            <Text className="text-muted-foreground text-center mt-2">Try a different search or add a new company</Text>
            <TouchableOpacity
              className="mt-6"
              activeOpacity={0.92}
              onPress={() => router.push('/(app)/company-add')}
              style={{
                borderRadius: 999,
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={['#7dd3fc', '#60a5fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 px-5 flex-row items-center justify-center rounded-full"
              >
                <View className="w-9 h-9 rounded-full bg-white/10 items-center justify-center mr-3">
                  <Ionicons name="add" size={18} className="text-white opacity-95" />
                </View>
                <Text className="text-white font-semibold text-base">Create Company</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </ScrollShadow>
  );
}