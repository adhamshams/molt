import React, { useState, useEffect, useCallback } from 'react';
import { Image, Dimensions } from "react-native";
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen'

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AnimatedSplashScreen from './screens/AnimatedSplashScreen';
import HomeScreen from './screens/HomeScreen';
import GetStarted from './screens/GetStarted';
import CreateGame from './screens/CreateGame';
import JoinGame from './screens/JoinGame';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import RoundEndScreen from './screens/RoundEndScreen';

const Stack = createStackNavigator();

export default function App() {

  const [appIsReady, setAppIsReady] = useState(false);
  const { width, height } = Dimensions.get('window');
  const fontSize = Math.max(width, height);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load assets, make any API calls you need to do here
        let images = [    
          require("./assets/splash.png"),
          require("./assets/modal-button.png"),
          require("./assets/main.png"),
          require("./assets/profile-icon.png"),
          require("./assets/arrow-back.png"),
          require("./assets/close.png"),
          require("./assets/Club.png"),
          require("./assets/Diamonds.png"),
          require("./assets/Heart.png"),
          require("./assets/Spades.png"),
          require("./assets/close-icon.png"),
        ]

        let fonts = [
          {'newake': require('./assets/fonts/NewakeFont-Demo.otf')},
        ]

        const imageAssets = images.map((image) => {
          if (typeof image == "string") {
            return Image.prefetch(image);
          } else {
            return Asset.fromModule(image).downloadAsync();
          }
        });
      
        const fontAssets = fonts.map(font => Font.loadAsync(font));
      
        await Promise.all(imageAssets);
        await Promise.all(fontAssets);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer onLayout={onLayoutRootView}>
      <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: '#000', shadowColor: '#000'}, headerTitleStyle: {fontFamily: 'newake', fontSize: fontSize * 0.02}, headerTintColor: '#fff', headerBackTitleVisible: false, headerBackImage: () => <Image source={require('.//assets/arrow-back.png')} style={{width: 30, height: 35, marginLeft: 20}} />}}>
        <Stack.Screen name="AnimatedSplashScreen" component={AnimatedSplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false, animationEnabled: false, gestureEnabled: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false, animationEnabled: false, gestureEnabled: false }} />
        <Stack.Screen name="CreateGame" component={CreateGame} options={{ headerTitle: 'CREATE GAME' }} />
        <Stack.Screen name="JoinGame" component={JoinGame} options={{ headerTitle: 'JOIN GAME' }} />
        <Stack.Screen name="LobbyScreen" component={LobbyScreen} options={{ headerTitle: 'LOBBY', animationEnabled: false, gestureEnabled: false, headerBackImage: () => null }} />
        <Stack.Screen name="GameScreen" component={GameScreen} options={{ animationEnabled: false, gestureEnabled: false, headerBackImage: () => null }} />
        <Stack.Screen name='RoundEndScreen' component={RoundEndScreen} options={{ animationEnabled: false, gestureEnabled: false, headerBackImage: () => null  }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
