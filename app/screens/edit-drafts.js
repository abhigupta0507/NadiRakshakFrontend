import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView,
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Alert,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import MapView, { Marker } from "react-native-maps";
import { format } from "date-fns";
import ToastComponent, { showToast } from "../components/Toast"; 
import { BackendUrl } from "../../secrets";

export default function EditDraftScreen() {
  const { draftId } = useLocalSearchParams();
  const router = useRouter();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");

  useEffect(() => {
    fetchDraftDetails();
  }, [draftId]);

  const fetchDraftDetails = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        // setTimeout(() => router.push("/screens/login"), 1500);
        // return;
      }

      const response = await fetch(`${BackendUrl}/reports/drafts/${draftId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (response.ok && result.draft) {
        setDraft(result.draft);
        setDescription(result.draft.description || "");
        setSeverity(result.draft.severity || "Medium");
      } else {
        setError(result.message || "Failed to fetch draft details");
        showToast("error", "Error", result.message || "Failed to fetch draft details");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDraft = async () => {
    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync("accessToken");
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        // setTimeout(() => router.push("/screens/login"), 1500);

        // return;
      }

      if(description === ""){
        throw "Description can't be empty";
      }

      const response = await fetch(`${BackendUrl}/reports/drafts/${draftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description, 
          severity
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        showToast("success", "Updated", "Draft updated successfully");
        setTimeout(() => router.back(), 1500);
      } else {
        showToast("error", "Error", result.message || "Failed to update draft");
      }
    } catch (error) {
      showToast("error", "Error", error || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReport = async () => {
    Alert.alert(
      "Submit Report",
      "Before submitting, please ensure:\n\n" +
      "• Images are not AI-generated\n" +
      "• You're not within 100 meters of another report submission\n" +
      "• This submission will be verified before final approval\n\n" +
      "Are you sure you want to submit this report? Once submitted, it cannot be edited.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Submit",
          onPress: submitReport
        }
      ]
    );
  };

  const submitReport = async () => {
    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync("accessToken");
      const raw = JSON.stringify({
        "description": description,
        "severity": severity
      });
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        // setTimeout(() => router.push("../screens.login"), 1500);
        // return;
      }
      
      const response = await fetch(`${BackendUrl}/reports/submit/${draftId}/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                description,
                severity
            }),
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast("success", "Submitted", "Report submitted successfully. Waiting for Approval");
            setTimeout(() => {
              showToast("info", "🎉 5 Points Earned!", "You got 5 points for submitting a report! 🪙", "blue");
            }, 2000);
            setTimeout(() => router.back(), 3500);
        } else {
        showToast("error", "Error", result.message || "Failed to submit report");
        return;
      }
    } catch (error) {
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = () => {
    Alert.alert(
      "Delete Draft",
      "Are you sure you want to delete this draft? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteDraft
        }
      ]
    );
  };

  const deleteDraft = async () => {
    try {
      setSaving(true);
      const token = await SecureStore.getItemAsync("accessToken");
      
      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        // setTimeout(() => router.push("/screens/login"), 1500);
        // return;
      }

      const response = await fetch(`${BackendUrl}/reports/drafts/${draftId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        showToast("success", "Deleted", "Draft deleted successfully");
        setTimeout(() => router.back(),1500); // Navigate back to reports screen
      } else {
        const result = await response.json();
        showToast("error", "Error", result.message || "Failed to delete draft");
      }
    } catch (error) {
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-blue-600 mt-4 font-medium">Loading draft...</Text>
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

  if (!draft) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-white">
        <Text className="text-gray-700 text-center mb-4">Draft not found.</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = draft.createdAt ? format(new Date(draft.createdAt), "MMMM dd, yyyy 'at' h:mm a") : "";
  const latitude = draft.location?.coordinates ? draft.location.coordinates[1] : 0;
  const longitude = draft.location?.coordinates ? draft.location.coordinates[0] : 0;

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* <View className="flex-1 bg-white"> */}

      <ScrollView className="flex-1 bg-white"  keyboardShouldPersistTaps="always">
        {/* Header with "DRAFT" label */}
        <View className="w-full h-64 bg-gray-300 relative">
          <Image
            source={{ uri: draft.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-0 right-0 bg-blue-600 px-4 py-2 rounded-bl-lg">
            <Text className="text-white font-bold">DRAFT</Text>
          </View>
        </View>
        {/* Main Content */}
        <View className="p-4">
          {/* Title and Date */}
          <View className="mb-3">
            <Text className="text-2xl font-bold text-gray-900">
              Edit Draft Report
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500 ml-1">
                Created on {formattedDate}
              </Text>
            </View>
          </View>
          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </Text>
            <TextInput
              className="bg-blue-50 p-3 rounded-lg text-gray-700 border border-blue-200"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              placeholder="Describe the pollution issue..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {/* Severity */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Severity
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setSeverity("Low")}
                className={`flex-1 mr-2 py-3 rounded-lg items-center ${
                  severity === "Low" ? "bg-green-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    severity === "Low" ? "text-white" : "text-black"
                  }`}
                >
                  Low
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSeverity("Medium")}
                className={`flex-1 mx-1 py-3 rounded-lg items-center ${
                  severity === "Medium" ? "bg-yellow-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    severity === "Medium" ? "text-white" : "text-black"
                  }`}
                >
                  Medium
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSeverity("High")}
                className={`flex-1 ml-2 py-3 rounded-lg items-center ${
                  severity === "High" ? "bg-orange-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    severity === "High" ? "text-white" : "text-black"
                  }`}
                >
                  High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSeverity("Critical")}
                className={`flex-1 ml-2 py-3 rounded-lg items-center ${
                  severity === "Critical" ? "bg-red-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    severity === "Critical" ? "text-white" : "text-black"
                  }`}
                >
                  Critical
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Suggested Severity */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Suggested Severity
            </Text>
            <View className="bg-blue-50 p-3 rounded-lg">
              <Text className="text-gray-700">
                {draft.severitySuggestion || "Medium"}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              This is the AI-suggested severity based on the image analysis
            </Text>
          </View>
          {/* Location */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Location
            </Text>

            {draft.location?.coordinates ? (
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
                    title="Draft Report Location"
                    description={draft.description}
                    pinColor="#2563eb"
                  />
                </MapView>
              </View>
            ) : (
              <View className="bg-gray-100 h-48 rounded-lg justify-center items-center">
                <Text className="text-gray-500">
                  Location data not available
                </Text>
              </View>
            )}

            {draft.location?.coordinates && (
              <Text className="text-gray-500 mt-2 text-center">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </Text>
            )}
          </View>
          {/* Action Buttons */}
          <View className="mb-10">
            {/* Save Draft */}
            <TouchableOpacity
              onPress={handleUpdateDraft}
              disabled={saving}
              className="bg-blue-600 mb-3 py-3 rounded-lg items-center shadow-md"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold">Save Changes</Text>
              )}
            </TouchableOpacity>

            {/* Submit Report */}
            <TouchableOpacity
              onPress={handleSubmitReport}
              disabled={saving}
              className="bg-green-600 mb-3 py-3 rounded-lg items-center shadow-md"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              <Text className="text-white font-semibold">Submit Report</Text>
            </TouchableOpacity>

            {/* Delete Draft */}
            <TouchableOpacity
              onPress={handleDeleteDraft}
              disabled={saving}
              className="bg-white py-3 rounded-lg items-center border-2 border-red-500"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              <Text className="text-red-500 font-semibold">Delete Draft</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ToastComponent />
      {/* </View> */}
    </SafeAreaView>
  );
}