import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';

// Helper function to safely convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return new Date();
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore Timestamp with seconds property
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // If it's a plain timestamp number
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Fallback: try to parse as string
  return new Date(timestamp);
};

export default function HomeScreen({ route, navigation }) {
  const latestLog = route.params?.latestLog ? {
    ...route.params.latestLog,
    timestamp: new Date(route.params.latestLog.timestamp) // Convert string back to Date
  } : null;
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [chartInfo, setChartInfo] = useState({ labels: [], data: [] });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'logs'));
        const data = snapshot.docs.map(doc => doc.data());

        // Convert timestamps to dates safely
        const logDates = data
          .map(log => convertTimestampToDate(log.timestamp))
          .map(date => date.toISOString().split('T')[0]);
        
        // Remove duplicates
        const uniqueDates = [...new Set(logDates)];

        // Sort from newest to oldest
        uniqueDates.sort((a, b) => new Date(b) - new Date(a));

        // Count streak
        let streakCount = 0;
        let current = new Date();

        for (let i = 0; i < uniqueDates.length; i++) {
          const logDate = new Date(uniqueDates[i]);
          const diff = Math.floor((current - logDate) / (1000 * 60 * 60 * 24));

          if (diff === 0) {
            streakCount++;
          } else if (diff === 1) {
            streakCount++;
            current.setDate(current.getDate() - 1);
          } else {
            break;
          }
        }

        setLogs(data);
        setStreak(streakCount);

        // Sort logs for chart
        const sortedLogs = [...data].sort((a, b) => 
          convertTimestampToDate(a.timestamp) - convertTimestampToDate(b.timestamp)
        );
        
        const chartLabels = sortedLogs.map(log => {
          const date = convertTimestampToDate(log.timestamp);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        const chartData = sortedLogs.map(log => log.pain);

        setChartInfo({ labels: chartLabels, data: chartData });
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
    fetchLogs();
  }, []);

  const recommendation = latestLog
    ? latestLog.pain >= 7
      ? 'High pain today — take a rest day and ice your knee.'
      : latestLog.pain >= 4
      ? 'Moderate pain — do light PT and avoid high strain.'
      : 'Pain is low — continue your rehab exercises and add resistance if ready.'
    : 'Submit a log to get a personalized recommendation.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Recent Log</Text>
        {latestLog ? (
          <>
            <Text>Pain Level: {latestLog.pain}</Text>
            <Text>Activity: {latestLog.activity}</Text>
            <Text style={styles.timestamp}>
              {convertTimestampToDate(latestLog.timestamp).toLocaleString()}
            </Text>
          </>
        ) : (
          <Text>No logs submitted yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Streak</Text>
        <Text>You've logged {streak} {streak === 1 ? 'day' : 'days'} in a row</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Pain Trend</Text>
        {chartInfo.data.length > 0 ? (
          <LineChart
            data={{
              labels: chartInfo.labels,
              datasets: [{ data: chartInfo.data }],
            }}
            width={Dimensions.get('window').width - 60}
            height={220}
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(31, 178, 138, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#1FB28A',
              },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 12 }}
          />
        ) : (
          <Text>No data yet. Log pain to see your chart.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Recommendation</Text>
        <Text>{recommendation}</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Log')}>
        <Text style={styles.cardTitle}>➕ Log Today's Recovery</Text>
        <Text style={{ color: '#1FB28A' }}>Tap to enter pain and activity</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('History')}>
        <Text style={styles.cardTitle}>📜 View Log History</Text>
        <Text style={{ color: '#1FB28A' }}>See past entries</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.cardTitle}>🧍 View Profile</Text>
        <Text style={{ color: '#1FB28A' }}>Update surgery date and metrics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
});