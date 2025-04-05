import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { LineChart } from "react-native-chart-kit";
import ToastComponent, { showToast } from "../components/Toast";
import { BackendUrl } from "../../secrets";

export default function StationDetailsScreen() {
  const { riverId, stationCode } = useLocalSearchParams();
  const [stationData, setStationData] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [parameterData, setParameterData] = useState({});
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const screenWidth = Dimensions.get("window").width - 32; // 16px padding on each side

  useEffect(() => {
    fetchStationData();
  }, [riverId, stationCode]);

  const fetchStationData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        setTimeout(() => router.push("/screens/login"), 1500);
        return;
      }

      const response = await fetch(
        `${BackendUrl}/rivers/${riverId}/stations/${stationCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setStationData({
          riverName: result.data.riverName,
          stationName: result.data.stationName,
          stationCode: result.data.stationCode,
          stateName: result.data.stateName,
        });
        setParameters(result.data.parameters);
        setParameterData(result.data.parameterData);

        // Set the first parameter as selected by default
        if (result.data.parameters && result.data.parameters.length > 0) {
          setSelectedParameter(result.data.parameters[0]);
        }
      } else {
        setError(result.message || "Failed to fetch station data");
        showToast(
          "error",
          "Error",
          result.message || "Failed to fetch station data"
        );
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleParameterPress = (parameter) => {
    setSelectedParameter(parameter);
  };

  const renderChart = () => {
    if (!selectedParameter || !parameterData[selectedParameter]) return null;

    const data = parameterData[selectedParameter];

    // Prepare data for min values
    const minData = {
      labels: data.map((item) => item.year),
      datasets: [
        {
          data: data.map((item) => item.min || 0),
          color: (opacity = 1) => `rgba(38, 115, 219, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Minimum Value"],
    };

    // Prepare data for max values
    const maxData = {
      labels: data.map((item) => item.year),
      datasets: [
        {
          data: data.map((item) => item.max || 0),
          color: (opacity = 1) => `rgba(219, 68, 55, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Maximum Value"],
    };

    const chartConfig = {
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
      },
    };

    return (
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          {selectedParameter}
        </Text>

        {/* Min Values Chart */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 font-medium mb-2">Minimum Values</Text>
          <LineChart
            data={minData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Max Values Chart */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-gray-800 font-medium mb-2">Maximum Values</Text>
          <LineChart
            data={maxData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(219, 68, 55, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-blue-600 mt-4 font-medium">
          Loading station data...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-white">
        <Ionicons name="alert-circle-outline" size={50} color="#ef4444" />
        <Text className="text-red-500 text-center my-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchStationData}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            {stationData?.stationName}
          </Text>
          <Text className="text-gray-600">{stationData?.riverName}</Text>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1">
              {stationData?.stateName} - {stationData?.stationCode}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          Water Quality Parameters
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {parameters.map((parameter) => (
            <TouchableOpacity
              key={parameter}
              onPress={() => handleParameterPress(parameter)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedParameter === parameter ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedParameter === parameter
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {parameter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 p-4">{renderChart()}</ScrollView>

      <ToastComponent />
    </SafeAreaView>
  );
}
