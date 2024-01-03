import React, { useEffect, useState} from "react";
import { StyleSheet, View, ActivityIndicator, Text, SafeAreaView, Dimensions } from "react-native";
import {
  CodeField,
  Cursor,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';

function JoinGame({route, navigation}) {

    const CELL_COUNT = 6;
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      value,
      setValue,
    });

    useEffect( () => {
        const handleJoinGame = async() => {
            if (value.length === 6){
                setIsLoading(true);
                try{
                    const docRef = doc(db, "games", value);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        if(docSnap.data().players.length < 4 && docSnap.data().status === 'lobby') {
                            let number = docSnap.data().players.length;
                            let player = {
                                id: await AsyncStorage.getItem('id'),
                                name: await AsyncStorage.getItem('name')
                            }
                            let gameObject = docSnap.data();
                            gameObject.players.push(player);
                            await setDoc(docRef, gameObject);
                            navigation.navigate('LobbyScreen', {gameObject, gameCode: value, host: false, number});
                            setIsLoading(false);
                        } else if (docSnap.data().status !== 'lobby') {
                            alert("Game has already started.");
                            setIsLoading(false);
                        } else {
                            alert("Game is full.");
                            setIsLoading(false);
                        }
                    } else {
                        alert("Game does not exist");
                        setIsLoading(false);
                    }
                } catch (e) {
                    setIsLoading(false);
                    alert("An error has occured.")
                }
            }
        }
        handleJoinGame()
    }, [value])

    const { width, height } = Dimensions.get('window');
    const fontSize = Math.max(width, height);

    return (
        <SafeAreaView style={styles.background}>
            <Text style={{color: '#fff', fontFamily: 'newake', marginTop: 25, fontSize: fontSize * 0.03}}>ENTER LOBBY CODE</Text>
            <CodeField
                {...props}
                value={value}
                autoFocus
                onChangeText={(text) => setValue(text.toUpperCase())}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardAppearance='dark'       
                renderCell={({index, symbol, isFocused}) => (
                    <View
                    // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
                    onLayout={getCellOnLayoutHandler(index)}
                    key={index}
                    style={[styles.cellRoot, isFocused && styles.focusCell]}>
                    <Text style={styles.cellText}>
                        {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                    </View>
                )}
            />
            <ActivityIndicator size="large" color="#ffda74" animating={isLoading} style={styles.activity} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: '#181818',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    root: {
    },
    codeFieldRoot: {
      marginTop: Dimensions.get('window').height * 0.03,
      width: '85%'
    },
    cellRoot: {
      width: Dimensions.get('window').width * 0.1,
      height: Dimensions.get('window').height * 0.05,
      borderBottomColor: '#fff',
      borderBottomWidth: 2
    },
    cellText: {
      color: '#ffda74',
      fontSize: Math.max(Dimensions.get('window').width, Dimensions.get('window').height) * 0.03,
      fontFamily: 'newake',
      textAlign: 'center',
    },
    focusCell: {
      borderBottomColor: '#ffda74',
      borderBottomWidth: 2,
    },
    activity: {
      marginTop: Dimensions.get('window').height * 0.03
    }
});
  
export default JoinGame;