import { View, Text } from "react-native";

export default function Header() {
  return (
    <View className="bg-blue-600 p-6">
      <Text className="text-white text-2xl font-bold">Community Campaigns</Text>
      <Text className="text-white text-sm">Join a cause and make a difference</Text>
    </View>
  );
}
