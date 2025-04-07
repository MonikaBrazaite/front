import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack initialRouteName="WelcomeScreen">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="WelcomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
      <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="SurveyScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ResultsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="FavouritesScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ReviewsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="PDFPreviewScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
