import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function IntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Smart Home Survey</Text>
      <Text style={styles.subtitle}>Take a quick survey to personalize your smart home experience.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/SurveyScreen')}>
        <Text style={styles.buttonText}>Start Survey</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F24',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#C0C6FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8A82E2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
