// app/recipe/[id].tsx
import { Colors } from "@/src/constants/colors";
import { Spacing } from "@/src/constants/spacing";
import { Typography } from "@/src/constants/typography";
import {
  ingredientsByRecipe,
  recipesById,
  stepsByRecipe,
} from "@/src/data/mealplan";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const recipe = id ? recipesById[id] : undefined;
  const ingredients = id ? ingredientsByRecipe[id] : undefined;
  const steps = id ? stepsByRecipe[id] : undefined;

  if (!recipe) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.muted}>Recipe not found.</Text>
        <TouchableOpacity
          style={[styles.pill, { marginTop: Spacing.sm }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: Colors.card }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const onAddToList = () => {
    // later: aggregate into shopping list store / SQLite
    Alert.alert("Added", "Ingredients added to your shopping list (demo).");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* HERO */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTopBar}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#111"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {}}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color="#111"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.title}>{recipe.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons
                  name="time"
                  size={14}
                  color={Colors.secondary}
                />
                <Text style={styles.metaText}>{recipe.mins} min</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons
                  name="people"
                  size={14}
                  color={Colors.secondary}
                />
                <Text style={styles.metaText}>Serves {recipe.servings}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* INGREDIENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>

          {ingredients?.map((ing, idx) => (
            <View
              key={idx}
              style={styles.ingredientRow}
            >
              <View style={styles.bullet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ingredientText}>
                  {ing.qty ? `${ing.qty} ` : ""}
                  {ing.name}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.cta}
            onPress={onAddToList}
          >
            <Ionicons
              name="cart"
              size={18}
              color={Colors.secondary}
            />
            <Text style={styles.ctaText}>Add all to Shopping List</Text>
          </TouchableOpacity>
        </View>

        {/* (Optional) STEPS placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          {steps?.map((s, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  backgroundColor: Colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: Spacing.sm,
                }}
              >
                <Text
                  style={{
                    ...Typography.small,
                    color: Colors.secondary,
                    fontWeight: "700",
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              <Text style={{ ...Typography.body, color: Colors.text, flex: 1 }}>
                {s}
              </Text>
            </View>
          ))}
          {!steps?.length && (
            <Text style={styles.muted}>No steps available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* HERO */
  heroWrap: {
    height: 260,
    margin: Spacing.md,
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: Colors.card,
    elevation: 4,
  },
  heroImage: { width: "100%", height: "100%" },
  heroTopBar: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  heroText: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
  },
  title: { ...Typography.h1, color: "#fff" },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  metaText: { ...Typography.small, color: Colors.secondary, marginLeft: 6 },

  /* SECTIONS */
  section: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: RADIUS,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.secondary,
    marginBottom: Spacing.sm,
  },

  /* INGREDIENTS */
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.accent,
    marginRight: Spacing.sm,
  },
  ingredientText: { ...Typography.body, color: Colors.text },

  /* CTA */
  cta: {
    marginTop: Spacing.md,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  ctaText: { ...Typography.h3, color: Colors.secondary },

  muted: { ...Typography.body, color: Colors.textSecondary },
});
``;
