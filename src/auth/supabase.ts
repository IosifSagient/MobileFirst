import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

const extra = (Constants.expoConfig?.extra ?? Constants.manifest?.extra) as
  | { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string }
  | undefined;

const SUPABASE_URL = extra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = extra?.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase env. Check app.config.ts and .env");
  throw new Error("supabaseUrl is required.");
}

const ExpoSecureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
