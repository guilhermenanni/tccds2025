import { Text, View, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import axios from 'axios';

import { style } from "./loginStyle";

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    
    const handleLogin = () => {
        axios.post('http://192.168.0.101:3000/login', {email, senha})
            .then(res => Alert.alert(res.data.message))
            .catch(err => Alert.alert('Erro', err.response?.data?.error || 'erro desconhecido'));
    };

    return (
        <View style={style.background}>
            <View style={style.loginSquare}>
                <Text style={style.textLogin}>Log-in</Text>
                <View style={style.line}></View>
                <View style={style.inputBox}>
                    <TextInput
                        style={style.input}
                        placeholder='Nome de usuário'
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={style.inputBox}>
                    <TextInput
                        style={style.input}
                        placeholder='senha'
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry={true}
                    />
                </View>

                <Link style={style.createAccountLink} href="/cadastrar/cadastrar">Nao possui uma conta?</Link>

            </View>
        </View>
    );
}
