// window.SUPABASE_URL and window.SUPABASE_ANON_KEY are now provided via main.js CONFIG
// or we can fall back to hardcoded ones for standalone pages.

const getSupabaseConfig = () => {
    if (window.CONFIG && window.CONFIG.SUPABASE_URL && window.CONFIG.SUPABASE_KEY) {
        return {
            url: window.CONFIG.SUPABASE_URL,
            key: window.CONFIG.SUPABASE_KEY
        };
    }
    return {
        url: "https://biehreklleprccoozzbo.supabase.co",
        key: "sb_publishable_ZgbC-iw-na5mrV7cq-7UTg_-DmTZciv"
    };
};

const config = getSupabaseConfig();
window.SUPABASE_URL = config.url;
window.SUPABASE_ANON_KEY = config.key;

console.log("Initializing Supabase Client with URL:", window.SUPABASE_URL);

(() => {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        console.error("Supabase library not found on window object!");
        return;
    }

    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.error("Supabase URL or Anon Key is missing!");
        return;
    }

    try {
        window.supabaseClient = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                },
            }
        );
        console.log("Supabase Client initialized successfully.");
    } catch (err) {
        console.error("Failed to initialize Supabase Client:", err);
    }
})();
