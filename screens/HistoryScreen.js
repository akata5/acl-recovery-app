import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function HistoryScreen() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'logs'));
        const data = snapshot.docs.map(doc => doc.data());
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(sorted);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Log History</Text>
      {logs.length === 0 ? (
        <Text>No logs yet.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Log #{logs.length - index}</Text>
              <Text>Pain: {item.pain}</Text>
              <Text>Activity: {item.activity}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          )}
        />
      )}
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
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
