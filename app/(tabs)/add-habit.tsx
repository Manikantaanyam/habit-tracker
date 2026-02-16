import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ID } from "react-native-appwrite";

const FREQUENCIES = ["daily", "weekly", "monthly"];
export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("daily");
  const [error, setError] = useState<string>("");

  const { user } = useAuth();

  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (!user) return;

      await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          title,
          description,
          frequency,
          streaks_count: 0,
          last_completed: new Date().toISOString(),
          $createdAt: new Date().toISOString(),
        },
      );

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }

      setError("There was an error occured while creating an habit");
    }
  };

  return (
    <View style={s.container}>
      <TextInput style={s.input} placeholder="Title" onChangeText={setTitle} />
      <TextInput
        style={s.input}
        placeholder="Description"
        onChangeText={setDescription}
      />

      <View style={s.freqButtonContainer}>
        {FREQUENCIES.map((freq, index) => (
          <TouchableOpacity
            key={freq}
            style={[
              s.freqButton,
              index !== FREQUENCIES.length - 1 && s.divider,
              frequency === freq && s.selectedButton,
            ]}
            onPress={() => setFrequency(freq)}
          >
            <Text>{freq.charAt(0).toUpperCase() + freq.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={s.addHabitBtn}
        disabled={!title || !description}
        onPress={handleSubmit}
      >
        <Text style={s.addHabitBtnText}>Add Habit</Text>
      </TouchableOpacity>

      {error && <Text style={s.errorMsg}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    borderColor: "#6200ee",
    paddingHorizontal: 20,
    height: 50,
  },
  freqButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: "#6200ee",
    borderWidth: 1,
    marginTop: 20,
    borderRadius: 999,
    overflow: "hidden",
  },
  freqButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  selectedButton: {
    backgroundColor: "#C399FF",
  },
  divider: {
    borderRightWidth: 1,
    borderColor: "#6200ee",
  },
  addHabitBtn: {
    backgroundColor: "#6200ee",
    alignItems: "center",
    padding: 10,
    borderRadius: 999,
    marginTop: 20,
    paddingVertical: 15,
  },
  addHabitBtnText: {
    color: "#fff",
    fontWeight: "500",
    letterSpacing: 0.5,
    fontSize: 16,
  },

  errorMsg: {
    color: "#ed0000",
    textAlign: "center",
  },
});
