import React, { useState, useEffect, useRef } from "react";
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
  const [cameraDirection, setCameraDirection] = useState("back");
  const [photoUri, setPhotoUri] = useState(null);
  const [photoLocation, setPhotoLocation] = useState(null); // New state for location
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false); // Loading state for sending report

  const cameraRef = useRef(null);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      if (!permission || permission.status !== "granted") {
        await requestPermission();
      }
    })();
  }, []);

  // Clear photoUri and photoLocation whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      setPhotoUri(null);
      setPhotoLocation(null);
    }, [])
  );

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (permission.status !== "granted") {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Camera access is required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo.uri);
        // Fetch and store location when the picture is taken
        const location = await Location.getCurrentPositionAsync({});
        setPhotoLocation(location);
        showToast("success", "Photo Captured", "Your photo has been taken successfully!");
      } catch (error) {
        showToast("error", "Capture Failed", "Failed to take picture.");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const sendReport = async () => {
    if (!photoUri) {
      showToast("error", "Error", "No photo captured");
      return;
    }
    if (!photoLocation) {
      showToast("error", "Error", "Location not captured");
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
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        showToast("success", "Success", "Report sent successfully!");
        router.push("/home");
      } else {
        const data = await response.json();
        showToast("error", "Error", data.message || "Failed to send report.");
      }
    } catch (error) {
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => { setPhotoUri(null); setPhotoLocation(null); }}>
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
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraDirection}
          autoFocus="on"
          resizeMode="cover"
          onCameraReady={() => setIsCameraReady(true)}
        >
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={!isCameraReady || isCapturing}
          >
            <View style={styles.captureInnerCircle} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() =>
              setCameraDirection(cameraDirection === "back" ? "front" : "back")
            }
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </CameraView>
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
  camera: {
    flex: 1,
  },
  captureButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#fff",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  captureInnerCircle: {
    backgroundColor: "#FF3B30",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  flipButton: {
    position: "absolute",
    bottom: 45,
    right: 40,
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
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});
