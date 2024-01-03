import React, { useState, useEffect } from "react";
import { StyleSheet, Image, BackHandler, SafeAreaView, KeyboardAvoidingView, Text, TextInput, Dimensions } from "react-native";
import Button from "../components/Button";
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

function GetStarted({navigation}) {

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    async function handlePress() { 
        setLoading(true);
        await AsyncStorage.setItem('id', uuid.v4());
        await AsyncStorage.setItem('name', name);
        navigation.navigate('HomeScreen');
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
        return () => backHandler.remove()
    }, [])

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

    return (
        <SafeAreaView style={styles.background}>
            <Image source={require("../assets/main.png")} style={{width: fontSize * 0.3, height: fontSize * 0.3, alignSelf: 'center', marginTop: 20}}/>
            <Text style={{color: '#fff', fontFamily: 'newake', marginTop: 10, fontSize: fontSize * 0.03, textAlign: 'center'}}>ENTER YOUR PLAYER NAME</Text>
            <TextInput maxLength={15} selectionColor={'#ffda74'} keyboardAppearance="dark" autoCapitalize="none" style={{height: fontSize * 0.06, marginTop: 10, width: "85%", backgroundColor: "transparent", borderBottomWidth: 1, borderBottomColor: '#fff', borderTopColor: '#CE1212', borderRightColor: '#CE1212', borderLeftColor: '#CE1212', color: "#ffda74", fontSize: fontSize * 0.02, fontFamily: "newake", alignSelf: 'center', textAlign: 'center'}} placeholderTextColor={'#696969'} placeholder={'PLAYER NAME'} onChangeText={(text) => setName(text)} value={name} 
                returnKeyType={'go'} onSubmitEditing={() => handlePress()} blurOnSubmit={false}
            />
            <KeyboardAvoidingView  behavior={Platform.OS == "ios" ? "position" : "height"} style={{marginTop: 'auto', paddingVertical: fontSize * 0.01, display: 'flex', justifyContent: 'center'}}>
                <Button onPress={() => handlePress()} disabled={name.length === 0} isLoading={loading} title={'GET STARTED'} style={{backgroundColor: '#ffda74', color: '#181818', fontSize: fontSize * 0.02, width: '85%', height: fontSize * 0.06, alignSelf: 'center', loadingColor: '#000'}}/>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: '#181818',
      display: 'flex',
      flexDirection: 'column'
    },
  });
  
  export default GetStarted;