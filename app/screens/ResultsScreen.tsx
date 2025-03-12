import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const recommendations = [
  { title: "Smart Security System", description: "Enhance your home's security with smart cameras and locks." },
  { title: "Energy Saving Kit", description: "Reduce your energy usage with smart thermostats and plugs." },
  { title: "Entertainment Hub", description: "Control your multimedia systems seamlessly." },
];

const ResultsScreen = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<{ title: string; description: string } | null>(null);

  const selectPlan = (plan: { title: string; description: string }) => {
    setSelectedPlan(plan);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Recommended Smart Home Plans</Text>

        <TouchableOpacity onPress={() => router.push('/screens/SurveyScreen')} style={styles.goBackButton}>
          <Text style={styles.goBackButtonText}>Go Back to Survey</Text>
        </TouchableOpacity>

        {recommendations.map((plan, index) => (
          <View key={index} style={styles.planContainer}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>

            <TouchableOpacity
              style={[styles.selectPlanButton, selectedPlan?.title === plan.title && styles.selectedPlanButton]}
              onPress={() => selectPlan(plan)}
            >
              <Text style={styles.selectPlanButtonText}>
                {selectedPlan?.title === plan.title ? "Plan Selected ✅" : "Select This Plan"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {selectedPlan && (
          <>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/screens/LoginScreen')}>
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/screens/SignupScreen')}>
              <Text style={styles.authButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0A0F24" },
  scrollContent: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  heading: { fontSize: 24, color: "#E1E6F9", fontWeight: "bold", textAlign: "center", marginBottom: 15 },
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
  planDescription: { color: "#AEB4E8", marginBottom: 10 },
  goBackButton: { backgroundColor: "#3A437E", padding: 12, borderRadius: 10, alignItems: "center", marginBottom: 15 },
  goBackButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  selectPlanButton: { backgroundColor: "#8A82E2", padding: 10, borderRadius: 10, marginTop: 10, alignItems: "center" },
  selectedPlanButton: { backgroundColor: "#6B8BFF" },
  selectPlanButtonText: { color: "#FFFFFF", fontWeight: "bold", textAlign: "center" },
  authButton: {
    backgroundColor: "#8A82E2",
    padding: 15,
    marginTop: 10,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#6B8BFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  authButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default ResultsScreen;