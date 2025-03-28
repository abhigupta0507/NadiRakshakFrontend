import { Stack } from "expo-router";
import "../../global.css"; // Ensure this file exists and is needed

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
    </Stack>
  );
}
