import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { useUpdateCompany } from "@/helpers/hooks/use-company";
import { useUsersAdmin } from "@/helpers/hooks/use-user"; // وەرگرتنا هەمی یوزەران
import { supabase } from "@/lib/supabase";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  Divider,
  FormField,
  ScrollShadow,
  Select,
  Switch,
  TextField,
  useThemeColor,
} from "heroui-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const getCompanyById = async (id: string) => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export default function EditCompany() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showTopToast, showError } = useCustomToast();
  const themeColorOverlay = useThemeColor("overlay");

  // 1. وەرگرتنا داتایێن کۆمپانیێ و یوزەران
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyById(id!),
    enabled: !!id,
  });
  const { data: users } = useUsersAdmin();
  const { mutate: updateCompanyMutation } = useUpdateCompany();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState<any>(undefined);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2. پرکرنا فۆرمێ دەما داتا دهێن
  useEffect(() => {
    if (company) {
      setName(company.name);
      setPhone(company.phone || "");
      setAddress(company.address || "");
      setIsActive(company.is_active);
      // Only override the editor preview when there's no local file selection in progress
      setLocalImage((prev) => {
        if (prev && prev.startsWith("file://")) return prev;
        return company.image_url ?? null;
      });

      // دیارکرنا خودانێ کۆمپانیێ د ناڤ Select دا
      if (users && company.owner_id) {
        const owner = users.find((u) => u.id === company.owner_id);
        if (owner) setSelectedOwner({ value: owner.id, label: owner.username });
      }
    }
  }, [company, users]);

  /* ---------------- IMAGE PICKER & UPLOAD ---------------- */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Allow photo access");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri ?? null;
      if (!uri) return;

      const prev = company?.image_url ?? null;
      // show local preview immediately
      setLocalImage(uri);
      setIsUploadingImage(true);

      // Delegate upload + DB update to the hook (same flow as users)
      updateCompanyMutation(
        { id, image_url: uri },
        {
          onSuccess: (data: any) => {
            const newUrl = data?.image_url ?? null;
            setLocalImage(newUrl || null);
            showTopToast("Success", "Company logo updated.");
          },
          onError: (err: any) => {
            showError("Upload failed", err.message ?? String(err));
            setLocalImage(prev);
          },
          onSettled: () => setIsUploadingImage(false),
        }
      );
    }
  };

  const handleRemoveImage = () => {
    if (!id) return;
    Alert.alert(
      "Remove logo",
      "Are you sure you want to remove this company logo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const prev = company?.image_url ?? null;
            // Optimistically remove from UI
            setLocalImage(null);
            setIsUploadingImage(true);
            updateCompanyMutation(
              { id, image_url: "" },
              {
                onSuccess: () => {
                  showTopToast("Success", "Company logo removed.");
                },
                onError: (err: any) => {
                  showError("Removal failed", err.message ?? String(err));
                  // rollback UI
                  setLocalImage(prev ?? null);
                },
                onSettled: () => setIsUploadingImage(false),
              }
            );
          },
        },
      ]
    );
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!name.trim() || !id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          is_active: isActive,
          // The image_url is already updated by pickImage/handleRemoveImage
          owner_id: selectedOwner?.value, // گرێدانا خودانێ نوو
        })
        .eq("id", id);

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      showTopToast("سەرکەفتن", "کۆمپانیا تە هاتە نووکرن");
      router.back();
    } catch (err: any) {
      showError("خەلەتی", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingCompany)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      {/* IMAGE SECTION */}
      <View className="items-center mb-6">
        <View className="relative">
          <Pressable
            onPress={pickImage}
            disabled={isUploadingImage}
            className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center overflow-hidden"
          >
            {localImage ? (
              <Image source={{ uri: localImage }} className="w-full h-full" />
            ) : (
              <Feather name="image" size={30} color="#888" />
            )}
          </Pressable>
          {localImage && (
            <Pressable
              onPress={handleRemoveImage}
              className="absolute top-0 right-0 bg-red-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white"
              disabled={isUploadingImage}
            >
              <Feather name="x" size={16} color="white" />
            </Pressable>
          )}
          {isUploadingImage && (
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} className="rounded-full items-center justify-center bg-black/30">
              <ActivityIndicator color="white" />
            </View>
          )}
        </View>
      </View>

      <View className="gap-5">
        {/* --- SELECT OWNER SECTION --- */}
        <View>
          <Text className="text-sm font-medium text-muted mb-2">
            خودانێ کۆمپانیێ (Owner)
          </Text>
          <Select
            value={selectedOwner}
            onValueChange={(v: any) => setSelectedOwner(v)}
          >
            <Select.Trigger asChild>
              <Button
                variant="secondary"
                className="justify-between flex-row h-14 border border-divider/40"
              >
                <Text className="text-foreground">
                  {selectedOwner ? selectedOwner.label : "خودانەکی هەلبژێرە"}
                </Text>
                <Ionicons name="person-outline" size={18} color="#888" />
              </Button>
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay className="bg-black/20" />
              <Select.Content
                presentation="bottom-sheet"
                snapPoints={["45%", "70%"]}
              >
                <ScrollShadow
                  LinearGradientComponent={LinearGradient}
                  color={themeColorOverlay}
                >
                  <BottomSheetScrollView contentContainerClassName="p-4 pb-20">
                    {users?.map((user, index) => (
                      <React.Fragment key={user.id}>
                        <Select.Item
                          value={user.id}
                          label={user.username}
                          className="py-4"
                        >
                          <View className="flex-row items-center gap-3">
                            <View style={{ width: 60, height: 60, borderRadius: 30, overflow: 'hidden' }} className="items-center justify-center bg-zinc-200">
                              {user.avatar_url ? (
                                <Image source={{ uri: user.avatar_url }} style={{ width: 60, height: 60 }} />
                              ) : (
                                <View className="w-full h-full items-center justify-center">
                                  <Text className="text-base font-medium">{user.username.charAt(0)}</Text>
                                </View>
                              )}
                            </View>
                            <View>
                              <Text className="text-base text-foreground font-medium">
                                {user.username}
                              </Text>
                              <Text className="text-xs text-muted">
                                {user.email}
                              </Text>
                            </View>
                          </View>
                          <Select.ItemIndicator />
                        </Select.Item>
                        {index < users.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </BottomSheetScrollView>
                </ScrollShadow>
              </Select.Content>
            </Select.Portal>
          </Select>
        </View>

        <TextField>
          <TextField.Label>ناڤێ کۆمپانیێ</TextField.Label>
          <TextField.Input value={name} onChangeText={setName} />
        </TextField>

        <TextField>
          <TextField.Label>ژمارا مۆبایلێ</TextField.Label>
          <TextField.Input
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </TextField>

        <FormField isSelected={isActive} onSelectedChange={setIsActive}>
          <View className="flex-1">
            <FormField.Label>کۆمپانیا چالاکە (Active)</FormField.Label>
          </View>
          <FormField.Indicator>
            <Switch className="w-10">
              <Switch.Thumb className="size-5" />
            </Switch>
          </FormField.Indicator>
        </FormField>

        <View className="mt-4 gap-4">
          <Button isDisabled={loading || isUploadingImage} onPress={handleSubmit}>
            {loading ? "نووکرن..." : "Update Company"}
          </Button>
          <Button variant="secondary" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
