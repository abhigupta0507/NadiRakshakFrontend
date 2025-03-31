import { useSegments, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export default function AuthMiddleware() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = SecureStore.getItemAsync("access_token");
      console.log(token);

      if (!token) {
        router.replace("../screens/login");
      }
    };

    checkAuth();
  }, [segments]);

  return null;
}
