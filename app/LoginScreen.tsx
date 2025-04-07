import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("⚠ Please enter your credentials.");
      return;
    }

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
        console.log("Token received from login:", data.token);
        await AsyncStorage.setItem('userToken', data.token);
        console.log("Token saved to AsyncStorage in LoginScreen");
        router.push("/HomeScreen");
      } else {
        console.log("Login error:", data.message);
        alert(data.message || "⚠ Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("⚠ An error occurred during login.");
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
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        placeholderTextColor="#AEB4E8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/SignupScreen")}>
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