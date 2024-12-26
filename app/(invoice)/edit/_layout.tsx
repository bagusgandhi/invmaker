import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Disables the header for all screens
      }}
    />
  );
};

export default Layout;
