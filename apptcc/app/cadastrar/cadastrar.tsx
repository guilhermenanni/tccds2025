import { Text, View, TextInput } from 'react-native';
import  React, { useState } from "react";
import { Link } from 'expo-router';

import { style } from './cadastrarStyle';

export default function cadastro() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <View style={style.background}>
            <View style={style.loginSquare}>
                <Text style={style.textLogin}>Cadastrar</Text>
                <View style={style.line}></View>
                <View style={style.inputBox}>
                    <TextInput
                        style={style.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={style.inputBox}>
                    <TextInput
                        style={style.input}
                        placeholder='Nome de usuário'
                        value={username}
                        onChangeText={setUsername}
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

                <Link style={style.createAccountLink} href="/login/login">Ja possui uma conta?</Link>

            </View>
        </View>
    );
}