import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TripStateRow } from "@/lib/types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(url!, anonKey!, {
          auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export type TripStateDatabase = {
    public: {
        Tables: {
            trip_state: {
                Row: TripStateRow;
                Insert: Omit<TripStateRow, "updated_at"> & { updated_at?: string };
                Update: Partial<TripStateRow>;
            };
        };
    };
};
