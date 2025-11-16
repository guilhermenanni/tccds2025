import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterUserScreen from '../screens/RegisterUserScreen';
import RegisterTeamScreen from '../screens/RegisterTeamScreen';
import FeedScreen from '../screens/FeedScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import SeletivasScreen from '../screens/SeletivasScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Seletivas" component={SeletivasScreen} />
      <Tab.Screen name="CriarPostagem" component={CreatePostScreen} options={{ title: 'Criar' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="AppTabs" component={AppTabs} />
            <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterUser" component={RegisterUserScreen} />
            <Stack.Screen name="RegisterTeam" component={RegisterTeamScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
