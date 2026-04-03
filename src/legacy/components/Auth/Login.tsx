import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import loginClass from "../../styles/login.module.css";
import loginBackground from "../../assets/login-background-removebg.png";

const Login = () => {
    const navigate = useNavigate();

    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
            console.log(result);
            console.log(result.user.displayName, " ", result.user.email);
            console.log(token);
            console.log(user);
            navigate("/");
        }).catch((error) => {
            console.log(error)
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
    }

    return (
        <>
            <div className={loginClass.layout}>
                <div className={loginClass.image}>
                    <img src={loginBackground} width="250px" height="250px"/>
                </div>
                <div className={loginClass.app}>
                    <div className={loginClass.title}>My Expenses</div>
                    <Button onClick={signInWithGoogle}>SignIn With Google</Button>
                </div>
            </div>
        </>
    )
}

export default Login;