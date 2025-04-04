import { useSegments, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { BackendUrl } from "@/secrets";

export default function AuthMiddleware() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync("accessToken");
        console.log("Access Token:", accessToken);

        if (accessToken) {
          const profileResult = await fetchUserProfile(accessToken);
          console.log("Profile Fetch Result:", profileResult);

          if (profileResult.success) return;
        }

        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        console.log("Refresh Token:", refreshToken);

        if (!refreshToken) {
          console.log("No Refresh Token. Redirecting to Login.");
          return router.replace("/screens/login");
        }

        const refreshResult = await refreshAccessToken(refreshToken);
        console.log("Refresh Result:", refreshResult);

        if (refreshResult.success) {
          await SecureStore.setItemAsync("accessToken", refreshResult.accessToken);

          const retryProfileResult = await fetchUserProfile(refreshResult.accessToken);
          console.log("Retry Profile Fetch Result:", retryProfileResult);

          if (retryProfileResult.success) return;
        }

        console.log("Token Refresh Failed. Redirecting to Login.");
        router.replace("/screens/login");
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/screens/login");
      }
    };

    checkAuth();
  }, [segments, router]);

  // Helper function to fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${{BackendUrl}}auth/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      }
      
      if (data.error === "TOKEN_EXPIRED") {
        return { success: false, expired: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error("Profile fetch error:", error);
      return { success: false };
    }
  };

  // Helper function to refresh the access token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch(`${{BackendUrl}}auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      
      if (response.ok && data.accessToken) {
        return { 
          success: true,
          accessToken: data.accessToken
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error("Token refresh error:", error);
      return { success: false };
    }
  };

  return null;
}