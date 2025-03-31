import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = () => {
  const [activeStat, setActiveStat] = useState(0);
  const scrollY = new Animated.Value(0);
  const { width } = Dimensions.get('window');

  // Statistics to display in the rotating carousel
  const statistics = [
    { id: 1, value: '80%', description: 'of ocean pollution comes from land-based activities' },
    { id: 2, value: '8M', description: 'tons of plastic enter our oceans every year' },
    { id: 3, value: '50%', description: 'of the world\'s coral reefs have died in the last 30 years' },
    { id: 4, value: '1B', description: 'people lack access to clean drinking water globally' },
  ];

  // Government initiatives
  const initiatives = [
    {
      id: 1,
      title: 'Clean Water Act',
      description: 'Regulates the discharge of pollutants into water bodies',
      icon: '🏛️',
    },
    {
      id: 2,
      title: 'Ocean Cleanup Fund',
      description: '$500M allocated for ocean cleanup technologies',
      icon: '💰',
    },
    {
      id: 3,
      title: 'Water Quality Monitoring',
      description: 'Real-time monitoring of water bodies across the country',
      icon: '📊',
    },
  ];

  // Auto-rotate statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStat((prevStat) => (prevStat + 1) % statistics.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Parallax header effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

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
      
      <Animated.ScrollView 
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for header */}
        <View className="h-64" />
        
        {/* Main Content */}
        <View className="bg-white rounded-t-3xl -mt-8 pt-8 px-6 pb-20 shadow-lg">
          
          {/* About NadiRakshak Section */}
          <View className="bg-gray-100 rounded-2xl p-6 mb-8">
            <Text className="text-blue-800 text-xl font-semibold mb-4">About NadiRakshak</Text>
            <Text className="text-gray-700 text-base mb-4">
              NadiRakshak is a crowdsourced river pollution reporting app that empowers citizens to report pollution incidents in real time by submitting images, GPS locations, and severity levels. The app integrates government initiatives and offers historical insights into river conditions, helping drive community action for cleaner rivers.
            </Text>
            <TouchableOpacity className="bg-blue-600 p-3 rounded-xl items-center">
              <Text className="text-white font-medium">Report Pollution Now</Text>
            </TouchableOpacity>
          </View>
          
          {/* Statistics Carousel */}
          <View className="py-6 mb-6">
            <Text className="text-blue-800 text-xl font-semibold mb-4">Alarming Statistics</Text>
            <View className="bg-blue-700 rounded-2xl p-6 shadow-md">
              <Animated.View className="items-center">
                <Text className="text-5xl font-bold text-white mb-2">
                  {statistics[activeStat].value}
                </Text>
                <Text className="text-center text-blue-100 text-lg">
                  {statistics[activeStat].description}
                </Text>
              </Animated.View>
              
              {/* Indicator dots */}
              <View className="flex-row justify-center mt-4 space-x-2">
                {statistics.map((_, index) => (
                  <View 
                    key={index} 
                    className={`h-2 w-2 rounded-full ${index === activeStat ? 'bg-white' : 'bg-blue-300'}`}
                  />
                ))}
              </View>
            </View>
          </View>
          
          {/* Government Initiatives */}
          <Text className="text-blue-800 text-xl font-semibold mb-4">Government Initiatives</Text>
          <View className="space-y-4 mb-8">
            {initiatives.map((initiative) => (
              <TouchableOpacity 
                key={initiative.id}
                className="bg-white rounded-xl p-4 flex-row items-center border border-blue-100 shadow-sm"
              >
                <Text className="text-4xl mr-4">{initiative.icon}</Text>
                <View className="flex-1">
                  <Text className="text-blue-900 font-semibold text-lg">{initiative.title}</Text>
                  <Text className="text-gray-600">{initiative.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* What You Can Do Section */}
          <View className="bg-emerald-50 rounded-2xl p-6 mb-8">
            <Text className="text-emerald-800 text-xl font-semibold mb-4">What You Can Do</Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-gray-700">Reduce single-use plastics</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-gray-700">Participate in beach cleanups</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-gray-700">Conserve water at home</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-gray-700">Support water conservation policies</Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-emerald-600 p-3 rounded-xl mt-6 items-center">
              <Text className="text-white font-medium">Get Involved Today</Text>
            </TouchableOpacity>
          </View>
          
          {/* News & Updates */}
          <Text className="text-blue-800 text-xl font-semibold mb-4">Latest News</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="pb-4"
          >
            {[1, 2, 3].map((item) => (
              <TouchableOpacity 
                key={item}
                className="mr-4 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                style={{ width: width * 0.7 }}
              >
                <Image 
                  source={{ uri: `https://placehold.co/600x300/0284c7/FFFFFF?text=News+${item}` }} 
                  className="w-full h-32"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <Text className="text-xs text-blue-600 font-medium mb-1">March 15, 2025</Text>
                  <Text className="text-gray-800 font-semibold mb-2">New policies to reduce industrial water pollution</Text>
                  <Text className="text-gray-600 text-sm" numberOfLines={2}>
                    Government announces stricter regulations for industrial wastewater treatment...
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;
