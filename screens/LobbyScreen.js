import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, SafeAreaView, BackHandler, TouchableOpacity, Text, Alert, ScrollView, Dimensions } from "react-native";
import Button from "../components/Button";
import { db } from '../firebase'
import { deleteDoc, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { StackActions } from '@react-navigation/native';
import AnimatedEllipsis from 'react-native-animated-ellipsis';

function LobbyScreen({navigation, route}) {

    const [loading, setLoading] = useState(false);
    const [gameObject, setGameObject] = useState(route.params.gameObject);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "games", route.params.gameCode), (doc) => {
            if(doc.data()){
                if(doc.data().status === 'lobby')
                    setGameObject(doc.data());
                else
                    navigation.dispatch(StackActions.replace('GameScreen', {gameObject: doc.data(), gameCode: route.params.gameCode, number: route.params.number}));
            }
            else{
                navigation.navigate('HomeScreen');
                alert("Host has left the game.");
            }
        });
        return () => unsub();
    }, []);

    async function handleStart() {
        setLoading(true);
        const suits = ["Spades", "Diamonds", "Club", "Heart"];
        const values = [
            "A",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "J",
            "Q",
            "K",
        ];
        let deck = [];
        for (let i = 0; i < suits.length; i++) {
            for (let x = 0; x < values.length; x++) {
                let card = { Value: values[x], Suit: suits[i] };
                deck.push(card);
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * i);
            let temp = deck[i];
            deck[i] = deck[j];
            deck[j] = temp;
        }
        let players = gameObject.players;
        for (let i = 0; i < players.length; i++) {
            players[i].hand = [];
            players[i].score = 0;
            players[i].revealed = false;
            players[i].ready = false;
            for (let x = 0; x < 4; x++) {
                players[i].hand.push(deck.pop());
            }
        }
        gameObject.players = players;
        gameObject.status = 'revealing';
        gameObject.deck = deck;
        gameObject.pile = [];
        gameObject.round = 1;
        gameObject.endRoundIndex = -1;
        gameObject.turn = 0;
        gameObject.count = players.length;
        gameObject.burnt = false;
        try{
            await setDoc(doc(db, "games", route.params.gameCode), gameObject);
            navigation.dispatch(StackActions.replace('GameScreen', {gameObject: gameObject, gameCode: route.params.gameCode, number: route.params.number}));
        } catch (e) {
            alert("An error has occured.")
        }
    }

    async function handleExit() {
        Alert.alert(
            "Exit Game",
            "Are you sure you want to exit this game?",
            [
              {
                text: "Cancel",
                onPress: () => null,
                style: "cancel"
              },
              { text: "Exit", onPress: () => {
                navigation.goBack();
                if(route.params.host) {
                    deleteDoc(doc(db, "games", route.params.gameCode));
                } else {
                    const gameRef = doc(db, 'games', route.params.gameCode);
                    setDoc(gameRef, { players: gameObject.players.splice(route.params.number - 1,1) }, { merge: true });
                }
              }}
            ]
        );
    }

    useEffect(() => {
        navigation.setOptions({headerRight: () =>
            <TouchableOpacity onPress={() => handleExit()}>
              <Image style={{width: 30, height: 30, marginRight: 20}} source={require('../assets/close.png')}/>
            </TouchableOpacity>})
    }, [])

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', () => handleExit())
        return () => BackHandler.removeEventListener("hardwareBackPress", () => handleExit());
    }, [])

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

    return (
        <SafeAreaView style={styles.background}>
            <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.03, textAlign: 'center', marginTop: 25}}>LOBBY CODE</Text>
            <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.06, textAlign: 'center', marginTop: 20}}>{route.params.gameCode}</Text>
            <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02, marginTop: 40, marginLeft: '7.5%'}}>Players ({gameObject.players.length}/4)</Text>
            <View style={{marginTop: 20, width: '85%', height: fontSize * 0.5, alignSelf: 'center', backgroundColor: '#ffda74', borderRadius: 12}}> 
                <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'column', flex: 1}}>
                    {gameObject.players.map((player, index) => {
                        return (
                            <View key={index} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 25, marginLeft: 20}}>
                                <Image source={require("../assets/profile-icon.png")} resizeMode="contain" style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: '#000'}} />
                                <Text style={{color: '#000', fontFamily: 'newake', fontSize: fontSize * 0.02, marginLeft: 10}}>{player.name}</Text>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
            {route.params.host ? 
                <Button disabled={gameObject.players.length === 1} onPress={() => handleStart()} isLoading={loading} title={'START'} style={{backgroundColor: '#ffda74', color: '#181818', fontSize: fontSize * 0.02, width: '85%', height: fontSize * 0.06, marginTop: 'auto', alignSelf: 'center', marginBottom: fontSize * 0.01, loadingColor: '#000'}}/> 
            : 
                <View style={{display: 'flex', flexDirection: 'column', width: '85%', marginTop: 'auto', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: fontSize * 0.01}}>
                    <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center', marginTop: 20}}>Waiting for host to start the game</Text>
                    <AnimatedEllipsis style={{color: '#fff', fontSize: 72, marginTop: -30}}/>
                </View>
            }
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
  
  export default LobbyScreen;