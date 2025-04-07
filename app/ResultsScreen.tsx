import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const popularCombos = [
  "Smart Lighting + Voice Assistant",
  "Security System + Energy Kit",
  "Health Monitor + Smart Kitchen",
];

const ResultsScreen = () => {
  const router = useRouter();

  interface Plan {
    PlanId: string;
    Title: string;
    Description: string;
    Rating: number;
    VoiceAssistants?: string;
  }

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [recommendedPlans, setRecommendedPlans] = useState<Plan[]>([]);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [showAllPlans]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setError("⚠ Please login to view recommendations.");
        router.push("/LoginScreen");
        return;
      }

      const queryParams = new URLSearchParams();
      if (showAllPlans) queryParams.append("showAll", "true");

      const response = await fetch(
        `http://192.168.146.209:3000/api/recommendations?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setRecommendedPlans(data);
      } else if (response.status === 403) {
        await AsyncStorage.removeItem("userToken");
        setError("⚠ Your session has expired. Please login again.");
        router.push("/LoginScreen");
      } else {
        setError(data.message || "⚠ Failed to fetch recommendations.");
      }
    } catch (error) {
      console.error("Fetch recommendations error:", error);
      setError("⚠ An error occurred while fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const addToFavourites = async (plan: Plan) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("⚠ Please login to add to favorites.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch("http://192.168.146.209:3000/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: plan.PlanId }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Saved!", "This plan has been added to your favorites.");
      } else {
        Alert.alert("Error", data.message || "Failed to add to favorites.");
      }
    } catch (error) {
      console.error("Error saving to favorites:", error);
      Alert.alert("Error", "An error occurred while adding to favorites.");
    }
  };

  const selectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const viewPDFReport = () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Please select a plan to view the PDF report.");
      return;
    }
    router.push({
      pathname: "/PDFPreviewScreen",
      params: {
        selectedPlan: JSON.stringify(selectedPlan),
      },
    });
  };

  const handleGoBackToSurvey = () => {
    Alert.alert(
      "Go Back to Survey",
      "You will be taken back to the survey to view or edit your previous answers. Do you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            router.push("/SurveyScreen");
          },
        },
      ]
    );
  };

  const renderPlanItem = ({ item }: { item: Plan }) => {
    if (!item || !item.PlanId) {
      console.warn("Invalid plan item:", item);
      return null;
    }

    return (
      <View style={styles.planContainer}>
        <Text style={styles.planTitle}>{item.Title}</Text>
        <Text style={styles.planDescription}>{item.Description}</Text>
        <Text style={styles.rating}>⭐ {item.Rating.toFixed(1)} / 5</Text>
        {item.VoiceAssistants && (
          <Text style={styles.voiceAssistants}>
            🗣️ Works with: {item.VoiceAssistants}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.selectPlanButton,
            selectedPlan?.PlanId === item.PlanId && styles.selectedPlanButton,
          ]}
          onPress={() => selectPlan(item)}
        >
          <Text style={styles.selectPlanButtonText}>
            {selectedPlan?.PlanId === item.PlanId
              ? "Plan Selected ✅"
              : "Select This Plan"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favButton}
          onPress={() => addToFavourites(item)}
        >
          <Text style={styles.favButtonText}>Save to Favorites ⭐</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Recommended Smart Home Plans</Text>

            {loading && <Text style={styles.loadingText}>Loading recommendations...</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              onPress={handleGoBackToSurvey}
              style={styles.goBackButton}
            >
              <Text style={styles.goBackButtonText}>Go Back to Survey</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAllPlans(!showAllPlans)}
              style={[styles.toggleButton, showAllPlans && styles.toggleButtonActive]}
            >
              <Text style={styles.toggleButtonText}>
                {showAllPlans ? "Show Recommended Plans" : "Show All Plans"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.subheading}>🔥 Popular Picks</Text>
            <View style={styles.popularContainer}>
              {popularCombos.map((combo, index) => (
                <View key={index} style={styles.popularCard}>
                  <Text style={styles.popularText}>{combo}</Text>
                </View>
              ))}
            </View>

            {recommendedPlans.length === 0 && !loading && !error && (
              <Text style={styles.emptyText}>
                {showAllPlans
                  ? "No plans available."
                  : "No recommendations match your survey responses. Try showing all plans or retaking the survey."}
              </Text>
            )}
          </>
        }
        data={recommendedPlans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.PlanId}
        ListFooterComponent={
          <>
            {recommendedPlans.length > 0 && (
              <TouchableOpacity
                style={styles.authButton}
                onPress={viewPDFReport}
              >
                <Text style={styles.authButtonText}>📄 View PDF Report</Text>
              </TouchableOpacity>
            )}
            {recommendedPlans.length === 0 && !showAllPlans && !loading && !error && (
              <TouchableOpacity
                style={styles.goBackButton}
                onPress={handleGoBackToSurvey}
              >
                <Text style={styles.goBackButtonText}>Retake Survey 📋</Text>
              </TouchableOpacity>
            )}
          </>
        }
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0A0F24" },
  scrollContent: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  heading: {
    fontSize: 24,
    color: "#E1E6F9",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  goBackButton: {
    backgroundColor: "#3A437E",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  goBackButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleButton: {
    backgroundColor: "#1A1F3D",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  toggleButtonActive: {
    backgroundColor: "#6B8BFF",
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  planContainer: {
    backgroundColor: "#1A1F3D",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#8A82E2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  planTitle: { fontSize: 20, color: "#C0C6FF", fontWeight: "bold" },
  planDescription: { color: "#AEB4E8", marginBottom: 6 },
  rating: { color: "#FFD700", fontSize: 14 },
  voiceAssistants: { color: "#AEB4E8", fontSize: 14 },
  selectPlanButton: {
    backgroundColor: "#8A82E2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  selectedPlanButton: {
    backgroundColor: "#6B8BFF",
  },
  selectPlanButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  favButton: {
    backgroundColor: "#3A437E",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  favButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 18,
    color: "#C0C6FF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  popularContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  popularCard: {
    backgroundColor: "#1A1F3D",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: "48%",
  },
  popularText: {
    color: "#AEB4E8",
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    color: "#AEB4E8",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  authButton: {
    backgroundColor: "#8A82E2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  authButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    color: "#AEB4E8",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  errorText: {
    color: "#E05B5B",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default ResultsScreen;