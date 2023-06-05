//require('dotenv').config()
declare var process: {
    env: {
        apiKey: string
        messagingSenderId: string
        appId: string
    }
}

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, child, push, update } from 'firebase/database'
import 'firebase/database'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: 'chess-e8f86.firebaseapp.com',
    databaseURL: 'https://chess-e8f86-default-rtdb.firebaseio.com',
    projectId: 'chess-e8f86',
    storageBucket: 'chess-e8f86.appspot.com',
    messageSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: 'G-JZDGWB329D',
}

// Initialize Firebase
initializeApp(firebaseConfig)
const db = getDatabase()

export const newGameId = push(child(ref(db), 'games')).key

export const writeNewFen = (fen: string) => {
    // A post entry.
    const postData = {
        fen,
    }

    // Get a key for a new Post.
    const newPostKey = push(child(ref(db), 'posts')).key

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates: { [key: string]: { fen: string } } = {}
    updates['/' + newPostKey] = postData

    return update(ref(db), updates)
}
