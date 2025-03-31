import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import MapView, { Marker } from "react-native-maps";
import { format } from "date-fns";
import ToastComponent, { showToast } from "../components/Toast";
import { BackendUrl } from "../../secrets";

export default function ReportDetailsScreen() {
  const { reportId } = useLocalSearchParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/drafts/${reportId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        setReport(result.report);
      } else {
        setError(result.message || "Failed to fetch report details");
        showToast("error", "Error", result.message || "Failed to fetch report details");
      }
    } catch (error) {
      console.error("Fetch Report Details Error:", error);
      setError("Something went wrong. Please try again.");
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const token = await SecureStore.getItemAsync("accessToken");
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/drafts/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setReport(prev => ({ ...prev, status: newStatus }));
        showToast("success", "Updated", `Report status updated to ${newStatus}`);
      } else {
        showToast("error", "Error", result.message || "Failed to update report status");
      }
    } catch (error) {
      console.error("Update Report Status Error:", error);
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const openMapApp = () => {
    if (!report?.location?.coordinates) return;
    
    const latitude = report.location.coordinates[1];
    const longitude = report.location.coordinates[0];
    const label = "Pollution Report Location";
    
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}(${label})`
    });
    
    Linking.openURL(url);
  };

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

  const getSeverityColor = (severity) => {
    switch(severity) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-blue-600 mt-4 font-medium">Loading report details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-white">
        <Ionicons name="alert-circle-outline" size={50} color="#ef4444" />
        <Text className="text-red-500 text-center my-4">{error}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-white">
        <Text className="text-gray-700 text-center mb-4">Report not found.</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = report.createdAt ? format(new Date(report.createdAt), "MMMM dd, yyyy 'at' h:mm a") : "";
  const latitude = report.location?.coordinates ? report.location.coordinates[1] : 0;
  const longitude = report.location?.coordinates ? report.location.coordinates[0] : 0;

  return (
    <ScrollView className="flex-1 bg-white">

      {/* Report Image */}
      <View className="w-full h-64 bg-gray-300">
        <Image 
          source={{ uri: report.imageUrl }} 
          className="w-full h-full" 
          resizeMode="cover" 
        />
      </View>

      {/* Main Content */}
      <View className="p-4">
        {/* Title and Status */}
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            {report.userId?.name ? `Report by ${report.userId.name}` : "Pollution Report"}
          </Text>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(report.status)}`}>
            <Text className="font-medium">{report.status}</Text>
          </View>
        </View>

        {/* Date */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="text-gray-500 ml-1">{formattedDate}</Text>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Description</Text>
          <View className="bg-blue-50 p-3 rounded-lg">
            <Text className="text-gray-700">{report.description}</Text>
          </View>
        </View>

        {/* Severity */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Severity</Text>
          <View className="flex-row space-x-3">
            <View className={`px-4 py-2 rounded-lg ${getSeverityColor(report.severity)}`}>
              <Text className="font-medium">Reported: {report.severity}</Text>
            </View>
            <View className={`px-4 py-2 rounded-lg ${getSeverityColor(report.severitySuggestion)}`}>
              <Text className="font-medium">Suggested: {report.severitySuggestion}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-800">Location</Text>
            <TouchableOpacity 
              onPress={openMapApp}
              className="bg-blue-600 px-3 py-1 rounded-lg"
            >
              <Text className="text-white font-medium text-sm">Open in Maps</Text>
            </TouchableOpacity>
          </View>
          
          {report.location?.coordinates ? (
            <View className="border-2 border-blue-200 rounded-lg overflow-hidden h-48">
              <MapView
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{ latitude, longitude }}
                  title="Pollution Report"
                  description={report.description}
                  pinColor="#2563eb"
                />
              </MapView>
            </View>
          ) : (
            <View className="bg-gray-100 h-48 rounded-lg justify-center items-center">
              <Text className="text-gray-500">Location data not available</Text>
            </View>
          )}
          
          {report.location?.coordinates && (
            <Text className="text-gray-500 mt-2 text-center">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Update Status */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Update Status</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity 
              onPress={() => handleStatusUpdate("Pending")}
              disabled={updating || report.status === "Pending"}
              className={`px-3 py-2 rounded-lg ${report.status === "Pending" ? "bg-gray-200" : "bg-orange-100"}`}
              style={{ opacity: updating ? 0.7 : 1 }}
            >
              <Text className={`${report.status === "Pending" ? "text-gray-500" : "text-orange-800"} font-medium`}>
                Pending
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleStatusUpdate("In Progress")}
              disabled={updating || report.status === "In Progress"}
              className={`px-3 py-2 rounded-lg ${report.status === "In Progress" ? "bg-gray-200" : "bg-blue-100"}`}
              style={{ opacity: updating ? 0.7 : 1 }}
            >
              <Text className={`${report.status === "In Progress" ? "text-gray-500" : "text-blue-800"} font-medium`}>
                In Progress
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleStatusUpdate("Resolved")}
              disabled={updating || report.status === "Resolved"}
              className={`px-3 py-2 rounded-lg ${report.status === "Resolved" ? "bg-gray-200" : "bg-green-100"}`}
              style={{ opacity: updating ? 0.7 : 1 }}
            >
              <Text className={`${report.status === "Resolved" ? "text-gray-500" : "text-green-800"} font-medium`}>
                Resolved
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row justify-between mb-10">
          <TouchableOpacity 
            onPress={() => Linking.openURL(`mailto:${report.userId?.email || ''}`)}
            className="bg-blue-600 flex-1 mr-2 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">Contact Reporter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: "../screens/EditReport",
              params: { reportId: report._id }
            })}
            className="bg-white flex-1 ml-2 py-3 rounded-lg items-center border-2 border-blue-600"
          >
            <Text className="text-blue-600 font-semibold">Edit Report</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ToastComponent />
    </ScrollView>
  );
}