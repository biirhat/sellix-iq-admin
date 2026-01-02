import { useAuth } from '@/contexts/AuthProvidere';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, TextField } from 'heroui-native';
import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { withUniwind } from 'uniwind';

const Icon = withUniwind(Ionicons);

export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth(); // Use signUp from auth context

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validateUsername = (v: string) =>
    /^[a-zA-Z0-9_]{3,20}$/.test(v); // alphanumeric and underscore, 3-20 chars

  const handleSubmit = async () => {
    const validEmail = validateEmail(email);
    const validUsername = validateUsername(username);
    const validPassword = password.length >= 6;

    setEmailError(!validEmail);
    setUsernameError(!validUsername);
    setPasswordError(!validPassword);

    if (!validEmail || !validUsername || !validPassword) return;

    try {
      setLoading(true);

      // Use auth context's signUp
      await signUp(email, password, username);

      // Success - auth provider will handle profile creation
      Alert.alert(
        'Success',
        'Account created successfully!',
        [{ text: 'OK', onPress: () => router.replace('/(app)/(tabs)') }]
      );
      
    } catch (err: any) {
      console.error('Signup error:', err.message);
      Alert.alert('Error', err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className=" flex-1 justify-center gap-4 p-4">
      {/* Email */}
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
          autoComplete="email"
        />
        <TextField.ErrorMessage>
          Invalid email address
        </TextField.ErrorMessage>
      </TextField>

      {/* Username */}
      <TextField isRequired isInvalid={usernameError}>
        <TextField.Label>Username</TextField.Label>
        <TextField.Input
          value={username}
          onChangeText={(t) => {
            setUsername(t);
            if (usernameError) setUsernameError(false);
          }}
          autoCapitalize="none"
          placeholder="Enter your username"
          autoComplete="username"
        />
        <TextField.ErrorMessage>
          Username must be 3-20 characters (letters, numbers, underscore only)
        </TextField.ErrorMessage>
      </TextField>

      {/* Password */}
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
          autoComplete="password"
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
        {loading ? 'Creating Account...' : 'Create Admin Account'}
      </Button>

      <Button variant="secondary" onPress={() => router.back()}>
        Already have an account? Log in
      </Button>
    </View>
  );
}