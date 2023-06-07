import { initializeApp } from 'firebase/app'
import {
    getDatabase,
    ref,
    child,
    push,
    update,
    onValue,
} from 'firebase/database'
import 'firebase/database'
import { ChessMove } from './hooks/useChessGame'

declare var process: {
    env: {
        REACT_APP_apiKey: string
        REACT_APP_messagingSenderId: string
        REACT_APP_appId: string
    }
}

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: 'chess-e8f86.firebaseapp.com',
    databaseURL: 'https://chess-e8f86-default-rtdb.firebaseio.com',
    projectId: 'chess-e8f86',
    storageBucket: 'chess-e8f86.appspot.com',
    messageSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
    measurementId: 'G-JZDGWB329D',
}

console.log('firebaseConfig', firebaseConfig)
// Initialize Firebase
initializeApp(firebaseConfig)
export const db = getDatabase()

export const newGameId = push(child(ref(db), 'games')).key
const updates: { [key: string]: {} } = {}
updates['/' + newGameId] = { game: 'chess' }
console.log('gameId', newGameId)
update(ref(db), updates)

export const writeNewFen = (move: ChessMove, playerColor: string) => {
    // A post entry.
    const moveData = {
        move,
        playerColor,
    }

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates: { [key: string]: { [key: number]: { fen: string } } } = {}
    updates['/' + newGameId] = moveData

    return update(ref(db), updates)
}
