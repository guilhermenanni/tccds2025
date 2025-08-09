import React, { Component } from 'react';
import { View } from 'react-native';

import LoginScreen from '../login/login'; // nome correto

export default class Index extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <LoginScreen />
      </View>
    );
  }
}
