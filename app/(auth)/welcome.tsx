import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={["#203A43", "#2C5364"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.emoji,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          📔
        </Animated.Text>
        <Text style={styles.title}>Pocket Journal</Text>
        <Text style={styles.subtitle}>
          Capture your thoughts. Summarized by AI.
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push("/(auth)/sign_up")}
        >
          <Text style={styles.primaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push("/(auth)/sign_in")}
        >
          <Text style={styles.secondaryText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 70,
    marginBottom: 12,
    textShadowColor: "rgba(255,255,255,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    textAlign: "center",
    marginBottom: 50,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: { backgroundColor: "rgba(255,255,255,0.9)" },
  primaryText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  secondaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
