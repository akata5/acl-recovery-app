import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appearance } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import LogScreen from './screens/LogScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import FormScreen from './screens/FormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  if (!colorScheme) return null; // Wait until theme is known

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} theme={colorScheme} />}
        </Stack.Screen>
        <Stack.Screen name="Log">
          {(props) => <LogScreen {...props} theme={colorScheme} />}
        </Stack.Screen>
        <Stack.Screen name="History">
          {(props) => <HistoryScreen {...props} theme={colorScheme} />}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {(props) => <ProfileScreen {...props} theme={colorScheme} />}
        </Stack.Screen>
        <Stack.Screen name="Form">
          {(props) => <FormScreen {...props} theme={colorScheme} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
