import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function Layout() {
  return (
    <Tabs
  screenOptions={{
    tabBarStyle: {
      backgroundColor: "#FFFFFF",
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
      height: 60,
      paddingTop: 10,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      shadowOffset: { width: 0, height: -2 },
      shadowRadius: 2,
      marginBottom: -3,
      backdropFilter: "blur(10px)",
    },
    tabBarLabelStyle: {
      fontSize: 10,
      marginBottom: 2,
    },
    headerShown: false,
    tabBarPressColor: "transparent", // disables Android ripple
    tabBarActiveBackgroundColor: "transparent", // disables active background on iOS
  }}
>
      <Tabs.Screen
        name="index"
        options={({ focused }) => ({
          title: "Home",
          tabBarLabel: focused ? "Home" : "",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        })}
      />
      <Tabs.Screen
        name="report"
        options={({ focused }) => ({
          title: "Report",
          tabBarLabel: focused ? "Report" : "",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={size}
              color={color}
            />
          ),
        })}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarLabel: "", // No label for camera tab
          tabBarIcon: ({ focused, size }) => (
            <View 
              className=""
            >
              <Ionicons
                name={focused ? "camera" : "camera-outline"}
                size={25}
                color="black"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="campaign"
        options={({ focused }) => ({
          title: "Campaign",
          tabBarLabel: focused ? "Campaign" : "",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "megaphone" : "megaphone-outline"}
              size={size}
              color={color}
            />
          ),
        })}
      />
      <Tabs.Screen
        name="profile"
        options={({ focused }) => ({
          title: "Profile",
          tabBarLabel: focused ? "Profile" : "",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        })}
      />
    </Tabs>
  );
}