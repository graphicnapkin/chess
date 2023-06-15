import React from 'react'
import { auth } from '../firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

function GoogleAuth() {
    const provider = new GoogleAuthProvider()

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log(result.user) // you can access the user info here
            })
            .catch((error) => {
                console.error(error)
            })
    }

    return <button onClick={signInWithGoogle}>Sign In with Google</button>
}

export default GoogleAuth
