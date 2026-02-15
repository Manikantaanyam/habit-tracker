import { Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View
      style={{
        backgroundColor: "#000",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 30, fontWeight: "600", color: "#fff" }}>
        Welcome to the Login Screen
      </Text>
    </View>
  );
}
