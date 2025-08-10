import { Text, View, TextInput } from 'react-native';
import  React, { useState } from "react";
import { Link } from 'expo-router';

import { style } from './cadastrarStyle';

export default function cadastro() {
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [cpf, setCpf] = useState('');
    const [dtNasc, setDtNasc] = useState('');
    const [time, setTime] = useState('');

    const handleCadastro = () => {
        axios.post('http://192.168.0.101:3000/login', {nome, senha, email, cpf, dtNasc, time})
            .then(res => Alert.alert(res.data.message))
            .catch(err => Alert.alert('Erro', err.response?.data?.error || 'erro desconhecido'));
    };

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
                        value={nome}
                        onChangeText={nome}
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