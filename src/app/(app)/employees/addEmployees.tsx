import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { useAuth } from "@/contexts/AuthProvidere";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Button,
  Divider,
  Select,
  TextField,
} from "heroui-native";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const availableRoles = [
  { label: "Driver", value: "driver" },
  { label: "Staff", value: "representative" },
  { label: "Worker", value: "worker" },
];

export default function AddEmployee() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showTopToast, showError } = useCustomToast();
  const { user: adminUser } = useAuth(); // Get the logged-in admin

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(availableRoles[0]); // Default to Driver
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }
    if (!adminUser?.profile?.company_id) {
      showError("Authentication Error", "You are not associated with any company.");
      return;
    }
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showError("Authentication Error", "You are not logged in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-employee", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          name,
          email: email.trim(),
          password,
          role: selectedRole.value,
          company_id: adminUser.profile.company_id,
        },
      });

      if (error) throw error;
      console.log("Employee created:", error);

      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["employees", adminUser.profile.company_id] });
        showTopToast("Success", "New employee has been created.");
        router.back();
      } else {
        throw new Error(data.error || "An unknown error occurred.");
      }
    } catch (err: any) {
      showError("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <View className="gap-5">
        <Text className="text-2xl font-bold text-foreground mb-2">زێدەکرنا کارمەندێ نوێ</Text>

        {/* --- FORM FIELDS --- */}
        <TextField isRequired>
          <TextField.Label>ناڤێ تەمام</TextField.Label>
          <TextField.Input value={name} onChangeText={setName} placeholder="مثال: جان دوو" />
        </TextField>

        <TextField isRequired>
          <TextField.Label>ئیمێل</TextField.Label>
          <TextField.Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </TextField>

        <TextField isRequired>
          <TextField.Label>Password</TextField.Label>
          <TextField.Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Min. 6 characters"
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
                <Text className="text-foreground">{selectedRole.label}</Text>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </Button>
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay className="bg-black/20" />
              <Select.Content presentation="bottom-sheet" snapPoints={['40%', '60%']}>
                <BottomSheetScrollView contentContainerClassName="p-2 mb-8">
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

        <View className="mt-4 gap-4">
          <Button isDisabled={loading} size="lg" onPress={handleSubmit}>
            {loading ? "Adding..." : "Add Employee"}
          </Button>
          <Button variant="secondary" onPress={() => router.back()}>
            پاشگەزبوون
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}