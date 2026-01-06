import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { DeleteConfirmationDialog } from "@/components/dialog/DeleteConfirmationDialog";
import { CompaniesSkeleton } from "@/components/skeleton/companyskeleton";
import { useCompanies, useDeleteCompany } from "@/helpers/hooks/use-company";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export default function Companies() {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: companies, isLoading, refetch, isRefetching } = useCompanies();
  const { showSuccess, showError } = useCustomToast();

  const { mutate: deleteCompanyMutation, isPending: isDeleting } = useDeleteCompany();
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);
  const [selectedStat, setSelectedStat] = useState<'all' | 'active' | 'inactive'>('all');

  const handleDelete = () => {
    if (!companyToDelete) return;

    deleteCompanyMutation(
      { id: companyToDelete.id, imageUrl: companyToDelete.image_url },
      {
        onSuccess: () => {
          showSuccess(
            "Company deleted",
            `${companyToDelete.name} has been removed.`
          );
          setCompanyToDelete(null);
        },
        onError: (error) => {
          showError("Deletion failed", error.message);
          setCompanyToDelete(null);
        },
      }
    );
  };

  // Calculate stats from the real data
  const stats = useMemo(() => {
    const totalCompanies = companies?.length ?? 0;
    const activeCompanies = companies?.filter((c) => c.is_active).length ?? 0;
    const inactiveCompanies = totalCompanies - activeCompanies;
    return { totalCompanies, activeCompanies, inactiveCompanies };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    const q = searchQuery.trim().toLowerCase();
    return companies.filter((company) => {
      // search match
      const matchesSearch =
        company.name.toLowerCase().includes(q) ||
        (company.phone ?? "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // status filter
      if (selectedStat === 'all') return true;
      if (selectedStat === 'active') return Boolean(company.is_active);
      if (selectedStat === 'inactive') return !company.is_active;
      return true;
    });
  }, [companies, searchQuery, selectedStat]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  };

  // Stats Card Component
  const StatCard = ({ title, value, icon, bg, iconClass, statKey }: any) => {
    const isSelected = selectedStat === statKey;
    return (
      <Pressable
        onPress={() => setSelectedStat((prev) => (prev === statKey ? 'all' : statKey))}
        className={`bg-surface rounded-xl p-2 mx-2`}
        style={{
          width: (width - 56) / 4,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? '#38bdf8' : 'transparent', // sky-400
          shadowColor: isSelected ? '#38bdf8' : undefined,
          shadowOpacity: isSelected ? 0.2 : undefined,
          shadowRadius: isSelected ? 6 : undefined,
          elevation: isSelected ? 3 : undefined,
        }}
      >
        <View className="items-center">
          <View
            className={`w-10 h-10 rounded-full ${bg} items-center justify-center mb-2 shadow-sm opacity-95 ${isSelected ? 'scale-105' : ''}`}
          >
            <Ionicons
              name={icon as any}
              size={18}
              className={`${iconClass} opacity-80`}
            />
          </View>
          <Text className="text-2xl font-bold text-foreground">{value}</Text>
          <Text className="text-muted text-xs text-center mt-1">{title}</Text>
        </View>
      </Pressable>
    );
  };

  const CompanyCard = ({ company }: any) => {
    const router = useRouter();

    return (
      <Popover>
        <Popover.Trigger asChild>
          <PressableFeedback
            className="m-2 w-full rounded-3xl overflow-hidden"
            feedbackVariant="ripple"
            animation={{ ripple: { backgroundColor: { value: "#67e8f9" } } }}
          >
            <Card className="p-4">
              <View className="flex-row items-center gap-4">
                {company.image_url ? (
                  <Image
                    source={{ uri: company.image_url }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                  />
                ) : (
                  <View className="w-20 h-20 rounded-lg items-center justify-center bg-zinc-200">
                    <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                      {company.name ? company.name.charAt(0).toUpperCase() : "C"}
                    </Text>
                  </View>
                )}

                <View className="flex-1">
                  <Text className="text-xl text-foreground font-bold" numberOfLines={1}>
                    {company.name}
                  </Text>
                  <Text className="text-sm text-muted mb-2">{company.phone}</Text>

                  <View className="flex-row items-center">
                    <View className="px-3 py-2 rounded-lg bg-surface/50">
                      <Text className={`font-medium ${company.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                        {company.is_active ? "Active" : "Inactive"}
                      </Text>
                    </View>

                    <View className="px-3 py-2 rounded-lg bg-surface/50 ml-2">
                      <Text className="font-medium text-default-foreground">
                        Joined: {formatDate(company.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </PressableFeedback>
        </Popover.Trigger>

        {/* 🔽 BOTTOM SHEET */}
        <Popover.Portal>
          <Popover.Overlay className="bg-black/20" />

          <Popover.Content presentation="bottom-sheet">
            <View className="gap-2 p-2">
              <Popover.Title className="text-center">
                {company.name}
              </Popover.Title>

              {/* Edit */}
              <Popover.Close asChild>
                <Pressable
                  onPress={() =>
                    router.push(`/(app)/company/company-edit/${company.id}`)
                  }
                  className="flex-row items-center p-3 rounded-lg"
                >
                  <View className="size-10 items-center justify-center rounded-full bg-yellow-500/10">
                    <StyledIonicons
                      name="pencil-outline"
                      size={20}
                      className="text-yellow-500"
                    />
                  </View>
                  <Text className="text-foreground text-base ml-3">Edit Company</Text>
                </Pressable>
              </Popover.Close>

              {/* Delete */}
              <Popover.Close asChild>
                <Pressable
                  onPress={() => setCompanyToDelete(company)}
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
                    Delete Company
                  </Text>
                </Pressable>
              </Popover.Close>

              {/* Cancel */}
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
    return (
      <CompaniesSkeleton />
    );
  }

  return (
    <>
    <ScrollShadow
      size={100}
      LinearGradientComponent={LinearGradient}
      className="flex-1 bg-background"
    >
      <View className="flex-1 relative">
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
              tintColor={Platform.OS === "ios" ? "#F97316" : undefined}
              colors={Platform.OS === "android" ? ["#F97316"] : undefined}
            />
          }
          ListHeaderComponent={
            <View className="px-2 pt-6">


              {/* Top Stats */}
              <View className="mb-4">
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[
                    { key: 'all', title: 'Total', value: stats.totalCompanies, icon: 'business-outline', bg: 'bg-blue-100', iconClass: 'text-blue-500' },
                    { key: 'active', title: 'Active', value: stats.activeCompanies, icon: 'checkmark-circle-outline', bg: 'bg-emerald-100', iconClass: 'text-emerald-500' },
                    { key: 'inactive', title: 'Inactive', value: stats.inactiveCompanies, icon: 'close-circle-outline', bg: 'bg-red-100', iconClass: 'text-red-500' },
                  ]}
                  renderItem={({ item }) => {
                    const { key, ...rest } = item;
                    return <StatCard statKey={key} {...rest} />;
                  }}
                  keyExtractor={(item) => item.key}
                   contentContainerStyle={{ paddingHorizontal: 12 }}
                 />
              </View>

              {/* Search Bar */}
              <View className="mb-4">
                <View className="bg-surface border border-border rounded-lg px-4 py-3 flex-row items-center">
                  <Ionicons
                    name="search-outline"
                    size={18}
                    className="text-muted-foreground mr-3 opacity-80"
                  />
                  <TextInput
                    placeholder="Search for company..."
                    placeholderTextColor="#71717a"
                    className="flex-1 text-foreground text-base"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              {/* (Add button moved to floating action button) */}


            </View>
          }
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View className="items-center justify-center py-10 px-4">
                <Ionicons
                  name="search-outline"
                  size={64}
                  className="text-muted/40"
                />
                <Text className="text-muted text-lg font-medium mt-4">
                  {`No companies found for "${searchQuery}"`}
                </Text>
                <Text className="text-muted text-center mt-2">
                  Try a different search
                </Text>
              </View>
            ) : (
              <View className="items-center justify-center py-10">
                <Ionicons
                  name="business-outline"
                  size={64}
                  className="text-muted/40"
                />
                <Text className="text-muted text-lg font-medium mt-4">
                  No companies found
                </Text>
                <Text className="text-muted text-center mt-2">
                  Try a different search or add a new company
                </Text>

              </View>
            )
          }
        />

        {/* Floating Action Button (bottom-left) - icon only */}
        <View
          style={{ position: 'absolute', right: 18, bottom: 30 }}
          pointerEvents="box-none"
        >
          <Button
            size="lg"
            isIconOnly
            onPress={() => router.push("/(app)/company/company-add")}
            style={{
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Button.Label>
              <StyledIonicons name="add" size={22} className="text-white" />
            </Button.Label>
          </Button>
        </View>
      </View>
    </ScrollShadow>
    <DeleteConfirmationDialog
      isOpen={!!companyToDelete}
      onOpenChange={(isOpen) => !isOpen && setCompanyToDelete(null)}
      onConfirm={handleDelete}
      title={`Delete ${companyToDelete?.name}`}
      description="Are you sure you want to delete this company? This action cannot be undone."
      isLoading={isDeleting}
    />
    </>
  );
}
