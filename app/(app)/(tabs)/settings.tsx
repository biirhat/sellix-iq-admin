import {  Text, } from 'react-native'
import React from 'react'
// import { useRouter } from 'expo-router'
import { ThemedView } from '@/components/themed-view'

export default function Settings() {
    // const router = useRouter()
  return (
    <ThemedView className='flex-1 items-center justify-center'>
      <Text>Settings</Text>
      {/* <TouchableOpacity onPress={() => router.push('/(app)')} className='mt-4 p-2 bg-blue-500 rounded'>
        <Text>Change Theme</Text>
      </TouchableOpacity> */}
    </ThemedView>
  )
}