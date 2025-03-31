import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

export default function ReportCard({ 
  _id,
  imageUrl, 
  description, 
  severity,
  severitySuggestion,
  status,
  location,
  createdAt,
  userId,
  isDraft = false,
  onPress
}) {
  const router = useRouter();
  
  // Format date
  const formattedDate = createdAt ? format(new Date(createdAt), "MMM dd, yyyy") : "";
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Handle navigation
  const handlePress = () => {
    if(!isDraft){
      return;
    }
    if (onPress) {
      // Use the custom onPress if provided
      onPress();
    } else {
      // Default navigation based on whether it's a draft
      if (isDraft) {
        router.push({
          pathname: "../screens/edit-drafts",
          params: { draftId: _id }
        });
      } else {
        router.push({
          pathname: "../screens/report-details",
          params: { reportId: _id }
        });
      }
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={isDraft?0.9:1}
    >
      <View className="bg-white mx-4 my-3 p-4 rounded-lg shadow-lg">
        {/* Draft Banner (if applicable) */}
        {isDraft && (
          <View className="absolute top-0 right-0 bg-blue-600 px-3 py-1 rounded-tr-lg rounded-bl-lg z-10">
            <Text className="text-white text-xs font-medium">DRAFT</Text>
          </View>
        )}
        
        <Image 
          source={{ uri: imageUrl }} 
          className="w-full h-40 rounded-lg" 
          resizeMode="cover" 
        />
        <Text className="text-xl font-semibold mt-3 text-gray-900">
          {isDraft ? "Draft Report" : (userId?.name ? `Report by ${userId.name}` : "Pollution Report")}
        </Text>
        <Text className="text-gray-600 mt-1" numberOfLines={2}>{description}</Text>
        
        <View className="flex-row mt-3 space-x-2">
          <View className={`self-start px-3 py-1 rounded-full ${getSeverityColor(severity)}`}>
            <Text className="text-xs font-medium">Severity: {severity}</Text>
          </View>
          
          {!isDraft && status && (
            <View className={`self-start px-3 py-1 rounded-full ${getStatusColor(status)}`}>
              <Text className="text-xs font-medium">Status: {status}</Text>
            </View>
          )}
        </View>
        
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1">
              {location?.coordinates ? 
                `${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}` : 
                "Location not available"}
            </Text>
          </View>
          
          <Text className="text-gray-500 text-right">
            {formattedDate}
          </Text>
        </View>
        
        {isDraft ? <TouchableOpacity 
          className="bg-blue-600 mt-3 px-5 py-2 rounded-full shadow-md self-start"
          onPress={handlePress}
        >
          <Text className="text-white font-semibold">
            {isDraft ? "Edit Draft" : "View Details"}
          </Text>
        </TouchableOpacity>: <></>}
      </View>
    </TouchableOpacity>
  );
}