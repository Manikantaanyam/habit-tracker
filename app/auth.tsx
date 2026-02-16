import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");

  const router = useRouter();

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields...");
      return;
    }

    if (password.length < 6) {
      setError("Password must be atleast 6 characters long.");
      return;
    }

    setError(null);

    if (isSignUp) {
      const error = await signUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }
      router.replace("/");
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <View style={s.content}>
        <Text style={s.title}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>

        <TextInput
          autoCapitalize="none"
          placeholder="example@gmail.com"
          keyboardType="email-address"
          style={s.input}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Your Password..."
          keyboardType="visible-password"
          style={s.input}
          secureTextEntry
          onChangeText={setPassword}
        />

        {error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity style={s.button} onPress={handleAuth}>
          <Text style={{ textAlign: "center", color: "#fff" }}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.ghostButton} onPress={handleSwitchMode}>
          <Text style={{ textAlign: "center" }}>
            {isSignUp
              ? "Already have an account ? Sign In"
              : "Dont't have an account ? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    gap: 6,
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    color: "#7522ff",
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderColor: "#000",
    borderWidth: 1,
    padding: 6,
    paddingLeft: 10,
    outlineColor: "none",
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#7522ff",
    color: "#fff",
    textAlign: "center",
    padding: 6,
    borderRadius: 5,
  },
  ghostButton: {
    marginTop: 10,
    color: "#7522ff",
    textAlign: "center",
    padding: 6,
  },
  error: {
    textAlign: "center",
    color: "red",
  },
});
