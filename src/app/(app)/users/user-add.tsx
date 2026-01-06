import { useCustomToast } from "@/components/Alert/use-custom-toast";
import { supabase } from "@/lib/supabase";
import { useCompanies } from "@/helpers/hooks/use-company";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Button, 
  Divider, 
  ScrollShadow, 
  Select, 
  TextField, 
  useThemeColor 
} from "heroui-native";
import React, { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddUser() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showTopToast, showError } = useCustomToast();
  const themeColorOverlay = useThemeColor('overlay');

  // وەرگرتنا کۆمپانیان
  const { data: companies } = useCompanies();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);

  const formatUsername = (val: string) => val.replace(/\s+/g, '').toLowerCase();

  const handleSubmit = async () => {
    if (!name || !email || !selectedCompany) {
      showError("خەلەتی", "تکایە هەمی خانان پڕ بکە");
      return;
    }
    setLoading(true);

    try {
      // 1. Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      // 2. Insert into Users Table
      if (!authData.user || !authData.user.id) {
        throw new Error("User ID not returned from sign up.");
      }
      const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        username: formatUsername(name),
        email: email.trim(),
        role:  'company_admin',
        company_id: selectedCompany.value, // ل ڤێرە ID یا کۆمپانیێ دهێتە وەرگرتن
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      await queryClient.invalidateQueries({ queryKey: ["users"] });
      showTopToast("Serکەفتن", "یوزەر و کۆمپانیا وی هاتنە تۆمارکرن");
      router.back();
    } catch (err: any) {
      showError("خەلەتی", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <View className="gap-5">
        <Text className="text-2xl font-bold text-foreground mb-2">زێدەکرنا یوزەرێ نوى</Text>

        {/* --- SELECT COMPANY (BOTTOM SHEET STYLE) --- */}
        <View>
          <Text className="text-sm font-medium text-muted mb-2">کۆمپانیا پەیوەندیدار *</Text>
          <Select
            value={selectedCompany}
            onValueChange={(val: any) => setSelectedCompany(val)}
          >
            <Select.Trigger asChild>
              <Button variant="secondary" className="justify-between flex-row h-14 border border-divider/50">
                <Text className="text-foreground">
                  {selectedCompany ? selectedCompany.label : "کۆمپانیەکێ هەلبژێرە"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </Button>
            </Select.Trigger>
            
            <Select.Portal>
              <Select.Overlay className="bg-black/15" />
              <Select.Content presentation="bottom-sheet" snapPoints={['40%', '60%']}>
                <ScrollShadow LinearGradientComponent={LinearGradient} color={themeColorOverlay}>
                  <BottomSheetScrollView contentContainerClassName="p-4">
                    {companies?.map((company, index) => (
                      <React.Fragment key={company.id}>
                        <Select.Item
                          value={company.id}
                          label={company.name}
                          className="py-4"
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                              <Ionicons name="business" size={16} color="#4F46E5" />
                            </View>
                            <Text className="text-base text-foreground">{company.name}</Text>
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

        {/* --- FORM FIELDS --- */}
        <TextField isRequired>
          <TextField.Label>ناڤێ تەمام</TextField.Label>
          <TextField.Input value={name} onChangeText={setName} placeholder="Username دێ لێ چێبیت" />
        </TextField>

        <TextField isRequired>
          <TextField.Label>ئیمێل</TextField.Label>
          <TextField.Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </TextField>

        <TextField isRequired>
          <TextField.Label>پاسۆرد</TextField.Label>
          <TextField.Input value={password} onChangeText={setPassword} secureTextEntry />
        </TextField>

        <View className="mt-4 gap-4">
          <Button isDisabled={loading} size="lg" onPress={handleSubmit}>
            {loading ? "چێدبیت..." : "تۆمارکرنا یوزەرێ نوى"}
          </Button>
          <Button variant="secondary" onPress={() => router.back()}>پاشگەزبوون</Button>
        </View>
      </View>
    </ScrollView>
  );
}