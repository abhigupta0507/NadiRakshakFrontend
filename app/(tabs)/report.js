import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, TouchableOpacity, ActivityIndicator, Text,RefreshControl  } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Header from "../components/Header";
import ReportCard from "../components/ReportCard";
import { showToast } from "../components/Toast";
import { BackendUrl } from "../../secrets";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ReportsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("drafts"); // "reports" or "drafts"
  const [reports, setReports] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // This will be called when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // This will be called every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {
        // Optional cleanup function
      };
    }, [])
  );

  const fetchData = async () => {
    // Fetch both reports and drafts
    await Promise.all([
      fetchReports(),
      fetchDrafts()
    ]);
  };

  const fetchReports = async () => {
    try {
      if(!refreshing) {
        setLoading(true);
      }
      const token = await SecureStore.getItemAsync("accessToken");
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        // router.push("/screens/login");
        // return;
      }

      const response = await fetch(`${BackendUrl}/reports/my-reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        setReports(result.reports || []);
      } else {
        setError(result.message || "Failed to fetch reports");
        showToast("error", "Error", result.message || "Failed to fetch reports");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      if(!refreshing) {
        setLoading(false);
      }
    }
  };

  const fetchDrafts = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        // router.push("/screens/login");
        // return;
      }

      const response = await fetch(`${BackendUrl}/reports/drafts/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        setDrafts(result.drafts || []);
      } else {
        // console.error("Error fetching drafts:", result.message);
      }
    } catch (error) {
      // console.error("Fetch Drafts Error:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Render tab bar
  const renderTabs = () => (
    <View className="flex-row mb-2 mx-4">
      <TouchableOpacity 
        className={`flex-1 py-3 ${activeTab === 'reports' ? 'border-b-2 border-blue-600' : 'border-b border-gray-200'}`}
        onPress={() => setActiveTab('reports')}
      >
        <Text className={`text-center font-medium ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-500'}`}>
          Reports
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className={`flex-1 py-3 ${activeTab === 'drafts' ? 'border-b-2 border-blue-600' : 'border-b border-gray-200'}`}
        onPress={() => setActiveTab('drafts')}
      >
        <Text className={`text-center font-medium ${activeTab === 'drafts' ? 'text-blue-600' : 'text-gray-500'}`}>
          Drafts
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderWarningText = () => {
    if(activeTab === 'drafts') {
      return <Text className="text-amber-600 text-center text-xs px-4 mb-2">Drafts will be deleted in 24 hours of creation if not submitted</Text>;
    }
    return null;
  };

  // Render content based on active tab
  const renderContent = () => {
    const currentData = activeTab === 'reports' ? reports : drafts;
    const emptyMessage = activeTab === 'reports' ? 'No pollution reports found.' : 'No draft reports found.';
    const createButtonText = activeTab === 'reports' ? 'Submit Drafts' : 'Create Draft';
    
    if (loading && currentData.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-blue-600 mt-4 font-medium">
            Loading {activeTab === 'reports' ? 'reports' : 'drafts'}...
          </Text>
        </View>
      );
    }
    
    if (error && activeTab === 'reports') {
      return (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity 
            onPress={handleRefresh}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (currentData.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-700 text-center mb-4">{emptyMessage}</Text>
          <TouchableOpacity 
            onPress={() => router.push("/camera")}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">{createButtonText}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3b82f6"]}
              tintColor="#3b82f6"
            />
          }
        >
        {currentData.map((item) => (
          <ReportCard 
            key={item._id}
            _id={item._id}
            imageUrl={item.imageUrl}
            description={item.description}
            severity={item.severity}
            severitySuggestion={item.severitySuggestion}
            status={item.status}
            location={item.location}
            createdAt={item.createdAt}
            userId={item.userId}
            isDraft={activeTab === 'drafts'}
            onPress={() => {
              if (activeTab === 'drafts') {
                router.push({
                  pathname: "../screens/edit-drafts",
                  params: { draftId: item._id }
                });
              } else {
                router.push({
                  pathname: "../screens/report-details",
                  params: { reportId: item._id }
                });
              }
            }}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header with Plus Button */}
      <View className="relative">
        <Header 
        title={"Reports"} 
        showButton={true}
        onAddPress={() => router.push("/camera")}
        subtitle={"Be the change—save water, sustain life."}/>
      </View>

      {/* Tab Navigation */}
      {renderTabs()}
      
      {renderWarningText()}

      {/* Content Container */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}