import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { lightColors, darkColors } from '../theme'; // ✅ import theme colors

export default function ProfileScreen({ theme }) {
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [surgeryDate, setSurgeryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [quadLSI, setQuadLSI] = useState('');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'profile', 'user1'), {
        surgeryDate: surgeryDate.toISOString(),
        weight: Number(weight),
        quadLSI: Number(quadLSI),
      });
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
  });

  return (
    <View style={styles.container}>
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

      <Text style={styles.label}>Quad Strength (LSI %):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={quadLSI}
        onChangeText={setQuadLSI}
        placeholder="e.g. 85"
        placeholderTextColor={colors.placeholder}
      />

      <Button title="Save Profile" onPress={handleSave} />
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}
