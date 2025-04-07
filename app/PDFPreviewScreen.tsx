import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";

const questions = [
  "What is your primary smart home need?",
  "Do you use a voice assistant?",
  "What is your budget for smart home solutions?",
  "What type of home do you live in?",
  "Which smart devices do you already use?",
  "What type of connectivity do you prefer?",
  "How do you prefer to control your smart home devices?",
  "Which devices do you want to use to manage your smart home system?",
  "What is the most important factor for you when choosing a smart home product?",
  "Which brands do you currently own in your home?",
  "How often do you plan to use smart home devices?",
  "Do you prefer eco-friendly smart home solutions?",
  "Are you interested in outdoor smart home solutions (e.g., smart garden, outdoor lighting)?",
  "Which entertainment features are you interested in?",
  "How many people live in your household?",
];

const PDFPreviewScreen = () => {
  const router = useRouter();
  const { selectedPlan } = useLocalSearchParams();
  const [surveyResponses, setSurveyResponses] = useState<{ [key: string]: string }>({});
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    if (selectedPlan) {
      try {
        const parsedPlan = JSON.parse(selectedPlan as string);
        setPlan(parsedPlan);
      } catch (error) {
        console.error("Error parsing selected plan:", error);
        Alert.alert("Error", "Failed to load the selected plan.");
      }
    }
    fetchSurveyResponses();
  }, [selectedPlan]);

  const fetchSurveyResponses = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("⚠ Please login to view your survey responses.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch("http://192.168.146.209:3000/api/survey/responses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSurveyResponses(data);
      } else if (response.status === 403) {
        await AsyncStorage.removeItem("userToken");
        Alert.alert("Error", "Your session has expired. Please login again.");
        router.push("/LoginScreen");
      } else {
        Alert.alert("Error", data.message || "Failed to fetch survey responses.");
      }
    } catch (error) {
      console.error("Fetch survey responses error:", error);
      Alert.alert("Error", "An error occurred while fetching survey responses.");
    }
  };

  const generatePDF = async () => {
    try {
      if (!plan) {
        Alert.alert("Error", "No plan selected to generate PDF.");
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f9; }
              h1 { color: #0A0F24; text-align: center; }
              h2 { color: #1A1F3D; margin-top: 20px; }
              p { font-size: 16px; color: #333; }
              .section { margin-bottom: 20px; }
              .response { margin: 10px 0; padding: 10px; background-color: #E1E6F9; border-radius: 5px; }
              .plan { margin: 10px 0; padding: 15px; background-color: #C0C6FF; border-radius: 5px; }
              .plan-title { font-weight: bold; font-size: 18px; color: #0A0F24; }
              .plan-description { font-size: 14px; color: #333; }
              .rating { font-size: 14px; color: #FFD700; }
            </style>
          </head>
          <body>
            <h1>Smart Home Recommendations Report</h1>

            <div class="section">
              <h2>Your Survey Responses</h2>
              ${Object.entries(surveyResponses)
                .map(([questionIndex, answer], idx) => {
                  const question = questions[parseInt(questionIndex)] || `Question ${parseInt(questionIndex) + 1}`;
                  return `
                    <div class="response">
                      <p><strong>${question}</strong></p>
                      <p>${answer}</p>
                    </div>
                  `;
                })
                .join("")}
            </div>

            <div class="section">
              <h2>Selected Plan</h2>
              <div class="plan">
                <p class="plan-title">${plan.Title}</p>
                <p class="plan-description">${plan.Description}</p>
                <p class="rating">⭐ Rating: ${plan.Rating.toFixed(1)} / 5</p>
                ${plan.VoiceAssistants ? `<p>🗣️ Works with: ${plan.VoiceAssistants}</p>` : ""}
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log("PDF generated at:", uri);

      const fileName = "SmartHomeReport.pdf";
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({ from: uri, to: newPath });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(newPath);
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", "An error occurred while generating the PDF: " + errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>📄 Your Smart Home Report</Text>
      <Text style={styles.subheading}>
        Review your survey responses and selected plan below. You can generate and share a PDF version of this report.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Survey Responses</Text>
        {Object.entries(surveyResponses).map(([questionIndex, answer], idx) => {
          const question = questions[parseInt(questionIndex)] || `Question ${parseInt(questionIndex) + 1}`;
          return (
            <View key={idx} style={styles.responseCard}>
              <Text style={styles.questionText}>{question}</Text>
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          );
        })}
      </View>

      {plan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Plan</Text>
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>{plan.Title}</Text>
            <Text style={styles.planDescription}>{plan.Description}</Text>
            <Text style={styles.rating}>⭐ {plan.Rating.toFixed(1)} / 5</Text>
            {plan.VoiceAssistants && (
              <Text style={styles.voiceAssistants}>
                🗣️ Works with: {plan.VoiceAssistants}
              </Text>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.generateButton} onPress={generatePDF}>
        <Text style={styles.generateButtonText}>Generate & Share PDF 📤</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/ResultsScreen")}
      >
        <Text style={styles.backButtonText}>⬅ Back to Results</Text>
      </TouchableOpacity>
    </SafeAreaView>
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
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    color: "#AEB4E8",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#C0C6FF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  responseCard: {
    backgroundColor: "#1A1F3D",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    color: "#E1E6F9",
    fontWeight: "bold",
  },
  answerText: {
    fontSize: 14,
    color: "#AEB4E8",
    marginTop: 5,
  },
  planCard: {
    backgroundColor: "#1A1F3D",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 18,
    color: "#C0C6FF",
    fontWeight: "bold",
  },
  planDescription: {
    fontSize: 14,
    color: "#AEB4E8",
    marginVertical: 5,
  },
  rating: {
    fontSize: 14,
    color: "#FFD700",
  },
  voiceAssistants: {
    fontSize: 14,
    color: "#AEB4E8",
    marginTop: 5,
  },
  generateButton: {
    backgroundColor: "#8A82E2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  generateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#3A437E",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PDFPreviewScreen;