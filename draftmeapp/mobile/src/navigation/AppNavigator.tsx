import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterUserScreen from '../screens/RegisterUserScreen';
import RegisterTeamScreen from '../screens/RegisterTeamScreen';

import FeedScreen from '../screens/FeedScreen';
import SeletivasScreen from '../screens/SeletivasScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  PostDetails: { id_postagem: number };
};

export type AuthStackParamList = {
  Login: undefined;
  RegisterUser: undefined;
  RegisterTeam: undefined;
};

export type MainTabsParamList = {
  Feed: undefined;
  Seletivas: undefined;
  Criar: undefined;
  Perfil: undefined;
};

// ...existing code...

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // ...existing code...
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Feed') iconName = 'home';
          if (route.name === 'Seletivas') iconName = 'trophy-outline';
          if (route.name === 'Criar') iconName = 'add-circle-outline';
          if (route.name === 'Perfil') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      // ...existing code...
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      // ...existing code...
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? 'MainTabs' : 'Auth'}
      screenOptions={{ headerShown: false }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="PostDetails" 
            component={PostDetailsScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};