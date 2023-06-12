import { initializeApp } from 'firebase/app'
import { getDatabase, ref, update } from 'firebase/database'
import { ChessMove } from './hooks/useChessGame'

declare var process: {
    env: {
        REACT_APP_apiKey: string
        REACT_APP_authDomain: string
        REACT_APP_projectId: string
        REACT_APP_storageBucket: string
        REACT_APP_messagingSenderId: string
        REACT_APP_appId: string
        REACT_APP_databaseURL: string
    }
}

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
    databaseURL: process.env.REACT_APP_databaseURL,
}

console.log('firebaseConfig', firebaseConfig)
// Initialize Firebase
initializeApp(firebaseConfig)
export const db = getDatabase()

console.log('db', db)

export const writeMoveAndGameState = (
    move: ChessMove,
    playerColor: string,
    gameId: string,
    fen: string
) => {
    // A post entry.
    const moveData = {
        move,
        playerColor,
        fen,
    }

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates: { [key: string]: { [key: number]: { fen: string } } } = {}
    updates['/' + gameId] = moveData

    return update(ref(db), updates)
}
