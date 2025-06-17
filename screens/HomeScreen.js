import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';
import { lightColors, darkColors } from '../theme';
import { generateRecommendation } from '../utils/recommendationEngine';
import { useNavigation } from '@react-navigation/native';

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date(timestamp);
};

export default function HomeScreen({ route, theme }) {
  const navigation = useNavigation();
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const latestLog = route.params?.latestLog
    ? { ...route.params.latestLog, timestamp: new Date(route.params.latestLog.timestamp) }
    : null;

  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [chartInfo, setChartInfo] = useState({ labels: [], data: [] });
  const [aiRecommendation, setAiRecommendation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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

        // Generate AI recommendation
        const recommendation = await generateRecommendation();
        setAiRecommendation(recommendation);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      fontSize: 18,
      opacity: 0.7,
      color: colors.text,
    },
    content: {
      padding: 20,
    },
    card: {
      padding: 20,
      borderRadius: 10,
      marginBottom: 20,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.text,
    },
    cardDescription: {
      fontSize: 16,
      opacity: 0.7,
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ACL Recovery</Text>
        <Text style={styles.subtitle}>Track your progress</Text>
      </View>

      <View style={styles.content}>
        {latestLog && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Most Recent Log</Text>
            <Text style={styles.text}>Pain Level: {latestLog.pain}</Text>
            <Text style={styles.text}>Activity: {latestLog.activity}</Text>
            <Text style={styles.timestamp}>
              {convertTimestampToDate(latestLog.timestamp).toLocaleString()}
            </Text>
          </View>
        )}

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
          <Text style={styles.cardTitle}>🤖 AI-Powered Recommendation</Text>
          {aiRecommendation ? (
            <>
              <Text style={styles.text}>{aiRecommendation.recommendation}</Text>
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.text, { fontSize: 12, color: colors.subtext }]}>
                  Based on:
                </Text>
                {aiRecommendation.factors.map((factor, index) => (
                  <Text key={index} style={[styles.text, { fontSize: 12, color: colors.subtext }]}>
                    • {factor}
                  </Text>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.text}>Generating personalized recommendation...</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Log')}
        >
          <Text style={styles.cardTitle}>Log Recovery</Text>
          <Text style={styles.cardDescription}>
            Record your daily progress and symptoms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.cardTitle}>View History</Text>
          <Text style={styles.cardDescription}>
            Track your recovery journey
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Form')}
        >
          <Text style={[styles.cardTitle, { color: '#fff' }]}>🎥 Exercise Form Analysis</Text>
          <Text style={[styles.cardDescription, { color: '#fff' }]}>
            Get real-time feedback on your exercise form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardDescription}>
            Manage your account and settings
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
