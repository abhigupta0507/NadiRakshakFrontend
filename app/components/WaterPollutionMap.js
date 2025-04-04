import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { BackendUrl } from "../../secrets";

const WaterPollutionMap = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BackendUrl}/reports/accepted-locations`, {
        method: "GET",
        redirect: "follow",
      });

      const result = await response.json();

      if (result.success) {
        setLocations(result.locations);
      } else {
        setError("Failed to load locations");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching locations");
    } finally {
      setLoading(false);
    }
  };

  // Calculate initial region based on the available locations or use a default
  const getInitialRegion = () => {
    if (locations.length > 0) {
      // Use the first location as the center
      return {
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Default location (India)
    return {
      latitude: 25.2644959,
      longitude: 82.9847737,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    };
  };

  // Get pin color based on severity
  const getSeverityPinColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "#EF4444"; // Red
      case "High":
        return "#F97316"; // Orange
      case "Medium":
        return "#EAB308"; // Yellow
      case "Low":
        return "#22C55E"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  // Get severity text color class for legend
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "red-100";
      case "High":
        return "orange-100";
      case "Medium":
        return "yellow-100";
      case "Low":
        return "green-100";
      default:
        return "gray-100";
    }
  };

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-800 text-lg font-semibold">
          Water Pollution Map
        </Text>
      </View>

      <View className="rounded-2xl overflow-hidden h-80">
        {loading ? (
          <View className="w-full h-full bg-gray-200 items-center justify-center">
            <Text>Loading map...</Text>
          </View>
        ) : error ? (
          <View className="w-full h-full bg-gray-200 items-center justify-center">
            <Text className="text-red-500">{error}</Text>
          </View>
        ) : (
          <MapView
            style={{ width: "100%", height: "100%" }}
            initialRegion={getInitialRegion()}
          >
            {locations.map((location) => (
              <Marker
                key={location.id}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={`Severity: ${location.severity}`}
                description="Water pollution report"
                pinColor={getSeverityPinColor(location.severity)}
              />
            ))}
          </MapView>
        )}

        {/* Legend */}
        <View className="absolute top-2 right-2 bg-white/70 p-2 rounded">
          <Text className="text-xs font-semibold mb-1">Severity:</Text>
          <View className="flex-row items-center">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#EF4444",
                marginRight: 4,
              }}
            />
            <Text className="text-xs mr-2">Critical</Text>

            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#F97316",
                marginRight: 4,
              }}
            />
            <Text className="text-xs mr-2">High</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#EAB308",
                marginRight: 4,
              }}
            />
            <Text className="text-xs mr-2">Medium</Text>

            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#22C55E",
                marginRight: 4,
              }}
            />
            <Text className="text-xs">Low</Text>
          </View>
        </View>

        {/* 🔄 Refresh Button */}
        <TouchableOpacity
          onPress={fetchLocations}
          className="absolute bottom-2 right-2 bg-blue-600 px-3 py-2 rounded-full shadow"
        >
          <Text className="text-white text-sm font-medium">Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WaterPollutionMap;
