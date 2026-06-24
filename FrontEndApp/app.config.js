module.exports = {
  expo: {
    name: "ZelonTrip",
    slug: "zelontrip",
    scheme: "zelontrip",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    extra: {
      eas: {
        projectId: "2e00e830-61a1-4abc-84b8-8c56dc8c3780",
      },
      router: {},
    },
    splash: {
      image: "./assets/images/splash.png",
      backgroundColor: "#ffffff",
      statusBarStyle: "dark",
      statusBarTranslucent: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.zelon.zelontrip",
      userInterfaceStyle: "light",
      infoPlist: {
        LSApplicationQueriesSchemes: ["comgooglemaps"],
        NSLocationWhenInUseUsageDescription:
          "현재 위치를 기반으로 맞춤 여행 플랜을 추천하기 위해서는 위치 권한이 필요합니다.",
      },
    },
    android: {
      package: "com.zelon.zelontrip",
      googleServicesFile: "./google-services.json",
      userInterfaceStyle: "light",
      config: {
        googleMaps: {
          apiKey: "AIzaSyCa-PhoSYV5rJABHNGqinTL62I2i17vp00",
        },
      },
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },

      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router", "expo-secure-store"],
    experiments: {
      typedRoutes: true,
    },
    owner: "zelon",
  },
};
