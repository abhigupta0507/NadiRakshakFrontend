import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  FlatList,
  Image,
} from "react-native";
import ToastComponent, { showToast } from "../components/Toast";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackendUrl } from "../../secrets";

const PointsHistory = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    history: [],
  });
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
        showToast(
          "error",
          "Error",
          "Authentication error. Please log in again."
        );
        router.push("./login");
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

  // Fetch points history when the component mounts
  useEffect(() => {
    if (authToken && isFocused) {
      fetchPointsHistory();
    }
  }, [authToken, isFocused]);

  // Function to fetch all points history without pagination
  const fetchPointsHistory = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${BackendUrl}/auth/points-history?limit=1000`, // Set a high limit to get all points
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPointsData(data.data);
      } else {
        showToast(
          "error",
          "Error",
          data.message || "Failed to load points history"
        );
      }
    } catch (error) {
      showToast("error", "Error", "Failed to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPointsHistory();
  }, [authToken]);

  // Format date function
  const formatDate = (dateString) => {
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Return appropriate icon based on event type
  const getEventIcon = (event) => {
    switch (event?.toLowerCase()) {
      case "campaign":
        return "🌊";
      case "cleanup":
        return "🧹";
      case "store purchase":
        return "📚";
      case "report submission":
        return "📢";
      case "referral":
        return "👥";
      case "signup":
        return "📱";
      case "quiz":
        return "❓";
      case "challenge":
        return "🏆";
      case "report accepted":
         return "🖊️"
            
      default:
        return "🌟";
    }
  };

  // Get color based on point value
  const getPointColor = (points) => {
    if (points > 0) return "text-green-600";
    if (points < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Render each history item
  const renderHistoryItem = ({ item }) => (
    <View className="flex-row items-center p-4 bg-white rounded-xl mb-3 shadow-sm border border-gray-100">
      <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
        <Text className="text-2xl">{getEventIcon(item.source)}</Text>
      </View>

      <View className="flex-1 ml-4">
        <Text className="text-base font-medium text-gray-800">
          {item.source}
        </Text>
        <Text className="text-sm text-gray-500">
          {item.reason || `Points from ${item.source}`}
        </Text>
        <Text className="text-xs text-gray-400 mt-1">
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <Text className={`text-lg font-bold ${getPointColor(item.points)}`}>
        {item.points > 0 ? "+" : ""}
        {item.points} pts
      </Text>
    </View>
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-blue-600 mt-4 font-medium">
          Loading points history...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header with total points */}
      <View className="bg-blue-600 p-6 pb-16 shadow-md">
        <Text className="text-white text-xl font-bold mb-1">My Points</Text>
        <View className="flex-row items-baseline">
          <Text className="text-white text-4xl font-bold">
            {pointsData.totalPoints}
          </Text>
          <Text className="text-white text-lg ml-2 opacity-80">points</Text>
        </View>
      </View>

      {/* Card showing point history */}
      <View className="flex-1 px-4 -mt-12">
        {/* Header for history list */}
        <View className="bg-white rounded-t-xl p-4 border-b border-gray-100 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800">
            Points History
          </Text>
          <Text className="text-sm text-gray-500">
            Your complete points earning history
          </Text>
        </View>

        {/* History list */}
        {pointsData.history && pointsData.history.length > 0 ? (
          <FlatList
            data={pointsData.history}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `${item._id || index}`}
            contentContainerStyle={{
              paddingVertical: 16,
              paddingHorizontal: 4,
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center p-6">
            <Image
              source={require("../../assets/default-river.jpg")}
              className="w-40 h-40 opacity-80 mb-4"
              resizeMode="contain"
            />
            <Text className="text-xl font-medium text-gray-700 mb-2">
              No Points Yet
            </Text>
            <Text className="text-center text-gray-500 mb-6">
              Start participating in campaigns and activities to earn points!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/campaign")}
              className="bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Explore Campaigns</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ToastComponent />
    </SafeAreaView>
  );
};

export default PointsHistory;
