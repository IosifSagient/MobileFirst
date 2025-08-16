import { Redirect } from "expo-router";
import { StyleSheet } from "react-native";

export default function Index() {
  return <Redirect href="/(tabs)/weekly" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20, color: "white" },
});
