import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { useCompanies } from "@/helpers/hooks/use-company";
import { useEmployee, useUpdateEmployee } from "@/helpers/hooks/use-employee";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Button,
  Divider,
  ScrollShadow,
  Select,
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

const availableRoles = [
  { label: "Driver", value: "driver" },
  { label: "Staff", value: "representative" },
  { label: "Worker", value: "worker" },
];

export default function EditEmployee() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showTopToast, showError } = useCustomToast();
  const themeColorOverlay = useThemeColor("overlay");

  const { data: user, isLoading: isLoadingUser } = useEmployee(id!);
  const { data: companies } = useCompanies();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateEmployee();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(undefined);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setLocalImage((user as any).avatar_url);

      if (companies && user.company_id) {
        const company = companies.find((c) => c.id === user.company_id);
        if (company)
          setSelectedCompany({ value: company.id, label: company.name });
      }

      if (user.role) {
        const role = availableRoles.find((r) => r.value === user.role);
        if (role) setSelectedRole(role);
      }
    }
  }, [user, companies]);

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
    if (!result.canceled) setLocalImage(result.assets?.[0]?.uri ?? null);
    // If a local file URI was selected, upload it immediately
    const uri = result.assets?.[0]?.uri ?? null;
    if (uri) {
      setIsUploadingAvatar(true);
      updateUser(
        { id, avatar_url: uri },
        {
          onSuccess: (data: any) => {
            // use returned public URL if available
            const newUrl = data?.avatar_url ?? null;
            setLocalImage(newUrl);
            showTopToast("Success", "Avatar updated.");
          },
          onError: (err: any) => {
            showError("Upload failed", err.message);
            // keep previous image (from `user`) if upload fails
            setLocalImage((user as any)?.avatar_url ?? null);
          },
          onSettled: () => setIsUploadingAvatar(false),
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!username.trim() || !id) return;

    const payload: any = {
      id,
      username: username.trim(),
      company_id: selectedCompany?.value,
    };

    if (selectedRole && selectedRole.value !== user?.role) {
      payload.role = selectedRole.value;
    }

    // If the user removed the image (explicitly set to null), send null to remove it
    if (localImage === null && user?.avatar_url) {
      payload.avatar_url = null;
    }

    // If a new local image was selected, pass the file URI so the hook uploads it
    if (typeof localImage === "string" && localImage.startsWith("file://")) {
      payload.avatar_url = localImage;
    }

    // If localImage is a public URL equal to the current avatar, we don't include it in payload

    updateUser(payload, {
      onSuccess: () => {
        showTopToast("Success", "User updated successfully.");
        router.back();
      },
      onError: (err: any) => {
        showError("Error", err.message);
      },
    });
  };

  if (isLoadingUser)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <View className="items-center mb-6">
        <View className="relative">
          <Pressable
            onPress={pickImage}
            className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center overflow-hidden"
          >
            {localImage ? (
              <Image source={{ uri: localImage }} className="w-full h-full" />
            ) : (
              <Feather name="user" size={40} color="#888" />
            )}
          </Pressable>
          {localImage && (
            <Pressable
              onPress={() => {
                // Confirm removal
                Alert.alert(
                  "Remove avatar",
                  "Are you sure you want to remove this avatar?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Remove",
                      style: "destructive",
                      onPress: () => {
                        const prev = localImage;
                        // Optimistically remove from UI
                        setLocalImage(null);
                        setIsUploadingAvatar(true);
                        updateUser(
                          { id, avatar_url: null },
                          {
                            onSuccess: () => {
                              showTopToast("Success", "Avatar removed.");
                            },
                            onError: (err: any) => {
                              showError("Removal failed", err.message);
                              // rollback UI
                              setLocalImage(prev);
                            },
                            onSettled: () => setIsUploadingAvatar(false),
                          }
                        );
                      },
                    },
                  ]
                );
              }}
              className="absolute top-0 right-0 bg-red-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white"
              disabled={isUploadingAvatar}
            >
              <Feather name="x" size={16} color="white" />
            </Pressable>
          )}
          {/* Uploading indicator overlay */}
          {isUploadingAvatar && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
              className="rounded-full items-center justify-center bg-black/30"
            >
              <ActivityIndicator color="white" />
            </View>
          )}
        </View>
      </View>

      <View className="gap-5">
        <TextField>
          <TextField.Label>Username</TextField.Label>
          <TextField.Input value={username} onChangeText={setUsername} />
        </TextField>

        <TextField>
          <TextField.Label>Email</TextField.Label>
          <TextField.Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
        </TextField>

        {/* --- ROLE SELECTOR --- */}
        <View>
          <Text className="text-sm font-medium text-muted mb-2">Role</Text>
          <Select
            value={selectedRole}
            onValueChange={(val: any) => setSelectedRole(val)}
          >
            <Select.Trigger asChild>
              <Button
                variant="secondary"
                className="justify-between flex-row h-14 border border-divider/40"
              >
                <Text className="text-foreground">
                  {selectedRole ? selectedRole.label : "Select a role"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </Button>
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay className="bg-black/20" />
              <Select.Content
                presentation="bottom-sheet"
                snapPoints={["45%", "80%"]}
              >
                <BottomSheetScrollView contentContainerClassName="p-4 pb-10">
                  {availableRoles.map((role, index) => (
                    <React.Fragment key={role.value}>
                      <Select.Item
                        value={role.value}
                        label={role.label}
                        className="py-4"
                      >
                        <Text className="text-base text-foreground font-medium">
                          {role.label}
                        </Text>
                        <Select.ItemIndicator />
                      </Select.Item>
                      {index < availableRoles.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </BottomSheetScrollView>
              </Select.Content>
            </Select.Portal>
          </Select>
        </View>

        <View>
          <Text className="text-sm font-medium text-muted mb-2">Company</Text>
          <Select
            value={selectedCompany}
            onValueChange={(v: any) => setSelectedCompany(v)}
          >
            <Select.Trigger asChild>
              <Button
                variant="secondary"
                className="justify-between flex-row h-14 border border-divider/40"
              >
                <Text className="text-foreground">
                  {selectedCompany ? selectedCompany.label : "Select a company"}
                </Text>
                <Ionicons name="business-outline" size={18} color="#888" />
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
                    {companies?.map((company, index) => (
                      <React.Fragment key={company.id}>
                        <Select.Item
                          value={company.id}
                          label={company.name}
                          className="py-4"
                        >
                          <View className="flex-row items-center gap-3">
                            <Ionicons
                              name="business"
                              size={24}
                              color="#4F46E5"
                            />
                            <Text className="text-base text-foreground font-medium">
                              {company.name}
                            </Text>
                          </View>
                          <Select.ItemIndicator />
                        </Select.Item>
                        {index < companies.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </BottomSheetScrollView>
                </ScrollShadow>
              </Select.Content>
            </Select.Portal>
          </Select>
        </View>

        <View className="mt-4 gap-4">
          <Button isDisabled={isUpdating || isUploadingAvatar} onPress={handleSubmit}>
            {isUpdating ? "Updating..." : "Update Employee"}
          </Button>
          <Button variant="secondary" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
