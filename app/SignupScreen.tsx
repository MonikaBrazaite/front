import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (!username || !password || !confirmPassword) {
      alert("⚠ Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("⚠ Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://192.168.146.209:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Token received from signup:", data.token);
        await AsyncStorage.setItem('userToken', data.token);
        console.log("Token saved to AsyncStorage in SignupScreen");
        alert("✅ Account created successfully!");
        router.push("/LoginScreen");
      } else {
        console.log("Signup error:", data.message);
        alert(data.message || "⚠ Failed to create account.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("⚠ An error occurred during signup.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign Up</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#AEB4E8"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
        <Text style={styles.loginText}>Already have an account? Log In</Text>
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
  signupButton: {
    backgroundColor: "#FF007F",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    color: "#8A82E2",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
});

export default SignupScreen;