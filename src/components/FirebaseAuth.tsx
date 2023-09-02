import React, { useEffect, useState } from 'react'
import {
    GoogleAuthProvider,
    User,
    getRedirectResult,
    signInWithPopup,
} from 'firebase/auth'
import { auth } from '../firebase'

const GoogleAuth = ({
    user,
    setUser,
}: {
    user: User | undefined
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>
}) => {
    useEffect(() => {
        const unregisterAuthObserver = auth.onAuthStateChanged(
            async (response) => {
                console.log('response', response)
                if (!response) return
                setUser(response)
            }
        )
        return () => unregisterAuthObserver() // Make sure we un-register Firebase observers when the component unmounts.
    }, [])

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider()
        provider.addScope('profile')
        provider.addScope('email')
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = result.user.getIdToken()
                // The signed-in user info.
                var user = result.user
                // ...
            })
            .catch((error) => {
                // Handle Errors here.
                var errorCode = error.code
                var errorMessage = error.message
                // The email of the user's account used.
                var email = error.email
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential
                console.log('errorCode:', errorCode)
                console.log('errorMessage:', errorMessage)
                console.log('email:', email)
                console.log('credential:', credential)
                // ...
            })
        //signInWithRedirect(auth, provider)
    }

    const signOut = async () => {
        await auth.signOut()
        setUser(undefined)
    }

    useEffect(() => {
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    var user = result.user
                    setUser(user)
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }, [])

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-sm w-full space-y-8 bg-white p-6 rounded shadow">
                {user ? (
                    <>
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                Welcome, {user.displayName}
                            </h2>
                        </div>
                        <div>
                            <button
                                onClick={signOut}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                Sign Out
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <button
                            onClick={signInWithGoogle}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Sign in with Google
                        </button>
                    </div>
                )}
            </div>
        </div>
    )

    // ;<div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    //     {user ? (
    //         <div className="max-w-md w-full space-y-8">
    //             <div>
    //                 <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //                     Welcome, {user.displayName}
    //                 </h2>
    //             </div>
    //             <div>
    //                 <button
    //                     onClick={signOut}
    //                     className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
    //                 >
    //                     Sign Out
    //                 </button>
    //             </div>
    //         </div>
    //     ) : (
    //         <div className="max-w-md w-full space-y-8">
    //             <div>
    //                 <button
    //                     onClick={signInWithGoogle}
    //                     className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
    //                 >
    //                     Sign in with Google
    //                 </button>
    //             </div>
    //         </div>
    //     )}
    // </div>
}

export default GoogleAuth
