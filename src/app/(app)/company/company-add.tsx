import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Button, FormField, Switch, TextField } from "heroui-native";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

export default function AddCompany() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showTopToast, showError, showWarning } = useCustomToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [localImage, setLocalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for validation errors
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    address: false,
  });

  /* ---------------- IMAGE PICKER ---------------- */

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      showWarning(
        "Permission required",
        "Allow photo access to select an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // use lowercase 'images' to match expected MediaType values
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri ?? null;
      setLocalImage(uri);
    }
  };

  const removeImage = () => setLocalImage(null);

  /* ---------------- SUBMIT ---------------- */

  const validateFields = () => {
    const newErrors = {
      name: !name.trim(),
      phone: !phone.trim(),
      address: !address.trim(),
    };
    setErrors(newErrors);
    // Return true if there are no errors
    return !Object.values(newErrors).some((isError) => isError);
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      return; // Stop submission if validation fails
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      formData.append("address", address.trim());
      formData.append("isActive", String(isActive));

      if (localImage) {
        const uri = localImage;
        const fileType = "image/jpeg"; // Or determine dynamically
        const fileName = uri.split("/").pop();
        formData.append("file", {
          uri,
          name: fileName,
          type: fileType,
        } as any);
      }

      const { data, error } = await supabase.functions.invoke("create-company", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (error) throw error;

      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        showTopToast("Success", "Company created successfully");
        router.back();
      } else {
        throw new Error(data.error || "Failed to create company");
      }
    } catch (err: any) {
      console.error(err);
      showError("Error", err.message ?? "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      {/* IMAGE PICKER */}
      <View className="items-center mb-6">
        <View className="relative">
          <Pressable
            onPress={pickImage}
            className="w-36 h-36 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center overflow-hidden"
          >
            {localImage ? (
              <Image
                source={{ uri: localImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Feather name="image" size={36} color="#888" />
            )}
          </Pressable>

          {!localImage && (
            <View className="absolute bottom-1 right-1">
              <Pressable
              onPress={pickImage}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "#4F46E5" }} // Indigo-600
              >
              <Feather name="plus" size={20} color="white" />
              </Pressable>
            </View>
          )}

          {localImage && (
            <Pressable
              onPress={removeImage}
              className="absolute top-1 right-1 bg-red-500 w-9 h-9 rounded-full items-center justify-center"
            >
              <Feather name="x" size={18} color="white" />
            </Pressable>
          )}
        </View>
      </View>

      {/* FORM */}
      <TextField isRequired isInvalid={errors.name}>
        <TextField.Label>Company name</TextField.Label>
        <TextField.Input
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors((prev) => ({ ...prev, name: false }));
          }}
          placeholder="e.g. Acme Corporation"
        />
        <TextField.ErrorMessage>
          Company name is required
        </TextField.ErrorMessage>
      </TextField>

      <TextField isRequired isInvalid={errors.phone}>
        <TextField.Label>Phone</TextField.Label>
        <TextField.Input
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            setErrors((prev) => ({ ...prev, phone: false }));
          }}
          placeholder="Company phone number"
          keyboardType="phone-pad"
        />
        <TextField.ErrorMessage>
          Phone number is required
        </TextField.ErrorMessage>
      </TextField>

      <TextField isRequired isInvalid={errors.address}>
        <TextField.Label>Address</TextField.Label>
        <TextField.Input
          value={address}
          onChangeText={(v) => {
            setAddress(v);
            setErrors((prev) => ({ ...prev, address: false }));
          }}
          placeholder="Company address"
        />
        <TextField.ErrorMessage>Address is required</TextField.ErrorMessage>
      </TextField>

      <View className="my-4">
        <FormField isSelected={isActive} onSelectedChange={setIsActive}>
          <View className="flex-1">
            <FormField.Label>Active</FormField.Label>
            <FormField.Description>
              Company is active by default
            </FormField.Description>
          </View>
          <FormField.Indicator>
            <Switch className="w-10">
              <Switch.Thumb className="size-5" />
            </Switch>
          </FormField.Indicator>
        </FormField>
      </View>
      <View className="mt-4 gap-6">
        <Button isDisabled={loading} onPress={handleSubmit}>
          {loading ? "Creating..." : "Create Company"}
        </Button>

        <Button variant="secondary" onPress={() => router.back()}>
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}
