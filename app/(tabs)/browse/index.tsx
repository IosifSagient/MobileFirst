import { Colors } from "@/src/constants/colors";
import { Spacing } from "@/src/constants/spacing";
import { Typography } from "@/src/constants/typography";
import { recipesById, weekPlan, type MealType } from "@/src/data/mealplan";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const mealLabel = (m: MealType) => m[0].toUpperCase() + m.slice(1);

export default function BrowseScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState<MealType | "all">("all");

  // build a reverse index: recipeId -> Set<MealType>
  const mealTypesByRecipe = useMemo(() => {
    const map = new Map<string, Set<MealType>>();
    Object.values(weekPlan).forEach((day) => {
      (Object.keys(day) as MealType[]).forEach((meal) => {
        const id = day[meal];
        if (!map.has(id)) map.set(id, new Set<MealType>());
        map.get(id)!.add(meal);
      });
    });
    return map;
  }, []);

  const data = useMemo(() => {
    return Object.values(recipesById)
      .filter((r) =>
        active === "all" ? true : mealTypesByRecipe.get(r.id)?.has(active)
      )
      .filter((r) => r.title.toLowerCase().includes(q.trim().toLowerCase()))
      .sort((a, b) => a.mins - b.mins); // quick ones first
  }, [q, active, mealTypesByRecipe]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>Browse Recipes</Text>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search recipes…"
        placeholderTextColor="#aaa"
        style={styles.search}
      />

      <View style={styles.filters}>
        <FilterPill
          label="All"
          active={active === "all"}
          onPress={() => setActive("all")}
        />
        {MEALS.map((m) => (
          <FilterPill
            key={m}
            label={mealLabel(m)}
            active={active === m}
            onPress={() => setActive(m)}
          />
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push(`/recipe/${item.id}`)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />
            <View style={styles.info}>
              <Text
                numberOfLines={1}
                style={styles.title}
              >
                {item.title}
              </Text>
              <Text style={styles.meta}>
                {item.mins} min • Serves {item.servings}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, active ? styles.pillActive : styles.pillIdle]}
    >
      <Text
        style={[
          styles.pillText,
          active ? styles.pillTextActive : styles.pillTextIdle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const CARD_RADIUS = 14;

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
    marginBottom: Spacing.sm,
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.md,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillIdle: { backgroundColor: "#fff", borderColor: Colors.border },
  pillActive: {
    backgroundColor: "rgba(255,215,0,0.18)",
    borderColor: Colors.accent,
  },
  pillText: { ...Typography.small },
  pillTextIdle: { color: Colors.text },
  pillTextActive: { color: Colors.secondary, fontWeight: "700" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  image: { width: "100%", height: 120 },
  info: { padding: 10 },
  title: { ...Typography.h3, color: Colors.text },
  meta: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
});
