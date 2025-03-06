import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const recommendations = [
  { title: "Smart Security System", description: "Enhance your home's security with smart cameras and locks." },
  { title: "Energy Saving Kit", description: "Reduce your energy usage with smart thermostats and plugs." },
  { title: "Entertainment Hub", description: "Control your multimedia systems seamlessly." },
];

const ResultsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Recommended Solutions</Text>
      {recommendations.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F24',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 26,
    color: '#E1E6F9',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1A1F3D',
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    color: '#C0C6FF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#AEB4E8',
  },
});

export default ResultsScreen;
