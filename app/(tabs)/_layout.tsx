import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { initDB } from '@/utils/database';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/ThemeContext';
import { TouchableOpacity } from 'react-native/Libraries/Components/Touchable/TouchableOpacity';
import Ionicons from '@expo/vector-icons/build/Ionicons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme, toggleTheme, colors } = useTheme(); 

  useEffect(() => {
    initDB()
      .then(() => console.log('Database initialized'))
      .catch(err => console.error('Database failed', err));
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.subText,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.text" color={color} />,
        }}
      />
    </Tabs>
  );
}
