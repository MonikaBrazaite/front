import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RadioButton } from 'react-native-paper';

const SurveyScreen = () => {
    const questions = [
        {
            question: "What type of home do you live in?",
            options: ["Apartment", "Detached house", "Villa", "Dormitory/Rented room", "Other"]
        },
        {
            question: "What is your primary smart home need?",
            options: ["Security", "Energy saving", "Comfort and automation", "Entertainment and multimedia", "Other"]
        },
        {
            question: "Which security features are most important to you?",
            options: ["Smart security cameras", "Smart locks and access control", "Motion sensors and alarm systems", "Smoke, gas, and water leak detectors", "Other"]
        },
        {
            question: "What are your lighting preferences?",
            options: ["Smart bulbs with color-changing options", "Motion-sensor lighting", "Lights that turn on/off automatically based on schedule", "Smart switches and dimmers", "Other"]
        },
        {
            question: "Which energy management solutions interest you the most?",
            options: ["Smart plugs and energy monitors", "Solar panels and battery systems", "Smart thermostats", "Smart irrigation systems", "Other"]
        },
        {
            question: "Which smart home devices do you already use?",
            options: ["Smart speakers (Alexa, Google Home, Siri)", "Smart TV", "Smart plugs and switches", "Smart security systems", "None"]
        },
        {
            question: "Do you use a voice assistant?",
            options: ["Yes, Alexa", "Yes, Google Assistant", "Yes, Siri", "No, I don’t use any"]
        },
        {
            question: "What type of connectivity do you prefer for your smart home system?",
            options: ["Wi-Fi", "Bluetooth", "Zigbee/Z-Wave", "Ethernet (Wired)", "I’m not sure"]
        },
        {
            question: "What is your budget for smart home solutions?",
            options: ["$0 - $50", "$50 - $250", "$250 - $500", "$500+"]
        },
        {
            question: "How do you prefer to control your smart home devices?",
            options: ["Mobile app", "Voice assistant", "Remote control", "Manual switches"]
        },
        {
            question: "Which devices do you want to use to manage your smart home system?",
            options: ["Smartphone", "Tablet", "Computer", "Smartwatch"]
        },
        {
            question: "What is the most important factor for you when choosing a smart home product?",
            options: ["Ease of use", "Wide device compatibility", "Energy efficiency", "Price-performance balance"]
        },
        {
            question: "Which brands do you currently own in your home?",
            options: ["Apple", "Samsung", "Xiaomi", "Philips Hue", "Other"]
        },
        {
            question: "Do you want to integrate a specific smart home system?",
            options: ["Google Home", "Apple HomeKit", "Amazon Alexa", "Samsung SmartThings", "I’m not sure"]
        },
        {
            question: "Where do you usually get information about smart home products?",
            options: ["Online reviews and ratings", "YouTube videos", "Recommendations from friends/family", "In-store advisors", "Other"]
        }
    ];

    const [selectedValue, setSelectedValue] = React.useState('');

    return (
        <ScrollView style={styles.container}>
            {questions.map((q, index) => (
                <View key={index} style={styles.questionContainer}>
                    <RadioButton.Group onValueChange={newValue => setSelectedValue(newValue)} value={selectedValue}>
                        <Text style={styles.questionText}>{`${index + 1}. ${q.question}`}</Text>
                        {q.options.map((option, idx) => (
                            <RadioButton.Item key={`${index}-${idx}`} label={option} value={option} />
                        ))}
                    </RadioButton.Group>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        padding: 20,
    },
    questionContainer: {
        marginBottom: 20,
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    questionText: {
        fontSize: 18,
        marginBottom: 10,
        color: '#333',
    },
});

export default SurveyScreen;