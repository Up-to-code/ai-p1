import { ActivityIndicator, View } from "react-native";

export function FontLoadScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f7f5" }}>
      <ActivityIndicator size="small" color="#111111" />
    </View>
  );
}
