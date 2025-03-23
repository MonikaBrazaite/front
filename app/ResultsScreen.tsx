import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<string>("");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSurveyStatus();
    fetchRecommendations();
  }, [selectedCategory, selectedTags, sortBy, minRating, showAllPlans]);

  const checkSurveyStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("⚠ Please login to view your survey status.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.146.209:3000/api/survey/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setIsSurveyCompleted(data.isSurveyCompleted);
      } else {
        Alert.alert("Error", data.message || "⚠ Failed to check survey status.");
      }
    } catch (error) {
      console.error("Check survey status error:", error);
      Alert.alert("Error", "⚠ An error occurred while checking survey status.");
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("Token retrieved in ResultsScreen:", token);
      if (!token) {
        setError("⚠ Please login to view recommendations.");
        router.push("/LoginScreen");
        return;
      }

      let queryParams = new URLSearchParams();
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedTags.length > 0) queryParams.append("tags", selectedTags.join(","));
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (minRating) queryParams.append("minRating", minRating);
      if (showAllPlans) queryParams.append("showAll", "true");

      const response = await fetch(`http://192.168.146.209:3000/api/recommendations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendedPlans(data);
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
        alert("⚠ Please login to add to favorites.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.146.209:3000/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
    router.push({
      pathname: "/PDFPreviewScreen",
      params: {
        recommendedPlans: JSON.stringify(recommendedPlans),
      },
    });
  };

  const finishSurvey = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("⚠ Please login to finish the survey.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.146.209:3000/api/survey/finish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setIsSurveyCompleted(true);
        Alert.alert("Survey Finished", "Your survey has been completed. You can now view your recommendations.");
        router.push("/HomeScreen");
      } else {
        Alert.alert("Error", data.message || "⚠ Failed to finish survey.");
      }
    } catch (error) {
      console.error("Finish survey error:", error);
      Alert.alert("Error", "⚠ An error occurred while finishing the survey.");
    }
  };

  const filteredPlans = recommendedPlans;
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (sortBy === "rating") {
      return b.Rating - a.Rating;
    } else if (sortBy === "compatibility") {
      return (b.VoiceAssistants ? b.VoiceAssistants.split(',').length : 0) - (a.VoiceAssistants ? a.VoiceAssistants.split(',').length : 0);
    }
    return 0;
  });

  const renderPlanItem = ({ item }: { item: Plan }) => (
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Recommended Smart Home Plans</Text>

            {loading && <Text style={styles.loadingText}>Loading recommendations...</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!isSurveyCompleted && (
              <TouchableOpacity
                onPress={() => router.push("/SurveyScreen")}
                style={styles.goBackButton}
              >
                <Text style={styles.goBackButtonText}>Go Back to Survey</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setShowAllPlans(!showAllPlans)}
              style={[styles.toggleButton, showAllPlans && styles.toggleButtonActive]}
            >
              <Text style={styles.toggleButtonText}>
                {showAllPlans ? "Show Recommended Plans" : "Show All Plans"}
              </Text>
            </TouchableOpacity>

            <View style={styles.filterRow}>
              <Text style={{ color: "#E1E6F9", fontWeight: "bold", marginRight: 8 }}>Sort by:</Text>
              {["rating", "compatibility"].map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSortBy(sortBy === key ? null : key)}
                  style={[
                    styles.filterButton,
                    sortBy === key && styles.filterButtonActive,
                  ]}
                >
                  <Text style={styles.filterButtonText}>
                    {key === "rating" ? "⭐ Rating" : "🎙 Voice Support"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterRow}>
              <Text style={{ color: "#E1E6F9", fontWeight: "bold", marginRight: 8 }}>Min Rating:</Text>
              <TextInput
                style={styles.ratingInput}
                placeholder="e.g., 4.0"
                placeholderTextColor="#AEB4E8"
                value={minRating}
                onChangeText={setMinRating}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.subheading}>🔥 Popular Picks</Text>
            <View style={styles.popularContainer}>
              {popularCombos.map((combo, index) => (
                <View key={index} style={styles.popularCard}>
                  <Text style={styles.popularText}>{combo}</Text>
                </View>
              ))}
            </View>

            <View style={styles.filterRow}>
              {["Security", "Energy", "Entertainment", "Appliances", "Lighting", "Health"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() =>
                    setSelectedCategory(cat === selectedCategory ? null : cat)
                  }
                  style={[
                    styles.filterButton,
                    selectedCategory === cat && styles.filterButtonActive,
                  ]}
                >
                  <Text style={styles.filterButtonText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterRow}>
              {[
                "Voice Compatible",
                "Eco-friendly",
                "Outdoor",
                "Streaming",
                "Cooking",
                "Automation",
                "Wearable",
                "Daily Tracking",
              ].map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() =>
                      setSelectedTags((prev) =>
                        selected
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      )
                    }
                    style={[
                      styles.tagButton,
                      selected && styles.tagButtonActive,
                    ]}
                  >
                    <Text style={styles.tagButtonText}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {sortedPlans.length === 0 && !loading && !error && (
              <Text style={styles.emptyText}>No recommendations available.</Text>
            )}
          </>
        }
        data={sortedPlans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.PlanId}
        ListFooterComponent={
          <>
            {sortedPlans.length > 0 && (
              <TouchableOpacity
                style={styles.authButton}
                onPress={viewPDFReport}
              >
                <Text style={styles.authButtonText}>📄 View PDF Report</Text>
              </TouchableOpacity>
            )}
            {!isSurveyCompleted && (
              <TouchableOpacity
                style={styles.finishButton}
                onPress={finishSurvey}
              >
                <Text style={styles.finishButtonText}>✅ Finish Survey</Text>
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
  rating: { color: "#FFD700", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  voiceAssistants: {
    color: "#C3C8F2",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 10,
  },
  selectPlanButton: {
    backgroundColor: "#8A82E2",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
  },
  selectedPlanButton: {
    backgroundColor: "#6B8BFF",
  },
  selectPlanButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  favButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  favButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  authButton: {
    backgroundColor: "#8A82E2",
    padding: 15,
    marginTop: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  authButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  finishButton: {
    backgroundColor: "#FF007F",
    padding: 15,
    marginTop: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#1A1F3D",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#6B8BFF",
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  ratingInput: {
    backgroundColor: "#1A1F3D",
    color: "#FFF",
    padding: 8,
    borderRadius: 10,
    width: 100,
  },
  tagButton: {
    backgroundColor: "#1A1F3D",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  tagButtonActive: {
    backgroundColor: "#FFD700",
  },
  tagButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  subheading: {
    fontSize: 20,
    color: "#FFD700",
    fontWeight: "bold",
    marginBottom: 10,
  },
  popularContainer: {
    marginBottom: 20,
    gap: 10,
  },
  popularCard: {
    backgroundColor: "#1A1F3D",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  popularText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingText: {
    color: "#C0C6FF",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  errorText: {
    color: "#FF5555",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  emptyText: {
    color: "#AEB4E8",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default ResultsScreen;