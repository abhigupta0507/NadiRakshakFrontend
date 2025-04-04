import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header({ title, subtitle, showButton = false, onAddPress }) {
  return (
    <View className="bg-blue-600 p-6">
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">{title}</Text>
        {showButton && (
          <TouchableOpacity
            onPress={onAddPress}
            className="bg-white rounded-full w-10 h-10 justify-center items-center shadow-md"
          >
            <Ionicons name="add" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-white text-sm mt-1">{subtitle}</Text>
    </View>
  );
}
