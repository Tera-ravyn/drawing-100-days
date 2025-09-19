// utils/supabaseClient.ts
import { createBrowserClient } from "@supabase/ssr";

// 浏览器客户端 - 用于客户端组件
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
export const supabase = createSupabaseBrowserClient();
