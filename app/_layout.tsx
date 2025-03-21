import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="/index" />
      <Stack.Screen name="/FavouritesScreen" />
      <Stack.Screen name="/HomeScreen" />
      <Stack.Screen name="/SurveyScreen" />
      <Stack.Screen name="/ResultsScreen" />
      <Stack.Screen name="/ReviewsScreen" />
      <Stack.Screen name="/PDFPreviewScreen" />

    </Stack>
  );
}
