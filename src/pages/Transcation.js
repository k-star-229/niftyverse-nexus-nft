import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import MenuPop from "../components/MenuPop";
import TransItem from "../components/TransItem";
import { useMoralis } from "react-moralis";
import ContractAddress from "../contract/ContractAddress";
import ERC1155ABI from "../contract/ERC1155ABI";
import ERC20ABI from "../contract/ERC20ABI";
import Web3 from "web3";
import NFTTraderABI from "../contract/NFTTraderABI";
import { toast, ToastContainer } from "react-toastify";
import { useMatch } from "react-router";

const Transcation = () => {
  const { Moralis, account } = useMoralis();
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isListed, setIsListed] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  const [img, setImg] = useState("");
  const [tradeHistory, setTradeHistory] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState({
    profilePicture: "",
    username: "",
  });
  console.log(tradeHistory);
  const match = useMatch("/transaction/:owner/:tokenId/:objectId");
  const { owner, tokenId, objectId } = match.params;
  const {
    ERC1155ContractAddress,
    NFTTraderContractAddress,
    ERC20ContractAddress,
  } = ContractAddress;
  const [tokenInfo, setTokenInfo] = useState({
    name: "",
    description: "",
    views: 0,
    likes: 0,
    createdAt: "",
    likeNFT: null,
  });
  const [price, setPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(async () => {
    Moralis.enableWeb3();
    const readOptions = {
      contractAddress: ERC1155ContractAddress,
      functionName: "tokenURI",
      abi: ERC1155ABI,
      params: {
        tokenId_: tokenId,
      },
    };

    const imageURI = await Moralis.executeFunction(readOptions);
    setImg(imageURI);
    getTokenInfo();
    getNFTTradeHistory();
    getOwnerInfo();
  }, []);

  async function getOwnerInfo() {
    const Listing = Moralis.Object.extend("Listing");
    const query = new Moralis.Query(Listing);
    query.get(objectId).then((data) => {
      setOwnerInfo({
        profilePicture: data.attributes.owner.profilePicture._url,
        username: data.attributes.owner.username,
      });
    });
  }
  useEffect(() => {
    getApprovedBalance();
  }, [account]);

  async function getApprovedBalance() {
    const readOptions = {
      contractAddress: ERC20ContractAddress,
      functionName: "allowance",
      abi: ERC20ABI,
      params: {
        owner: account,
        spender: NFTTraderContractAddress,
      },
    };
    const balance = await Moralis.executeFunction(readOptions);
    if (balance > parseInt(price)) {
      setIsApprove(true);
    } else {
      setIsApprove(false);
    }
  }

  async function approveNFTTrader() {
    const sendOptions = {
      contractAddress: ERC20ContractAddress,
      functionName: "approve",
      abi: ERC20ABI,
      params: {
        spender: NFTTraderContractAddress,
        amount: price,
      },
    };

    const approveTransaction = await Moralis.executeFunction(sendOptions).then(
      () => {
        setIsApprove(true);
      }
    );
  }

  async function getNFTTradeHistory() {
    const TradeHistory = Moralis.Object.extend("TradeHistory");
    const query = new Moralis.Query(TradeHistory);
    query.equalTo("tokenId", tokenId);
    const result = await query.find();

    setTradeHistory(result[0].attributes.trades);
  }

  async function purchaseNFT() {
    const sendOptions = {
      contractAddress: NFTTraderContractAddress,
      functionName: "purchase",
      abi: NFTTraderABI,
      params: {
        _seller: owner,
        _tokenId: tokenId,
        _amount: 1,
      },
    };

    const puchaseTransaction = await Moralis.executeFunction(sendOptions).then(
      () => {
        const Listing = Moralis.Object.extend("Listing");
        const query = new Moralis.Query(Listing);
        query.equalTo("owner", owner);
        query.equalTo("tokenId", tokenId);
        query.first().then((listingData) => {
          listingData.decrement("amount");
          listingData.save().then(async () => {
            const TradeHistory = Moralis.Object.extend("TradeHistory");
            const query = new Moralis.Query(TradeHistory);
            query.equalTo("tokenId", tokenId);
            const result = await query.find();
            if (result.length == 0) {
              const newTrade = new TradeHistory();
              newTrade
                .save({
                  tokenId,
                  trades: [
                    {
                      from: owner,
                      to: account,
                      price,
                      at: new Date(),
                    },
                  ],
                })
                .then(() => {
                  toast("NFT Successfully purchased");
                  navigate("/profile");
                });
            } else {
              const trade = result[0];
              trade.add("trades", {
                from: owner,
                to: account,
                at: new Date(),
                price,
              });
              trade.save().then(() => {
                toast("NFT Successfully purchased");
                navigate("/profile");
              });
            }
          });
        });
      }
    );
  }

  async function getTokenInfo() {
    Moralis.enableWeb3();
    const readOptions = {
      contractAddress: ERC1155ContractAddress,
      functionName: "getMetaData",
      abi: ERC1155ABI,
      params: {
        tokenId_: tokenId,
      },
    };
    const readListing = {
      contractAddress: NFTTraderContractAddress,
      functionName: "getListing",
      abi: NFTTraderABI,
      params: {
        _owner: owner,
        _tokenId: tokenId,
      },
    };

    const metaDataId = await Moralis.executeFunction(readOptions);
    const listingData = await Moralis.executeFunction(readListing);
    setPrice(listingData.price);
    if (listingData.amount != "0") {
      setIsListed(true);
    }
    const NFT = Moralis.Object.extend("NFT");
    const query = new Moralis.Query(NFT);

    query.get(metaDataId).then((metaData) => {
      const { name, description, likes, views, createdAt } =
        metaData.attributes;
      metaData.increment("views");
      metaData.save();
      setTokenInfo({
        name,
        description,
        views,
        likes,
        createdAt,
        likeNFT: metaData,
      });
    });
  }

  document.addEventListener("click", (e) => {
    if (showMenu === true) {
      setShowMenu(false);
    }
  });

  return (
    <section className="mt-[90px]">
      <ToastContainer />
      <div className="max-w-5xl lg:mx-auto sm:mx-5 mx-0  sm:py-[20px]  py-[10px] sm:px-[30px] px-[10px] md:rounded-[46px] border border-gray-300 my-[25px] font-poppins">
        <div className="md:flex md:space-x-5">
          <div className="flex-[0.5]">
            <div className="flex justify-between items-center mb-3 relative">
              <div className="flex items-center space-x-3">
                <img
                  src={ownerInfo.profilePicture}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h4 className="sm:text-lg text-sm">{ownerInfo.username}</h4>
              </div>
              <img
                src="/images/icons/option.png"
                alt=""
                className="w-5 h-5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(true);
                }}
              />
              {showMenu && (
                <div className="absolute top-10 right-0 w-[200px] bg-white rounded-md shadow-my transition duration-500">
                  <div
                    className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    <img
                      src="/images/icons/copy.png"
                      alt=""
                      className="h-4 w-4"
                    />
                    <p className="font-roboto font-medium">Copy</p>
                  </div>
                  <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
                    <img
                      src="/images/icons/giftbox.png"
                      alt=""
                      className="h-4 w-4"
                    />
                    <p className="font-roboto font-medium">Gift</p>
                  </div>{" "}
                  <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
                    <img
                      src="/images/icons/share.png"
                      alt=""
                      className="h-4 w-4"
                    />
                    <p className="font-roboto font-medium">Share</p>
                  </div>{" "}
                  <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
                    <img
                      src="/images/icons/block.png"
                      alt=""
                      className="h-4 w-4"
                    />
                    <p className="font-roboto font-medium">Report</p>
                  </div>
                  <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
                    <img
                      src="/images/icons/close.png"
                      alt=""
                      className="h-4 w-4"
                    />
                    <p className="font-roboto font-medium">Cancel</p>
                  </div>
                </div>
              )}
            </div>

            <img src={img} alt="" className="rounded-md" />

            <div className="mt-3">
              <div className="flex justify-between w-full">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <img
                      src={`/images/icons/${
                        !isLiked ? "heart" : "heart-fill"
                      }.png`}
                      alt=""
                      className="w-5 h-5 cursor-pointer"
                      onClick={() => {
                        tokenInfo.likeNFT.increment("likes");
                        tokenInfo.likeNFT.save();
                        setIsLiked(!isLiked);
                        setTokenInfo({
                          ...tokenInfo,
                          likes: tokenInfo.likes + 1,
                        });
                      }}
                    />
                    <p className="sm:text-base text-sm">{tokenInfo.likes}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <img
                      src="/images/icons/eye.png"
                      alt=""
                      className="w-5 h-5"
                    />
                    <p className="sm:text-base text-sm">{tokenInfo.views}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* <p className="sm:text-base text-sm sm:block hidden">
                    2,500,000 NFT
                  </p> */}
                  {isListed && isApprove ? (
                    <button
                      className="homecate sm:text-base text-sm"
                      onClick={purchaseNFT}
                    >
                      Buy for {Web3.utils.fromWei(price, "gwei")} NIFTY
                    </button>
                  ) : isListed && !isApprove ? (
                    <button
                      className="homecate sm:text-base text-sm"
                      onClick={approveNFTTrader}
                    >
                      Approve {Web3.utils.fromWei(price, "gwei")} NIFTY
                    </button>
                  ) : null}
                  {/* <button
                    className="homecate sm:text-base text-sm"
                    onClick={approveNFTTrader}
                  >
                    Approve
                  </button> */}
                </div>
              </div>
            </div>

            <p className="sm:text-base text-sm">{tokenInfo.description}</p>

            <span className="sm:text-base text-sm text-gray-400">
              {tokenInfo.createdAt === ""
                ? "Now"
                : Math.floor(
                    (new Date() - tokenInfo.createdAt) / (1000 * 60 * 60 * 24)
                  ) === 0
                ? "Now"
                : String(
                    Math.floor(
                      (new Date() - tokenInfo.createdAt) / (1000 * 60 * 60 * 24)
                    ) + " days ago"
                  )}
            </span>
          </div>

          <div className="flex-[0.5]">
            <p className="sm:text-lg text-base text-center sm:my-0 my-3">
              Trade History
            </p>
            {tradeHistory.length == 0 ? (
              <p style={{ marginLeft: "30px", marginTop: "20px" }}>
                It's newly minted...
              </p>
            ) : null}
            {tradeHistory.map((trade) => {
              const { price, at, from, to } = trade;
              console.log(at);
              return (
                <TransItem
                  img1="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NjB8fGJsb2NrY2hhaW58ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
                  name="someone"
                  date={
                    at.getFullYear() +
                    "-" +
                    (at.getMonth() + 1) +
                    "-" +
                    at.getDate()
                  }
                  time={
                    at.getHours() +
                    ":" +
                    at.getMinutes() +
                    ":" +
                    at.getSeconds()
                  }
                  price={Web3.utils.fromWei(price, "gwei")}
                  img2="/images/prod/vision.jpg"
                  boughtName="someone2"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transcation;
