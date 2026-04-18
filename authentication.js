import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {

  getAuth,

  createUserWithEmailAndPassword,

  signInWithEmailAndPassword,

  signOut,

  onAuthStateChanged,

  updateProfile

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import firebaseConfig from "./config"
const app=initializeApp(firebaseConfig)
const auth=getAuth(app)


export function onAuthChanged(callback){
    onAuthStateChanged(auth, callback)
}

export async function signUp(username, email, password, country) {
    const credential=await createUserWithEmailAndPassword(auth, email, password)
}

export async function signIn(email, password) {
    const credential=await signInWithEmailAndPassword(auth, email, password)
    return credential.username
}

export async function logOut() {
    await signOut(auth)
}

export function getCurrentUser() {
    return auth.currentUser
}