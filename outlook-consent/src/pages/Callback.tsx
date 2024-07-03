import React from "react";
import { useLocation } from "react-router-dom";
import { getToken } from "../api/api";

const Callback: React.FC = () => {
  const location = useLocation();

  // Function to get the URL parameter
  const getQueryParam = (param: string) => {
    return new URLSearchParams(location.search).get(param);
  };

  // Get the 'code' parameter from the URL
  const code = getQueryParam("code");
  const state = getQueryParam("state");

  return (
    <div>
      {code && state === "12345" ? (
        <>
          <h1>Here's your authentication code</h1>
          <div
            style={{ display: "flex", alignItems: "center" }}
            className="copyable-text-field"
          >
            <input
              type="text"
              value={code}
              readOnly
              style={{ marginRight: "10px" }}
            />
            <button className="btn" onClick={()=>getToken(code)}>
                Get Refresh Token
            </button>
          </div>
        </>
      ) : (
        <h3>Unable to fetch a valid Auth code!</h3>
      )}
    </div>
  );
};

export default Callback;
