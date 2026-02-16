import {
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  HABITS_COMPLETIONS_ID,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);

  const { signOut, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchCompletions();
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

  const fetchCompletions = async () => {
    try {
      const response = await databases.listDocuments<HabitCompletion>(
        DATABASE_ID,
        HABITS_COMPLETIONS_ID,
        [Query.equal("user_id", user?.$id ?? "")],
      );

      const completions = response.documents;
      setCompletedHabits(completions);
      console.log("Today completions", completedHabits);
    } catch (error) {
      console.log("Error occured", error);
    }
  };

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreak = (habitId: string): StreakData => {
    const habitCompletions = completedHabits
      .filter((c) => c.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_At).getTime() -
          new Date(b.completed_At).getTime(),
      );

    if (habitCompletions.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions.forEach((c) => {
      const date = new Date(c.completed_At);
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
        }
        streak = currentStreak;
        lastDate = date;
      }
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreak(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => a.bestStreak - b.bestStreak);
  console.log(
    "rankeddddddddddddddddddd",
    rankedHabits.map((h) => h.habit.title),
  );
  return (
    <View style={s.container}>
      <Text style={s.mainHeading}>Habits Streaks</Text>

      {habits.length === 0 ? (
        <View>
          <Text>No Habits yet. Add your first Habit!</Text>
        </View>
      ) : (
        rankedHabits.map(({ bestStreak, habit, streak, total }, key) => (
          <View style={[s.card, key === 0 && s.firstCard]} key={key}>
            <View style={s.cardContent}>
              <View>
                <Text style={s.habitTitle}>{habit.title}</Text>
                <Text style={s.habitDesc}>{habit.description}</Text>
              </View>

              <View style={s.statsRow}>
                <View style={s.statsBadge}>
                  <Text style={s.statsBadgeText}> 🔥{streak}</Text>
                  <Text style={s.statsBadgeLabel}> Current</Text>
                </View>
                <View style={s.statsBadgeGold}>
                  <Text style={s.statsBadgeText}> 🏆 {bestStreak}</Text>
                  <Text style={s.statsBadgeLabel}> Best</Text>
                </View>
                <View style={s.statsBadgeGreen}>
                  <Text style={s.statsBadgeText}> ✅ {total}</Text>
                  <Text style={s.statsBadgeLabel}> Total</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  mainHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    padding: 18,
    marginBottom: 10,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 18,
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff",
  },
  cardContent: {},
  habitTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 2,
  },
  habitDesc: {
    color: "#6c6c80",
    marginBottom: 8,
    fontSize: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 8,
  },
  statsBadge: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
    borderRadius: 10,
  },
  statsBadgeGold: {
    backgroundColor: "#fffde7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
    borderRadius: 10,
  },
  statsBadgeGreen: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
    borderRadius: 10,
  },
  statsBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },
  statsBadgeLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },
});
