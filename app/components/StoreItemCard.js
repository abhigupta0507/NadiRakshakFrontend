import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StoreItemCard = ({
  _id,
  name,
  description,
  pointsCost,
  image,
  inStock,
  userPoints,
  onRedeemPress
}) => {
  const canRedeem = userPoints >= pointsCost && inStock;

  return (
    <View className="bg-white rounded-xl shadow-sm w-[48%] mb-4 overflow-hidden">
      <Image
        source={{ uri: image }}
        className="w-full h-32"
        resizeMode="cover"
      />
      
      <View className="p-3">
        <Text className="font-medium text-gray-800 text-base">{name}</Text>
        <Text className="text-gray-500 text-xs mt-1 mb-2" numberOfLines={2}>
          {description}
        </Text>
        
        <View className="flex-row items-center mt-auto">
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#3b82f6" />
            <Text className="text-blue-600 font-bold ml-1">{pointsCost}</Text>
          </View>
          
          <Text className="text-xs text-gray-500 ml-1">points</Text>
        </View>

        <TouchableOpacity
          className={`mt-3 py-2 rounded-lg flex items-center justify-center ${
            canRedeem ? "bg-blue-600" : "bg-gray-300"
          }`}
          onPress={onRedeemPress}
          disabled={!canRedeem}
        >
          <Text
            className={`text-center text-xs font-medium ${
              canRedeem ? "text-white" : "text-gray-500"
            }`}
          >
            {canRedeem
              ? "Redeem Now"
              : inStock
              ? "Not Enough Points"
              : "Out of Stock"}
          </Text>
        </TouchableOpacity>
        
        {!inStock && (
          <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded">
            <Text className="text-white text-xs font-bold">Out of Stock</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default StoreItemCard;