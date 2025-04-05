import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BackendUrl } from "@/secrets";
import * as SecureStore from "expo-secure-store";
import { Linking } from "react-native";
import ToastComponent, { showToast } from "@/app/components/Toast";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import WaterPollutionMap from "@/app/components/WaterPollutionMap";
import actionItems from "@/assets/index-data/ActionItems";
import initiatives from "@/assets/index-data/Initiatives";
import statistics from "@/assets/index-data/Statistics";
import IndexCard from "@/app/components/IndexCard";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  // State management
  const [activeStat, setActiveStat] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const scrollY = useRef(new Animated.Value(0)).current;
  const statAnimatedValue = useRef(new Animated.Value(0)).current;
  const [authToken, setAuthToken] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Animation references
  const tabBarAnimation = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150, 250],
    outputRange: [0, -height * 0.2, -height * 0.3],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews().then(() => {
      setRefreshing(false);
    });
  }, []);

  // Get auth token from secure store
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (token) {
          setAuthToken(token);
        }
        // Fetch news regardless of auth token status
        fetchNews();
      } catch (error) {
        // Still try to fetch news even if getting the token fails
        fetchNews();
      }
    };

    getAuthToken();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    const url = `${BackendUrl}/news`;
    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow",
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : {},
      };

      const response = await fetch(url, requestOptions);
      const result = await response.text();
      const data = JSON.parse(result);


      if (response.ok) {
        // Improved data handling
        let newsItems = [];
        if (data.data && data.data.news) {
          newsItems = data.data.news;
        } else if (data.news) {
          newsItems = data.news;
        } else if (Array.isArray(data)) {
          newsItems = data;
        }

        if (newsItems.length > 0) {
          setNewsData(newsItems);
        } else {
          // If the API returns an empty array, use fallback data
          setNewsData(newsArticles);
        }
      } else {
        showToast("error", "Error", data.message || "Failed to load News");
        // Fallback to default news data
        setNewsData(newsArticles);
      }
    } catch (error) {
      showToast("error", "Error", "Failed to load News");
      // Fallback to default news data
      setNewsData(newsArticles);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-rotate statistics with animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Animate out
      Animated.timing(statAnimatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setActiveStat((prevStat) => (prevStat + 1) % statistics.length);
        // Reset and animate in
        statAnimatedValue.setValue(0);
        Animated.timing(statAnimatedValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Animation values for header effects
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [height * 0.45, height * 0.15],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });

  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Animation for statistics
  const statOpacity = statAnimatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const statTranslateY = statAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  // Button press animation
  const onPressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(buttonScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Show/hide tab bar on scroll
  useEffect(() => {
    const scrollListener = scrollY.addListener(({ value }) => {
      if (value > 50) {
        Animated.timing(tabBarAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(tabBarAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => {
      scrollY.removeListener(scrollListener);
    };
  }, []);

  // Progress bar renderer
  const renderProgressBar = (progress) => {
    return (
      <View className="h-1 bg-gray-200 rounded-full w-full mt-2">
        <View
          className="h-1 bg-blue-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <StatusBar style="dark" />

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // Changed to false for better compatibility
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Parallax Header */}
        <View className="h-64 overflow-hidden">
          <Image
            source={{
              uri: "https://placehold.co/600x400/0284c7/FFFFFF?text=Ocean+Water",
            }}
            className="w-full h-full absolute"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-blue-900/50 p-6 justify-end">
            <Text className="text-white text-4xl font-bold mb-2">
              Save Our Waters
            </Text>
            <Text className="text-blue-100 text-lg">
              A global initiative for cleaner oceans
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="bg-white rounded-t-3xl -mt-4 pt-8 px-6 pb-32 shadow-xl">
          {/* Action Items */}
          <View className="mb-8">
            <Text className="text-gray-800 text-lg font-semibold mb-4">
              Quick Actions
            </Text>
            <FlatList
              data={actionItems}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingRight: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="mr-4 p-4 rounded-xl overflow-hidden"
                  style={{
                    width: width * 0.38,
                    backgroundColor: `${item.color}10`,
                  }}
                  onPress={() => {
                    router.push(`${item.to}`);
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-full mb-3 items-center justify-center"
                    style={{ backgroundColor: `${item.color}25` }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <Text className="text-gray-800 font-semibold mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* About NadiRakshak Section */}
          <IndexCard
            title={"About NadiRakshak"}
            description={`NadiRakshak is a crowdsourced river pollution reporting app that empowers citizens to report pollution incidents in real time by submitting images, GPS locations, and severity levels. The app integrates government initiatives and offers historical insights into river conditions, helping drive community action for cleaner rivers.`}
            routeName={`Report Pollution Now`}
            route={`/report`}
          />

          {/* Statistics Cards */}
          <Text className="text-gray-800 text-lg font-semibold mb-4">
            Alarming Statistics
          </Text>
          <View className="mb-8">
            <FlatList
              data={statistics}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              decelerationRate="normal"
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingRight: 20 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => setActiveStat(index)}
                  className={`mr-4 p-6 rounded-2xl w-64 border-l-4 ${
                    index === activeStat
                      ? "border-opacity-100"
                      : "border-opacity-50"
                  }`}
                  style={{
                    backgroundColor:
                      index === activeStat ? `${item.color}15` : "white",
                    borderLeftColor: item.color,
                  }}
                >
                  <View className="mb-2">
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={28}
                      color={item.color}
                    />
                  </View>
                  <Text
                    className="text-4xl font-bold mb-2"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    className="text-gray-700 text-sm"
                    style={{ opacity: 0.8 }}
                  >
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Water Quality Map Placeholder */}
          <WaterPollutionMap />
          <IndexCard
            title={"Track River Health"}
            description={`Explore the current condition of major Indian rivers with live updates on water temperature and oxygen levels. This section helps you stay informed about river health and encourages awareness towards preserving our water bodies.`}
            routeName={`Learn More`}
            route={`/screens/rivers`}
          />

          {/* Government Initiatives */}
          <Text className="text-gray-800 text-lg font-semibold mb-4">
            Government Initiatives
          </Text>
          <View className="space-y-4 mb-8">
            {initiatives.map((initiative) => (
              <TouchableOpacity
                key={initiative.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <View className="flex-row items-center mb-1">
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: `${initiative.color}15` }}
                  >
                    <MaterialCommunityIcons
                      name={initiative.icon}
                      size={22}
                      color={initiative.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">
                      {initiative.title}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {initiative.description}
                    </Text>
                  </View>
                </View>
                <View className="mt-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-gray-500">
                      Implementation Progress
                    </Text>
                    <Text
                      className="text-xs font-medium"
                      style={{ color: initiative.color }}
                    >
                      {initiative.progress}%
                    </Text>
                  </View>
                  {renderProgressBar(initiative.progress)}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* What You Can Do Section */}
          <View className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-6 mb-8">
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons
                name="hand-heart"
                size={24}
                color="#059669"
              />
              <Text className="text-emerald-800 text-lg font-semibold ml-2">
                What You Can Do
              </Text>
            </View>

            <View className="space-y-3 mb-5">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color="#059669"
                  />
                </View>
                <Text className="text-gray-700">
                  Reduce single-use plastics
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color="#059669"
                  />
                </View>
                <Text className="text-gray-700">
                  Participate in beach cleanups
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color="#059669"
                  />
                </View>
                <Text className="text-gray-700">Conserve water at home</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color="#059669"
                  />
                </View>
                <Text className="text-gray-700">
                  Support water conservation policies
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm"
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => {
                router.push(`/campaign`);
              }}
            >
              <Animated.View
                style={{ transform: [{ scale: buttonScale }] }}
                className="flex-row items-center"
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color="white"
                />
                <Text className="text-white font-medium ml-2">
                  Join Community Efforts
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* News & Updates */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 text-lg font-semibold">
                Latest News
              </Text>
              <TouchableOpacity></TouchableOpacity>
            </View>
            {isLoading ? (
              <View className="items-center justify-center p-8">
                <Text className="text-gray-500">Loading news...</Text>
              </View>
            ) : newsData && newsData.length > 0 ? (
              newsData.map((article) => (
                <TouchableOpacity
                  key={article._id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm mb-4 border border-gray-100"
                  onPress={() => Linking.openURL(article.url)}
                >
                  <Image
                    source={{ uri: article.urlToImage }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <View className="flex-row items-center px-4 py-2">
                    <View className="px-2 py-1 rounded-md bg-blue-100 mr-2">
                      <Text className="text-blue-700 text-xs font-medium">
                        {article.category}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-xs mr-2">•</Text>
                    <Text className="text-gray-500 text-xs">
                      {new Date(article.publishedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Text>
                    <Text className="text-gray-500 text-xs mr-2 ml-auto">
                      {}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {article.source.name}
                    </Text>
                  </View>
                  <View className="p-4 pt-0">
                    <Text className="text-gray-800 font-semibold text-lg mb-1">
                      {article.title}
                    </Text>
                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                      {article.description}
                    </Text>
                    <View className="flex-row items-center mt-3">
                      <Text className="text-blue-600 font-medium text-sm">
                        Read Article
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={16}
                        color="#2563eb"
                        style={{ marginLeft: 4 }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center justify-center p-8">
                <Text className="text-gray-500">
                  No news articles available
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <ToastComponent />
    </SafeAreaView>
  );
};

export default HomeScreen;
