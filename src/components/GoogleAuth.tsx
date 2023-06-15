import React from 'react'
import { auth } from '../firebase'
import {
    GoogleAuthProvider,
    getRedirectResult,
    signInWithRedirect,
} from 'firebase/auth'

function GoogleAuth() {
    const provider = new GoogleAuthProvider()

    const signInWithGoogle = () => {
        signInWithRedirect(auth, provider)
        getRedirectResult(auth)
            .then((result) => {
                console.log('result', result)
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential =
                    GoogleAuthProvider.credentialFromResult(result)
                const token = credential.accessToken
                // The signed-in user info.
                const user = result.user
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            })
            .catch((error) => {
                console.log('error', error)
                // Handle Errors here.
                // const errorCode = error.code
                // const errorMessage = error.message
                // // The email of the user's account used.
                // const email = error.customData.email
                // // The AuthCredential type that was used.
                // const credential = GoogleAuthProvider.credentialFromError(error)
                // ...
            })
    }

    return <button onClick={signInWithGoogle}>Sign In with Google</button>
}

export default GoogleAuth
