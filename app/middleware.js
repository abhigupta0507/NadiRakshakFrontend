import { useSegments, useRouter } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { BackendUrl } from "@/secrets";
import ToastComponent, {showToast} from "./components/Toast";

export default function AuthMiddleware() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Create an array of excluded paths
      const excludedPaths = [
        "/index",
        "/campaign",
        "/screens/forgot-password",
        "/screens/login",
        "/screens/reset-password",
        "/screens/rivers",
        "/screens/RiverScreen",
        "/screens/RiverStationsScreen",
        "/screens/signup",
        "/screens/StationDetailsScreen",
        "/screens/reset-password",
        "/screens/verify-otp",
        "/screens/verify-reset-otp",
      ];

      // Get the current path
      const currentPath = "/" + segments.join("/");
      
      // Check if the current path is in the excluded list
      const isExcludedPath = excludedPaths.some(path => 
        currentPath === path || currentPath.startsWith(`${path}/`)
      );
      
      // If the current path is excluded, skip authentication check
      if (isExcludedPath) {
        return;
      }

      try {
        const accessToken = await SecureStore.getItemAsync("accessToken");

        if (accessToken) {
          const profileResult = await fetchUserProfile(accessToken);

          if (profileResult.success) return;
        }

        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (!refreshToken) {
          showToast("error","Error","Session Expired");
          return router.replace("/screens/login");
        }
        
        const refreshResult = await refreshAccessToken(refreshToken);
        
        if (refreshResult.success) {
          await SecureStore.setItemAsync("accessToken", refreshResult.accessToken);

          const retryProfileResult = await fetchUserProfile(refreshResult.accessToken);
          
          if (retryProfileResult.success) return;
        }
        
        showToast("error","Error","Session Expired");
        router.replace("/screens/login");
      } catch (error) {
        showToast("error","Error","Session Expired");
        router.replace("/screens/login");
      }
    };

    checkAuth();
  }, [segments, router]);

  // Helper function to fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${BackendUrl}/auth/profile`, {
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
      const response = await fetch(`${BackendUrl}/auth/refresh-token`, {
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