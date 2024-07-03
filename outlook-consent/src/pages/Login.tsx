import { FC } from "react";
import "../App.css";

const Login: FC = () => {
  return (
    <>
      <button
        className="btn"
        onClick={() =>
          (window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=7063e01a-96cd-46a9-ab98-7d6b36843227&response_type=code&redirect_uri=http://localhost:3003/callback&response_mode=query&scope=User.Read Mail.ReadWrite MailboxSettings.ReadWrite offline_access&state=12345`)
        }
      >
        Login with Oulook
      </button>
    </>
  );
};
export default Login;
