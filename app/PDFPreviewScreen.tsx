import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, PermissionsAndroid, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Sharing from 'expo-sharing'; // expo-sharing import edildi
import AsyncStorage from "@react-native-async-storage/async-storage";

const PDFPreviewScreen = () => {
  const router = useRouter();
  const { recommendedPlans: recommendedPlansString } = useLocalSearchParams();
  const [surveyResponses, setSurveyResponses] = useState<Record<number, string>>({});
  const [recommendedPlans, setRecommendedPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchSurveyResponses();
    if (recommendedPlansString) {
      try {
        const plans = JSON.parse(recommendedPlansString as string);
        setRecommendedPlans(plans);
      } catch (error) {
        console.error("Error parsing recommended plans:", error);
        Alert.alert("Error", "⚠ Failed to load recommended plans.");
      }
    } else {
      fetchRecommendations();
    }
  }, [recommendedPlansString]);

  const fetchSurveyResponses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("⚠ Please login to view your survey responses.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.146.209:3000/api/survey/responses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSurveyResponses(data);
      } else {
        Alert.alert("Error", data.message || "⚠ Failed to fetch survey responses.");
      }
    } catch (error) {
      console.error("Fetch survey responses error:", error);
      Alert.alert("Error", "⚠ An error occurred while fetching survey responses.");
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("⚠ Please login to view recommendations.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.146.209:3000/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendedPlans(data);
      } else {
        Alert.alert("Error", data.message || "⚠ Failed to fetch recommendations.");
      }
    } catch (error) {
      console.error("Fetch recommendations error:", error);
      Alert.alert("Error", "⚠ An error occurred while fetching recommendations.");
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "This app needs access to your storage to save the PDF.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const generatePDF = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Storage permission is required to save the PDF.");
        return null;
      }

      const surveyHtml = Object.entries(surveyResponses).map(([index, answer]) => `
        <div style="margin-bottom: 10px;">
          <p style="font-weight: bold; color: #C0C6FF;">${parseInt(index) + 1}. ${questions[parseInt(index)].question}</p>
          <p style="color: #E1E6F9;">${answer}</p>
        </div>
      `).join('');

      const plansHtml = recommendedPlans.map(plan => `
        <div style="margin-bottom: 15px;">
          <p style="font-weight: bold; color: #C0C6FF;">${plan.Title}</p>
          <p style="color: #E1E6F9;">${plan.Description}</p>
          <p style="color: #FFD700;">⭐ ${plan.Rating.toFixed(1)} / 5</p>
          ${plan.VoiceAssistants ? `<p style="color: #C3C8F2;">🗣️ Works with: ${plan.VoiceAssistants}</p>` : ''}
        </div>
      `).join('');

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background-color: #0A0F24; color: #E1E6F9; }
              h1 { color: #FFD700; text-align: center; }
              h2 { color: #8A82E2; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>📄 Smart Home Plan Report</h1>
            <h2>📝 Your Survey Answers</h2>
            ${surveyHtml}
            <h2>✅ Recommended Plans</h2>
            ${plansHtml}
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'SmartHomePlanReport',
        directory: Platform.OS === 'android' ? 'Download' : 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      return file.filePath;
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("Error", "⚠ An error occurred while generating the PDF.");
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    const filePath = await generatePDF();
    if (filePath) {
      Alert.alert("Success", `PDF has been saved to ${filePath}`);
    }
  };

  const handleSharePDF = async () => {
    const filePath = await generatePDF();
    if (filePath) {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert("Error", "Sharing is not supported on this device.");
          return;
        }

        await Sharing.shareAsync(`file://${filePath}`, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Smart Home Plan Report',
          UTI: 'com.adobe.pdf', // iOS için
        });
      } catch (error) {
        console.error("Share error:", error);
        Alert.alert("Error", "⚠ An error occurred while sharing the PDF.");
      }
    }
  };

  const questions = [
    { question: "What is your primary smart home need?" },
    { question: "Do you use a voice assistant?" },
    { question: "What is your budget for smart home solutions?" },
    { question: "What type of home do you live in?" },
    { question: "Which devices do you already use?" },
    { question: "What type of connectivity do you prefer?" },
    { question: "How do you prefer to control your smart home devices?" },
    { question: "Which devices do you want to use to manage your smart home system?" },
    { question: "What is the most important factor for you when choosing a smart home product?" },
    { question: "Which brands do you currently own in your home?" },
    { question: "How often do you plan to use smart home devices?" },
    { question: "Do you prefer eco-friendly smart home solutions?" },
    { question: "Are you interested in outdoor smart home solutions (e.g., smart garden, outdoor lighting)?" },
    { question: "Which entertainment features are you interested in?" },
    { question: "How many people live in your household?" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📄 Smart Home Plan Report</Text>

      <Text style={styles.sectionHeading}>📝 Your Survey Summary</Text>
      {Object.entries(surveyResponses).map(([index, answer]) => (
        <View key={index} style={styles.section}>
          <Text style={styles.label}>{questions[parseInt(index)].question}</Text>
          <Text style={styles.value}>{answer}</Text>
        </View>
      ))}

      <Text style={styles.sectionHeading}>🌟 Recommended Plans</Text>
      {recommendedPlans.map((plan, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.label}>{plan.Title}</Text>
          <Text style={styles.value}>{plan.Description}</Text>
          <Text style={styles.value}>⭐ {plan.Rating.toFixed(1)} / 5</Text>
          {plan.VoiceAssistants && (
            <Text style={styles.value}>🗣️ Works with: {plan.VoiceAssistants}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
        <Text style={styles.buttonText}>⬇ Download PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.shareButton} onPress={handleSharePDF}>
        <Text style={styles.buttonText}>📤 Share PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
  downloadButton: {
    backgroundColor: "#6B8BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  shareButton: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#3A437E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PDFPreviewScreen;