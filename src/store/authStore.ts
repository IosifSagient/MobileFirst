import { supabase } from "@/src/auth/supabase";
import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  session: Session | null;
  isLoading: boolean;
  init: () => void;
  signOut: () => Promise<void>;
  _inited?: boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: true,
  init: () => {
    if (get()._inited) return;
    set({ _inited: true });
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session ?? null, isLoading: false });
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      set({ session: session ?? null, isLoading: false });
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
  },
}));
