import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, SafeAreaView, BackHandler, Dimensions, TouchableOpacity, Text, Alert, Modal, ScrollView } from "react-native";
import Button from "../components/Button";
import Card from "../components/Card";

function HomeScreen({navigation}) {

    const [modalVisible, setModalVisible] = useState(false);
    const [cardVisible, setCardVisible] = useState(false);
    const [flippedCards, setFlippedCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
          if (flippedCards.length < 2) {
            setFlippedCards(prevFlipped => [...prevFlipped, currentIndex]);
            setCurrentIndex(prevIndex => prevIndex + 1);
          } else {
            setFlippedCards([]);
            setCurrentIndex(0);
            clearInterval(interval);
          }
        }, 1500);
    
        return () => {
          clearInterval(interval);
        };
      }, [currentIndex]);

      useEffect(() => {
        const interval = setInterval(() => {
          if (!cardVisible) {
            setCardVisible(true);
          } else {
            setCardVisible(false);
          }
        }, 1500);
    
        return () => {
          clearInterval(interval);
        };
      }, [currentIndex]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
        return () => backHandler.remove()
    }, [])

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

    return (
        <SafeAreaView style={styles.background}>
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <View style={{backgroundColor: '#181818', borderRadius: 20, width: '93%', height: '88%', borderWidth: 2, borderColor: '#ffda74', display: 'flex', flexDirection: 'column'}}>
                        <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => setModalVisible(!modalVisible)}>
                            <Image source={require("../assets/close-icon.png")} resizeMode="contain" style={{width: fontSize * 0.05, height: fontSize * 0.05, borderRadius: 10, marginTop: -20, marginRight: -15}} />
                        </TouchableOpacity>
                        <ScrollView style={{flex: 1, paddingHorizontal: 20}}>
                            <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 40, textAlign: 'center', marginTop: 20}}>HOW TO PLAY</Text>
                            <Text style={styles.rule}>
                                1. Create or join a game
                            </Text>
                            <Text style={styles.rule}>
                                2. Each player is dealt 4 cards
                            </Text>
                            <Text style={styles.rule}>
                                3. Players reveal any 2 cards from their hand
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'row', gap: 20, marginTop: 20, alignSelf: 'center'}}>
                                <Card flip={flippedCards.includes(0)} card={{Suit: 'Spades', Value: 'A'}} />
                                <Card flip={flippedCards.includes(1)} card={{Suit: 'Diamonds', Value: 'J'}} />
                                <Card flip={flippedCards.includes(2)} card={{Suit: 'Club', Value: '2'}} />
                                <Card flip={flippedCards.includes(3)} card={{Suit: 'Heart', Value: '9'}} />
                            </View>
                            <Text style={styles.rule}>
                                4. Once all players reveal their cards, the game begins
                            </Text>
                            <Text style={styles.rule}>
                                5. On a player's turn, they can select a card from the pile or deck
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'row', gap: 20, marginTop: 20, alignSelf: 'center'}}>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <Card flip={true} card={{Suit: 'Spades', Value: 'J'}} /> 
                                    <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 20, marginTop: 10}}>Pile</Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <Card flip={true} card={{Suit: 'Heart', Value: '3'}}/> 
                                    <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 20, marginTop: 10}}>Deck</Text>
                                </View>
                            </View>
                            <Text style={styles.rule}>
                                6. If the player selects a card from the pile, they must replace the card in the pile with a card from their hand
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
                                <Card isSelected={true} flip={true} card={{Suit: 'Spades', Value: 'J'}} /> 
                                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 20, marginTop: 10}}>Pile</Text>
                            </View>
                            <Text style={styles.rule}>
                                7. If the player selects a card from the deck, the player can replace the card in the deck with a card in their hand or place it in the pile
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
                                <Card isSelected={true} flip={true} card={{Suit: 'Spades', Value: '3'}} /> 
                                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 20, marginTop: 10}}>Deck</Text>
                            </View>
                            <Text style={styles.rule}>
                                8. If the deck card is a Jack, the player can reveal one of the opponent's cards
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
                                <Card isSelected={true} flip={true} card={{Suit: 'Heart', Value: 'J'}} /> 
                                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 20, marginTop: 10}}>Deck</Text>
                            </View>
                            <Text style={styles.rule}>
                                9. If the deck card is a Queen, the player can reveal one of their own cards
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
                                <Card isSelected={true} flip={true} card={{Suit: 'Spades', Value: 'Q'}} /> 
                                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 20, marginTop: 10}}>Deck</Text>
                            </View>
                            <Text style={styles.rule}>
                                10. If the deck card is a King, the player can exchange one of their cards with an opponent's card
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20}}>
                                <Card isSelected={true} flip={true} card={{Suit: 'Spades', Value: 'K'}} /> 
                                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: 20, marginTop: 10}}>Deck</Text>
                            </View>
                            <Text style={styles.rule}>
                                11. Each turn, a player can burn a card from their hand if it matches the top card in the pile. If it doesn't match, the top pile card is added to the player's hand. Only one player can burn a card per turn
                            </Text>
                            <View style={{display: 'flex', flexDirection: 'row', gap: 20, marginTop: 20, alignSelf: 'center'}}>
                                <Card flip={false} card={{Suit: 'Spades', Value: 'A'}} />
                                {cardVisible ? <Card flip={false} card={{Suit: 'Diamonds', Value: 'J'}} /> : null}
                                <Card flip={false} card={{Suit: 'Club', Value: '2'}} />
                                <Card flip={false} card={{Suit: 'Heart', Value: '9'}} />
                            </View>
                            <Text style={styles.rule}>
                                12. A player can end the round by clicking the "CALL MOLT" button if they feel confident. The round ends on their next turn.
                            </Text>
                            <Button title="LOULOU" style={{backgroundColor: '#ffda74', color: '#181818', alignSelf: 'center', height: 40, width: 150, fontSize: 20, marginTop: 20}}/>
                            <Text style={styles.rule}>
                                13. At the end of each round, the total sum of each player's hand cards is calculated. The goal is to have the lowest sum among all players. The game ends when a player reaches the target score.
                            </Text>
                            <Text style={[styles.rule, {marginBottom: 30}]}>
                                NOTE: The 10 card is counted as 0, while Queen, Jack, and King cards are counted as 10. Other cards are counted as their face value.
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <View style={{marginTop: fontSize * 0.05, paddingHorizontal: fontSize * 0.03, display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image source={require("../assets/modal-button.png")} resizeMode="contain" style={{width: fontSize * 0.05, height: fontSize * 0.05, borderRadius: 10}} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert("Profile customization is coming soon!")}>
                    <Image source={require("../assets/profile-icon.png")} resizeMode="contain" style={{width: fontSize * 0.05, height: fontSize * 0.05, borderRadius: 500, borderWidth: 2, borderColor: '#000'}} />
                </TouchableOpacity>
            </View>
            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', flex: 1}}>
                <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.05, marginTop: 20}}>M O L T</Text>
                <Image source={require("../assets/main.png")} style={{width: "100%", height: height * 0.45, resizeMode: 'contain'}} />
                <View style={{width: '100%', alignItems: 'center', gap: "20%", display: 'flex', flexDirection: 'column', marginBottom: height * 0.03}}>
                    <Button title={'CREATE GAME'} onPress={() => navigation.navigate('CreateGame')} style={{backgroundColor: '#ffda74', color: '#000', fontSize: fontSize * 0.02, width: '85%', height: fontSize * 0.06}}/>
                    <Button title={'JOIN GAME'} onPress={() => navigation.navigate('JoinGame')} style={{backgroundColor: '#ffda74', color: '#000', fontSize: fontSize * 0.02, width: '85%', height: fontSize * 0.06}}/>
                    <Text style={{color: '#fff', fontFamily: 'newake', fontSize: fontSize * 0.02}}>© MOLT {new Date().getFullYear()}</Text>
                </View>
            </View>
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
    rule: {
        color: '#fff',
        fontFamily: 'newake',
        fontSize: Math.max(Dimensions.get('window').width, Dimensions.get('window').height) * 0.02,
        textAlign: 'center',
        marginTop: 20
    }
  });
  
  export default HomeScreen;