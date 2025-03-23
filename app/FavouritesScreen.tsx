import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const FavouritesScreen = () => {
  const router = useRouter();
  interface Favourite {
    PlanId: string;
    Title: string;
    Description: string;
  }
  
  const [favourites, setFavourites] = useState<Favourite[]>([]);

  useEffect(() => {
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        alert("⚠ Please login to view favorites.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.146.209:3000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFavourites(data);
      } else {
        alert(data.message || "⚠ Failed to load favorites.");
      }
    } catch (error) {
      console.error("Error loading favourites:", error);
      alert("⚠ An error occurred while loading favorites.");
    }
  };

  const removeFromFavourites = async (planId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        alert("⚠ Please login to remove from favorites.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch(`http://192.168.146.209:3000/api/favorites/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFavourites(favourites.filter((item) => item.PlanId !== planId));
        Alert.alert("Removed", "This plan has been removed from your favorites.");
      } else {
        alert(data.message || "⚠ Failed to remove from favorites.");
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      alert("⚠ An error occurred while removing from favorites.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⭐ Your Favourites</Text>

      {favourites.length === 0 ? (
        <Text style={styles.emptyText}>You have no saved plans.</Text>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item.PlanId}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.planName}>{item.Title}</Text>
              <Text style={styles.planDesc}>{item.Description}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromFavourites(item.PlanId)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F24",
    padding: 20,
  },
  heading: {
    color: "#E1E6F9",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1A1F3D",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  planName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  planDesc: {
    color: "#C3C8F2",
    fontSize: 14,
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: "#E05B5B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#AEB4E8",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default FavouritesScreen;