import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderCard = ({
  _id,
  items,
  status,
  trackingInfo,
  pointsSpent,
  createdAt,
  onPress
}) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  console.log(items.length);

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "time-outline";
      case "processing":
        return "construct-outline";
      case "shipped":
        return "car-outline";
      case "delivered":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm mb-4 p-4"
      onPress={onPress}
      activeOpacity={1}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-gray-500 text-xs">Order ID</Text>
          <Text className="text-gray-800 font-medium">
            #{_id.substring(_id.length - 8)}
          </Text>
        </View>
        
        <View
          className={`px-2 py-1 rounded-full flex-row items-center ${getStatusColor(
            status
          )}`}
        >
          <Ionicons
            name={getStatusIcon(status)}
            size={12}
            color="currentColor"
            className="mr-1"
          />
          <Text className={`text-xs font-medium`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-3">
        <Text className="text-gray-600 mb-2">Item:</Text>
        {items.map((item) => (
          <View
            key={item}
            className="flex-row justify-between items-center mb-1"
          >
            <Text className="text-gray-800" numberOfLines={1}>
              {item.itemName} {item.quantity >= 1 ? `(${item.quantity})` : ""}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={12} color="#3b82f6" />
              <Text className="text-blue-600 text-sm ml-1">
                {item.pointsCost}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="text-gray-500 text-xs">
          {formatDate(createdAt)}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-gray-700 text-sm mr-1">Total:</Text>
          <Ionicons name="star" size={14} color="#3b82f6" />
          <Text className="text-blue-700 font-bold text-base ml-1">
            {pointsSpent}
          </Text>
        </View>
      </View>
      
      {trackingInfo && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="locate-outline" size={16} color="#4b5563" />
            <Text className="text-gray-600 text-sm ml-1">
              Tracking: {trackingInfo.number}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default OrderCard;