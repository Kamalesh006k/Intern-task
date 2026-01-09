import React, { useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

const GoogleLogin = () => {
    const { googleLogin } = useContext(AuthContext);

    useEffect(() => {
        
        if (window.google) {
            google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleCallback
            });

            google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                { theme: "outline", size: "large", width: "100%", text: "continue_with" }
            );
        }
    }, []);

    const handleCallback = async (response) => {
        try {
            await googleLogin(response.credential);
        } catch (error) {
            console.error("Google Auth Error:", error);
            toast.error("Google Sign-In failed. Please try again.");
        }
    };

    return (
        <div className="w-full mt-4 flex justify-center">
            <div id="googleSignInDiv" className="w-full"></div>
        </div>
    );
};

export default GoogleLogin;
