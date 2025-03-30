import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function CampaignCard({ 
  id, 
  _id,
  title, 
  description, 
  image, 
  volunteers,
  maxParticipants,
  category,
  location,
  startDate,
  endDate,
  spotsRemaining,
  isParticipant,
  onPress
}) {
  const router = useRouter();
  
  // Handle navigation to campaign details
  const handlePress = () => {
    if (onPress) {
      // Use the custom onPress if provided
      onPress();
    } else {
      // Otherwise, use default navigation
      const campaignId = id || _id;
      router.push({
        pathname: "../screens/campaign-details",
        params: { campaignId }
      });
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View className="bg-white mx-4 my-3 p-4 rounded-lg shadow-lg">
        <Image 
          source={{ uri: image }} 
          className="w-full h-40 rounded-lg" 
          resizeMode="cover" 
        />
        <Text className="text-xl font-semibold mt-3 text-gray-900">{title}</Text>
        <Text className="text-gray-600 mt-1" numberOfLines={2}>{description}</Text>
        
        {category && (
          <View className="mt-2">
            <View className="bg-blue-100 self-start px-3 py-1 rounded-full">
              <Text className="text-blue-800 text-xs font-medium">{category}</Text>
            </View>
          </View>
        )}
        
        <View className="flex-row justify-between items-center mt-4">
          <TouchableOpacity 
            className="bg-blue-600 px-5 py-2 rounded-full shadow-md"
            onPress={handlePress}
          >
            <Text className="text-white font-semibold">{isParticipant?"Joined":"Join Now"}</Text>
          </TouchableOpacity>
          
          <View>
            <Text className="text-gray-500 text-right">
              {volunteers} / {maxParticipants || '∞'} volunteers
            </Text>
            {spotsRemaining !== undefined && (
              <Text className="text-xs text-blue-600 text-right">
                {spotsRemaining} spots remaining
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}