import { Pressable, Text, View } from 'react-native';
import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

export default function Header({ title }: { title: string }) {
  const navigation = useNavigation();

  return (
    <View
      className="relative flex-row items-center justify-center h-12"
    >
      <Pressable
        onPress={() => navigation.goBack()}
        className="absolute p-2 rounded-xl"
      >
        <AntDesign
          size={24}
        />
      </Pressable>
      <Text
        className="text-lg"
      >
        {title}
      </Text>
    </View>
  );
}