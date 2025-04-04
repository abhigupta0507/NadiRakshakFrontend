import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect } from "expo-router";
import { BackendUrl } from "../../secrets";
import ToastComponent, { showToast } from "../components/Toast";

export default function CameraScreen() {
  // State management
  const [cameraDirection, setCameraDirection] = useState("back");
  const [photoUri, setPhotoUri] = useState(null);
  const [photoLocation, setPhotoLocation] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("loading"); // 'loading', 'ready', 'error'

  // Refs and hooks
  const cameraRef = useRef(null);
  const readyTimeoutRef = useRef(null);
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState(null);

  // Permission handling
  useEffect(() => {
    (async () => {
      try {
        if (!cameraPermission || cameraPermission.status !== "granted") {
          await requestCameraPermission();
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission({ status });
      } catch (error) {
        console.error("Permission error:", error);
        setCameraStatus("error");
      }
    })();

    return () => {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
    };
  }, []);

  // Reset on focus
  useFocusEffect(
    useCallback(() => {
      setPhotoUri(null);
      setPhotoLocation(null);
      return () => {
        if (readyTimeoutRef.current) {
          clearTimeout(readyTimeoutRef.current);
        }
      };
    }, [])
  );

  // Camera ready handler
  const handleCameraReady = useCallback(() => {
    readyTimeoutRef.current = setTimeout(() => {
      setCameraStatus("ready");
    }, 50); // Small delay to ensure stability
  }, []);

  // Take picture function
  const takePicture = async () => {
    if (cameraStatus !== "ready" || isCapturing || !cameraRef.current) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true, // Faster capture
      });
      setPhotoUri(photo.uri);

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        throw new Error("Location services are disabled.");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPhotoLocation(location);
      showToast("success", "Photo Captured", "Your photo has been taken successfully!");
    } catch (error) {
      console.error("Capture Error:", error);
      showToast(
        "error",
        // "Failed",
        error.message.includes("Location")
          ? "Ensure location services are enabled."
          : "Failed to take picture."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle retake
  const handleRetake = useCallback(() => {
    setPhotoUri(null);
    setPhotoLocation(null);
    setCameraStatus("loading");
    if (cameraRef.current) {
      readyTimeoutRef.current = setTimeout(() => {
        setCameraStatus("ready");
      }, 100);
    }
  }, []);

  // Send report function
  const sendReport = async () => {
    if (!photoUri || !photoLocation) {
      showToast("error", "Error", !photoUri ? "No photo captured" : "Location not captured");
      return;
    }

    setIsSending(true);
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        showToast("error", "Unauthorized", "User not authenticated");
        return;
      }

      const formData = new FormData();
      formData.append("image", {
        uri: photoUri,
        type: "image/jpeg",
        name: "photo.jpg",
      });
      formData.append("latitude", photoLocation.coords.latitude);
      formData.append("longitude", photoLocation.coords.longitude);

      const response = await fetch(`${BackendUrl}/reports/drafts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        showToast("success", "Success", "Report sent successfully!");
        router.push("/report");
      } else {
        const data = await response.json();
        showToast("error", "Error", data.message || "Failed to send report.");
      }
    } catch (error) {
      console.error("Send Report Error:", error);
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Permission checks
  if (!cameraPermission || !locationPermission) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-base mt-2.5">Checking permissions...</Text>
      </View>
    );
  }

  if (cameraPermission.status !== "granted" || locationPermission.status !== "granted") {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text className="text-lg text-[#FF3B30] text-center my-5">
          {cameraPermission.status !== "granted" && locationPermission.status !== "granted"
            ? "Camera and location access are required"
            : cameraPermission.status !== "granted"
            ? "Camera access is required"
            : "Location access is required"}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            // Attempt to request again
            const camPerm = cameraPermission.status !== "granted" && await requestCameraPermission();
            const locPerm =
              locationPermission.status !== "granted" &&
              (await Location.requestForegroundPermissionsAsync());
          
            // If still not granted, open settings
            if (
              (camPerm && camPerm.status === "denied") ||
              (locPerm && locPerm.status === "denied")
            ) {
              showToast("info", "Manual Permission Required", "Opening device settings...");
              Linking.openSettings();
            }
          
            if (locPerm?.status) {
              setLocationPermission({ status: locPerm.status });
            }
          }}
          
          className="bg-[#007AFF] py-2.5 px-5 rounded-lg"
        >
          <Text className="text-white text-base font-bold">Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {photoUri ? (
        <View className="flex-1 bg-black justify-center items-center p-5">
          <Image source={{ uri: photoUri }} className="w-[90%] h-[70%] rounded-lg" />
          <View className="flex-row mt-5 justify-around w-[80%]">
            <TouchableOpacity 
              className="items-center justify-center bg-[#007AFF] py-2.5 px-5 rounded-lg"
              onPress={handleRetake}
            >
              <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
              <Text className="text-white text-sm mt-1.5">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="items-center justify-center bg-[#007AFF] py-2.5 px-5 rounded-lg"
              onPress={sendReport}
            >
              <Ionicons name="cloud-upload-outline" size={30} color="#fff" />
              <Text className="text-white text-sm mt-1.5">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1 relative">
          {/* Use style prop for CameraView instead of className */}
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraDirection}
            autoFocus="on"
            resizeMode="cover"
            onCameraReady={handleCameraReady}
            onMountError={() => setCameraStatus("error")}
          >
            {cameraStatus === "loading" && (
              <View className="absolute inset-0 justify-center items-center bg-black/30">
                <ActivityIndicator size="large" color="#fff" />
                <Text className="text-white mt-2.5">Initializing camera...</Text>
              </View>
            )}
          </CameraView>

          <View className="absolute bottom-0 w-full pb-8 items-center">
            <TouchableOpacity
              className="absolute right-10 bottom-[45px] bg-black/60 p-2 rounded-full"
              onPress={() => setCameraDirection(cameraDirection === "back" ? "front" : "back")}
            >
              <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              className="self-center bg-white w-[70px] h-[70px] rounded-full items-center justify-center mb-2.5"
              onPress={takePicture}
              disabled={cameraStatus !== "ready" || isCapturing}
            >
              <View className={`w-[50px] h-[50px] rounded-full justify-center items-center ${
                (cameraStatus !== "ready" || isCapturing) ? "bg-gray-500" : "bg-[#FF3B30]"
              }`}>
                {(cameraStatus !== "ready" || isCapturing) && (
                  <ActivityIndicator size="small" color="#fff" />
                )}
              </View>
              {(cameraStatus !== "ready" || isCapturing) && (
                <Text className="absolute bottom-[-25px] text-white text-xs text-center w-full">
                  {cameraStatus !== "ready" ? "Camera not ready" : "Processing..."}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isSending && (
        <View className="absolute inset-0 bg-black/60 justify-center items-center z-10">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-2.5 text-base">Sending Report...</Text>
        </View>
      )}
      <ToastComponent />
    </View>
  );
}

// Use StyleSheet for the camera component specifically
const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
