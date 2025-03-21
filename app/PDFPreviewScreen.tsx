import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const PDFPreviewScreen = () => {
  const router = useRouter();
  const { title, description, rating, voiceAssistants } = useLocalSearchParams();

  // Real survey questions with example (mock) answers
  const surveySummary = [
    { question: "What type of home do you live in?", answer: "Apartment" },
    { question: "What is your primary smart home need?", answer: "Energy saving" },
    { question: "Which security features are most important to you?", answer: "Smart locks and access control" },
    { question: "What are your lighting preferences?", answer: "Motion-sensor lighting" },
    { question: "Which energy management solutions interest you the most?", answer: "Smart thermostats" },
    { question: "Which smart home devices do you already use?", answer: "Smart plugs and switches" },
    { question: "Do you use a voice assistant?", answer: "Yes, Google Assistant" },
    { question: "What type of connectivity do you prefer?", answer: "Wi-Fi" },
    { question: "Budget for smart home solutions?", answer: "$250 - $500" },
    { question: "Preferred control method?", answer: "Mobile app" },
    { question: "Devices to manage your system?", answer: "Smartphone" },
    { question: "Most important factor?", answer: "Energy efficiency" },
    { question: "Brands you currently own?", answer: "Philips Hue" },
    { question: "Integration system?", answer: "Google Home" },
    { question: "Where do you get info?", answer: "Online reviews and ratings" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📄 Smart Home Plan Report</Text>

      {/* Survey Section */}
      <Text style={styles.sectionHeading}>📝 Your Survey Summary</Text>
      {surveySummary.map((item, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.label}>{item.question}</Text>
          <Text style={styles.value}>{item.answer}</Text>
        </View>
      ))}

      {/* Selected Plan Section */}
      <Text style={styles.sectionHeading}>✅ Your Recommended Plan</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Plan:</Text>
        <Text style={styles.value}>{title}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{description}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Rating:</Text>
        <Text style={styles.value}>⭐ {rating} / 5</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Voice Assistants:</Text>
        <Text style={styles.value}>
          {Array.isArray(voiceAssistants)
            ? voiceAssistants.join(" • ")
            : voiceAssistants}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to Results</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0F24",
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    color: "#FFD700",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  sectionHeading: {
    fontSize: 18,
    color: "#8A82E2",
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    color: "#C0C6FF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  value: {
    color: "#E1E6F9",
    fontSize: 15,
  },
  backButton: {
    backgroundColor: "#3A437E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PDFPreviewScreen;
