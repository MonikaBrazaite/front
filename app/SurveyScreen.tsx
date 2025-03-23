import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { RadioButton, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const SurveyScreen = () => {
  const router = useRouter();

  const questions = [
    { question: "What is your primary smart home need?", options: ["Security and Surveillance", "Energy Efficiency", "Comfort and Automation", "Entertainment and Multimedia", "Health and Wellness", "Lighting Control"] },
    { question: "Do you use a voice assistant?", options: ["Yes, Alexa", "Yes, Google Assistant", "Yes, Siri", "No, I don’t use any"] },
    { question: "What is your budget for smart home solutions?", options: ["$0 - $50", "$50 - $250", "$250 - $500", "$500+"] },
    { question: "What type of home do you live in?", options: ["Apartment", "Detached house", "Villa", "Dormitory/Rented room", "Other"] },
    { question: "Which devices do you already use?", options: ["Smart speakers (Alexa, Google Home, Siri)", "Smart TV", "Smart plugs and switches", "Smart security systems", "None"] },
    { question: "What type of connectivity do you prefer?", options: ["Wi-Fi", "Bluetooth", "Zigbee/Z-Wave", "Ethernet (Wired)", "I’m not sure"] },
    { question: "How do you prefer to control your smart home devices?", options: ["Mobile app", "Voice assistant", "Remote control", "Manual switches"] },
    { question: "Which devices do you want to use to manage your smart home system?", options: ["Smartphone", "Tablet", "Computer", "Smartwatch"] },
    { question: "What is the most important factor for you when choosing a smart home product?", options: ["Ease of use", "Wide device compatibility", "Energy efficiency", "Price-performance balance"] },
    { question: "Which brands do you currently own in your home?", options: ["Apple", "Samsung", "Xiaomi", "Philips Hue", "Other"] },
    { question: "How often do you plan to use smart home devices?", options: ["Daily", "Weekly", "Occasionally", "Rarely"] },
    { question: "Do you prefer eco-friendly smart home solutions?", options: ["Yes, very important", "Somewhat important", "Not important"] },
    { question: "Are you interested in outdoor smart home solutions (e.g., smart garden, outdoor lighting)?", options: ["Yes", "No", "Maybe"] },
    { question: "Which entertainment features are you interested in?", options: ["Smart TV and streaming", "Smart speakers for music", "Gaming integration", "None"] },
    { question: "How many people live in your household?", options: ["1", "2-3", "4-5", "6 or more"] },
  ];

  const [selectedValues, setSelectedValues] = useState<Record<number, string>>({});
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const animations = useRef(questions.map(() => new Animated.Value(1))).current;
  const [progress, setProgress] = useState(0);
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkSurveyStatus();
    fetchSurveyResponses();
  }, []);

  useEffect(() => {
    const answered = Object.values(selectedValues).filter(Boolean).length;
    const calculatedProgress = answered / questions.length;
    Animated.timing(animatedProgress, { toValue: calculatedProgress, duration: 500, useNativeDriver: false }).start();
  }, [selectedValues]);

  useEffect(() => {
    const listener = animatedProgress.addListener(({ value }) => setProgress(value));
    return () => animatedProgress.removeListener(listener);
  }, []);

  const checkSurveyStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("⚠ Please login to view your survey responses.");
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
        setSelectedValues(data);
      } else {
        Alert.alert("Error", data.message || "⚠ Failed to fetch survey responses.");
      }
    } catch (error) {
      console.error("Fetch survey responses error:", error);
      Alert.alert("Error", "⚠ An error occurred while fetching survey responses.");
    }
  };

  const handleOptionSelect = (questionIndex: number, option: string) => {
    if (isSurveyCompleted) {
      Alert.alert("Survey Completed", "You cannot modify your answers. Please reset the survey to start again.");
      return;
    }
    setSelectedValues(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleRetakeSurvey = () => {
    Alert.alert(
      "Retake Survey",
      "This will clear all your previous answers and start a new survey. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) {
                Alert.alert("⚠ Please login to reset the survey.");
                router.push("/LoginScreen");
                return;
              }

              const response = await fetch('http://192.168.146.209:3000/api/survey/reset', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (response.ok) {
                setSelectedValues({});
                setIsSurveyCompleted(false);
                Alert.alert("Survey Cleared", "You can now start a new survey.");
              } else {
                Alert.alert("Error", data.message || "⚠ Failed to reset survey.");
              }
            } catch (error) {
              console.error("Reset survey error:", error);
              Alert.alert("Error", "⚠ An error occurred while resetting the survey.");
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    const answered = Object.values(selectedValues).filter(Boolean).length;
    if (answered !== questions.length) {
      Alert.alert("⚠ Please answer all questions before submitting.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert("⚠ Please login to submit the survey.");
        router.push("/LoginScreen");
        return;
      }

      const response = await fetch('http://192.168.146.209:3000/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ responses: selectedValues }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("✅ Survey submitted successfully!");
        router.push('/ResultsScreen');
      } else {
        Alert.alert("Error", data.message || "⚠ Failed to submit survey.");
      }
    } catch (error) {
      console.error("Survey submission error:", error);
      Alert.alert("Error", "⚠ An error occurred while submitting the survey.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.progressText}>{`Progress: ${(progress * 100).toFixed(0)}%`}</Text>
          <ProgressBar progress={progress} color="#8A82E2" style={styles.progressBar} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {questions.map((q, index) => (
            <Animated.View key={index} style={[styles.questionContainer, { transform: [{ scale: animations[index] }] }]}>
              <Text style={styles.questionText}>{`${index + 1}. ${q.question}`}</Text>
              <RadioButton.Group onValueChange={(newValue) => handleOptionSelect(index, newValue)} value={selectedValues[index] || ''}>
                {q.options.map((option, idx) => (
                  <RadioButton.Item key={idx} label={option} value={option} labelStyle={styles.optionText} color="#8A82E2" uncheckedColor="#555555" mode="android" />
                ))}
              </RadioButton.Group>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeSurvey}>
            <Text style={styles.retakeButtonText}>Retake Survey</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Survey</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#0A0F24',
  },
  progressText: {
    color: '#E1E6F9',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    marginHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#3A437E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: '#1A1F3D',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#8A82E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 12,
    color: '#E1E6F9',
    fontWeight: 'bold',
  },
  optionText: {
    color: '#C0C6FF',
    fontSize: 16,
  },
  submitButtonContainer: {
    padding: 20,
    backgroundColor: '#0A0F24',
  },
  retakeButton: {
    backgroundColor: '#FF5555',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF007F',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#FF007F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SurveyScreen;