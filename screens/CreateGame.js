import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text, Alert, Dimensions } from "react-native";
import Button from "../components/Button";
import { db } from '../firebase.js'
import { setDoc, getDoc, doc, collection } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';

function CreateGame({navigation}) {

    const [targetScore, setTargetScore] = useState(50);
    const [loading, setLoading] = useState(false);

    async function handleCreate() {
        setLoading(true);
        let gameCode = await generateUniqueRoomCode();
        const gamesRef = collection(db, "games");
        let player = {
            id: await AsyncStorage.getItem('id'),
            name: await AsyncStorage.getItem('name')
        }
        let gameObject = {
            players: [player],
            status: 'lobby',
            targetScore: targetScore
        }
        try{
            await setDoc(doc(gamesRef, gameCode), gameObject);
        } catch (e) {
            setLoading(false);
            Alert("An error has occured while creating the game.") // handle your error here
        } finally {
            navigation.navigate('LobbyScreen', {gameObject, gameCode, host: true, number: 0});
            setLoading(false);
        }
    }

    const generateUniqueRoomCode = async() => {
        let code = createCode();
        let doesExist = await checkCode(code);
        while(doesExist) {
            code = createCode();
            doesExist = await checkCode(code);
        }
        return code;
    }

    const checkCode = async (code) => {
        try {
            const docRef = doc(db, "games", code);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            setLoading(false);
            Alert("An error has occured while creating the game.")
        }
    }

    const createCode = () => {
        let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return code;
    }

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

    return (
        <SafeAreaView style={styles.background}>
            <Text style={{color: '#fff', fontFamily: 'newake', textAlign: 'center', marginTop: 25, fontSize: fontSize * 0.03}}>TARGET SCORE</Text>
            <View style={{display: 'flex', flexDirection: 'row', width: '100%', marginTop: 25, justifyContent: 'space-around', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => {targetScore > 50 ? setTargetScore(targetScore-10) : null}} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 8, backgroundColor: '#ffda74', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <Text style={{color: '#181818', fontFamily: 'newake', fontSize: fontSize * 0.03}}>-</Text>
                </TouchableOpacity>
                <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.03}}>{targetScore}</Text>
                <TouchableOpacity onPress={() => {targetScore < 200 ? setTargetScore(targetScore+10) : null}}  style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 8, backgroundColor: '#ffda74', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <Text style={{color: '#181818', fontFamily: 'newake', fontSize: fontSize * 0.03}}>+</Text>
                </TouchableOpacity>
            </View>
            <Button onPress={() => handleCreate()} isLoading={loading} title={'CREATE'} style={{backgroundColor: '#ffda74', color: '#181818', fontSize: fontSize * 0.02, width: '85%', height: fontSize * 0.06, marginTop: 'auto', alignSelf: 'center', marginBottom: fontSize * 0.01, loadingColor: '#000'}}/>
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
  
  export default CreateGame;