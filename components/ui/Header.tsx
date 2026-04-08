import { Link, router } from "expo-router";
import React, { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <View className="flex-row justify-between items-center bg-white p-4 shadow">
      <Link href="/" asChild>
        <Pressable>
          <Text className="text-2xl font-bold text-pink-600">SBeauty</Text>
        </Pressable>
      </Link>

      <View className="flex-row space-x-4">
        <Link href="/" asChild>
          <Pressable>
            <Text className="text-base text-gray-700">Inicio</Text>
          </Pressable>
        </Link>

        <Link href="/search" asChild>
          <Pressable>
            <Text className="text-base text-gray-700">Buscar</Text>
          </Pressable>
        </Link>

        {user ? (
          <>
            <Link href="/profile" asChild>
              <Pressable>
                <Text className="text-base text-gray-700">{user.nombre}</Text>
              </Pressable>
            </Link>

            <Pressable onPress={handleLogout}>
              <Text className="text-base text-red-500">Salir</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Link href="/auth/login" asChild>
              <Pressable>
                <Text className="text-base text-gray-700">Ingresar</Text>
              </Pressable>
            </Link>
            <Link href="/auth/register" asChild>
              <Pressable>
                <Text className="text-base text-gray-700">Registrarse</Text>
              </Pressable>
            </Link>
          </>
        )}
      </View>
    </View>
  );
}
