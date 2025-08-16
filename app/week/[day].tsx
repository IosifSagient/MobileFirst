import { Colors } from "@/src/constants/colors";
import { Spacing } from "@/src/constants/spacing";
import { Typography } from "@/src/constants/typography";
import { recipesById, weekPlan, type MealType } from "@/src/data/mealplan";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const label = (m: MealType) => m[0].toUpperCase() + m.slice(1);

export default function DayPlanScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const router = useRouter();

  const plan = day && weekPlan[day];
  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>Unknown day</Text>
        <Text style={styles.subtext}>Please go back and pick a valid day.</Text>
      </SafeAreaView>
    );
  }

  // Use the dinner image as the hero (usually the nicest shot)
  const heroRecipe = recipesById[plan.dinner];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HERO */}
      <View style={styles.hero}>
        <Image
          source={{ uri: heroRecipe.image }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.55)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Text style={styles.dayPill}>{day}</Text>
          <Text style={styles.heroTitle}>Your {day} Plan</Text>
          <Text style={styles.heroMeta}>
            Breakfast • Lunch • Dinner • Snack
          </Text>
        </View>
      </View>

      {/* LIST OF MEALS */}
      <FlatList
        data={MEALS}
        keyExtractor={(m) => m}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item: meal }) => {
          const recipe = recipesById[plan[meal]];
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <View style={styles.thumbWrap}>
                <Image
                  source={{ uri: recipe.image }}
                  style={styles.thumb}
                />
              </View>

              <View style={styles.info}>
                <View style={styles.mealRow}>
                  <Ionicons
                    name={
                      meal === "breakfast"
                        ? "sunny"
                        : meal === "lunch"
                        ? "restaurant"
                        : meal === "dinner"
                        ? "moon"
                        : "ice-cream"
                    }
                    size={16}
                    color={Colors.accent}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.meal}>{label(meal)}</Text>
                </View>

                <Text
                  style={styles.title}
                  numberOfLines={1}
                >
                  {recipe.title}
                </Text>
                <Text style={styles.meta}>
                  {recipe.mins} min • Serves {recipe.servings}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    height: 200,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: RADIUS,
    overflow: "hidden",
    elevation: 4,
    backgroundColor: Colors.card,
  },
  heroImage: { width: "100%", height: "100%" },
  heroContent: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  dayPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,215,0,0.9)",
    color: "#1a1a1a",
    ...Typography.small,
    marginBottom: 6,
    fontWeight: "700",
  },
  heroTitle: { ...Typography.h1, color: "#fff" },
  heroMeta: { ...Typography.body, color: "#f1f1f1", marginTop: 2 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: RADIUS,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    // subtle glass effect on Android; iOS will rely on blur-less translucency
    elevation: 2,
  },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#eee",
    marginRight: Spacing.sm,
  },
  thumb: { width: "100%", height: "100%" },
  info: { flex: 1 },
  mealRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  meal: { ...Typography.small, color: Colors.accent, fontWeight: "700" },
  title: { ...Typography.h3, color: Colors.text },
  meta: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
});
