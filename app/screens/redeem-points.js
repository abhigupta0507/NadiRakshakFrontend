import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Header from "../components/Header";
import StoreItemCard from "../components/StoreItemCard";
import OrderCard from "../components/OrderCard";
import { showToast } from "../components/Toast";
import { BackendUrl } from "../../secrets";
import { SafeAreaView } from "react-native-safe-area-context";


export default function PointsRedemptionScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("store"); // "store" or "orders"
  const [storeItems, setStoreItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  // State for the shipping address modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [address, setAddress] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
  });
  

  // This will be called when component mounts
  useEffect(() => {
    fetchData();
    // Try to load saved address if it exists
    loadSavedAddress();
  }, []);

  // Load saved address if available
  const loadSavedAddress = async () => {
    try {
      const savedAddress = await SecureStore.getItemAsync("shippingAddress");
      if (savedAddress) {
        setAddress(JSON.parse(savedAddress));
      }
    } catch (error) {
      console.error("Error loading saved address:", error);
    }
  };

  // Save address to secure storage
  const saveAddress = async (addressData) => {
    try {
      await SecureStore.setItemAsync(
        "shippingAddress",
        JSON.stringify(addressData)
      );
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

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
    // Fetch store items, orders, and user info with points
    await Promise.all([fetchStoreItems(), fetchOrders(), fetchUserInfo()]);
  };

  const fetchUserInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        router.push("/screens/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/auth/points`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setUserPoints(result.data.points || 0);
      } else {
        console.error("Error fetching user info:", result.message);
      }
    } catch (error) {
      console.error("Fetch User Info Error:", error);
    }
  };

  const fetchStoreItems = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        router.push("/screens/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/store/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setStoreItems(result.data.items || []);
      } else {
        setError(result.message || "Failed to fetch store items");
        showToast(
          "error",
          "Error",
          result.message || "Failed to fetch store items"
        );
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        router.push("/screens/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/store/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setOrders(result.data.orders || []);
      } else {
        console.error("Error fetching orders:", result.message);
      }
    } catch (error) {
      console.error("Fetch Orders Error:", error);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Initialize redemption process
  const handleInitiateRedeem = (item) => {
    if (userPoints < item.pointsCost) {
      showToast(
        "error",
        "Insufficient Points",
        "You don't have enough points to redeem this item."
      );
      return;
    }

    setSelectedItem(item);
    setModalVisible(true);
  };

  // Submit shipping address and place order
  const handleSubmitAddress = () => {
    // Validate address fields
    const requiredFields = [
      "fullName",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    const missingFields = requiredFields.filter((field) => !address[field]);

    if (missingFields.length > 0) {
      showToast(
        "error",
        "Missing Information",
        "Please fill in all required fields."
      );
      return;
    }

    // Close modal and show confirmation
    setModalVisible(false);

    // Save address for future use
    saveAddress(address);

    // Show confirmation dialog
    Alert.alert(
      "Confirm Order",
      `Are you sure you want to redeem ${selectedItem.name} for ${selectedItem.pointsCost} points?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () =>
            placeOrder(selectedItem._id, selectedItem.pointsCost, address),
        },
      ]
    );
  };

  // Place the order with backend
  const placeOrder = async (itemId, pointsCost, shippingAddress) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        router.push("/screens/login");
        return;
      }

      const response = await fetch(`${BackendUrl}/store/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [
            {
              item: itemId,
              quantity: 1,
            },
          ],
          shippingAddress: shippingAddress,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(
          "success",
          "Order Placed",
          "Your order has been placed successfully!"
        );
        // Update points with the actual remaining points from the server
        setUserPoints(result.data.pointsRemaining);
        fetchOrders();
        // Switch to orders tab to show the new order
        setActiveTab("orders");
      } else {
        showToast(
          "error",
          "Order Failed",
          result.message || "Failed to place order"
        );
      }
    } catch (error) {
      showToast("error", "Error", "Something went wrong. Please try again.");
    }
  };

  // Render tab bar
  const renderTabs = () => (
    <View className="flex-row mb-2 mx-4">
      <TouchableOpacity
        className={`flex-1 py-3 ${
          activeTab === "store"
            ? "border-b-2 border-blue-600"
            : "border-b border-gray-200"
        }`}
        onPress={() => setActiveTab("store")}
      >
        <Text
          className={`text-center font-medium ${
            activeTab === "store" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          Store
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`flex-1 py-3 ${
          activeTab === "orders"
            ? "border-b-2 border-blue-600"
            : "border-b border-gray-200"
        }`}
        onPress={() => setActiveTab("orders")}
      >
        <Text
          className={`text-center font-medium ${
            activeTab === "orders" ? "text-blue-600" : "text-gray-500"
          }`}
        >
          Your Orders
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render points balance
  const renderPointsBalance = () => (
    <View className="bg-blue-50 rounded-lg mx-4 mb-4 p-4 flex-row items-center justify-between">
      <View>
        <Text className="text-gray-600 text-sm">Available Points</Text>
        <Text className="text-blue-700 text-2xl font-bold">{userPoints}</Text>
      </View>
      <TouchableOpacity
        className="bg-blue-100 p-3 rounded-full"
        onPress={() => router.push("/screens/points-history")}
      >
        <Ionicons name="gift" size={24} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );

  // Render shipping address modal
  const renderAddressModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-5 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Shipping Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96" keyboardShouldPersistTaps="always">
              {/* Form Fields */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Full Name *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={address.fullName}
                  onChangeText={(text) =>
                    setAddress({ ...address, fullName: text })
                  }
                  placeholder="Enter your full name"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Street Address *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={address.streetAddress}
                  onChangeText={(text) =>
                    setAddress({ ...address, streetAddress: text })
                  }
                  placeholder="Enter your street address"
                />
              </View>

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-700 mb-1">City *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={address.city}
                    onChangeText={(text) =>
                      setAddress({ ...address, city: text })
                    }
                    placeholder="City"
                  />
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-gray-700 mb-1">State/Province *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={address.state}
                    onChangeText={(text) =>
                      setAddress({ ...address, state: text })
                    }
                    placeholder="State"
                  />
                </View>
              </View>

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-700 mb-1">Postal Code *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={address.postalCode}
                    onChangeText={(text) =>
                      setAddress({ ...address, postalCode: text })
                    }
                    placeholder="Postal code"
                    keyboardType="number-pad"
                  />
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-gray-700 mb-1">Country *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={address.country}
                    onChangeText={(text) =>
                      setAddress({ ...address, country: text })
                    }
                    placeholder="Country"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Phone Number</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={address.phoneNumber}
                  onChangeText={(text) =>
                    setAddress({ ...address, phoneNumber: text })
                  }
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg mt-4"
              onPress={handleSubmitAddress}
            >
              <Text className="text-white text-center font-medium">
                Continue to Order
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Render content based on active tab
  const renderContent = () => {
    const currentData = activeTab === "store" ? storeItems : orders;
    const emptyMessage =
      activeTab === "store"
        ? "No items available in store."
        : "No orders found.";

    if (loading && currentData.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-blue-600 mt-4 font-medium">
            Loading {activeTab === "store" ? "store items" : "orders"}...
          </Text>
        </View>
      );
    }

    if (error && activeTab === "store") {
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
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshing={loading}
        onRefresh={handleRefresh}
      >
        {activeTab === "store" ? (
          // Store items display
          <View className="flex-row flex-wrap justify-between px-4">
            {storeItems.map((item) => (
              <StoreItemCard
                key={item._id}
                _id={item._id}
                name={item.name}
                description={item.description}
                pointsCost={item.pointsCost}
                image={item.image}
                inStock={item.inStock}
                userPoints={userPoints}
                onRedeemPress={() => handleInitiateRedeem(item)}
              />
            ))}
          </View>
        ) : (
          // Orders display
          <View className="px-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                _id={order._id}
                items={order.items}
                status={order.status}
                trackingInfo={order.trackingInfo}
                pointsSpent={order.totalPointsCost}
                createdAt={order.createdAt}
                onPress={() => {}}
              />
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <Header
        title={"Redeem Points"}
        subtitle={"Exchange your points for exclusive rewards"}
      />

      {/* Points Balance */}
      {renderPointsBalance()}

      {/* Tab Navigation */}
      {renderTabs()}

      {/* Content Container */}
      <View className="flex-1">{renderContent()}</View>

      {/* Address Modal */}
      {renderAddressModal()}
    </SafeAreaView>
  );
}
