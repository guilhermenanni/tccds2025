import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    background: {
        backgroundColor: 'white',
        flex: 1,
        padding: 40,
        justifyContent: 'center'
    },

    loginSquare: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
        flexDirection: 'column',
        height: 'auto',
        width: 'auto',
        padding: 20,
        borderRadius: 20,
    },

    line: {
        height: 2,
        width: '100%',
        backgroundColor: 'black',
        marginBottom: 10
    },

    textLogin: {
        color: 'white',
        fontSize: 20,
        padding: 10,
        fontWeight: 'bold',
    },

    inputBox: {
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 20,
        width: 190,
        height: 'auto'
    },

    input: {
        fontSize: 20,
    },

    createAccountLink: {
        fontSize: 15,
        color: 'blue',
        marginTop: 20,
        marginBottom:20
    }
})