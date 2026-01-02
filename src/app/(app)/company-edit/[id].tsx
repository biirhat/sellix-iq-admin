import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, FormField, Switch, TextField } from 'heroui-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native';

// Fetch a single company by ID
const getCompanyById = async (id: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export default function EditCompany() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch the company data
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id!),
    enabled: !!id,
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    address: false,
  });

  // Populate form when company data loads
  useEffect(() => {
    if (company) {
      setName(company.name);
      setPhone(company.phone || '');
      setAddress(company.address || '');
      setIsActive(company.is_active);
      setLocalImage(company.image_url);
    }
  }, [company]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo access');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLocalImage(result.assets?.[0]?.uri ?? null);
    }
  };

  const removeImage = () => setLocalImage(null);

  const uploadImage = async (companyId: string) => {
    if (!localImage || localImage === company?.image_url) {
      // If image is unchanged or removed, return the existing URL or null
      return localImage;
    }

    const uri = localImage;
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `companies/${companyId}/logo.${fileExt}`;
    const fileType = `image/${fileExt}`;

    const formData = new FormData();
    formData.append('file', { uri, name: fileName, type: fileType } as any);

    const { error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, formData, { contentType: fileType, upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('company-logos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const validateFields = () => {
    const newErrors = {
      name: !name.trim(),
      phone: !phone.trim(),
      address: !address.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(isError => isError);
  };

  const handleSubmit = async () => {
    if (!validateFields() || !id) return;

    setLoading(true);

    try {
      const uploadedUrl = await uploadImage(id);

      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          is_active: isActive,
          image_url: uploadedUrl ?? undefined,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await queryClient.invalidateQueries({ queryKey: ['companies'] });
      await queryClient.invalidateQueries({ queryKey: ['company', id] });

      Alert.alert('Success', 'Company updated');
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message ?? 'Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingCompany) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      <View className="items-center mb-6">
        <View className="relative">
          <Pressable
            onPress={pickImage}
            className="w-36 h-36 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center overflow-hidden"
          >
            {localImage ? (
              <Image source={{ uri: localImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Feather name="image" size={36} color="#888" />
            )}
          </Pressable>
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

      <TextField isRequired isInvalid={errors.name}>
        <TextField.Label>Company name</TextField.Label>
        <TextField.Input
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors(prev => ({ ...prev, name: false }));
          }}
        />
      </TextField>

      <TextField isRequired isInvalid={errors.phone}>
        <TextField.Label>Phone</TextField.Label>
        <TextField.Input
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            setErrors(prev => ({ ...prev, phone: false }));
          }}
          keyboardType="phone-pad"
        />
      </TextField>

      <TextField isRequired isInvalid={errors.address}>
        <TextField.Label>Address</TextField.Label>
        <TextField.Input
          value={address}
          onChangeText={(v) => {
            setAddress(v);
            setErrors(prev => ({ ...prev, address: false }));
          }}
        />
      </TextField>

      <View className="my-4">
        <FormField isSelected={isActive} onSelectedChange={setIsActive}>
          <View className="flex-1">
            <FormField.Label>Active</FormField.Label>
            <FormField.Description>Company is active by default</FormField.Description>
          </View>
          <FormField.Indicator>
            <Switch className="w-10">
              <Switch.Thumb className="size-5" />
            </Switch>
          </FormField.Indicator>
        </FormField>
      </View>

      <Button isDisabled={loading} onPress={handleSubmit}>
        {loading ? 'Updating...' : 'Update Company'}
      </Button>

      <Button variant="secondary" onPress={() => router.back()}>
        Cancel
      </Button>
    </ScrollView>
  );
}
