import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWmBEx2KaoKbEC6zfWvXsquY8fd2Et5Yo",
  authDomain: "react-auth-584da.firebaseapp.com",
  projectId: "react-auth-584da",
  storageBucket: "react-auth-584da.appsot.app",
  messagingSenderId: "481530831860",
  appId: "1:481530831860:web:0c5e0787df954fbd550fa1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };