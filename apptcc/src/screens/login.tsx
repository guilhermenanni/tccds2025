import { Text, View, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Link } from 'expo-router'
import { style } from "./loginStyle";

export default function Login() {
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <View style={style.background}>
            <View style={style.loginSquare}>
                <Text style={style.textLogin}>Log-in</Text>
                <View style={style.line}></View>
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

                <Link style={style.createAccountLink} href="">Nao possui uma conta?</Link>

            </View>
        </View>
    );
}
