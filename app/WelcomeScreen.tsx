import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>👋 Welcome to Smart Home</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/SignupScreen")}>
        <Text style={styles.buttonText}>Go to Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F24",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  welcome: {
    color: "#E1E6F9",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#8A82E2",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
