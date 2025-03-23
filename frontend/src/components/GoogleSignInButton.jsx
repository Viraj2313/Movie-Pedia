import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import LoadingPage from "./LoadingPage";
import nProgress from "nprogress";
import { toast } from "react-toastify";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleSignInButton({ setUserName }) {
  const { userId, setUserId } = useUser();

  const nav = useNavigate();
  const handleSuccess = async (response) => {
    try {
      nav("/loading");
      nProgress.start();

      const res = await axios.post(
        "/api/auth/google-login",
        { token: response.credential },
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success("Login Success");
        setUserId(res.data.userId);
        setUserName(res.data.userName);
        nav("/");
        nProgress.done();
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      nProgress.done();
    }
  };

  const handleFailure = (error) => {
    console.error("Google Sign-In Failed:", error);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
    </GoogleOAuthProvider>
  );
}

export default GoogleSignInButton;
