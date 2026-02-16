import { useAuth } from "@/lib/auth-context";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { signOut } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Link href="/login">Go to Login Screen</Link>

      <TouchableOpacity
        onPress={signOut}
        style={{ backgroundColor: "#7522ff", padding: 6 }}
      >
        <Text style={{ color: "#fff" }}> Signout</Text>
      </TouchableOpacity>
    </View>
  );
}
