import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { lightColors, darkColors } from '../theme'; // ✅ import colors
import { useNavigation } from '@react-navigation/native';

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date(timestamp);
};

export default function LogScreen({ navigation, theme }) {
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [painLevel, setPainLevel] = useState(0);
  const [activity, setActivity] = useState('');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [exercisesText, setExercisesText] = useState('');

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.background,
      flexGrow: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 16,
      marginBottom: 10,
      fontWeight: 'bold',
      color: colors.text,
    },
    input: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingHorizontal: 10,
      borderRadius: 5,
      color: colors.inputText,
      backgroundColor: colors.inputBackground,
    },
    text: {
      color: colors.text,
    },
    message: {
      marginTop: 10,
      color: 'green',
      fontWeight: 'bold',
    },
    timestamp: {
      fontSize: 12,
      color: colors.subtext,
      marginTop: 10,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pain Level: {painLevel}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={painLevel}
          onValueChange={setPainLevel}
          minimumTrackTintColor="#1FB28A"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1FB28A"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Activity Notes:</Text>
        <TextInput
          style={styles.input}
          placeholder="What did you do today?"
          value={activity}
          onChangeText={setActivity}
          placeholderTextColor={colors.placeholder}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💪 Exercises Completed</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Quad stretch, calf raises"
          value={exercisesText}
          onChangeText={setExercisesText}
          multiline
          placeholderTextColor={colors.placeholder}
        />
      </View>

      <View style={styles.card}>
        <Button
          title="Submit Log"
          onPress={async () => {
            const newLog = {
              pain: painLevel,
              activity: activity,
              exercises: exercisesText,
              timestamp: serverTimestamp(),
            };
            try {
              await addDoc(collection(db, 'logs'), newLog);
              setMessage('Log saved to Firebase!');
              setActivity('');
              const localLog = {
                ...newLog,
                timestamp: new Date().toISOString(),
              };
              navigation.navigate('Home', { latestLog: localLog });
            } catch (error) {
              console.log('❌ Error writing log:', error);
              setMessage('Failed to save log.');
            }
          }}
        />
        {message !== '' && <Text style={styles.message}>{message}</Text>}
      </View>

      {logs.map((log, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>Log #{index + 1}</Text>
          <Text style={styles.text}>Pain Level: {log.pain}</Text>
          <Text style={styles.text}>Activity: {log.activity}</Text>
          <Text style={styles.timestamp}>
            {convertTimestampToDate(log.timestamp).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
