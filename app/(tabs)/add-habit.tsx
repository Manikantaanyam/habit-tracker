import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FREQUENCIES = ["daily", "weekly", "monthly"];
export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [freqeuncy, setFrequency] = useState<string>("daily");

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
            ]}
            onPress={() => setFrequency(freq)}
          >
            <Text>{freq.charAt(0).toUpperCase() + freq.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.addHabitBtn}>
        <Text style={s.addHabitBtnText}>Add Habit</Text>
      </TouchableOpacity>
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
  },
  freqButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
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
});
