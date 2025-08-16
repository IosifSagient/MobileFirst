import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  // const { session, isLoading, init } = useAuthStore();
  // useEffect(() => {
  //   init();
  // }, [init]);

  // if (!loaded || isLoading) return null;
  if (!loaded) return null;
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* {!session && <Redirect href="/(auth)/welcome" />}
      {session && <Redirect href="/(tabs)/journal" />} */}
      <Stack>
        {/* <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="week/[day]"
          options={{ title: "Day Plan" }}
        />

        <Stack.Screen
          name="recipe/[id]"
          options={{ title: "Recipe" }}
        />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
