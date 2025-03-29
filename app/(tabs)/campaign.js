import { ScrollView, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import CampaignCard from "../components/CampaignCard";

const campaigns = [
  {
    title: "Beach Cleanup Drive",
    description: "Join us to clean the beach this Saturday at 8 AM.",
    image: "https://img.freepik.com/free-vector/people-cleaning-beaches-together_23-2148417058.jpg",
    volunteers: 20,
  },
  {
    title: "Tree Plantation Drive",
    description: "Help us plant trees and make our environment greener.",
    image: "https://img.freepik.com/premium-vector/volunteers-planting-tree_294791-305.jpg?w=1480",
    volunteers: 15,
  },
  {
    title: "Food Donation Camp",
    description: "Distribute food to those in need and make an impact.",
    image: "https://img.freepik.com/premium-vector/people-with-box-basket-charity-donation_24877-62968.jpg?w=1800",
    volunteers: 30,
  },
];

export default function CampaignsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header with Plus Button */}
      <View className="relative">
        <Header />
        
        <TouchableOpacity
          onPress={() => router.push("/screens/CreateCampaign")}
          style={{
          position: "absolute",
          top: "40%", // Align with text
          transform: [{ translateY: -10 }], // Adjust for centering,
          right: 30,
          backgroundColor: "white",
          borderRadius: 25,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5, // for Android shadow
        }}
      >
        <Ionicons name="add" size={24} color="black" />
      </TouchableOpacity>

        
      </View>

      {/* Campaign List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {campaigns.map((campaign, index) => (
          <CampaignCard key={index} {...campaign} />
        ))}
      </ScrollView>
    </View>
  );
}
