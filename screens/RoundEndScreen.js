import React, { useState, useEffect } from "react";
import { StyleSheet, BackHandler, View, Image, SafeAreaView, Dimensions, TouchableOpacity, Text, Alert } from "react-native";
import Button from "../components/Button";
import { db } from '../firebase'
import { deleteDoc, onSnapshot, doc, setDoc } from 'firebase/firestore'
import Card from "../components/Card";
import { CountUp } from 'use-count-up';
import { StackActions } from '@react-navigation/native';
import AnimatedEllipsis from 'react-native-animated-ellipsis';

function RoundEndScreen({navigation, route}) {

    const [gameObject, setGameObject] = useState(route.params.gameObject);
    const [flippedCards, setFlippedCards] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [sums, setSums] = useState([]);
    const [scores, setScores] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
      const unsub = onSnapshot(doc(db, "games", route.params.gameCode), (res) => {
        if(res.data()){
            setGameObject(res.data());
            let obj = res.data();
            let flag = true;
            obj.players.forEach(player => {
              !player.ready ? flag = false : null;
            })
            if(flag && route.params.numer === 0){
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
                    players[i].revealed = false;
                    players[i].score = scores[i];
                    players[i].ready = false;
                    for (let x = 0; x < 4; x++) {
                        players[i].hand.push(deck.pop());
                    }
                }
                obj.players = players;
                obj.status = 'revealing';
                obj.deck = deck;
                obj.pile = [];
                obj.round = obj.round + 1;
                obj.turn = obj.endRoundIndex + 1;
                if(obj.turn === obj.count)
                    obj.turn = 0;
                obj.burnt = false;
                obj.endRoundIndex = -1;
                try{
                  setDoc(doc(db, "games", route.params.gameCode), obj);
                  navigation.dispatch(StackActions.replace('GameScreen', {gameObject: obj, gameCode: route.params.gameCode, number: route.params.number}));
                } catch (e) {
                  setRetryCount(prevCount => prevCount + 1);
                  alert("An error has occured.")
                }
            } else if(gameObject.status === "revealing"){
              navigation.dispatch(StackActions.replace('GameScreen', {gameObject: obj, gameCode: route.params.gameCode, number: route.params.number}));
            }
        }
        else{
          navigation.navigate('HomeScreen');
          alert("A player has left the game.");
        }
      });
      return () => unsub();
    }, [scores, retryCount]);

    useEffect(() => {
      BackHandler.addEventListener('hardwareBackPress', () => handleExit())
      return () => BackHandler.removeEventListener("hardwareBackPress", () => handleExit());
    }, [])

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
                const docRef = doc(db, "games", route.params.gameCode);
                deleteDoc(docRef);
                navigation.navigate('HomeScreen');
              }}
            ]
        );
    }

    useEffect(() => {
      navigation.setOptions({headerRight: () =>
        <TouchableOpacity onPress={() => handleExit()}>
          <Image style={{width: 30, height: 30, marginRight: 20}} source={require('../assets/close.png')}/>
        </TouchableOpacity>
        , headerTitle: () => <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02}}>End of Round {gameObject.round}</Text>
        })
    }, []) 

    useEffect(() => {
        const interval = setInterval(async () => {
          if (currentPlayerIndex < gameObject.players.length) {
            const currentPlayer = gameObject.players[currentPlayerIndex];
            if (currentCardIndex < currentPlayer.hand.length) {
              setFlippedCards(prevFlipped => [...prevFlipped, { playerIndex: currentPlayerIndex, cardIndex: currentCardIndex }]);
              setCurrentCardIndex(prevIndex => prevIndex + 1);
            } else if(sums[currentPlayerIndex] === undefined){
              let sum = calculateSum(currentPlayer.hand); 
              setSums(prevSums => [...prevSums, {sum: sum, playerIndex: currentPlayerIndex}]); 
            }
            else {
              setCurrentPlayerIndex(prevIndex => prevIndex + 1);
              setCurrentCardIndex(0);
            }
          } else {
            clearInterval(interval);
            const sortedArray = sums.slice().sort((a, b) => a.sum - b.sum);
            let arrTemp = []
            let gameOverFlag = false;
            let scoreTemp = 0
            sortedArray.forEach((item, index) => {
              if(index === 0 && item.sum === 0)
                scoreTemp = -10;
              let newScore = gameObject.players[item.playerIndex].score + scoreTemp;
              arrTemp[item.playerIndex] = newScore;
              if(newScore >= gameObject.targetScore){
                gameOverFlag = true;
              } 
              if(index < sortedArray.length - 1 && item.sum !== sortedArray[index + 1].sum){
                scoreTemp += 10;
              }
            });
            setScores(arrTemp);
            if(gameOverFlag){
              setIsGameOver(true)
              let lowestScore = scores[0];
              let lowestScoreIndex = 0;
              for (let i = 1; i < scores.length; i++) {
                if (scores[i] < lowestScore) {
                  lowestScore = scores[i];
                  lowestScoreIndex = i;
                }
              }
              gameObject.status = 'gameover';
              setDoc(doc(db, "games", route.params.gameCode), gameObject);
              setWinner(gameObject.players[lowestScoreIndex].name)
            }
          }
        }, 1000);
    
        return () => {
          clearInterval(interval);
        };
    }, [currentPlayerIndex, currentCardIndex, sums]);

    const calculateSum = (hand) => {
        let sum = 0;
        hand.forEach(card => {
            if(card.Value === 'A')
                sum += 1;
            else if(card.Value === '10')
                sum += 0;
            else if(card.Value === 'J' || card.Value === 'Q' || card.Value === 'K')
                sum += 10;
            else
                sum += parseInt(card.Value);
        });
        return sum;
    }

    const renderPlayers = () => {
        return(
            <View style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                {gameObject.players.map((player, playerIndex) => {
                    return(
                        <View key={playerIndex} style={{display: 'flex', flexDirection: 'column', marginLeft: 20, marginTop: 20}}>
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <Image style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: gameObject.players[playerIndex].revealed ? '#0f0' : '#000'}} source={require('../assets/profile-icon.png')}/>
                                <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02, marginLeft: 10}}>{player.name}</Text>
                                {scores[playerIndex] ?
                                    <Text style={{marginLeft: 'auto', marginRight: 20, color: '#ffda74', fontSize: fontSize * 0.02, fontFamily: 'newake'}}>
                                        Score: <CountUp isCounting start={player.score} end={scores[playerIndex]} duration={1.5}/>
                                    </Text>
                                    :
                                    <Text style={{marginLeft: 'auto', marginRight: 20, color: '#ffda74', fontSize: fontSize * 0.02, fontFamily: 'newake'}}>Score: {player.score}</Text>
                                }
                            </View>
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 10}}>
                                {player.hand.map((card, cardIndex) => {
                                    return(
                                        <View key={cardIndex} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                            <Card flip={flippedCards.some(item => item.playerIndex === playerIndex && item.cardIndex === cardIndex)} card={card} onPress={() => null}/>
                                        </View>
                                    )
                                })}
                            </View>
                            {sums[playerIndex] ?
                                <Text style={{marginTop: 15, color: '#fff', fontSize: fontSize * 0.02, fontFamily: 'newake'}}>
                                    Sum: <CountUp isCounting start={0} end={sums[playerIndex].sum} duration={1.5}/>
                                </Text>
                                :
                                <Text style={{marginTop: 15, color: '#fff', fontSize: fontSize * 0.02, fontFamily: 'newake'}}>Sum: 0</Text>
                            }
                        </View>
                    )
                })}
            </View>
        )
    }

    const handleReady = async () => {
      setLoading(true);
      gameObject.players[route.params.number].ready = true;
      try{
        await setDoc(doc(db, "games", route.params.gameCode), gameObject);
      } catch (e) {
        alert("An error has occured.")
      }
    }

    const handleReturnHome = () => {
      gameObject.count = gameObject.count - 1;
      if(gameObject.count === 0){
        const docRef = doc(db, "games", route.params.gameCode);
        deleteDoc(docRef);
      } else {
        setDoc(doc(db, "games", route.params.gameCode), gameObject)
      }
      navigation.navigate('HomeScreen');
    }

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

    return (
      <SafeAreaView style={styles.background}>
        {renderPlayers()}
        {!isGameOver && scores.length === gameObject.count && !gameObject.players[route.params.number].revealed ?
          <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: 20}}>
            <Button isLoading={loading} style={{backgroundColor: '#ffda74', color: '#181818', loadingColor: '#181818', height: fontSize * 0.06, width: "85%", fontSize: fontSize * 0.02, marginTop: 20}} onPress={() => handleReady()} title="READY"/>
          </View>
        : !isGameOver && gameObject.players[route.params.number].revealed && scores.length === gameObject.count ?
          <View style={{display: 'flex', flexDirection: 'column', width: '85%', marginTop: 'auto', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 25}}>
            <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center', marginTop: 20}}>Waiting for players to ready up</Text>
            <AnimatedEllipsis style={{color: '#fff', fontSize: 72, marginTop: -30}}/>
          </View>
        : null}
        {isGameOver ?
          <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: 20, gap: 15}}>
            <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02}}>GAME OVER</Text>
            <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02}}>Winner: {winner}</Text>
            <Button style={{backgroundColor: '#ffda74', color: '#181818', loadingColor: '#181818', height: fontSize * 0.06, width: "85%", fontSize: fontSize * 0.02}} onPress={() => handleReturnHome()} title="RETURN TO HOME SCREEN"/>
          </View>
        : null}
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
  
  export default RoundEndScreen;