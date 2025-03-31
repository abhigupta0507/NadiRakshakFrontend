import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { BackendUrl } from "../../secrets";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        Alert.alert("Unauthorized", "Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setUser(result.data.profile);
        setFormData(result.data.profile);
      } else {
        Alert.alert("Error", result.message || "Failed to fetch profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Fetch Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        Alert.alert("Unauthorized", "Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully.");
        setUser(formData);
        setModalVisible(false);
      } else {
        Alert.alert("Error", result.message || "Failed to update profile.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Update Profile Error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-700 font-medium">Loading Profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-red-500">Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-6">
      {/* Profile Card */}
      <View className="bg-white p-6 rounded-xl shadow-md relative items-center">
        <MaterialIcons name="account-circle" size={80} color="#3b82f6" />
        <Text className="text-2xl font-bold mt-2 text-gray-800">{user.name}</Text>
        <Text className="text-gray-500">{user.email}</Text>
        {/* Edit Icon */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute top-4 right-4"
        >
          <MaterialIcons name="edit" size={22} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Details Section */}
      <View className="bg-white mt-4 p-6 rounded-xl shadow-md">
        <ProfileDetail label="Mobile Number" value={user.mobileNumber} />
        <ProfileDetail label="Age" value={user.age} />
        <ProfileDetail label="City" value={user.city} />
        <ProfileDetail label="State" value={user.state} />
        <ProfileDetail label="Member Since" value={new Date(user.memberSince).toLocaleDateString()} />
      </View>

      {/* Statistics Section */}
      <View className="bg-white mt-4 p-6 rounded-xl shadow-md">
        <Text className="text-xl font-bold mb-2 text-gray-800">Statistics</Text>
        <View className="flex-row justify-between">
          <StatCard label="Created" value={user.stats.totalCampaignsCreated} />
          <StatCard label="Joined" value={user.stats.totalCampaignsJoined} />
          <StatCard label="Participants" value={user.stats.totalParticipantsManaged} />
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black bg-opacity-50"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white p-6 rounded-xl w-11/12" onStartShouldSetResponder={() => true}>
            <Text className="text-xl font-bold mb-4 text-center">Edit Profile</Text>
            {["name", "mobileNumber", "age", "city", "state"].map((field) => (
              <View key={field} className="mb-4">
                <Text className="text-gray-600 capitalize">{field}</Text>
                <TextInput
                  className="border border-gray-300 p-3 rounded-md"
                  value={formData[field]?.toString()}
                  onChangeText={(text) =>
                    setFormData({ ...formData, [field]: text })
                  }
                />
              </View>
            ))}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-300 p-2 rounded-lg w-5/12 items-center"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={updateProfile}
                className="bg-blue-600 p-2 rounded-lg w-5/12 items-center"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const ProfileDetail = ({ label, value }) => (
  <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
    <Text className="text-gray-600">{label}</Text>
    <Text className="text-gray-800 font-medium">{value}</Text>
  </View>
);

const StatCard = ({ label, value }) => (
  <View className="flex-1 bg-gray-100 p-4 rounded-lg shadow-sm items-center mx-1">
    <Text className="text-lg font-bold text-blue-600">{value}</Text>
    <Text className="text-gray-600">{label}</Text>
  </View>
);
