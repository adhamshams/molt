import React, { useState, useEffect } from "react";
import { StyleSheet, Animated, View, Image, SafeAreaView, BackHandler, TouchableOpacity, Text, Alert, Dimensions } from "react-native";
import Button from "../components/Button";
import { db } from '../firebase'
import { deleteDoc, onSnapshot, doc, setDoc } from 'firebase/firestore'
import Card from "../components/Card";
import { useHeaderHeight } from '@react-navigation/elements';
import { StackActions } from '@react-navigation/native';
import AnimatedEllipsis from 'react-native-animated-ellipsis';


function GameScreen({navigation, route}) {

    const [gameObject, setGameObject] = useState(route.params.gameObject);
    const [revealedCards, setRevealedCards] = useState([]);
    const [newCard, setNewCard] = useState(null);
    const [deckFlip, setDeckFlip] = useState(false);
    const [loading, setLoading] = useState(false);
    const [kingAbility, setKingAbility] = useState(false);
    const [queenAbility, setQueenAbility] = useState(false);
    const [jackAbility, setJackAbility] = useState(false);
    const [enemyRevealedCard, setEnemyRevealedCard] = useState(null);
    const [kingSwapCard, setKingSwapCard] = useState(null);
    const [kingEnemySwapCard, setKingEnemySwapCard] = useState(null);
    const [kingAbilityEnemyPlayerIndex, setKingAbilityEnemyPlayerIndex] = useState(null);
    const [kingAbilityEnemyCardIndex, setKingAbilityEnemyCardIndex] = useState(null);
    const [slideInAnim] = useState(new Animated.Value(-Dimensions.get('window').width));

    useEffect(() => {
      const unsub = onSnapshot(doc(db, "games", route.params.gameCode), (res) => {
        if(res.data()){
          setGameObject(res.data());
          let obj = res.data()
          //Game Statuses
          //Revealing
          if(obj.status === 'revealing'){
            let flag = true;
            obj.players.forEach(player => {
              !player.revealed ? flag = false : null;
            })
            if(flag){
              obj.status = 'dealing';
              obj.players.forEach(player => {
                player.revealed = false;
              })
              setTimeout(() => {
                setDoc(doc(db, "games", route.params.gameCode), obj);
                setRevealedCards([]);
              }, 2000);
            }
          }
          //Dealing
          if(obj.status === 'dealing'){

          }
          //Round End
          if(obj.status === 'roundEnd'){
            navigation.dispatch(StackActions.replace('RoundEndScreen', {gameObject: obj, gameCode: route.params.gameCode, number: route.params.number}));
          }
        }
        else{
          navigation.navigate('HomeScreen');
          alert("A player has left the game.");
        }
      });
      return () => unsub();
    }, []);

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
        , headerTitle: () => <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02}}>Round {gameObject.round}</Text>
        })
    }, [])

    useEffect(() => {
      BackHandler.addEventListener('hardwareBackPress', () => handleExit())
      return () => BackHandler.removeEventListener("hardwareBackPress", () => handleExit());
    }, [])

    const renderTopPlayer = () => {
      let opposition;
      if(gameObject.count === 2){
        opposition = route.params.number === 0 ? 1 : 0;
      } else {
        opposition = route.params.number + 2;
        if(opposition > gameObject.count - 1){
          opposition -= gameObject.count;
        }
      }
      return(
        <View style={{display: 'flex', flexDirection: 'column', zIndex: 1}}>
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center', gap: 15, marginTop: -20, transform: [{rotate: '180deg'}]}}>
            {gameObject.players[opposition].hand.map((card, index) => {
              return (
                <Card isSelected={JSON.stringify(kingEnemySwapCard) === JSON.stringify(card)} flip={JSON.stringify(enemyRevealedCard) === JSON.stringify(card)} backBorder={jackAbility || (kingAbility && !kingEnemySwapCard)} card={card} key={index} onPress={() => handleEnemyCardPress(card, opposition)}/>
              )
            })}
          </View>
          {gameObject.status === "revealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: gameObject.players[opposition].revealed ? '#0f0' : "#000", marginTop: 20, alignSelf: 'center'}}/> : null}
          {gameObject.status === "dealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: gameObject.turn === opposition ? '#f00' : "#000", marginTop: 20, alignSelf: 'center'}}/> : null}
          <Text style={{color: gameObject.status === "dealing" && gameObject.turn === opposition ? '#f00' : '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center', marginTop: 10}}>{gameObject.players[opposition].name}</Text>
        </View>
      )
    }

    const renderLeftAndRightPlayerNames = () => {
      let leftOpposition = route.params.number + 1;
      let rightOpposition = route.params.number + 3;
      if(leftOpposition > gameObject.count - 1){
        leftOpposition -= gameObject.count;
      }
      if(rightOpposition > gameObject.count - 1){
        rightOpposition -= gameObject.count;
      }
      if(gameObject.count === 4){
        return(
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: fontSize * 0.02}}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10}}>
              {gameObject.status === "revealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, alignSelf: 'center', borderWidth: 2, borderColor: gameObject.players[leftOpposition].revealed ? '#0f0' : '#000'}}/> : null}
              {gameObject.status === "dealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, alignSelf: 'center', borderWidth: 2, borderColor: gameObject.turn === leftOpposition ? '#f00' : '#000'}}/> : null}
              <Text style={{color: gameObject.status === "dealing" && gameObject.turn === leftOpposition ? '#f00' : '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center'}}>{gameObject.players[leftOpposition].name}</Text>
            </View>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10}}>
              {gameObject.status === "revealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, alignSelf: 'center', borderWidth: 2, borderColor: gameObject.players[rightOpposition].revealed ? '#0f0' : '#000'}}/> : null}
              {gameObject.status === "dealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, alignSelf: 'center', borderWidth: 2, borderColor: gameObject.turn === rightOpposition ? '#f00' : '#000'}}/> : null}
              <Text style={{color: gameObject.status === "dealing" && gameObject.turn === rightOpposition ? '#f00' : '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center'}}>{gameObject.players[rightOpposition].name}</Text>
            </View>
          </View>
        )
      } else if(gameObject.count === 3){
        return(
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: fontSize * 0.02, alignSelf: 'flex-start', gap: 10}}>
            {gameObject.status === "revealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: gameObject.players[leftOpposition].revealed ? '#0f0' : '#000'}}/> : null}
            {gameObject.status === "dealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: gameObject.turn === leftOpposition ? '#f00' : '#000'}}/> : null}
            <Text style={{color: gameObject.status === "dealing" && gameObject.turn === leftOpposition ? '#f00' : '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center'}}>{gameObject.players[leftOpposition].name}</Text>
          </View>
        )
      }
    }

    const renderLeftPlayerCards = () => {
      let opposition = route.params.number + 1;
      if(opposition > gameObject.count - 1){
        opposition -= gameObject.count;
      }
      if(gameObject.count > 2){
        return(
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 15, transform: [{rotate: '90deg'}], position: 'absolute', top: 0, bottom: useHeaderHeight(), right: width * 0.9, left: 0, justifyContent: 'center', zIndex: 1}}>
            {gameObject.players[opposition].hand.map((card, index) => {
              return (
                <Card isSelected={JSON.stringify(kingEnemySwapCard) === JSON.stringify(card)} flip={JSON.stringify(enemyRevealedCard) === JSON.stringify(card)} card={card} backBorder={jackAbility || (kingAbility && !kingEnemySwapCard)} key={index} onPress={() => handleEnemyCardPress(card, opposition)}/>
              )
            })}
          </View>
        )
      }
    }

    const renderRightPlayerCards = () => {
      let opposition = route.params.number + 3;
      if(opposition > gameObject.count - 1){
        opposition -= gameObject.count;
      }
      if(gameObject.count === 4){
        return(
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 15, transform: [{rotate: '-90deg'}], position: 'absolute', top: 0, bottom: useHeaderHeight(), right: 0, left: width * 0.85, justifyContent: 'center', zIndex: 1}}>
            {gameObject.players[opposition].hand.map((card, index) => {
              return (
                <Card isSelected={JSON.stringify(kingEnemySwapCard) === JSON.stringify(card)} flip={JSON.stringify(enemyRevealedCard) === JSON.stringify(card)} backBorder={jackAbility || (kingAbility && !kingEnemySwapCard)} card={card} key={index} onPress={() => handleEnemyCardPress(card, opposition)}/>
              )
            })}
          </View>
        )
      }
    }

    const renderMiddle = () => {
      if(gameObject.status === "revealing" && revealedCards.length == 2){
        return(
          <View style={{position: 'absolute', top: 0, bottom: useHeaderHeight(), left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center', marginHorizontal: fontSize * 0.07}}>Waiting for other players to reveal their cards</Text> 
            <AnimatedEllipsis style={{color: '#fff', fontSize: 72, marginTop: -30}}/>
          </View>
        )
      } else if(gameObject.status === "revealing"){
        return(
          <View style={{position: 'absolute', top: 0, bottom: useHeaderHeight(), left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center', marginHorizontal: fontSize * 0.07}}>Please select 2 cards from your hand to reveal</Text> 
          </View>
        )
      } else if(gameObject.status === "dealing"){
        return(
          <View style={{position: 'absolute', top: 0, bottom: useHeaderHeight(), left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 25}}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 25, zIndex: 1}}>
              <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {gameObject.pile.length > 0 ? 
                  <Card isSelected={newCard === gameObject.pile[gameObject.pile.length - 1]} flip={true} card={gameObject.pile[gameObject.pile.length - 1]} onPress={() => handlePilePress()}/> 
                :
                  <TouchableOpacity onPress={() => handlePilePress()} style={{width: fontSize * 0.05, height: fontSize * 0.07, backgroundColor: '#646d6b', borderRadius: 4, borderWidth: 2}}/>
                }
                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02, marginTop: 10}}>Pile</Text>
              </View>
              <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Card isSelected={newCard === gameObject.deck[0]} flip={deckFlip} card={gameObject.deck[0]} onPress={() => handleDeckPress()}/> 
                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02, marginTop: 10}}>Deck</Text>
              </View>
            </View>
            <Button title="CALL MOLT" isLoading={loading} disabled={gameObject.endRoundIndex !== -1} style={{backgroundColor: '#ffda74', color: '#181818', loadingColor: '#181818', height: fontSize * 0.04, width: fontSize * 0.2, fontSize: fontSize * 0.02}} onPress={() => handleEndRound()}/>
          </View>
        )
      }
    }

    const renderBottomPlayer = () => {
      return(
        <View style={{display: 'flex', flexDirection: 'column', marginTop: 'auto', alignItems: 'center', alignSelf: 'center', width: '100%', marginBottom: 20}}>
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center', gap: 15}}>
            {gameObject.players[route.params.number].hand.map((card, index) => {
              return (
                <Card flip={revealedCards.includes(index)} isSelected={JSON.stringify(kingSwapCard) === JSON.stringify(card)} backBorder={queenAbility || (kingAbility && !kingSwapCard)} card={card} key={index} onPress={() => handleCardPress(index)}/>
              )
            })}
          </View>
          {gameObject.status === "revealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: revealedCards.length == 2 ? '#0f0' : "#000", marginTop: 20}}/> : null}
          {gameObject.status === "dealing" ? <Image source={require('../assets/profile-icon.png')} style={{width: fontSize * 0.04, height: fontSize * 0.04, borderRadius: 500, borderWidth: 2, borderColor: gameObject.turn === route.params.number ? '#f00' : "#000", marginTop: 20}}/> : null}
          {gameObject.status === "dealing" && route.params.number === gameObject.turn ? <Text style={{color: '#f00', fontFamily: 'newake', fontSize: fontSize * 0.02, marginTop: 10}}>YOUR TURN</Text> : <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02, marginTop: 10}}>{gameObject.players[route.params.number].name}</Text>}
        </View>
      )
    }

    function handleDeckPress() {
      if(gameObject.status === 'dealing'){
        if(gameObject.turn === route.params.number && newCard === null){
          setDeckFlip(true);
          setNewCard(gameObject.deck[0]);
          if(gameObject.deck[0].Value === "K")
            setKingAbility(true);
          else if(gameObject.deck[0].Value === "Q")
            setQueenAbility(true);
          else if(gameObject.deck[0].Value === "J")
            setJackAbility(true);
        }
      }
    }

    function handlePilePress() {
      if(gameObject.status === 'dealing'){
        if(gameObject.turn === route.params.number && newCard !== null && newCard !== gameObject.pile[gameObject.pile.length - 1]){
          setDeckFlip(false)
          setKingAbility(false);
          setQueenAbility(false);
          setJackAbility(false);
          gameObject.pile.push(newCard);
          gameObject.deck.shift();
          let turn = gameObject.turn + 1;
          if(turn > gameObject.count - 1){
            turn = 0;
          }
          gameObject.turn = turn
          gameObject.burnt = false;
          setNewCard(null)
          if(gameObject.deck.length === 0 || turn === gameObject.endRoundIndex){
            setTimeout(() => {
              gameObject.status = "roundEnd";
              setDoc(doc(db, "games", route.params.gameCode), gameObject);
            }, 2000);
          } else {
            setDoc(doc(db, "games", route.params.gameCode), gameObject);
          }
        } else if(gameObject.turn === route.params.number && gameObject.pile.length > 0 && newCard === null){
          setNewCard(gameObject.pile[gameObject.pile.length - 1]);
        }
      } 
    }

    function checkBurn() {
      if(gameObject.players[route.params.number].hand.length === 8){
        alert("You have reached the maximum number of cards in your hand. You cannot burn a card.");
      }
      else if(gameObject.status === "dealing" && !gameObject.burnt && gameObject.pile.length > 0){
        if(route.params.number === gameObject.count - 1 && gameObject.turn === 0)
          return false
        else if(route.params.number === gameObject.turn - 1)
          return false
        else
          return true
      }
      return false
    }

    function handleEnemyCardPress(card, playerIndex) {
      if(jackAbility){
        setJackAbility(false);
        setDeckFlip(false)
        setEnemyRevealedCard(card);
        gameObject.pile.push(newCard);
        gameObject.deck.shift();
        let turn = gameObject.turn + 1;
        if(turn > gameObject.count - 1){
          turn = 0;
        }
        gameObject.turn = turn
        gameObject.burnt = false;
        setNewCard(null)
        if(gameObject.deck.length === 0 || turn === gameObject.endRoundIndex){
          setTimeout(() => {
            gameObject.status = "roundEnd";
            setDoc(doc(db, "games", route.params.gameCode), gameObject);
          }, 2000);
        }
        else{
          setDoc(doc(db, "games", route.params.gameCode), gameObject);
          setTimeout(() => {
            setEnemyRevealedCard(null);
          }, 2000);
        }
      } else if(kingAbility){
        if(!kingSwapCard && !kingEnemySwapCard){
          setKingEnemySwapCard(card);
          setKingAbilityEnemyPlayerIndex(playerIndex);
          setKingAbilityEnemyCardIndex(gameObject.players[playerIndex].hand.indexOf(card));
        } else if(kingSwapCard){
          setKingAbility(false);
          setDeckFlip(false)
          gameObject.players[route.params.number].hand[gameObject.players[route.params.number].hand.indexOf(kingSwapCard)] = card;
          gameObject.players[playerIndex].hand[gameObject.players[playerIndex].hand.indexOf(card)] = kingSwapCard;
          gameObject.pile.push(newCard);
          gameObject.deck.shift();
          let turn = gameObject.turn + 1;
          if(turn > gameObject.count - 1){
            turn = 0;
          }
          gameObject.turn = turn
          gameObject.burnt = false;
          setNewCard(null)
          setRevealedCards([gameObject.players[route.params.number].hand.indexOf(card)])
          setKingEnemySwapCard(null);
          setKingAbilityEnemyPlayerIndex(null)
          setKingAbilityEnemyCardIndex(null)
          setKingSwapCard(null)
          if(gameObject.deck.length === 0 || turn === gameObject.endRoundIndex){
            setTimeout(() => {
              gameObject.status = "roundEnd";
              setDoc(doc(db, "games", route.params.gameCode), gameObject);
            }, 2000);
          }
          else{
            setDoc(doc(db, "games", route.params.gameCode), gameObject);
            setTimeout(() => {
              setRevealedCards([]);
            }, 2000);
          }
        }
      }
    }

    function handleCardPress(index) {
      if(gameObject.status === "revealing" && revealedCards.length < 2 && !revealedCards.includes(index)){
        let arr = revealedCards.slice();
        arr.push(index);
        setRevealedCards(arr);
        if(arr.length === 2){
          gameObject.players[route.params.number].revealed = true;
          setDoc(doc(db, "games", route.params.gameCode), gameObject);
        }
      } 
      if(gameObject.status === "dealing" && gameObject.turn === route.params.number && newCard !== null){
        if(queenAbility){
          setRevealedCards([index])
          setDeckFlip(false)
          setQueenAbility(false);
          gameObject.pile.push(newCard);
          gameObject.deck.shift();
          let turn = gameObject.turn + 1;
          if(turn > gameObject.count - 1){
            turn = 0;
          }
          gameObject.turn = turn
          gameObject.burnt = false;
          setNewCard(null)
          if(gameObject.deck.length === 0 || turn === gameObject.endRoundIndex){
            setTimeout(() => {
              gameObject.status = "roundEnd";
              setDoc(doc(db, "games", route.params.gameCode), gameObject);
            }, 2000);
          }
          else{
            setDoc(doc(db, "games", route.params.gameCode), gameObject);
            setTimeout(() => {
              setRevealedCards([]);
            }, 2000);
          }
        } else if(kingAbility){
          if(!kingSwapCard && !kingEnemySwapCard){
            setKingSwapCard(gameObject.players[route.params.number].hand[index]);
          } else if(kingEnemySwapCard){
            setKingAbility(false);
            setDeckFlip(false)
            gameObject.players[kingAbilityEnemyPlayerIndex].hand[kingAbilityEnemyCardIndex] = gameObject.players[route.params.number].hand[index];
            gameObject.players[route.params.number].hand[index] = kingEnemySwapCard;
            gameObject.pile.push(newCard);
            gameObject.deck.shift();
            let turn = gameObject.turn + 1;
            if(turn > gameObject.count - 1){
              turn = 0;
            }
            gameObject.turn = turn
            gameObject.burnt = false;
            setNewCard(null)
            setRevealedCards([index])
            setKingEnemySwapCard(null);
            setKingAbilityEnemyPlayerIndex(null)
            setKingAbilityEnemyCardIndex(null)
            setKingSwapCard(null)
            if(gameObject.deck.length === 0 || turn === gameObject.endRoundIndex){
              setTimeout(() => {
                gameObject.status = "roundEnd";
                setDoc(doc(db, "games", route.params.gameCode), gameObject);
              }, 2000);
            }
            else{
              setDoc(doc(db, "games", route.params.gameCode), gameObject);
              setTimeout(() => {
                setRevealedCards([]);
              }, 2000);
            }
          }
        } else {
          setDeckFlip(false);
          setJackAbility(false);
          {newCard !== gameObject.pile[gameObject.pile.length - 1] ? gameObject.deck.shift() : gameObject.pile.pop()};
          gameObject.pile.push(gameObject.players[route.params.number].hand[index]);
          gameObject.players[route.params.number].hand[index] = newCard;
          let turn = gameObject.turn + 1;
          if(turn > gameObject.count - 1){
            turn = 0;
          }
          gameObject.turn = turn
          gameObject.burnt = false
          setRevealedCards([index])
          setNewCard(null)
          if(gameObject.deck.length === 0 || turn === gameObject.endRoundIndex){
            setTimeout(() => {
              gameObject.status = "roundEnd";
              setDoc(doc(db, "games", route.params.gameCode), gameObject);
            }, 1000);
          }
          else{
            setDoc(doc(db, "games", route.params.gameCode), gameObject);
            setTimeout(() => {
              setRevealedCards([]);
            }, 1000);
          }
        }
      }
      else if(checkBurn()){
        if(gameObject.pile[gameObject.pile.length - 1].Value === gameObject.players[route.params.number].hand[index].Value){ 
          gameObject.pile.push(gameObject.players[route.params.number].hand[index]);
          gameObject.players[route.params.number].hand.splice(index, 1);
          gameObject.burnt = true;
          setDoc(doc(db, "games", route.params.gameCode), gameObject);
          if(gameObject.players[route.params.number].hand.length === 0){
            handleEndRound()
          }
        } else {
          gameObject.players[route.params.number].hand.push(gameObject.pile[gameObject.pile.length - 1]);
          setRevealedCards([gameObject.players[route.params.number].hand.length - 1, index])
          gameObject.pile.pop();
          gameObject.burnt = true;
          setDoc(doc(db, "games", route.params.gameCode), gameObject);
          setTimeout(() => {
            setRevealedCards([]);
          }, 1000);
        }
      }
    }

    async function handleEndRound(){
      setLoading(true);
      gameObject.endRoundIndex = route.params.number;
      await setDoc(doc(db, "games", route.params.gameCode), gameObject);
      setLoading(false)
    }

    useEffect(() => {
      if(gameObject.endRoundIndex !== -1){
        Animated.spring(slideInAnim, {
          toValue: 0, // Final position (center of the screen)
          useNativeDriver: false, // Native driver is not supported for 'left' position
        }).start();
      }
    }, [gameObject.endRoundIndex])

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

    return (
        <SafeAreaView style={styles.background}>
          {renderTopPlayer()}
          {renderLeftAndRightPlayerNames()}
          <Animated.View style={{width: '85%', left: slideInAnim, height: fontSize * 0.06, backgroundColor: '#47473B', borderWidth: 2, alignSelf: 'center', borderRadius: 20, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02, textAlign: 'center'}}>{gameObject.endRoundIndex !== -1 ? gameObject.players[gameObject.endRoundIndex].name + ' has ended this round.' : ''}</Text>
          </Animated.View>
          {renderLeftPlayerCards()}
          {renderRightPlayerCards()}
          {renderMiddle()}
          {renderBottomPlayer()}
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
  
  export default GameScreen;