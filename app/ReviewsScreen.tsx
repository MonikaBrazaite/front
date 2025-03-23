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
import { useRouter } from "expo-router";

const ReviewsScreen = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<{ ReviewId: number; Username: string; Rating: number; Comment: string }[]>([]);
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [plans, setPlans] = useState<{ PlanId: number; Title: string }[]>([]);

  useEffect(() => {
    loadReviews();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://192.168.1.100:3000/api/recommendations');
      const data = await response.json();
      if (response.ok) {
        setPlans(data);
      } else {
        console.error("Failed to fetch plans:", data.message);
      }
    } catch (error) {
      console.error("Fetch plans error:", error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch('http://192.168.1.100:3000/api/reviews');
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      } else {
        console.error("Failed to load reviews:", data.message);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  const submitReview = async () => {
    if (!username || !comment || !rating || !selectedPlanId) {
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
        alert("⚠ Please login to submit a review.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.1.100:3000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        setUsername("");
        setComment("");
        setRating(0);
        setSelectedPlanId(null);
        loadReviews(); // Yorumları yeniden yükle
      } else {
        Alert.alert("Error", data.message || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      Alert.alert("Error", "An error occurred while submitting the review.");
    }
  };

  const deleteReview = async (reviewId: number) => {
    // Kullanıcı yalnızca kendi yorumlarını silebilir - backend'de kontrol edilecek
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`http://192.168.1.100:3000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReviews(reviews.filter((review) => review.ReviewId !== reviewId));
        Alert.alert("Success", "Review deleted successfully!");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Failed to delete review.");
      }
    } catch (error) {
      console.error("Delete review error:", error);
      Alert.alert("Error", "An error occurred while deleting the review.");
    }
  };

  const renderItem = ({ item }: { item: { ReviewId: number; Username: string; Rating: number; Comment: string } }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.username}>{item.Username}</Text>
        <TouchableOpacity onPress={() => deleteReview(item.ReviewId)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>❌</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.rating}>⭐ {item.Rating}/5</Text>
      <Text style={styles.comment}>"{item.Comment}"</Text>
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

          {/* Plan Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.sectionHeading}>Select a Plan to Review</Text>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.PlanId}
                onPress={() => setSelectedPlanId(plan.PlanId)}
                style={[
                  styles.planButton,
                  selectedPlanId === plan.PlanId && styles.planButtonActive,
                ]}
              >
                <Text style={styles.planButtonText}>{plan.Title}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
            keyExtractor={(item) => item.ReviewId.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          {/* Go Back to Home Button */}
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
    marginTop: 60,
  },
  sectionHeading: {
    color: "#E1E6F9",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
  planButton: {
    backgroundColor: "#252A49",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  planButtonActive: {
    backgroundColor: "#8A82E2",
  },
  planButtonText: {
    color: "#FFF",
    fontWeight: "bold",
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
    color: "#FFD700",
  },
  unselectedStar: {
    color: "#888",
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