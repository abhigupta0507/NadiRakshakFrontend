import { View, Text, Image, TouchableOpacity } from "react-native";

export default function CampaignCard({ title, description, image, volunteers }) {
  return (
    <View className="bg-white mx-4 my-3 p-4 rounded-lg shadow-lg">
      <Image source={{ uri: image }} className="w-full h-40 rounded-lg" resizeMode="cover" />

      <Text className="text-xl font-semibold mt-3 text-gray-900">{title}</Text>
      <Text className="text-gray-600 mt-1">{description}</Text>

      <View className="flex-row justify-between items-center mt-4">
        <TouchableOpacity className="bg-blue-600 px-5 py-2 rounded-full shadow-md">
          <Text className="text-white font-semibold">Join Now</Text>
        </TouchableOpacity>
        <Text className="text-gray-500">{volunteers} volunteers</Text>
      </View>
    </View>
  );
}
