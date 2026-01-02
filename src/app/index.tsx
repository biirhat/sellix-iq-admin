import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, TextField } from 'heroui-native';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withUniwind } from 'uniwind';
import { useAuth } from '@/contexts/AuthProvidere'; // adjust path

const Icon = withUniwind(Ionicons);

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async () => {
    const validEmail = validateEmail(email);
    const validPassword = password.length >= 6;

    setEmailError(!validEmail);
    setPasswordError(!validPassword);
    if (!validEmail || !validPassword) return;

    try {
      setLoading(true);

      // ✅ AUTH VIA PROVIDER
      await signIn(email, password);

      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      console.error('Login error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className=" flex-1 justify-center gap-4 p-4">
      <TextField isRequired isInvalid={emailError}>
        <TextField.Label>Email</TextField.Label>
        <TextField.Input
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailError) setEmailError(false);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Enter your email"
        />
        <TextField.ErrorMessage>Invalid email address</TextField.ErrorMessage>
      </TextField>

      <TextField isRequired isInvalid={passwordError}>
        <TextField.Label>Password</TextField.Label>
        <TextField.Input
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (passwordError) setPasswordError(false);
          }}
          secureTextEntry={!isPasswordVisible}
          placeholder="Enter password"
        >
          <TextField.InputEndContent>
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Icon
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={18}
              />
            </Pressable>
          </TextField.InputEndContent>
        </TextField.Input>

        <TextField.ErrorMessage>
          Password must be at least 6 characters
        </TextField.ErrorMessage>
      </TextField>

      <Button isDisabled={loading} onPress={handleSubmit}>
        {loading ? <ActivityIndicator color="white" /> : 'Log In'}
      </Button>

      <Button variant="secondary" onPress={() => router.push('/signup')}>
        Create an account
      </Button>
    </View>
  );
}
