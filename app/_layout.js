import { Stack } from "expo-router";
import "../global.css";
import AuthMiddleware from "@/app/middleware";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* <AuthMiddleware /> */}
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </SafeAreaProvider>
  );
}