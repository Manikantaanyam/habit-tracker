import {
  client,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Query } from "react-native-appwrite";

export default function Index() {
  const [habits, setHabits] = useState<Habit[]>([]);

  const { signOut, user } = useAuth();

  useEffect(() => {
    if (user) {
      const channel = `databses.${DATABASE_ID}.collection.${HABITS_COLLECTION_ID}.documents`;
      const habitsSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create",
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update",
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete",
            )
          ) {
            fetchHabits();
          }
        },
      );

      fetchHabits();

      return () => {
        habitsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments<Habit>(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")],
      );

      console.log("response", response.documents);
      setHabits(response.documents);
    } catch (error) {
      console.log("Error occured", error);
    }
  };

  return (
    <ScrollView>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.mainHeading}>Today's Habits</Text>

          <TouchableOpacity style={s.signOutBtn} onPress={signOut}>
            <Ionicons name="log-out" color="#6200ee" size={24} />
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {habits?.length === 0 ? (
          <View style={s.noHabits}>
            <Text>No habits yet.</Text>
            <Link
              href="/add-habit"
              style={{ color: "#6200ee", fontWeight: "500" }}
            >
              Add your habits..
            </Link>
          </View>
        ) : (
          habits.map((habit, key) => (
            <View key={key} style={s.cardContent}>
              <Text style={s.cardTitle}>{habit.title}</Text>
              <Text style={s.cardDescription}>{habit.description}</Text>
              <View style={s.cardFooter}>
                <View style={s.streakBadge}>
                  <Ionicons name="flame" size={24} color="#ff9800" />
                  <Text style={s.streakText}>
                    {habit.streaks_count} day streak
                  </Text>
                </View>
                <View style={s.frequencyBadge}>
                  <Text style={s.frequencyText}>
                    {habit.frequency.charAt(0).toUpperCase() +
                      habit.frequency.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: "bold",
  },
  noHabits: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutBtn: { flexDirection: "row", gap: 6 },
  signOutText: { fontSize: 16, fontWeight: "400" },

  cardContent: {
    backgroundColor: "#e8daf1",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
  },
});
