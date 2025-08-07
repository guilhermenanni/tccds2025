import { Text, View } from 'react-native';
import React, { Component } from 'react';

import LoginScreen from '../../src/screens/login'; // nome correto

export default class Index extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <LoginScreen />
      </View>
    );
  }
}
