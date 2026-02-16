import {
  client,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  HABITS_COMPLETIONS_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";

export default function Index() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const { signOut, user } = useAuth();

  const swipableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
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

      const habitsCompletionChannel = `databases.${DATABASE_ID}.collections.${HABITS_COMPLETIONS_ID}.documents`;
      const habitsCompletionSubscription = client.subscribe(
        habitsCompletionChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create",
            )
          ) {
            fetchTodayCompletions();
          }
        },
      );

      fetchHabits();
      fetchTodayCompletions();

      return () => {
        habitsSubscription();
        habitsCompletionSubscription();
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

  const fetchTodayCompletions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      const response = await databases.listDocuments<HabitCompletion>(
        DATABASE_ID,
        HABITS_COMPLETIONS_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_At", today.toISOString()),
        ],
      );

      const completions = response.documents;
      setCompletedHabits(completions.map((c) => c.habit_id));
      console.log("Today completions", completedHabits);
    } catch (error) {
      console.log("Error occured", error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, id);
    } catch (error) {
      console.log("Error occured while deleting a habit", error);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits.includes(id)) return;
    try {
      const currentDate = new Date().toISOString();
      await databases.createDocument(
        DATABASE_ID,
        HABITS_COMPLETIONS_ID,
        ID.unique(),
        {
          user_id: user?.$id,
          habit_id: id,
          completed_At: currentDate,
        },
      );

      const habit = habits.find((h) => h.$id === id);
      if (!habit) return;

      await databases.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, id, {
        streaks_count: habit.streaks_count + 1,
        last_completed: currentDate,
      });
    } catch (error) {
      console.log("Error occured while deleting a habit", error);
    }
  };

  const renderLeftActions = () => (
    <View style={s.swipeActionLeft}>
      <Ionicons name="trash" size={32} color="#fff" />
    </View>
  );

  const isHabitCompleted = (habitId: string) =>
    completedHabits.includes(habitId);

  const renderRightActions = (habitId: string) => (
    <View style={s.swipeActionRight}>
      {isHabitCompleted(habitId) ? (
        <Text style={{color: "#fff"}}>Completed!</Text>
      ) : (
        <Ionicons name="checkmark-circle" size={32} color="#fff" />
      )}
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.mainHeading}>Today's Habits</Text>

        <TouchableOpacity style={s.signOutBtn} onPress={signOut}>
          <Ionicons name="log-out" color="#6200ee" size={24} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <Swipeable
              ref={(ref) => {
                swipableRefs.current[habit.$id] = ref;
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={() => renderRightActions(habit.$id)}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDeleteHabit(habit.$id);
                } else if (direction === "right") {
                  handleCompleteHabit(habit.$id);
                }

                swipableRefs.current[habit.$id]?.close();
              }}
            >
              <View
                key={key}
                style={[
                  s.cardContent,
                  isHabitCompleted(habit.$id) && s.cardCompletedStyle,
                ]}
              >
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
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
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
    borderRadius: 18,
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
  swipeActionLeft: {
    backgroundColor: "#e53935",
    justifyContent: "center",
    paddingLeft: 16,
    flex: 1,
    alignItems: "flex-start",
    borderRadius: 18,
    marginBottom: 10,
  },
  swipeActionRight: {
    backgroundColor: "#4caf50",
    justifyContent: "center",
    paddingRight: 16,
    flex: 1,
    alignItems: "flex-end",
    marginBottom: 10,
    borderRadius: 18,
  },
  cardCompletedStyle: {
    opacity: 0.6,
  },
});
