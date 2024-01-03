import React, { useState, useEffect } from "react";
import { Animated, StyleSheet, View, StatusBar } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase'
import app from '../app.json';

function AnimatedSplashScreen({navigation}) {

    const opacity = useState(new Animated.Value(1))[0]

    useEffect(() => {
        async function prepare() {
            let appVersion = app.expo.version;
            try {
                let serverVersion = await getDoc(doc(db, "app", "version"));
                if(serverVersion.data().version !== appVersion) {
                    alert("Please update the app to the latest version.");
                } else {
                    let id = await AsyncStorage.getItem('id');
                    {id ?
                        setTimeout(() => {
                            Animated.timing(opacity, {
                              toValue:0,
                              timing: 500,
                              useNativeDriver: true
                            }).start(() => navigation.navigate('HomeScreen'))
                        }, 700)
                    : 
                        setTimeout(() => {
                            Animated.timing(opacity, {
                            toValue:0,
                            timing: 500,
                            useNativeDriver: true
                            }).start(() => navigation.navigate('GetStarted'))
                        }, 700)
                    }
                } 
            } catch (error) {
                alert("An error has occured.")
            }
        }
        prepare();
    })

    return (
        <View style={styles.background}>
            <StatusBar barStyle="light-content" />
            <Animated.Image
                source={require("../assets/splash.png")}
                resizeMode="contain"
                style={[
                    {
                        width: "100%",
                        height: "100%",
                        opacity
                    }
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: '#181818',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
  });
  
  export default AnimatedSplashScreen;