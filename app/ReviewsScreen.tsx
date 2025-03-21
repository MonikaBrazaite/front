import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // For navigation

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
}

const ReviewsScreen = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0); // Default rating is 0 (unselected)

  useEffect(() => {
    loadReviews();
  }, []);

  // Load saved reviews from AsyncStorage
  const loadReviews = async () => {
    try {
      const savedReviews = await AsyncStorage.getItem("reviews");
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  // Save reviews to AsyncStorage
  const saveReviews = async (updatedReviews: Review[]) => {
    try {
      await AsyncStorage.setItem("reviews", JSON.stringify(updatedReviews));
    } catch (error) {
      console.error("Failed to save reviews:", error);
    }
  };

  // Submit a new review
  const submitReview = async () => {
    if (username.trim() === "" || comment.trim() === "") {
      Alert.alert("Error", "Username and review cannot be empty.");
      return;
    }
    if (comment.length > 150) {
      Alert.alert("Error", "Review is too long. Max 150 characters.");
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(), // Unique ID
      username,
      rating,
      comment,
    };

    const updatedReviews = [newReview, ...reviews]; // Add new review to the top
    setReviews(updatedReviews);
    saveReviews(updatedReviews); // Persist data

    // Reset input fields
    setUsername("");
    setComment("");
    setRating(0);
  };

  // Delete a review
  const deleteReview = async (id: string) => {
    const updatedReviews = reviews.filter((review) => review.id !== id);
    setReviews(updatedReviews);
    saveReviews(updatedReviews);
  };

  const renderItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <TouchableOpacity onPress={() => deleteReview(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>❌</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.rating}>⭐ {item.rating}/5</Text>
      <Text style={styles.comment}>"{item.comment}"</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.heading}>⭐ Customer Reviews</Text>

          {/* Review Input Section */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#C3C8F2"
              value={username}
              onChangeText={setUsername}
              returnKeyType="done"
            />
            <TextInput
              style={[styles.input, styles.reviewInput]}
              placeholder="Write your review..."
              placeholderTextColor="#C3C8F2"
              value={comment}
              onChangeText={setComment}
              maxLength={150}
              returnKeyType="done"
              multiline
            />

            {/* Star Rating Selection */}
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity key={num} onPress={() => setRating(num)}>
                  <Text style={[styles.star, rating >= num ? styles.selectedStar : styles.unselectedStar]}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          {/* ✅ "Go Back to Home" Button */}
          <TouchableOpacity style={styles.goBackButton} onPress={() => router.push("/HomeScreen")}>
            <Text style={styles.goBackButtonText}>⬅ Go Back to Home</Text>
          </TouchableOpacity>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F24",
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  heading: {
    color: "#E1E6F9",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 60, // Push header down
  },
  list: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#1A1F3D",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    color: "#E05B5B",
    fontSize: 20,
  },
  rating: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
  comment: {
    color: "#C3C8F2",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#1A1F3D",
    borderRadius: 12,
  },
  input: {
    backgroundColor: "#252A49",
    color: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  star: {
    fontSize: 30,
    marginHorizontal: 5,
  },
  selectedStar: {
    color: "#FFD700", // Yellow when selected
  },
  unselectedStar: {
    color: "#888", // Gray when not selected
  },
  submitButton: {
    backgroundColor: "#8A82E2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  goBackButton: {
    backgroundColor: "#3A437E",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  goBackButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReviewsScreen;
