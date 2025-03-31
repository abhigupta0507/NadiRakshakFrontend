import { View, Text } from "react-native";

export default function Header({title , subtitle}) {
  return (
    <View className="bg-blue-600 p-6">
      <Text className="text-white text-2xl font-bold">{title}</Text>
      <Text className="text-white text-sm">{subtitle}</Text>
    </View>
  );
}
