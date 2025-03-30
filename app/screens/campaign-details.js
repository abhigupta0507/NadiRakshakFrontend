import React, { useCallback, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar,
  SafeAreaView,
  Alert
} from "react-native";
import ToastComponent, { showToast } from "../components/Toast";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect, useGlobalSearchParams, useRouter } from "expo-router";

const BackendUrl = "https://nadirakshak-backend.onrender.com/api/v1";

const CampaignDetails = ({ route }) => {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { campaignId } = params;
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [totalParticipantWithoutUser, settotalParticipantWithoutUser] = useState(0);
  const [joinLeaveLoading, setJoinLeaveLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Get auth token on component mount
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
          showToast("error", "Unauthorized", "Please log in again.");
          router.push("/login");
          return;
        }
        setAuthToken(token);
      } catch (error) {
        console.error("Error retrieving token:", error);
        showToast("error", "Error", "Authentication error. Please log in again.");
        router.push("/login");
      }
    };
    
    getAuthToken();
  }, []);

// Add a state to track screen focus
  const [isFocused, setIsFocused] = useState(false);

  // Update useFocusEffect implementation
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  // Replace your existing useEffect with this one
  useEffect(() => {
    if (authToken && isFocused) {
      fetchCampaignDetails();
    }
  }, [authToken, isFocused, joinLeaveLoading]);

  // Memoize fetchCampaignDetails
  const fetchCampaignDetails = useCallback(async () => {
    try {
      const response = await fetch(`${BackendUrl}/campaigns/${campaignId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCampaign(data.data.campaign);
        setIsParticipant(data.data.isParticipant);
        setIsCreator(data.data.isCreator);
        
        if (data.data.isParticipant) {
          settotalParticipantWithoutUser(data.data.campaign.participants.length - 1);
        } else {
          settotalParticipantWithoutUser(data.data.campaign.participants.length);
        }
      } else {
        showToast("error", "Error", data.message || "Failed to load campaign details");
      }
    } catch (error) {
      console.error("Fetch Campaign Error:", error);
      showToast("error", "Error", "Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  }, [authToken, campaignId]); // Include dependencies used inside

  const handleJoin = async () => {
    setJoinLeaveLoading(true);
    
    try {
      const response = await fetch(`${BackendUrl}/campaigns/${campaignId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        setIsParticipant(true);
        showToast("success", "Joined Successfully", "You are now a participant!");
      } else {
        showToast("error", "Error", result.message || "Failed to join campaign");
      }
    } catch (error) {
      console.error("Join Campaign Error:", error);
      showToast("error", "Error", "Failed to join campaign");
    } finally {
      setJoinLeaveLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      "Leave Campaign",
      "Are you sure you want to leave this campaign?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: confirmLeave
        }
      ]
    );
  };

  const confirmLeave = async () => {
    setJoinLeaveLoading(true);
    
    try {
      const response = await fetch(`${BackendUrl}/campaigns/${campaignId}/leave`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        setIsParticipant(false);
        showToast("success", "Left Successfully", "You are no longer a participant");
      } else {
        showToast("error", "Error", result.message || "Failed to leave campaign");
      }
    } catch (error) {
      console.error("Leave Campaign Error:", error);
      showToast("error", "Error", "Failed to leave campaign");
    } finally {
      setJoinLeaveLoading(false);
    }
  };

  const handleUpdateCampaign = () => {
    router.push({
      pathname: "../screens/update-campaign",
      params: { campaignId }
    });
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-blue-600 mt-4 font-medium">Loading campaign details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 bg-white">
        <View className="relative">
          <Image
            source={{ 
              uri: campaign.image 
            }}
            className="w-full h-64"
            resizeMode="cover"
          />
          
          {/* Header overlay for text legibility */}
          <View className="absolute bottom-0 left-0 right-0 h-32 bg-black opacity-50" />
          
          {/* Title on image */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-3xl font-bold text-white">{campaign.title}</Text>
            <View className="flex-row mt-2 items-center">
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">{campaign.category}</Text>
              </View>
              <Text className="text-white ml-3 text-sm">
                {campaign.participants?.length || 0}/{campaign.maxParticipants} joined
              </Text>
            </View>
          </View>
        </View>

        {/* Campaign info cards */}
        <View className="px-5 py-6">
          {/* Date and Location card */}
          <View className="flex-row justify-between bg-blue-50 p-4 rounded-xl mb-6">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-blue-500 text-lg mr-2">📅</Text>
                <View>
                  <Text className="text-gray-500 text-xs">Date</Text>
                  <Text className="text-gray-800 font-medium">
                    {formatDate(campaign.startDate)}
                  </Text>
                  <Text className="text-gray-800 font-medium">
                    to {formatDate(campaign.endDate)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="h-auto w-0.5 bg-gray-200 mx-2" />
            
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-blue-500 text-lg mr-2">📍</Text>
                <View>
                  <Text className="text-gray-500 text-xs">Location</Text>
                  <Text className="text-gray-800 font-medium">{campaign.location}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* About section */}
          <Text className="text-lg font-semibold text-gray-800 mb-2">About</Text>
          <Text className="text-gray-600 leading-6">{campaign.description}</Text>

          {/* Campaign details section */}
          <View className="mt-8 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Campaign Details</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600">Campaign Type</Text>
                <Text className="text-gray-800 font-medium">{campaign.type || "Community"}</Text>
              </View>
              <View className="h-0.5 bg-gray-100 my-2" />
              
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600">Organizer</Text>
                <Text className="text-gray-800 font-medium">{campaign.organizer?.name || "Nadi Rakshak"}</Text>
              </View>
              <View className="h-0.5 bg-gray-100 my-2" />
              
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600">Created On</Text>
                <Text className="text-gray-800 font-medium">{formatDate(campaign.createdAt)}</Text>
              </View>
              <View className="h-0.5 bg-gray-100 my-2" />
              
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600">Max Participants</Text>
                <Text className="text-gray-800 font-medium">{campaign.maxParticipants}</Text>
              </View>
            </View>
          </View>
          
          {/* Current participants */}
          <View className="mt-4 mb-24">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Current Participants</Text>
            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-gray-600 text-center">
                {totalParticipantWithoutUser + (isParticipant ? 1 : 0) || 0} people have joined this campaign
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button or buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100 shadow-lg">
        {isCreator ? (
          // Show both buttons for creator
          <View className="flex-row space-x-2">
            {/* Join/Leave Button */}
            <TouchableOpacity
              onPress={isParticipant ? handleLeave : handleJoin}
              disabled={joinLeaveLoading}
              className={`flex-1 py-3.5 rounded-xl ${
                joinLeaveLoading 
                  ? "bg-gray-400" 
                  : isParticipant 
                    ? "bg-red-500" 
                    : "bg-blue-600"
              }`}
            >
              {joinLeaveLoading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-base font-bold ml-2">
                    {isParticipant ? "Leaving..." : "Joining..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-center text-white text-base font-bold">
                  {isParticipant ? "Leave Campaign" : "Join Campaign"}
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Update Button */}
            <TouchableOpacity
              onPress={handleUpdateCampaign}
              className="flex-1 py-3.5 rounded-xl bg-green-600"
            >
              <Text className="text-center text-white text-base font-bold">
                Update Campaign
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show only Join/Leave button for non-creators
          <TouchableOpacity
            onPress={isParticipant ? handleLeave : handleJoin}
            disabled={joinLeaveLoading}
            className={`py-3.5 rounded-xl ${
              joinLeaveLoading 
                ? "bg-gray-400" 
                : isParticipant 
                  ? "bg-red-500" 
                  : "bg-blue-600"
            }`}
          >
            {joinLeaveLoading ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-base font-bold ml-2">
                  {isParticipant ? "Leaving..." : "Joining..."}
                </Text>
              </View>
            ) : (
              <Text className="text-center text-white text-base font-bold">
                {isParticipant ? "Leave Campaign" : "Join Campaign"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      <ToastComponent />
    </SafeAreaView>
  );
};

export default CampaignDetails;