  // code 1
  
  import React, { useState, useEffect, useRef } from 'react';
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
    RefreshControl 
  } from 'react-native';
  import { StatusBar } from 'expo-status-bar';
  import { BlurView } from 'expo-blur';
  import { LinearGradient } from 'expo-linear-gradient';
  import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
  import * as Haptics from 'expo-haptics';
  import {BackendUrl} from "@/secrets";
  import * as SecureStore from "expo-secure-store";
  import { Linking } from 'react-native'; // Add this import
  import ToastComponent, {showToast}  from "@/app/components/Toast";
  import { useRouter } from 'expo-router';
  import { useCallback } from 'react';

  const { width, height } = Dimensions.get('window');

  const HomeScreen = () => {
    // State management
    const [activeStat, setActiveStat] = useState(0);
    const [activeTab, setActiveTab] = useState('home');
    const scrollY = new Animated.Value(0);
    const statAnimatedValue = useRef(new Animated.Value(0)).current;
    const [authToken, setAuthToken] = useState(null);
    const [newsData,setNewsData] = useState();
    const [refreshing, setRefreshing] = useState(false);
    // Animation references
    const tabBarAnimation = useRef(new Animated.Value(1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const router = useRouter();

    
    const headerTranslateY = scrollY.interpolate({
      inputRange: [0, 150, 250],  // Adjust input range for smoother effect
      outputRange: [0, -height * 0.2, -height * 0.3], // Moves header fully out of view
      extrapolate: 'clamp',
    });
    
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100, 200],  // Adjusted input range for better transition
      outputRange: [1, 0.5, 0],  // Fades out completely
      extrapolate: 'clamp',
    });
    

    const onRefresh = useCallback(() => {
      setRefreshing(true);
      fetchNews().then(() => {
        setRefreshing(false);
      });
    }, []);

    // Statistics data
    const statistics = [
      { 
        id: 1, 
        value: '80%', 
        description: 'of ocean pollution comes from land-based activities',
        icon: 'factory',
        color: '#0ea5e9' 
      },
      { 
        id: 2, 
        value: '8M', 
        description: 'tons of plastic enter our oceans every year',
        icon: 'trash-can-outline',
        color: '#f43f5e' 
      },
      { 
        id: 3, 
        value: '50%', 
        description: 'of the world\'s coral reefs have died in the last 30 years',
        icon: 'waves',
        color: '#f59e0b' 
      },
      { 
        id: 4, 
        value: '1B', 
        description: 'people lack access to clean drinking water globally',
        icon: 'water-outline',
        color: '#6366f1' 
      },
    ];

    // Government initiatives
    const initiatives = [
      {
        id: 1,
        title: 'Clean Water Act',
        description: 'Regulates the discharge of pollutants into water bodies',
        icon: 'bank',
        color: '#3b82f6',
        progress: 78,
      },
      {
        id: 2,
        title: 'Ocean Cleanup Fund',
        description: '$500M allocated for ocean cleanup technologies',
        icon: 'cash',
        color: '#10b981',
        progress: 42,
      },
      {
        id: 3,
        title: 'Water Quality Monitoring',
        description: 'Real-time monitoring of water bodies across the country',
        icon: 'chart-line',
        color: '#8b5cf6',
        progress: 91,
      },
    ];

    useEffect(() => {
      if (authToken) {
        fetchNews();
      }
    }, [authToken]);
    
    const fetchNews = async () => {
      const url = `${BackendUrl}/news`;
      try {
        const requestOptions = {
          method: "GET",
          redirect: "follow"
        };
        console.log("Fetching news from:", url);
        
        const response = await fetch(url, requestOptions);
        const result = await response.text();
        const data = JSON.parse(result);
        
        console.log("News data from API:", data);
        
        if (response.ok) {
          // Update this path based on your actual API response structure
          setNewsData(data.data?.news || data.news || data);
          console.log("News data set:", newsData);
        } else {
          showToast("error", "Error", data.message || "Failed to load News");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        showToast("error", "Error", "Failed to load News");
      }
    };
    
    // News articles
    const newsArticles = [
      {
        source: {
          id: null,
          name: "Policy News"
        },
        _id: "1",
        title: "New policies to reduce industrial water pollution",
        description: "Government announces stricter regulations for industrial wastewater treatment...",
        content: null,
        url: "https://placehold.co/600x300/0284c7/FFFFFF?text=Water+Policy",
        urlToImage: "https://placehold.co/600x300/0284c7/FFFFFF?text=Water+Policy",
        publishedAt: "2025-04-02T00:00:00.000Z",
        category: "Policy",
        __v: 0,
        createdAt: "2025-04-02T00:00:00.000Z",
        updatedAt: "2025-04-02T00:00:00.000Z"
      },
      {
        source: {
          id: null,
          name: "Technology News"
        },
        _id: "2",
        title: "Innovative filtration technology shows promising results",
        description: "Researchers develop new nanomaterial that can remove microplastics from water...",
        content: null,
        url: "https://placehold.co/600x300/0284c7/FFFFFF?text=Water+Tech",
        urlToImage: "https://placehold.co/600x300/0284c7/FFFFFF?text=Water+Tech",
        publishedAt: "2025-03-28T00:00:00.000Z",
        category: "Technology",
        __v: 0,
        createdAt: "2025-03-28T00:00:00.000Z",
        updatedAt: "2025-03-28T00:00:00.000Z"
      },
      {
        source: {
          id: null,
          name: "Community News"
        },
        _id: "3",
        title: "Community cleanup saves local river ecosystem",
        description: "Volunteers remove over 2 tons of garbage from the riverbank during weekend event...",
        content: null,
        url: "https://placehold.co/600x300/0284c7/FFFFFF?text=River+Cleanup",
        urlToImage: "https://placehold.co/600x300/0284c7/FFFFFF?text=River+Cleanup",
        publishedAt: "2025-03-23T00:00:00.000Z",
        category: "Community",
        __v: 0,
        createdAt: "2025-03-23T00:00:00.000Z",
        updatedAt: "2025-03-23T00:00:00.000Z"
      }
    ];

    // User action items
    const actionItems = [
      {
        id: 1,
        title: "Report Pollution",
        description: "Document and submit evidence of water pollution",
        icon: "camera",
        url: "./report",
        color: "#0ea5e9",
      },
      {
        id: 2,
        title: "Join Cleanup",
        description: "Find local cleanup events near you",
        icon: "hand-heart",
        url: "./campaign",
        color: "#10b981",
      },
      {
        id: 3,
        title: "Water Quality",
        description: "Check water quality in your area",
        icon: "water-check",
        url: "screens/rivers",
        color: "#8b5cf6",
      },
      {
        id: 4,
        title: "Contact Officials",
        description: "Voice your concerns to local representatives",
        icon: "comment-text-outline",
        color: "#f59e0b",
      },
    ];

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
      extrapolate: 'clamp',
    });

    const headerTitleOpacity = scrollY.interpolate({
      inputRange: [0, 150, 200],
      outputRange: [0, 0.7, 1],
      extrapolate: 'clamp',
    });

    const headerContentOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0],
      extrapolate: 'clamp',
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
      scrollY.addListener(({value}) => {
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
        scrollY.removeAllListeners();
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
        
        {/* Parallax Header */}
    <Animated.View 
      style={{ 
        transform: [{ translateY: headerTranslateY }],
        opacity: headerOpacity,
        position: 'absolute',
        zIndex: 10,
        width: '100%',
      }}
      className="h-64 overflow-hidden"
    >
      <Image 
        source={{ uri: 'https://placehold.co/600x400/0284c7/FFFFFF?text=Ocean+Water' }} 
        className="w-full h-full absolute"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-blue-900/50 p-6 justify-end">
        <Text className="text-white text-4xl font-bold mb-2">Save Our Waters</Text>
        <Text className="text-blue-100 text-lg">A global initiative for cleaner oceans</Text>
      </View>
    </Animated.View>
    
    {/* <View className="flex-1 bg-white"> */}
      <Animated.ScrollView
        className="flex-1 pt-5"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for header */}
        <View className="h-64" />
      
            {/* Main Content */}
            <View className="bg-white rounded-t-3xl -mt-8 pt-8 px-6 pb-32 shadow-xl">
      
              {/* Action Items */}
              <View className="mb-8">
                <Text className="text-gray-800 text-lg font-semibold mb-4">Quick Actions</Text>
                <FlatList
                  data={actionItems}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id.toString()}
                  contentContainerStyle={{ paddingRight: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="mr-4 p-4 rounded-xl  overflow-hidden" 
                      onPress={() => router.push(item.url)}
                      style={{ width: width * 0.38, backgroundColor: `${item.color}10` }}
                    >
                      <View className="w-12 h-12 rounded-full mb-3 items-center justify-center" style={{ backgroundColor: `${item.color}25` }}>
                        <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                      </View>
                      <Text className="text-gray-800 font-semibold mb-1">{item.title}</Text>
                      <Text className="text-gray-500 text-xs">{item.description}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
      
              {/* About NadiRakshak Section */}
              <View className="bg-gray-100 rounded-2xl p-6 mb-8">
                <Text className="text-blue-800 text-xl font-semibold mb-4">About NadiRakshak</Text>
                <Text className="text-gray-700 text-base mb-4">
                  NadiRakshak is a crowdsourced river pollution reporting app that empowers citizens to report pollution incidents in real time by submitting images, GPS locations, and severity levels. The app integrates government initiatives and offers historical insights into river conditions, helping drive community action for cleaner rivers.
                </Text>
                <TouchableOpacity className="bg-blue-600 p-3 rounded-xl items-center">
                  <Text className="text-white font-medium" onPress={() => router.push("/report")}>Report Pollution Now</Text>
                </TouchableOpacity>
              </View>
      
              {/* Statistics Cards */}
              <Text className="text-gray-800 text-lg font-semibold mb-4">Alarming Statistics</Text>
              <View className="mb-8">
                <FlatList
                  data={statistics}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  // snapToInterval={width + 80}
                  snapToAlignment="start"
                  decelerationRate="normal"
                  keyExtractor={item => item.id.toString()}
                  contentContainerStyle={{ paddingRight: 20 }}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => setActiveStat(index)}
                      className={`mr-4 p-6 rounded-2xl  w-64 border-l-4 ${index === activeStat ? 'border-opacity-100' : 'border-opacity-50'}`}
                      style={{
                        backgroundColor: index === activeStat ? `${item.color}15` : 'white',
                        borderLeftColor: item.color,
                      }}
                    >
                      <View className="mb-2">
                        <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                      </View>
                      <Text className="text-4xl font-bold mb-2" style={{ color: item.color }}>
                        {item.value}
                      </Text>
                      <Text className="text-gray-700 text-sm" style={{ opacity: 0.8 }}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
      
              {/* Water Quality Map Placeholder */}
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-800 text-lg font-semibold">Water Quality Map</Text>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-medium text-sm">View Full Map</Text>
                  </TouchableOpacity>
                </View>
                <View className="rounded-2xl overflow-hidden h-48 ring">
                  <Image
                    source={{ uri: 'https://placehold.co/600x400/0284c7/FFFFFF?text=Water+Quality+Map' }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/30 backdrop-blur-md">
                    <Text className="text-white font-semibold">3 Pollution Alerts Nearby</Text>
                    <Text className="text-white/80 text-xs">Tap to view details</Text>
                  </View>
                </View>
              </View>
      
              {/* Government Initiatives */}
              <Text className="text-gray-800 text-lg font-semibold mb-4">Government Initiatives</Text>
              <View className="space-y-4 mb-8">
                {initiatives.map((initiative) => (
                  <TouchableOpacity
                    key={initiative.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  >
                    <View className="flex-row items-center mb-1">
                      <View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${initiative.color}15` }}>
                        <MaterialCommunityIcons name={initiative.icon} size={22} color={initiative.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-semibold">{initiative.title}</Text>
                        <Text className="text-gray-500 text-xs">{initiative.description}</Text>
                      </View>
                    </View>
                    <View className="mt-2">
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-gray-500">Implementation Progress</Text>
                        <Text className="text-xs font-medium" style={{ color: initiative.color }}>{initiative.progress}%</Text>
                      </View>
                      {renderProgressBar(initiative.progress)}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {/* What You Can Do Section */}
              <View className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-6 mb-8 ring">
                <View className="flex-row items-center mb-4">
                  <MaterialCommunityIcons name="hand-heart" size={24} color="#059669" />
                  <Text className="text-emerald-800 text-lg font-semibold ml-2">What You Can Do</Text>
                </View>
      
                <View className="space-y-3 mb-5">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                      <MaterialCommunityIcons name="check" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-700">Reduce single-use plastics</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                      <MaterialCommunityIcons name="check" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-700">Participate in beach cleanups</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                      <MaterialCommunityIcons name="check" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-700">Conserve water at home</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-3">
                      <MaterialCommunityIcons name="check" size={14} color="#059669" />
                    </View>
                    <Text className="text-gray-700">Support water conservation policies</Text>
                  </View>
                </View>
      
                <TouchableOpacity
                  className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm"
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }} className="flex-row items-center">
                    <MaterialCommunityIcons name="account-group" size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Join Community Efforts</Text>
                  </Animated.View>
                </TouchableOpacity>
              </View>
      
              {/* News & Updates */}
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-800 text-lg font-semibold">Latest News</Text>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-medium text-sm">View All</Text>
                  </TouchableOpacity>
                </View>
                {(newsData || []).map((article)=> (
                  <TouchableOpacity
                    key={article._id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm mb-4 border border-gray-100"
                    onPress={() => Linking.openURL(article.url)} // Add this onPress handler
                  >
                    <Image
                      source={{ uri: article.urlToImage }}
                      className="w-full h-40"
                      resizeMode="cover"
                    />
                    <View className="flex-row items-center px-4 py-2">
                      <View className="px-2 py-1 rounded-md bg-blue-100 mr-2">
                        <Text className="text-blue-700 text-xs font-medium">{article.category}</Text>
                      </View>
                      <Text className="text-gray-500 text-xs mr-2">•</Text>
                      <Text className="text-gray-500 text-xs">{new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
                      <Text className="text-gray-500 text-xs mr-2 ml-auto">{}</Text>
                      <Text className="text-gray-500 text-xs">{article.source.name}</Text>
                    </View>
                    <View className="p-4 pt-0">
                      <Text className="text-gray-800 font-semibold text-lg mb-1">{article.title}</Text>
                      <Text className="text-gray-600 text-sm" numberOfLines={2}>{article.description}</Text>
                      <View className="flex-row items-center mt-3">
                        <Text className="text-blue-600 font-medium text-sm">Read Article</Text>
                        <Feather name="arrow-right" size={16} color="#2563eb" style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
                <View>
                  <TouchableOpacity
            onPress={() => router.push("screens/rivers")}
            className="bg-green-600 p-3 rounded-xl w-5/12 items-center shadow-md"
          ><Text>Rivers</Text></TouchableOpacity>
                </View>
              {/* Impact Stats */}
              <View className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 shadow-md">
                <Text className="text-white text-lg font-semibold mb-4">Your Impact</Text>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-white text-3xl font-bold">12</Text>
                    <Text className="text-blue-100 text-xs mt-1">Reports Filed</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-white text-3xl font-bold">4</Text>
                    <Text className="text-blue-100 text-xs mt-1">Cleanups Joined</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-white text-3xl font-bold">87</Text>
                    <Text className="text-blue-100 text-xs mt-1">Impact Score</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.ScrollView>
    {/* </View> */}
        <ToastComponent />
      </SafeAreaView>
    );
  };

  export default HomeScreen;