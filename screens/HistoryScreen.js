import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { lightColors, darkColors } from '../theme'; // 👈 import theme

const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'number') return new Date(timestamp);
  return new Date(timestamp);
};

export default function HistoryScreen({ theme }) {
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'logs'));
        const data = snapshot.docs.map(doc => doc.data());
        const sorted = data.sort((a, b) =>
          convertTimestampToDate(b.timestamp) - convertTimestampToDate(a.timestamp)
        );
        setLogs(sorted);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

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
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontWeight: 'bold',
      marginBottom: 5,
      color: colors.text,
    },
    text: {
      color: colors.text,
    },
    timestamp: {
      fontSize: 12,
      color: colors.subtext,
      marginTop: 5,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Log History</Text>
      {logs.length === 0 ? (
        <Text style={styles.text}>No logs yet.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Log #{logs.length - index}</Text>
              <Text style={styles.text}>Pain: {item.pain}</Text>
              <Text style={styles.text}>Activity: {item.activity}</Text>
              <Text style={styles.timestamp}>
                {convertTimestampToDate(item.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
