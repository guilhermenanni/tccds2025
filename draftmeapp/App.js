import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './Screens/HomeScreen';
import LoginScreen from './Screens/LoginScreen';
import MainScreen from './Screens/MainScreen';
import RegisterScreen from './Screens/RegisterScreen';
import RegisterPlayerScreen from './Screens/RegisterPlayerScreen';
import RegisterTeamScreen from './Screens/RegisterTeamScreen';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen';
import FeedScreen from './Screens/FeedScreen';
import CreatePostScreen from './Screens/CreatePostScreen';
import CommentsScreen from './Screens/CommentsScreen';
import SearchScreen from './Screens/SearchScreen';
import ProfileScreen from './Screens/ProfileScreen';
import MyProfileScreen from './Screens/MyProfileScreen';
import LocationScreen from './Screens/LocationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'DraftMe', headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login', headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Cadastro', headerShown: false }} 
        />
        <Stack.Screen 
          name="RegisterPlayer" 
          component={RegisterPlayerScreen} 
          options={{ title: 'Cadastro Jogador', headerShown: false }} 
        />
        <Stack.Screen 
          name="RegisterTeam" 
          component={RegisterTeamScreen} 
          options={{ title: 'Cadastro Time', headerShown: false }} 
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen} 
          options={{ title: 'Recuperar Senha', headerShown: false }} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={{ title: 'DraftMe', headerShown: false }} 
        />
        <Stack.Screen 
          name="Feed" 
          component={FeedScreen} 
          options={{ title: 'Feed', headerShown: false }} 
        />
        <Stack.Screen 
          name="CreatePost" 
          component={CreatePostScreen} 
          options={{ title: 'Nova Postagem', headerShown: false }} 
        />
        <Stack.Screen 
          name="Comments" 
          component={CommentsScreen} 
          options={{ title: 'Comentários', headerShown: false }} 
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ title: 'Buscar', headerShown: false }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Perfil', headerShown: false }} 
        />
        <Stack.Screen 
          name="MyProfile" 
          component={MyProfileScreen} 
          options={{ title: 'Meu Perfil', headerShown: false }} 
        />
        <Stack.Screen 
          name="Location" 
          component={LocationScreen} 
          options={{ title: 'Localização', headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

