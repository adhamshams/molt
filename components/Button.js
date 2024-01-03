import React from "react";
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";

function Button(props) {
  return (
    <TouchableOpacity style={[styles.container, props.style, props.disabled ? styles.disabled : null]} disabled={props.isLoading || props.disabled} onPress={props.onPress}>
      {props.isLoading ? <ActivityIndicator size="small" color={props.style.loadingColor} animating/> : <Text style={{color: props.style.color, fontSize: props.style.fontSize, fontFamily: "newake"}}>{props.title}</Text>}
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

export default Button;