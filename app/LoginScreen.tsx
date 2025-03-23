import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu

  // Token kontrolü: Kullanıcı zaten giriş yapmışsa HomeScreen'e yönlendir
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Token varsa, kullanıcıyı HomeScreen'e yönlendir
          router.replace('/HomeScreen');
        }
      } catch (error) {
        console.error('Error checking token:', error);
        Alert.alert("Error", "⚠ An error occurred while checking authentication.");
      }
    };

    checkToken();
  }, [router]);

  const handleLogin = async () => {
    // Alanların dolu olup olmadığını kontrol et
    if (!username || !password) {
      Alert.alert("Error", "⚠ Please enter your credentials.");
      return;
    }

    setIsLoading(true); // Yükleme başlıyor

    try {
      const response = await fetch('http://192.168.146.209:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Token'ı AsyncStorage'a kaydet
        await AsyncStorage.setItem('userToken', data.token);
        router.push("/HomeScreen"); // Giriş sonrası HomeScreen'e yönlendir
      } else {
        Alert.alert("Error", data.message || "⚠ Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "⚠ An error occurred during login.");
    } finally {
      setIsLoading(false); // Yükleme bitti
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Username"
        placeholderTextColor="#AEB4E8"
        value={username}
        onChangeText={setUsername}
        editable={!isLoading} // Yükleme sırasında giriş alanlarını devre dışı bırak
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        placeholderTextColor="#AEB4E8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/SignupScreen")} disabled={isLoading}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F24",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    color: "#E1E6F9",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#1A1F3D",
    color: "#FFF",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  loginButton: {
    backgroundColor: "#8A82E2",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#8A82E280", // Yükleme sırasında butonun rengini soluk yap
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupText: {
    color: "#8A82E2",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
});

export default LoginScreen;