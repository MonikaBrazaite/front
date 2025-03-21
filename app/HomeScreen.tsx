import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>🏠 Welcome to Your Smart Home</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.push("/FavouritesScreen")}>
        <Text style={styles.buttonText}>View Favourites</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/ReviewsScreen")}>
        <Text style={styles.buttonText}>Customer Reviews</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#8A82E2",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default HomeScreen;
