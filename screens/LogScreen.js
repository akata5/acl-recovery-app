import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // adjust path if needed


// define logscreen
export default function LogScreen({ navigation }) {
  // state variables for pain level, activity, confirmation message, and all logs
  const [painLevel, setPainLevel] = useState(0);
  const [activity, setActivity] = useState('');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [exercisesText, seteExercisesText] = useState('');

  return (
    // wrap the entire screen in a scroll view so the list can scroll
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Pain Level Card */}
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

      {/* Activity Notes Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Activity Notes:</Text>
        <TextInput
          style={styles.input}
          placeholder="What did you do today?"
          value={activity}
          onChangeText={setActivity}
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
        />
      </View>


      {/* Submit Button Card */}
      <View style={styles.card}>
        <Button
          title="Submit Log"
          onPress={async () => {
            const newLog = {
              pain: painLevel,
              activity: activity,
              exercises: exercisesText,
              timestamp: new Date().toLocaleString(),
            };
            console.log('📤 Submitting log:', newLog);
            try {
              console.log('📤 Attempting to write to Firestore...', newLog);
              await addDoc(collection(db, 'logs'), newLog); // Save to Firestore
              setMessage('Log saved to Firebase!');
              setActivity('');
              navigation.navigate('Home', { latestLog: newLog });
            } catch (error) {
              console.log('❌ Error writing log:', error);
              setMessage('Failed to save log.');
            }
          }}
        />
        {message !== '' && <Text style={styles.message}>{message}</Text>}
      </View>

      {/* Log History Display */}
      {logs.map((log, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>Log #{index + 1}</Text>
          <Text>Pain Level: {log.pain}</Text>
          <Text>Activity: {log.activity}</Text>
          <Text style={styles.timestamp}>{log.timestamp}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// reusable styles using stylesheet api
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    flexGrow: 1, // required for ScrollView to expand
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3, // for Android shadow
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  message: {
    marginTop: 10,
    color: 'green',
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
});