import { Stack } from "expo-router";
import "../global.css";
import AuthMiddleware from "@/app/middleware";

export default function RootLayout() {
  return (
    <>
      <AuthMiddleware />
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </>
  );
}
