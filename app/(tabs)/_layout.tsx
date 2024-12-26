import { Redirect, Tabs, useRouter } from "expo-router";
import { Dimensions, Platform, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Octicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from ".";
import InvoiceScreen from "./invoice";
import CreateInvoiceScreen from "../(invoice)/create";

const width = Dimensions.get("window").width;
const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/auth" />;
  }

  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
    return <Redirect href="/auth/complete-your-account" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bottom Tab Navigator */}
      <Tab.Navigator
        screenOptions={({ route }: any) => ({
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "#ddd", // Set inactive color to gray
          headerShown: false,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
              paddingTop: 10, // Adjust this value as needed
              backgroundColor: "white",
              display: route.name === 'Create' ? 'none' : 'flex',
            },
            default: {
              paddingTop: 10, // Add padding for other platforms
              backgroundColor: "white",
              display: route.name === 'Create' ? 'none' : 'flex',
            },
          }),
        })}
      >
        {/* Home */}
        <Tab.Screen
          name="Home"
          options={{
            title: "Home",
            animation: 'shift',
            tabBarIcon: ({ color }) => (
              <Octicons name="home" color={color} size={width * 0.06} />
            ),
          }}
          component={HomeScreen}
        />

        {/* Invoice */}
        <Tab.Screen
          name="Invoice"
          options={{
            title: "Invoice",
            animation: 'shift',
            tabBarIcon: ({ color }) => (
              <Octicons size={width * 0.06} name="project" color={color} />
            ),
          }}
          component={InvoiceScreen}
        />
      </Tab.Navigator>

      {/* Central Plus Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 40, // Adjust as needed
          left: '50%',
          transform: [{ translateX: -25 }], // Center horizontally
          backgroundColor: 'black', // Customize color
          borderRadius: 50,
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          // Handle plus button press (e.g., navigate to CreateInvoiceScreen)
          // navigation.navigate('Create'); // Assuming you have navigation access
          router.push('/(invoice)/create')
        }}
      >
        <Octicons name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}