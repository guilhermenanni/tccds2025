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
import MySeletivasScreen from '../screens/MySeletivasScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';

export type AuthStackParamList = {
  Login: undefined;
  RegisterUser: undefined;
  RegisterTeam: undefined;
};

export type MainTabsParamList = {
  Feed: undefined;
  Seletivas: undefined;
  MinhasSeletivas: undefined;
  Criar: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  PostDetails: { id_postagem: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="RegisterUser" component={RegisterUserScreen} />
    <AuthStack.Screen name="RegisterTeam" component={RegisterTeamScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#22C55E',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        backgroundColor: '#020617',
        borderTopColor: '#111827',
      },
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';

        if (route.name === 'Feed') iconName = 'home';
        if (route.name === 'Seletivas') iconName = 'trophy';
        if (route.name === 'MinhasSeletivas') iconName = 'checkmark-circle';
        if (route.name === 'Criar') iconName = 'add-circle';
        if (route.name === 'Perfil') iconName = 'person';

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
    <Tab.Screen
      name="Seletivas"
      component={SeletivasScreen}
      options={{ title: 'Seletivas' }}
    />
    <Tab.Screen
      name="MinhasSeletivas"
      component={MySeletivasScreen}
      options={{ title: 'Minhas' }}
    />
    <Tab.Screen name="Criar" component={CreatePostScreen} options={{ title: 'Criar' }} />
    <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil' }} />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#020617',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
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
