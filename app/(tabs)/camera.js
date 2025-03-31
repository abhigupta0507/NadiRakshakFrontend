import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
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
        "Capture Failed",
        error.message.includes("location")
          ? "Failed to get location. Ensure location services are enabled."
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (cameraPermission.status !== "granted" || locationPermission.status !== "granted") {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>
          {cameraPermission.status !== "granted" && locationPermission.status !== "granted"
            ? "Camera and location access are required"
            : cameraPermission.status !== "granted"
            ? "Camera access is required"
            : "Location access is required"}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            if (cameraPermission.status !== "granted") await requestCameraPermission();
            if (locationPermission.status !== "granted") {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationPermission({ status });
            }
          }}
          style={styles.permissionButton}
        >
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleRetake}>
              <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
              <Text style={styles.iconText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={sendReport}>
              <Ionicons name="cloud-upload-outline" size={30} color="#fff" />
              <Text style={styles.iconText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
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
              <View style={styles.cameraLoadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.cameraLoadingText}>Initializing camera...</Text>
              </View>
            )}
          </CameraView>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setCameraDirection(cameraDirection === "back" ? "front" : "back")}
            >
              <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={cameraStatus !== "ready" || isCapturing}
            >
              <View style={[
                styles.captureInnerCircle,
                (cameraStatus !== "ready" || isCapturing) && styles.disabledCircle
              ]}>
                {(cameraStatus !== "ready" || isCapturing) && (
                  <ActivityIndicator size="small" color="#fff" />
                )}
              </View>
              {(cameraStatus !== "ready" || isCapturing) && (
                <Text style={styles.processingText}>
                  {cameraStatus !== "ready" ? "Camera not ready" : "Processing..."}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isSending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Sending Report...</Text>
        </View>
      )}
      <ToastComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 30,
    alignItems: 'center',
  },
  captureButton: {
    alignSelf: 'center',
    backgroundColor: "#fff",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  captureInnerCircle: {
    backgroundColor: "#FF3B30",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledCircle: {
    backgroundColor: "#555",
  },
  flipButton: {
    position: 'absolute',
    right: 40,
    bottom: 45,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
  previewButtons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-around",
    width: "80%",
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  iconText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cameraLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraLoadingText: {
    color: '#fff',
    marginTop: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  processingText: {
    position: 'absolute',
    bottom: -25,
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
});