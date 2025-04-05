import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";

const IndexCard = ({ title, description, routeName, route }) => {
  return (
    <View className="bg-gray-100 rounded-2xl p-6 mb-8">
      <Text className="text-blue-800 text-xl font-semibold mb-4">{title}</Text>
      <Text className="text-gray-700 text-base mb-4">{description}</Text>
      <TouchableOpacity
        className="bg-blue-600 p-3 rounded-xl items-center"
        onPress={() => router.push(`${route}`)}
      >
        <Text className="text-white font-medium">{routeName}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IndexCard;
