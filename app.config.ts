import "dotenv/config";
import type { ConfigContext } from "expo/config";

export default ({ config }: ConfigContext) => ({
  ...config,
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
});
