import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";
import { MoralisProvider } from "react-moralis";

//Testnet Server
const serverUrl = "https://1jk06q2b5brj.usemoralis.com:2053/server";
const appId = "Z0eDqGqSucrJlA61cLKXJsnnFYecLXJmib9M40h6";


//Mainnet Server
// const serverUrl = "https://ga6qk09shyva.usemoralis.com:2053/server";
// const appId = "RcLPvIvLozKGMtAA8UBiCSNHUntD9OgYU377W6tv";


function getLibrary(provider) {
  return new Web3(provider);
}

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <MoralisProvider appId={appId} serverUrl={serverUrl}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </Web3ReactProvider>,
  document.getElementById("root")
);
