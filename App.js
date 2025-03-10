import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import IngresosScreen from "./screens/IngresosScreen";
import EgresosScreen from "./screens/EgresosScreen";
import DeudasScreen from "./screens/./Deudas/DeudasScreen";
import IngresoEgresos from "./screens/IngresoEgresos";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitle: "Estado Financiero", // 🔥 Título único para todas las pantallas
          headerStyle: { backgroundColor: "#0039a2" }, // Color del encabezado
          headerTitleStyle: { color: "white", fontSize: 20, fontWeight: "bold" }, // Estilo del título
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Inicio") iconName = focused ? "home" : "home-outline";
            if (route.name === "Ingresos") iconName = focused ? "cash" : "cash-outline";
            if (route.name === "Egresos") iconName = focused ? "card" : "card-outline";
            if (route.name === "Deudas") iconName = focused ? "file-tray" : "file-tray-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { backgroundColor: "#0039a2" },
        })}
      >
        {/* <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Ingresos" component={IngresosScreen} />*/
        <Tab.Screen name="Egresos" component={IngresoEgresos} /> }
        <Tab.Screen name="Deudas" component={DeudasScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
