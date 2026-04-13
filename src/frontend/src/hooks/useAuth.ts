import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const { login, clear, identity, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        console.error("Login error:", err);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return {
    identity,
    isAuthenticated,
    isLoggingIn,
    login: handleLogin,
    logout: handleLogout,
    principal: identity?.getPrincipal(),
  };
}
