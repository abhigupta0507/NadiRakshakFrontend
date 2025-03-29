import { ScrollView, View, Text } from "react-native";
import Header from "../components/Header";
import CampaignCard from "../components/CampaignCard";

const campaigns = [
  {
    title: "Beach Cleanup Drive",
    description: "Join us to clean the beach this Saturday at 8 AM.",
    image: "https://source.unsplash.com/800x400/?beach,cleanup",
    volunteers: 20,
  },
  {
    title: "Tree Plantation Drive",
    description: "Help us plant trees and make our environment greener.",
    image: "https://source.unsplash.com/800x400/?tree,plantation",
    volunteers: 15,
  },
  {
    title: "Food Donation Camp",
    description: "Distribute food to those in need and make an impact.",
    image: "https://source.unsplash.com/800x400/?food,donation",
    volunteers: 30,
  },
];

export default function CampaignsScreen() {
  return (
    <View className="flex-1 bg-gray-100">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }} // Prevents overlap with bottom bar
      >
        {campaigns.map((campaign, index) => (
          <CampaignCard key={index} {...campaign} />
        ))}
      </ScrollView>
    </View>
  );
}
