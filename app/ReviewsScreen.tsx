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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const ReviewsScreen = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<
    { ReviewId: number; Username: string; Rating: number; Comment: string }[]
  >([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<{ PlanId: string; Title: string }[]>([]);

  useEffect(() => {
    loadReviews();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found, redirecting to login");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch(
        "http://192.168.146.209:3000/api/recommendations?showAll=true",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPlans(data);
      } else if (response.status === 403) {
        await AsyncStorage.removeItem("userToken");
        console.error("Session expired, redirecting to login");
        router.push("/LoginScreen");
      } else {
        console.error("Failed to fetch plans:", data.message);
        Alert.alert("Error", data.message || "Failed to fetch plans.");
      }
    } catch (error) {
      console.error("Fetch plans error:", error);
      Alert.alert("Error", "An error occurred while fetching plans.");
    }
  };

  const loadReviews = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("No token found, redirecting to login");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch("http://192.168.146.209:3000/api/reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      } else if (response.status === 403) {
        await AsyncStorage.removeItem("userToken");
        console.error("Session expired, redirecting to login");
        router.push("/LoginScreen");
      } else {
        console.error("Failed to load reviews:", data.message);
        Alert.alert("Error", data.message || "Failed to load reviews.");
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
      Alert.alert("Error", "An error occurred while loading reviews.");
    }
  };

  const submitReview = async () => {
    if (!comment || !rating || !selectedPlanId) {
      Alert.alert("Error", "Please fill all fields and select a plan.");
      return;
    }
    if (comment.length > 150) {
      Alert.alert("Error", "Review is too long. Max 150 characters.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("⚠ Please login to submit a review.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch("http://192.168.146.209:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Review submitted successfully!");
        setComment("");
        setRating(0);
        setSelectedPlanId(null);
        loadReviews();
      } else if (response.status === 403) {
        await AsyncStorage.removeItem("userToken");
        Alert.alert("Error", "Your session has expired. Please login again.");
        router.push("/LoginScreen");
      } else {
        Alert.alert("Error", data.message || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      Alert.alert("Error", "An error occurred while submitting the review.");
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("⚠ Please login to delete a review.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch(
        `http://192.168.146.209:3000/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setReviews(reviews.filter((review) => review.ReviewId !== reviewId));
        Alert.alert("Success", "Review deleted successfully!");
      } else if (response.status === 403) {
        await AsyncStorage.removeItem("userToken");
        Alert.alert("Error", "Your session has expired. Please login again.");
        router.push("/LoginScreen");
      } else {
        Alert.alert("Error", data.message || "Failed to delete review.");
      }
    } catch (error) {
      console.error("Delete review error:", error);
      Alert.alert("Error", "An error occurred while deleting the review.");
    }
  };

  const renderReview = ({
    item,
  }: {
    item: { ReviewId: number; Username: string; Rating: number; Comment: string };
  }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.username}>{item.Username}</Text>
      <Text style={styles.rating}>⭐ {item.Rating} / 5</Text>
      <Text style={styles.comment}>{item.Comment}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteReview(item.ReviewId)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlanOption = ({
    item,
  }: {
    item: { PlanId: string; Title: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.planOption,
        selectedPlanId === item.PlanId && styles.selectedPlanOption,
      ]}
      onPress={() => setSelectedPlanId(item.PlanId)}
    >
      <Text style={styles.planOptionText}>{item.Title}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.heading}>Reviews</Text>

      <Text style={styles.subheading}>Select a Plan to Review</Text>
      <FlatList
        data={plans}
        renderItem={renderPlanOption}
        keyExtractor={(item) => item.PlanId}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.planList}
      />

      <Text style={styles.subheading}>Rate the Plan (1-5)</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Text style={rating >= star ? styles.starFilled : styles.starEmpty}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subheading}>Write Your Review</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your review here (max 150 characters)"
        placeholderTextColor="#AEB4E8"
        value={comment}
        onChangeText={setComment}
        maxLength={150}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>

      <Text style={styles.subheading}>All Reviews</Text>
      {reviews.length === 0 ? (
        <Text style={styles.noReviewsText}>No reviews yet.</Text>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.ReviewId.toString()}
          style={styles.reviewsList}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F24",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    color: "#E1E6F9",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    color: "#C0C6FF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  planList: {
    marginBottom: 20,
  },
  planOption: {
    backgroundColor: "#1A1F3D",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedPlanOption: {
    backgroundColor: "#6B8BFF",
  },
  planOptionText: {
    color: "#E1E6F9",
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  starButton: {
    marginHorizontal: 5,
  },
  starFilled: {
    fontSize: 24,
    color: "#FFD700",
  },
  starEmpty: {
    fontSize: 24,
    color: "#AEB4E8",
  },
  input: {
    backgroundColor: "#1A1F3D",
    color: "#E1E6F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#8A82E2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewsList: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: "#1A1F3D",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    color: "#E1E6F9",
    fontWeight: "bold",
  },
  rating: {
    fontSize: 14,
    color: "#FFD700",
    marginVertical: 5,
  },
  comment: {
    fontSize: 14,
    color: "#AEB4E8",
  },
  deleteButton: {
    backgroundColor: "#E05B5B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  noReviewsText: {
    color: "#AEB4E8",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default ReviewsScreen;