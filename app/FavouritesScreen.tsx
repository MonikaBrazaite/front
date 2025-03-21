import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavouriteItem {
  id: string;
  title: string;
  description: string;
}

const FavouritesScreen = () => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);

  // ✅ Load favorites from AsyncStorage
  useEffect(() => {
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    try {
      const storedFavourites = await AsyncStorage.getItem("favourites");
      if (storedFavourites) {
        setFavourites(JSON.parse(storedFavourites));
      }
    } catch (error) {
      console.error("Error loading favourites:", error);
    }
  };

  // ✅ Save updated favorites to AsyncStorage
  const saveFavourites = async (newFavourites: FavouriteItem[]) => {
    try {
      await AsyncStorage.setItem("favourites", JSON.stringify(newFavourites));
    } catch (error) {
      console.error("Error saving favourites:", error);
    }
  };

  // ✅ Remove from favorites
  const removeFromFavourites = (id: string) => {
    const updatedFavourites = favourites.filter((item) => item.id !== id);
    setFavourites(updatedFavourites);
    saveFavourites(updatedFavourites);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⭐ Your Favourites</Text>

      {favourites.length === 0 ? (
        <Text style={styles.emptyText}>You have no saved plans.</Text>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.planName}>{item.title}</Text>
              <Text style={styles.planDesc}>{item.description}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromFavourites(item.id)}
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
    marginTop: 60, // 👈 Add this line
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
