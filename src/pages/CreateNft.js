import React, { useEffect, useRef, useState } from "react";
import PostPop from "../components/PostPop";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import ERC1155ABI from "../contract/ERC1155ABI";
import ContractAddress from "../contract/ContractAddress";
import { toast, ToastContainer } from "react-toastify";
import NFTTraderABI from "../contract/NFTTraderABI";
import { set } from "store";

const CreateNft = () => {
  const { Moralis, account, isInitialized, user, isAuthenticated } =
    useMoralis();
  const [showPopup, setShowPopup] = useState(false);
  const [btnText, setBtnText] = useState("Create NFT");
  const [image, setImage] = useState("");
  const imageRef = useRef(null);
  const { ERC1155ContractAddress, NFTTraderContractAddress } = ContractAddress;
  const [isImage, setIsImage] = useState(true);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [file, setFile] = useState("");
  const [itemExternalLink, setItemExternalLink] = useState("");
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);

  useEffect(async () => {
    Moralis.enableWeb3();

    const approvalOptions = {
      contractAddress: ERC1155ContractAddress,
      functionName: "isApprovedForAll",
      abi: ERC1155ABI,
      params: {
        account: account,
        operator: NFTTraderContractAddress,
      },
    };

    const approvalData = await Moralis.executeFunction(approvalOptions);
    setIsApprovedForAll(approvalData);
  }, []);

  async function setApprove() {
    try {
      const approvalOptions = {
        contractAddress: ERC1155ContractAddress,
        functionName: "setApprovalForAll",
        abi: ERC1155ABI,
        params: {
          operator: NFTTraderContractAddress,
          approved: true,
        },
      };

      const approve = await Moralis.executeFunction(approvalOptions);
      setIsApprovedForAll(true);
    } catch (error) {
      console.log(error);
    }
  }

  function useDisplayImage() {
    const [result, setResult] = React.useState("");

    function uploader(e) {
      const imageFile = e.target.files[0];
      if (imageFile.type && imageFile.type.indexOf("image") === -1) {
        setIsImage(false);
        // console.log("File is not an image.", imageFile.type, imageFile);
        // alert("File is not an Image type. Please upload image file only!");
        // return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        setFile(imageFile);
        setResult(e.target.result);
      });
      reader.readAsDataURL(imageFile);
    }

    return { result, uploader };
  }

  const { result, uploader } = useDisplayImage();

  async function minNFT() {
    try {
      console.log(account);
      setBtnText("NFT Posting...");
      const NFT = Moralis.Object.extend("NFT");
      const newNFT = new NFT();
      const moralisFile = new Moralis.File(file.name, file);
      newNFT
        .save({
          name: itemName,
          description: itemDesc,
          externalLink: itemExternalLink,
          file: moralisFile,
          views: 0,
          likes: 0,
        })
        .then(async (result) => {
          let tokenURI = moralisFile.url();
          await Moralis.enableWeb3();
          const web3 = new Web3(Moralis.provider);
          tokenURI = tokenURI.slice(95);
          const sendOptions = {
            contractAddress: ERC1155ContractAddress,
            functionName: "mint",
            abi: ERC1155ABI,
            params: {
              objectId_: result.id,
              tokenURI_: tokenURI,
              amount_: 1,
            },
          };
          const transaction = await Moralis.executeFunction(sendOptions);
          
          toast(
            "You token is minted, confirm the next transaction to list the nft to sell"
          );

          // const listingOptions = {
          //   contractAddress: NFTTraderContractAddress,
          //   functionName: "addListing",
          //   abi: NFTTraderABI,
          //   params: {
          //     _tokenId: transaction.events.TransferSingle.returnValues.id,
          //     _price: Web3.utils.toWei(itemPrice, "gwei"),
          //     _amount: 1,
          //   },
          // };

          // console.log(listingOptions);

          // const listingTransaction = await Moralis.executeFunction(
          //   listingOptions
          // );

          const myweb3 = new Web3(window.ethereum);

          const NFTTrader = new myweb3.eth.Contract(
            NFTTraderABI,
            NFTTraderContractAddress
          );

          NFTTrader.methods
            .addListing(
              transaction.events.TransferSingle.returnValues.id,
              Web3.utils.toWei(itemPrice, "gwei"),
              1
            )
            .send({ from: account })
            .then(() => {
              const Listing = Moralis.Object.extend("Listing");
              const newListing = new Listing();
              let profilePicture;
              if (
                user.attributes.profileInfo &&
                user.attributes.profileInfo.profilePicture
              ) {
                profilePicture = user.attributes.profileInfo.profilePicture;
              } else {
                profilePicture = "";
              }
              newListing
                .save({
                  owner: {
                    address: account,
                    username: user.getUsername(),
                    profilePicture: user.attributes.profileInfo.profilePicture,
                  },
                  tokenId: transaction.events.TransferSingle.returnValues.id,
                  price: Web3.utils.toWei(itemPrice, "gwei"),
                  amount: 1,
                })
                .then(() => {
                  setShowPopup(true);
                  setBtnText("Create NFT");
                });
            });
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className="mt-[90px]">
      <ToastContainer />
      <PostPop showPopup={showPopup} setShowPopup={setShowPopup} />
      <div className="max-w-5xl lg:mx-auto sm:mx-5 mx-0 sm:p-[40px] p-0 sm:rounded-[50px] border border-gray-300 my-[25px]">
        <div className="md:flex sm:space-x-5 items-center">
          <div className="flex-[0.5]">
            <div className="border-dashed border-2 border-gray-300 rounded-md md:mb-0 mb-5 w-full">
              {result && isImage ? (
                <img
                  ref={imageRef}
                  alt=""
                  src={result}
                  className="rounded-md md:mb-0 mb-5 w-full"
                />
              ) : result && !isImage ? (
                <div>
                  <p
                    className="sm:text-base text-sm pt-3 pb-5"
                    style={{ textAlign: "center" }}
                  >
                    {file.name}
                  </p>
                  <img
                    src="/images/document.png"
                    alt=""
                    className="object-cover hover:bg-gray-200 rounded-md md:mb-0 mb-5 w-full"
                  />
                </div>
              ) : (
                <div>
                  <img
                    src="/images/icons/image_placeholder.png"
                    alt=""
                    className="object-cover hover:bg-gray-200 rounded-md md:mb-0 mb-5 w-full"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex-[0.5] font-poppins px-2">
            <div className="flex space-x-3 relative">
              <div>
                <label htmlFor="name" className="sm:text-base text-sm">
                  Item Name
                </label>
                <hr className="absolute w-full bg-gray-200" />
                <label htmlFor="name" className="pt-3 sm:text-base text-sm">
                  Item Description
                </label>
                <hr className="absolute w-full bg-gray-200" />
                <label htmlFor="name" className="pt-3 sm:text-base text-sm">
                  Price (In NFTC)
                </label>
                <hr className="absolute w-full bg-gray-200" />
                <label htmlFor="name" className="pt-3 sm:text-base text-sm">
                  External Link
                </label>
                <hr className="absolute w-full bg-gray-200" />
              </div>

              <div>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Item Name"
                  className="sm:text-base text-sm"
                />
                <input
                  type="text"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Item Description"
                  className="pt-3 sm:text-base text-sm"
                />
                <input
                  type="text"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="Item Price"
                  className="pt-3 sm:text-base text-sm"
                />
                <input
                  type="text"
                  value={itemExternalLink}
                  placeholder="External Link (If Any)"
                  onChange={(e) => setItemExternalLink(e.target.value)}
                  className="pt-3 sm:text-base text-sm"
                />
              </div>
            </div>

            <p className="sm:text-base text-sm pt-3 pb-5">
              Mint: Text, Image, Video, Audio, or 3D Model File types supported:
              JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size:
              100 MB
            </p>

            <div className="flex justify-between items-center">
              <button className="rounded-[40px] border border-gray-300 px-5 py-1">
                <label
                  htmlFor="choosefile"
                  className="m-0 p-0 sm:text-base text-sm"
                >
                  Choose File
                </label>
                <input
                  type="file"
                  inputProps={{ accept: "image/*" }}
                  onChange={(e) => {
                    setImage(e.target.files[0]);
                    uploader(e);
                  }}
                  id="choosefile"
                  multiple={false}
                  className="hidden"
                />
              </button>
              {isApprovedForAll ? (
                <button
                  className="text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 px-5 py-1"
                  onClick={minNFT}
                >
                  {btnText}
                </button>
              ) : (
                <button
                  className="text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 px-5 py-1"
                  onClick={() => setApprove()}
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateNft;
