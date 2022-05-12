import React, {useEffect, useState} from "react";
import Web3 from 'web3';
import Connected from "../components/Connected";
import Disconnected from "../components/Disconnected";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {injected} from "../components/connectors";
import {useWeb3React} from "@web3-react/core";
import {createIcon} from "@download/blockies";
import {adjectives, colors, uniqueNamesGenerator} from 'unique-names-generator';
import randomQuotes from 'random-quotes';
import Moralis from "moralis";
import {useMoralis} from "react-moralis";

const Wallet = () => {

    const {active, account, library, connector, activate, deactivate} = useWeb3React()

    const {isAuthenticated, logout} = useMoralis();
    const {profileNotLoggedIn, setProfileNotLoggedIn} = useState(true);
    const {authenticate, authError} = useMoralis();


    const [addressWallet, setAddressWallet] = useState(null);
    const [addressBalance, setAddressBalance] = useState(null);
    const [currentChainID, setCurrentChainID] = useState(null);
    const [addressImage, setAddressImage] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userBio, setUserBio] = useState(null);

    const [showPopupConnected, setShowPopupConnected] = useState(false);
    const [showPopupDisconnected, setShowPopupDisconnected] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(false)

    let connected;

    let accountState = localStorage.getItem("account");


    const connectWalletHandler = async () => {
        if (window.ethereum) {
            if (window.ethereum.isConnected() && window.ethereum.isMetaMask) {
                window.ethereum
                    .request({method: 'eth_requestAccounts'})
                    .then(console.log('Connected!'))
                    .catch((err) => {
                        if (err.code === 4001) {
                            console.log('Please Connect MetaMask Wallet!');
                            setAddressWallet(null)
                        } else {
                            console.error(err);
                            setLoading(true)
                        }
                    });

                const web3 = new Web3(window.ethereum);
                const accounts1 = await web3.eth.getAccounts();
                const chainID = await web3.eth.getChainId();
                const accountBalance = await web3.eth.getBalance(accounts1[0].toString());

                setCurrentChainID(chainID)
                setAddressBalance(accountBalance)
                setAddressWallet(accounts1)

                let icon = createIcon({
                    seed: accounts1[0].toString(),
                });
                setAddressImage(icon.toDataURL())
                // alert(icon.toDataURL())
                if (!isAuthenticated) {
                    await authenticate({signingMessage: "Welcome to Niftyverse NFT Marketplace. Please Authenticate Wallet Connection!"})();
                }

            } else {
                console.log('Please Install MetaMask Wallet!');
            }
        } else {
            alert('Please Install or Connect MetaMask Wallet!');
        }
    }

    document.addEventListener("click", e => {
        if (showMenu === true) {
            setShowMenu(false);
        }
    });

    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            let currentAccount = null;
            if (accounts.length === 0) {
                console.log('Please Connect MetaMask Wallet!');
            } else if (accounts[0] !== currentAccount) {
                currentAccount = accounts[0];
                console.log('CurrentAccount:' + currentAccount)
            }
        });

        window.ethereum.on('chainChanged', (chainId) => {
            console.log(chainId);
            // window.location.reload();
        });

        window.ethereum.on('connect', (connectInfo) => {
            console.log(connectInfo);
            // window.location.reload();
        });

        window.ethereum.on('disconnect', (disconnectInfo) => {
            console.log(disconnectInfo);
            // window.location.reload();
        });
    } else {
        // alert('Metamask is not Connected or Installed!')
        // setLoading(true)
    }

    async function connect() {
        try {
            await activate(injected)
            connected = true
            if (!isAuthenticated) {
                await authenticate({signingMessage: "Welcome to Niftyverse NFT Marketplace. Please Authenticate Wallet Connection!"})();
            }
        } catch (ex) {
            console.log(ex)
        }


        const web3 = new Web3(window.ethereum);
        const accounts1 = await web3.eth.getAccounts();
        accountState = localStorage.setItem("account", accounts1);
        const chainID = await web3.eth.getChainId();
        const accountBalance = await web3.eth.getBalance(accounts1[0].toString());

        setCurrentChainID(chainID)
        setAddressBalance(accountBalance)
        setAddressWallet(accounts1)

        let icon = createIcon({
            seed: accounts1[0].toString(),
        });
        setAddressImage(icon.toDataURL())

        // setShowPopupConnected(true);
    }


    useEffect(async () => {
        if (accountState != null) {
            connect().then(r => console.log('AccountState Done!'))
        }
        const nickNameUser: string = uniqueNamesGenerator({
            dictionaries: [colors, adjectives],
            style: 'lowerCase'
        });
        localStorage.setItem('userName', nickNameUser);
        setUserName((localStorage.getItem('userName')));
        const quote = randomQuotes();
        localStorage.setItem('userBio', quote.body);
        setUserBio(quote.body);
        // localStorage.removeItem('myData');
        // localStorage.clear();
        return () => {
            connectWalletHandler().then(r => console.log('ConnectWallet Done!'))
        };
    }, [])

    async function connectOnClick() {
        if (localStorage.getItem("account") == null) {
            setLoading(true);
            try {
                await activate(injected)
            } catch (ex) {
                console.log(ex)
            }

            const web3 = new Web3(window.ethereum);
            const accounts1 = await web3.eth.getAccounts();
            // alert(accounts1[0].toString())
            accountState = localStorage.setItem("account", accounts1);
            const chainID = await web3.eth.getChainId();
            const accountBalance = await web3.eth.getBalance(accounts1[0].toString());

            setCurrentChainID(chainID)
            setAddressBalance(accountBalance)
            setAddressWallet(accounts1)

            const quote = randomQuotes();
            setUserBio(quote.body);

            let icon = createIcon({
                seed: accounts1[0].toString(),
            });
            setAddressImage(icon.toDataURL())
            localStorage.setItem('userImg', icon.toDataURL());


            setShowPopupConnected(true);
            setTimeout(function () {
                setLoading(false)
            }, 1600);
        } else {
            disconnect().then(r => console.log('DisconnectWallet Done!'))
            connected = false
        }
    }


    async function disconnect() {
        try {
            localStorage.removeItem("account");
            deactivate()

            if (isAuthenticated) {
                await logout();
                Moralis.User.logOut().then(() => {
                    const currentUser = Moralis.User.current();
                    setShowPopupDisconnected(true);
                });
            }
        } catch (ex) {
            console.log(ex)
        }
    }

    return (
        <section className="mt-[75px]">
            <Connected showPopup={showPopupConnected} setShowPopup={setShowPopupConnected}/>
            <Disconnected showPopup={showPopupDisconnected} setShowPopup={setShowPopupDisconnected}/>
            <section>
                <div className="max-w-5xl lg:mx-auto md:mx-5 sm:mx-5 mx-0 ">
                    <div className="md:flex py-5 md:space-x-5 space-x-0">
                        <div className="flex-[1] flex flex-col items-center md:mt-auto mt-[70px]">
                            {active ?
                                <div className="w-full flex-col flex items-center">
                                    <img
                                        id={'imgID'}
                                        src={addressImage !== '' ? addressImage : null}
                                        alt=""
                                        placeholder={'/images/icons/user.png'}
                                        className="h-[120px] w-[120px] rounded-full"
                                    />
                                    <h2 className="pt-2 sm:text-3xl text-3xl font-medium text-black mt-2 font-prata">
                                        {userName}
                                    </h2>
                                    <h2 className="pt-1 sm:text-1xl text-1xl font-normal text-black mb-3 mt-1 font-prata">
                                        @{account &&
                                    `${account.slice(0, 6)}...${account.slice(
                                        account.length - 4,
                                        account.length
                                    )}`}
                                    </h2>
                                    <p className="pt-4 pb-4 px-2 border border-gray-200 rounded-[5px] text-center mb-1 sm:ml-0 ml-0 font-poppins w-full">
                                        {userBio}
                                    </p>
                                </div>
                                :
                                <div>
                                    <img
                                        src="/images/logo.png"
                                        alt=""
                                        className="h-[220px] w-[220px] rounded-[10px] mb-4"
                                    />
                                </div>
                            }
                            {active ?
                                <div className="lg:flex space-x-1 w-full font-poppins">
                                    <div className="flex-[1] rounded-[5px] mb-1">
                                        <div className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1">
                                            <div className="flex items-center justify-center pr-4">
                                                <p className="text-sm">{addressWallet}</p>
                                                <img
                                                    onClick={() => navigator.clipboard.writeText(addressWallet).then(r => toast("✅ Address Copied!"))}
                                                    src="/images/icons/clipboards.png"
                                                    alt=""
                                                    className="w-5 h-5 ml-3 mb-1 cursor-pointer"
                                                />
                                                <ToastContainer/>
                                            </div>
                                            <p className="p-1 text-center font-medium">Wallet Address</p>
                                        </div>
                                        <div className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1">
                                            <div className="flex items-center justify-center pr-4">
                                                <p className="text-sm">{currentChainID !== "" ? (currentChainID === 56 ? "Binance Smart Chain Network" : "Invalid Chain Selected (Please Select Binance Smart Chain Network)") : "Nill"}</p>
                                            </div>
                                            <p className="p-1 text-center font-medium">Wallet Chain ID</p>
                                        </div>
                                        <div className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1">
                                            <div className="flex items-center justify-center pr-4">
                                                <p className="text-sm">{addressBalance !== "" ? (addressBalance / 1000000000000000000).toFixed(5) : "Nill"} BNB</p>
                                            </div>
                                            <p className="p-1 text-center font-medium">Wallet Balance</p>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="w-full p-3 border border-gray-200 rounded-[5px] mb-1">
                                    <p className="p-1 text-center text-2xl font-medium">Wallet Not Connected</p>
                                    <p className="p-1 text-center text-2xl font-medium">Please Select Binance Smart Chain Network</p>
                                </div>
                            }

                            <div className="lg:flex space-x-1 w-full h-max font-poppins">
                                <div className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1
                                flex flex-col items-center w-full h-max">
                                    <button
                                        className="w-[22%] h-[100%] text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 px-5 py-1"
                                        onClick={!active ? connectOnClick : disconnect}>
                                        {!active ? 'Connect Wallet' : 'Disconnect Wallet'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default Wallet;
