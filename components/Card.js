import React, { useRef, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Animated, Text, Image, View, Dimensions } from "react-native";
var Club = require('../assets/Club.png')
var Heart =  require('../assets/Heart.png') 
var Spades = require('../assets/Spades.png')
var Diamonds =  require('../assets/Diamonds.png') 

function Card(props) {

    const flipAnimation = useRef(new Animated.Value(0)).current;
    
    const flipToFrontStyle = {
      transform: [
        { rotateY: flipAnimation.interpolate( {
          inputRange: [ 0, 180 ],
          outputRange: [ "0deg", "180deg" ]
        } ) }
      ]
    };

    const flipToBackStyle = {
      transform: [
        { rotateY: flipAnimation.interpolate( {
          inputRange: [ 0, 180 ],
          outputRange: [ "180deg", "360deg" ]
        } ) }
      ]
    };

    flipAnimation.addListener(() => {return});

    const flipToFront = () => {
      Animated.timing( flipAnimation, {
        toValue: 180,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
    const flipToBack = () => {
      Animated.timing( flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      } ).start();
    };

    useEffect(() => {
        if(props.flip){
            flipToFront();
        }
        else if(!props.flip){
            flipToBack();
        }
    }, [props.flip])

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

  return (
    <TouchableOpacity onPress={props.onPress}>
        {/*Front*/}
        <Animated.View style={{position: 'absolute', display: 'flex', flexDirection: 'column', width: fontSize * 0.05, height: fontSize * 0.07, backgroundColor: '#ffda74', borderRadius: 4, borderWidth: 2, borderColor: props.isSelected ? '#f00' : '#000', ...flipToBackStyle}}>
            <Text style={{color: '#181818', fontFamily: 'newake', fontSize: fontSize * 0.02, marginTop: 5, marginLeft: 5}}>{props.card.Value}</Text> 
            <Image source={props.card.Suit === "Club" ? Club : props.card.Suit === "Heart" ? Heart : props.card.Suit === "Diamonds" ? Diamonds : Spades} style={{width: fontSize * 0.035, height: fontSize * 0.035, alignSelf: 'center'}} />
        </Animated.View>
        {/*Back*/}
        <Animated.View style={{width: fontSize * 0.05, height: fontSize * 0.07, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffda74', backfaceVisibility: 'hidden', borderRadius: 4, borderWidth: 2, borderColor: props.backBorder ? '#ff00c3' : props.isSelected ? '#f00' : '#000', ...flipToFrontStyle }}>
          <View style={{width: fontSize * 0.035, height: fontSize * 0.06, backgroundColor: '#181818', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 4}}>
            <Text style={{color: '#ffda74', fontFamily: 'newake', fontSize: fontSize * 0.02}}>M</Text>
          </View>
        </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabled: {
    backgroundColor: "rgba(120,120,120,0.7)",
  },
});

export default Card;