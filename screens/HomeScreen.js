import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';
import { lightColors, darkColors } from '../theme'; // ✅ import theme

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date(timestamp);
};

export default function HomeScreen({ route, navigation, theme }) {
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const latestLog = route.params?.latestLog
    ? { ...route.params.latestLog, timestamp: new Date(route.params.latestLog.timestamp) }
    : null;

  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [chartInfo, setChartInfo] = useState({ labels: [], data: [] });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'logs'));
        const data = snapshot.docs.map(doc => doc.data());

        const logDates = data
          .map(log => convertTimestampToDate(log.timestamp))
          .map(date => date.toISOString().split('T')[0]);

        const uniqueDates = [...new Set(logDates)];
        uniqueDates.sort((a, b) => new Date(b) - new Date(a));

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

        const sortedLogs = [...data].sort(
          (a, b) => convertTimestampToDate(a.timestamp) - convertTimestampToDate(b.timestamp)
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

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.background,
      flexGrow: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: colors.text,
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
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.text,
    },
    text: {
      color: colors.text,
    },
    timestamp: {
      fontSize: 12,
      color: colors.subtext,
      marginTop: 10,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Recent Log</Text>
        {latestLog ? (
          <>
            <Text style={styles.text}>Pain Level: {latestLog.pain}</Text>
            <Text style={styles.text}>Activity: {latestLog.activity}</Text>
            <Text style={styles.timestamp}>
              {convertTimestampToDate(latestLog.timestamp).toLocaleString()}
            </Text>
          </>
        ) : (
          <Text style={styles.text}>No logs submitted yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Streak</Text>
        <Text style={styles.text}>
          You've logged {streak} {streak === 1 ? 'day' : 'days'} in a row
        </Text>
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
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) =>
                isDark
                  ? `rgba(144, 238, 144, ${opacity})`
                  : `rgba(31, 178, 138, ${opacity})`,
              labelColor: (opacity = 1) =>
                isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: isDark ? '#90ee90' : '#1FB28A',
              },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 12 }}
          />
        ) : (
          <Text style={styles.text}>No data yet. Log pain to see your chart.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Recommendation</Text>
        <Text style={styles.text}>{recommendation}</Text>
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
    </ScrollView>
  );
}
