import { StyleSheet, Text, View } from "react-native";

export default function Browse() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello from Browse</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20, color: "white" },
});
