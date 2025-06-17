import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { lightColors, darkColors } from '../theme'; // ✅ import theme colors
import { assessRisk } from '../utils/riskAssessment';

export default function ProfileScreen({ theme }) {
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [surgeryDate, setSurgeryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [message, setMessage] = useState('');
  
  // Strength measurements
  const [injuredQuadStrength, setInjuredQuadStrength] = useState('');
  const [nonInjuredQuadStrength, setNonInjuredQuadStrength] = useState('');
  const [injuredHamstringStrength, setInjuredHamstringStrength] = useState('');
  const [nonInjuredHamstringStrength, setNonInjuredHamstringStrength] = useState('');
  
  // Risk assessment
  const [riskAssessment, setRiskAssessment] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const docRef = doc(db, 'profile', 'user1');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSurgeryDate(new Date(data.surgeryDate));
        setWeight(data.weight?.toString() || '');
        setInjuredQuadStrength(data.injuredQuadStrength?.toString() || '');
        setNonInjuredQuadStrength(data.nonInjuredQuadStrength?.toString() || '');
        setInjuredHamstringStrength(data.injuredHamstringStrength?.toString() || '');
        setNonInjuredHamstringStrength(data.nonInjuredHamstringStrength?.toString() || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      const profileData = {
        surgeryDate: surgeryDate.toISOString(),
        weight: Number(weight),
        injuredQuadStrength: Number(injuredQuadStrength),
        nonInjuredQuadStrength: Number(nonInjuredQuadStrength),
        injuredHamstringStrength: Number(injuredHamstringStrength),
        nonInjuredHamstringStrength: Number(nonInjuredHamstringStrength),
      };

      await setDoc(doc(db, 'profile', 'user1'), profileData);
      
      // Calculate risk assessment
      const assessment = assessRisk(profileData);
      setRiskAssessment(assessment);
      
      setMessage('Profile saved!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Failed to save profile.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.background,
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
    },
    label: {
      fontWeight: 'bold',
      marginTop: 15,
      color: colors.text,
    },
    input: {
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 10,
      marginTop: 5,
      color: colors.inputText,
      backgroundColor: colors.inputBackground,
    },
    message: {
      marginTop: 15,
      fontWeight: 'bold',
      color: 'green',
    },
    riskCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginTop: 20,
      marginBottom: 20,
    },
    riskTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.text,
    },
    riskLevel: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    riskFactor: {
      marginTop: 5,
      color: colors.text,
    },
    recommendation: {
      marginTop: 10,
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 5,
    },
    recommendationTitle: {
      fontWeight: 'bold',
      color: colors.text,
    },
    recommendationText: {
      color: colors.text,
      marginTop: 5,
    },
  });

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High':
        return '#ff4444';
      case 'Moderate':
        return '#ffbb33';
      case 'Low':
        return '#00C851';
      default:
        return colors.text;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧍 Your Profile</Text>

      <Text style={styles.label}>Surgery Date:</Text>
      <Button title={surgeryDate.toDateString()} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={surgeryDate}
          mode="date"
          display="spinner"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setSurgeryDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Bodyweight (lbs):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="e.g. 150"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Injured Leg Quad Strength (lbs):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={injuredQuadStrength}
        onChangeText={setInjuredQuadStrength}
        placeholder="e.g. 120"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Non-Injured Leg Quad Strength (lbs):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={nonInjuredQuadStrength}
        onChangeText={setNonInjuredQuadStrength}
        placeholder="e.g. 130"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Injured Leg Hamstring Strength (lbs):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={injuredHamstringStrength}
        onChangeText={setInjuredHamstringStrength}
        placeholder="e.g. 75"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Non-Injured Leg Hamstring Strength (lbs):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={nonInjuredHamstringStrength}
        onChangeText={setNonInjuredHamstringStrength}
        placeholder="e.g. 80"
        placeholderTextColor={colors.placeholder}
      />

      <Button title="Save Profile" onPress={handleSave} />
      {message !== '' && <Text style={styles.message}>{message}</Text>}

      {riskAssessment && (
        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>Risk Assessment</Text>
          <Text style={[styles.riskLevel, { color: getRiskLevelColor(riskAssessment.riskLevel) }]}>
            {riskAssessment.riskLevel} Risk
          </Text>
          
          <Text style={styles.label}>Risk Factors:</Text>
          {riskAssessment.factors.map((factor, index) => (
            <Text key={index} style={styles.riskFactor}>
              • {factor.factor}: {factor.value} (Threshold: {factor.threshold})
            </Text>
          ))}

          <Text style={[styles.label, { marginTop: 15 }]}>Recommendations:</Text>
          {riskAssessment.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendation}>
              <Text style={styles.recommendationTitle}>{rec.category}</Text>
              <Text style={styles.recommendationText}>{rec.recommendation}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
