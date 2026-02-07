import { Stack } from 'expo-router';
import { ThemeProvider } from '@/hooks/ThemeContext';

export default function RootLayout() {
  return (
    // Wrap everything here
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}