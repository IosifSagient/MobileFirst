// app/(tabs)/weekly/index.tsx
import { Colors } from "@/src/constants/colors";
import { Spacing } from "@/src/constants/spacing";
import { Typography } from "@/src/constants/typography";
import { recipesById, weekPlan, type MealType } from "@/src/data/mealplan";
import { useRouter } from "expo-router";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const FEATURE_MEAL: MealType = "dinner"; // which meal to feature on the card’s image

export default function WeeklyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>🍽️ Weekly Meal Plan</Text>
      <Text style={styles.subtext}>
        Tap a day to view breakfast, lunch, dinner & snack.
      </Text>

      <FlatList
        data={DAYS}
        keyExtractor={(d) => d}
        contentContainerStyle={{ paddingBottom: Spacing.lg }}
        renderItem={({ item: day }) => {
          const recipeId = weekPlan[day][FEATURE_MEAL];
          const recipe = recipesById[recipeId];
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/week/[day]", params: { day } })
              }
              style={styles.card}
            >
              <ImageBackground
                source={{ uri: recipe.image }}
                style={styles.image}
                imageStyle={styles.imageStyle}
              >
                <View style={styles.overlay}>
                  <Text style={styles.day}>{day}</Text>
                  <Text style={styles.title}>{recipe.title}</Text>
                  <Text style={styles.meta}>
                    Featured:{" "}
                    {FEATURE_MEAL[0].toUpperCase() + FEATURE_MEAL.slice(1)} •{" "}
                    {recipe.mins} min • Serves {recipe.servings}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  header: {
    ...Typography.h1,
    color: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  subtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  card: {
    marginBottom: Spacing.lg,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: { height: 180, justifyContent: "flex-end" },
  imageStyle: { borderRadius: 16 },
  overlay: { backgroundColor: "rgba(0,0,0,0.45)", padding: Spacing.md },
  day: { ...Typography.h3, color: Colors.accent, marginBottom: Spacing.xs },
  title: { ...Typography.h2, color: "#fff" },
  meta: { ...Typography.small, color: "#eaeaea", marginTop: Spacing.xs },
});
