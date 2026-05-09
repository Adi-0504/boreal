import { supabase } from '../../supabaseClient';

export const authService = {
  // --- OAuth (Google) ---
  loginWithGoogle: async () => {
    console.log('[Auth] 🚀 Starting Google OAuth...');
    console.log('[Auth] redirectTo:', window.location.origin);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('[Auth] ❌ Google OAuth error:', error);
      throw error;
    }
    console.log('[Auth] ✅ Redirecting to Google...');
  },

  // --- Magic Link (Email OTP) ---
  loginWithEmail: async (email) => {
    console.log('[Auth] 📧 Sending magic link to:', email);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('[Auth] ❌ Magic link error:', error);
      throw error;
    }
    console.log('[Auth] ✅ Magic link sent!');
  },

  // --- 登出 ---
  logout: async () => {
    console.log('[Auth] 🔓 Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] ❌ Logout error:', error);
      throw error;
    }
    console.log('[Auth] ✅ Logged out');
  },

  // --- 更新個人資料 ---
  updateProfile: async (updates) => {
    console.log('[Auth] 📝 Updating profile...', updates);
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) {
      console.error('[Auth] ❌ Update profile error:', error);
      throw error;
    }
    console.log('[Auth] ✅ Profile updated');
    return data.user;
  },

  // --- 監聽登入狀態變化 ---
  onAuthStateChange: (callback) => {
    console.log('[Auth] 👂 Setting up onAuthStateChange listener...');

    // 先主動取得目前 session（處理 OAuth redirect 後的情況）
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] ❌ getSession error:', error);
        return;
      }
      console.log('[Auth] 🔍 Initial session check:', session ? `user=${session.user.email}` : 'no session');
      if (session?.user) {
        callback(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth] 🔔 Auth state changed!');
        console.log('[Auth]   event:', event);
        console.log('[Auth]   user:', session?.user?.email ?? 'null');
        console.log('[Auth]   session:', session ? '✅ exists' : '❌ null');
        callback(session?.user ?? null);
      }
    );

    return () => {
      console.log('[Auth] 🧹 Unsubscribing auth listener');
      subscription.unsubscribe();
    };
  },
};
