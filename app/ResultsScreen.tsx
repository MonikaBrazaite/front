import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SmartHomePlan {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  voiceAssistants: string[];
  rating: number; // ⭐ NEW
}

const allRecommendations: SmartHomePlan[] = [
  {
    id: "1",
    title: "Smart Security System",
    category: "Security",
    tags: ["Outdoor", "Voice Compatible"],
    description: "Enhance your home's security with smart cameras and locks.",
    voiceAssistants: ["Alexa", "Google Assistant"],
    rating: 4.8,
  },
  {
    id: "2",
    title: "Energy Saving Kit",
    category: "Energy",
    tags: ["Eco-friendly"],
    description: "Reduce your energy usage with smart thermostats and plugs.",
    voiceAssistants: ["Google Assistant"],
    rating: 4.2,
  },
  {
    id: "3",
    title: "Entertainment Hub",
    category: "Entertainment",
    tags: ["Streaming", "Voice Compatible"],
    description: "Control your multimedia systems seamlessly.",
    voiceAssistants: ["Alexa", "Siri"],
    rating: 4.6,
  },
  {
    id: "4",
    title: "Smart Kitchen",
    category: "Appliances",
    tags: ["Cooking", "Automation"],
    description: "Automate cooking, grocery tracking, and smart appliances.",
    voiceAssistants: [],
    rating: 3.9,
  },
  {
    id: "5",
    title: "Smart Lighting",
    category: "Lighting",
    tags: ["Voice Compatible", "Eco-friendly"],
    description: "Control lights with voice commands and automation.",
    voiceAssistants: ["Alexa"],
    rating: 4.3,
  },
  {
    id: "6",
    title: "Health Monitoring System",
    category: "Health",
    tags: ["Wearable", "Daily Tracking"],
    description: "Track your health with smart wearables and home devices.",
    voiceAssistants: ["Google Assistant"],
    rating: 4.1,
  },
];

const popularCombos = [
  "Smart Lighting + Voice Assistant",
  "Security System + Energy Kit",
  "Health Monitor + Smart Kitchen",
];


const ResultsScreen = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SmartHomePlan | null>(null);
  const [favourites, setFavourites] = useState<SmartHomePlan[]>([]);
  const [recommendedPlans, setRecommendedPlans] = useState<SmartHomePlan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "compatibility" | null>(null); // ⭐ NEW

  useEffect(() => {
    loadFavourites();
    generateRecommendations();
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

  const saveFavourites = async (newFavourites: SmartHomePlan[]) => {
    try {
      await AsyncStorage.setItem("favourites", JSON.stringify(newFavourites));
    } catch (error) {
      console.error("Error saving favourites:", error);
    }
  };

  const generateRecommendations = () => {
    const shuffled = allRecommendations.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
    setRecommendedPlans(selected);
  };

  const addToFavourites = async (plan: SmartHomePlan) => {
    try {
      const storedFavourites = await AsyncStorage.getItem("favourites");
      let currentFavourites: SmartHomePlan[] = storedFavourites
        ? JSON.parse(storedFavourites)
        : [];

      if (currentFavourites.some((fav) => fav.id === plan.id)) {
        Alert.alert("Already Added", "This plan is already in your favorites.");
        return;
      }

      const updatedFavourites = [...currentFavourites, plan];
      await AsyncStorage.setItem("favourites", JSON.stringify(updatedFavourites));
      setFavourites(updatedFavourites);

      Alert.alert("Saved!", "This plan has been added to your favorites.");
    } catch (error) {
      console.error("Error saving to favorites:", error);
    }
  };

  const selectPlan = (plan: SmartHomePlan) => {
    setSelectedPlan(plan);
  };

  const filteredPlans = recommendedPlans.filter((plan) => {
    const matchesCategory = selectedCategory ? plan.category === selectedCategory : true;
    const matchesTags =
      selectedTags.length > 0
        ? selectedTags.every((tag) => plan.tags.includes(tag))
        : true;
    return matchesCategory && matchesTags;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "compatibility") {
      return b.voiceAssistants.length - a.voiceAssistants.length;
    }
    return 0;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Recommended Smart Home Plans</Text>

        {/* Go Back */}
        <TouchableOpacity
          onPress={() => router.push("/SurveyScreen")}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Go Back to Survey</Text>
        </TouchableOpacity>

        {/* Sort Buttons */}
        <View style={styles.filterRow}>
          <Text style={{ color: "#E1E6F9", fontWeight: "bold", marginRight: 8 }}>Sort by:</Text>
          {["rating", "compatibility"].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSortBy(sortBy === key ? null : key as any)}
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

{/* 🔥 Popular Picks */}
<Text style={styles.subheading}>🔥 Popular Picks</Text>
<View style={styles.popularContainer}>
  {popularCombos.map((combo, index) => (
    <View key={index} style={styles.popularCard}>
      <Text style={styles.popularText}>{combo}</Text>
    </View>
  ))}
</View>


        {/* Category Filter */}
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

        {/* Tag Filter */}
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

        {/* Sorted + Filtered Plans */}
        {sortedPlans.map((plan) => (
          <View key={plan.id} style={styles.planContainer}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>

            {/* ⭐ Rating */}
            <Text style={styles.rating}>⭐ {plan.rating.toFixed(1)} / 5</Text>

            {/* 🗣️ Voice Assistants */}
            {plan.voiceAssistants.length > 0 && (
              <Text style={styles.voiceAssistants}>
                🗣️ Works with: {plan.voiceAssistants.join(" • ")}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.selectPlanButton,
                selectedPlan?.id === plan.id && styles.selectedPlanButton,
              ]}
              onPress={() => selectPlan(plan)}
            >
              <Text style={styles.selectPlanButtonText}>
                {selectedPlan?.id === plan.id
                  ? "Plan Selected ✅"
                  : "Select This Plan"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.favButton}
              onPress={() => addToFavourites(plan)}
            >
              <Text style={styles.favButtonText}>Save to Favorites ⭐</Text>
            </TouchableOpacity>
          </View>
        ))}

        {selectedPlan && (
          <>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push("/LoginScreen")}
            >
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push("/SignupScreen")}
            >
              <Text style={styles.authButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}

{selectedPlan && (
  <TouchableOpacity
    style={styles.authButton}
    onPress={() =>
      router.push({
        pathname: "/PDFPreviewScreen",
        params: {
          title: selectedPlan.title,
          description: selectedPlan.description,
          rating: selectedPlan.rating.toString(),
          voiceAssistants: selectedPlan.voiceAssistants,
        },
      })
    }
  >
    <Text style={styles.authButtonText}>📄 View PDF Report</Text>
  </TouchableOpacity>
)}



      </ScrollView>
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
});

export default ResultsScreen;
