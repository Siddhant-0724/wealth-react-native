import { Redirect, Slot } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function Layout() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return null;
  }
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return <Slot screenOptions={{ headerShown: false }} />;
}
