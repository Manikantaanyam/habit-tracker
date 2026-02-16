import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
  user_id: string;
  title: string;
  description: string;
  streaks_count: number;
  last_completed: string;
  frequency: string;
  createdAt: string;
}
