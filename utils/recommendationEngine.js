import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Constants for recommendation thresholds
const PAIN_THRESHOLDS = {
  HIGH: 7,
  MODERATE: 4,
  LOW: 2
};

const RECOVERY_STAGES = {
  EARLY: 'early',      // 0-6 weeks
  MIDDLE: 'middle',    // 6-12 weeks
  LATE: 'late'         // 12+ weeks
};

// Helper function to calculate recovery stage based on first log date
const calculateRecoveryStage = (firstLogDate) => {
  const now = new Date();
  const weeksSinceStart = (now - firstLogDate) / (1000 * 60 * 60 * 24 * 7);
  
  if (weeksSinceStart <= 6) return RECOVERY_STAGES.EARLY;
  if (weeksSinceStart <= 12) return RECOVERY_STAGES.MIDDLE;
  return RECOVERY_STAGES.LATE;
};

// Analyze pain trends
const analyzePainTrend = (logs) => {
  if (logs.length < 2) return 'stable';
  
  const recentLogs = logs.slice(-5); // Look at last 5 logs
  const painLevels = recentLogs.map(log => log.pain);
  
  const trend = painLevels.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return 0;
    return acc + (curr - arr[idx - 1]);
  }, 0) / (painLevels.length - 1);
  
  if (trend > 0.5) return 'increasing';
  if (trend < -0.5) return 'decreasing';
  return 'stable';
};

// Get exercise frequency
const getExerciseFrequency = (logs) => {
  const recentLogs = logs.slice(-7); // Last 7 days
  const daysWithExercises = recentLogs.filter(log => 
    log.exercises && log.exercises.trim().length > 0
  ).length;
  
  return daysWithExercises / 7; // Returns a value between 0 and 1
};

// Generate personalized recommendation
export const generateRecommendation = async (userId) => {
  try {
    // Fetch recent logs
    const logsQuery = query(
      collection(db, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(30) // Get last 30 days of logs
    );
    
    const snapshot = await getDocs(logsQuery);
    const logs = snapshot.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    })).reverse(); // Reverse to get chronological order
    
    if (logs.length === 0) {
      return {
        recommendation: "Start your recovery journey by logging your first entry.",
        confidence: 1,
        factors: ["No previous data"]
      };
    }

    const latestLog = logs[logs.length - 1];
    const firstLog = logs[0];
    const recoveryStage = calculateRecoveryStage(firstLog.timestamp);
    const painTrend = analyzePainTrend(logs);
    const exerciseFrequency = getExerciseFrequency(logs);
    
    // Generate recommendation based on multiple factors
    let recommendation = "";
    let confidence = 0.8;
    const factors = [];

    // Pain level based recommendations
    if (latestLog.pain >= PAIN_THRESHOLDS.HIGH) {
      recommendation = "High pain detected. Rest and ice are crucial. ";
      factors.push("High pain level");
      
      if (painTrend === 'increasing') {
        recommendation += "Consider consulting your physical therapist as pain is trending upward.";
        factors.push("Increasing pain trend");
        confidence = 0.9;
      }
    } else if (latestLog.pain >= PAIN_THRESHOLDS.MODERATE) {
      recommendation = "Moderate pain level. ";
      factors.push("Moderate pain level");
      
      if (exerciseFrequency < 0.5) {
        recommendation += "Focus on gentle range of motion exercises and light strengthening.";
        factors.push("Low exercise frequency");
      } else {
        recommendation += "Maintain current exercise routine but reduce intensity.";
        factors.push("Regular exercise pattern");
      }
    } else {
      recommendation = "Low pain level. ";
      factors.push("Low pain level");
      
      if (recoveryStage === RECOVERY_STAGES.EARLY) {
        recommendation += "Continue with basic strengthening and range of motion exercises.";
        factors.push("Early recovery stage");
      } else if (recoveryStage === RECOVERY_STAGES.MIDDLE) {
        recommendation += "You can progress to more challenging exercises and light activities.";
        factors.push("Middle recovery stage");
      } else {
        recommendation += "Consider adding sport-specific exercises and controlled impact activities.";
        factors.push("Late recovery stage");
      }
    }

    // Add activity-specific recommendations
    if (latestLog.activity) {
      const activity = latestLog.activity.toLowerCase();
      if (activity.includes('run') || activity.includes('jump')) {
        if (recoveryStage !== RECOVERY_STAGES.LATE) {
          recommendation += " Avoid high-impact activities until cleared by your physical therapist.";
          factors.push("High-impact activity detected");
        }
      }
    }

    return {
      recommendation,
      confidence,
      factors,
      recoveryStage,
      painTrend,
      exerciseFrequency
    };
  } catch (error) {
    console.error('Error generating recommendation:', error);
    return {
      recommendation: "Unable to generate recommendation at this time.",
      confidence: 0,
      factors: ["Error in data processing"]
    };
  }
}; 