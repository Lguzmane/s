// app/(tabs)/_layout.tsx
import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export const unstable_settings = { anchor: "(tabs)" };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#14B8A6",
        tabBarInactiveTintColor: "rgba(255,255,255,0.75)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: "#1E1240",
          borderTopWidth: 0,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.14,
          shadowRadius: 12,
          elevation: 14,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />

      <Tabs.Screen
        name="home/index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search/index"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart/index"
        options={{
          title: "Carro",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="shopping-cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account/index"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="account/inbox/index" options={{ href: null }} />
      <Tabs.Screen name="account/inbox/[id]" options={{ href: null }} />
      <Tabs.Screen name="account/notifications/index" options={{ href: null }} />
      <Tabs.Screen name="account/payments/index" options={{ href: null }} />
      <Tabs.Screen name="account/portfolio/index" options={{ href: null }} />
      <Tabs.Screen name="account/profile/index" options={{ href: null }} />
      <Tabs.Screen name="account/settings/index" options={{ href: null }} />
      <Tabs.Screen name="account/favorites/index" options={{ href: null }} />
      <Tabs.Screen name="account/history/index" options={{ href: null }} />
      <Tabs.Screen name="account/history-pro/index" options={{ href: null }} />
      <Tabs.Screen name="account/profile/create-service" options={{ href: null }} />
      <Tabs.Screen name="account/profile/favorites" options={{ href: null }} />
      <Tabs.Screen name="account/profile/myservices" options={{ href: null }} />
      <Tabs.Screen name="account/profile/portfolio" options={{ href: null }} />
      <Tabs.Screen name="account/profile/requests" options={{ href: null }} />
      <Tabs.Screen name="account/profile/schedule" options={{ href: null }} />

      {/* nuevas */}
      <Tabs.Screen name="booking/index" options={{ href: null }} />
      <Tabs.Screen name="booking/confirmation" options={{ href: null }} />
      <Tabs.Screen name="service/[id]" options={{ href: null }} />
      <Tabs.Screen name="cart/checkout/index" options={{ href: null }} />

      {/* viejas, por si aún existen */}
      <Tabs.Screen name="home/booking/index" options={{ href: null }} />
      <Tabs.Screen name="home/booking/confirmation" options={{ href: null }} />
      <Tabs.Screen name="home/service/[id]" options={{ href: null }} />
    </Tabs>
  );
}