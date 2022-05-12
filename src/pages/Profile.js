import { useMoralis, useMoralisWeb3Api, useNativeBalance } from "react-moralis";
import ContractAddress from "../contract/ContractAddress";
import React, { useEffect, useRef, useState } from "react";
import ProfileGallery from "../components/ProfileGallery";
import ERC1155ABI from "../contract/ERC1155ABI";
import { toast, ToastContainer } from "react-toastify";
import { Modal } from "react-responsive-modal";

const Profile = () => {
  const { ERC1155ContractAddress } = ContractAddress;
  const {
    isAuthenticated,
    logout,
    Moralis,
    user,
    authenticate,
    authError,
    account,
  } = useMoralis();
  const { data: balance } = useNativeBalance();

  // react state
  const [NFTFound, setNFTFound] = useState(false);
  const [userNFT, setUserNFT] = useState({
    tokenIds: [],
    imageURIs: [],
    mintedNFTs: 0,
    soldNFTs: 0,
  });
  const [profileInfo, setProfileInfo] = useState({
    bio: "",
    username: "",
    facebook: "",
    instagram: "",
    twitter: "",
    profilePicture: "",
  });
  const [editProfile, setEditProfile] = useState(false);
  const [image, setImage] = useState("");
  const [file, setFile] = useState("");
  const [isImage, setIsImage] = useState(true);
  const imageRef = useRef(null);
  const [needUploading, setNeedUploading] = useState(false);

  useEffect(async () => {
    await Moralis.enableWeb3();
    getNFTsOfUser();
    getProfileInfo();
  }, [account]);

  async function getNFTsOfUser() {
    const transfers = await Moralis.Web3API.token.getContractNFTTransfers({
      address: ERC1155ContractAddress,
      chain: "bsc testnet",
    });

    let tokenIds = [],
      mintedNFTs = 0,
      soldNFTs = 0;

    transfers.result.forEach((transfer) => {
      soldNFTs = transfer.from_address == account ? soldNFTs + 1 : soldNFTs;
      mintedNFTs =
        transfer.to_address == account &&
        transfer.from_address == "0x0000000000000000000000000000000000000000"
          ? mintedNFTs + 1
          : mintedNFTs;
      if (transfer.to_address == account) {
        tokenIds.push(transfer.token_id);
      }
    });

    const readOptions = {
      contractAddress: ERC1155ContractAddress,
      functionName: "tokenURIBatch",
      abi: ERC1155ABI,
      params: {
        tokenId_: tokenIds,
      },
    };
    const imageURIs = await Moralis.executeFunction(readOptions);

    setUserNFT({ tokenIds, imageURIs, soldNFTs, mintedNFTs });
    imageURIs.length > 0 ? setNFTFound(true) : setNFTFound(false);
  }

  async function connectWithProfile() {
    authenticate({
      signingMessage:
        "Welcome to Niftyverse NFT Marketplace. Please Authenticate Profile Connection!",
    })
      .then(async (r) => {
        getNFTsOfUser();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function saveProfileInfo() {
    const User = Moralis.Object.extend("User");
    const query = new Moralis.Query(User);

    query.get(user.id).then((fetchedUser) => {
      fetchedUser.set("profileInfo", profileInfo);
      fetchedUser.set("username", profileInfo.username);
      fetchedUser.save();
      setEditProfile(false);
    });
  }

  function saveProfilePicture() {
    const User = Moralis.Object.extend("User");
    const query = new Moralis.Query(User);

    query.get(user.id).then((fetchedUser) => {
      const moralisFile = new Moralis.File(file.name, file);
      console.log(moralisFile);
      let newProfileInfo = { ...profileInfo, profilePicture: moralisFile };

      fetchedUser.set("profileInfo", newProfileInfo);
      fetchedUser.save();
      setNeedUploading(false);
      setProfileInfo({ ...profileInfo, profilePicture: moralisFile });
    });
  }

  function getProfileInfo() {
    const User = Moralis.Object.extend("User");
    const query = new Moralis.Query(User);

    query.get(user.id).then((fetchedUser) => {
      const fetchedProfileInfo = fetchedUser.get("profileInfo");
      const username = fetchedUser.get("username");
      if (fetchedProfileInfo != undefined) {
        setProfileInfo({ ...fetchedProfileInfo, username });
      }
    });
  }

  function useDisplayImage() {
    const [result, setResult] = React.useState("");

    function uploader(e) {
      const imageFile = e.target.files[0];
      // if (imageFile.type && imageFile.type.indexOf("image") === -1) {
      //   setIsImage(false);
      // console.log("File is not an image.", imageFile.type, imageFile);
      // alert("File is not an Image type. Please upload image file only!");
      // return;
      // }
      const reader = new FileReader();
      reader.addEventListener("load", (e) => {
        setFile(imageFile);
        setResult(e.target.result);
        setNeedUploading(true);
      });
      reader.readAsDataURL(imageFile);
    }

    return { result, uploader };
  }

  let { result, uploader } = useDisplayImage();
  // console.log(profileInfo.profilePicture._url, profileInfo.profilePicture);
  return (
    <section>
      <div className="max-w-5xl lg:mx-auto md:mx-5 sm:mx-5 mx-0 ">
        {isAuthenticated ? (
          <div className="md:flex py-5 md:space-x-5 space-x-0">
            <div className="flex-[0.4] flex flex-col items-center md:mt-auto">
              {result ? (
                <img
                  ref={imageRef}
                  alt=""
                  src={result}
                  style={{ marginTop: "70px", marginBottom: "20px" }}
                  className="rounded-md md:mb-0 mb-5 w-full"
                />
              ) : profileInfo.profilePicture === undefined ||
                profileInfo.profilePicture === "" ? (
                <img
                  src="/images/icons/image_placeholder.png"
                  alt=""
                  className="object-cover rounded-md md:mb-0 mb-5 w-full"
                />
              ) : (
                <img
                  src={profileInfo.profilePicture._url}
                  style={{ marginTop: "70px", marginBottom: "20px" }}
                  alt=""
                  className="object-cover rounded-md md:mb-0 mb-5 w-[full]"
                />
              )}
              {needUploading ? (
                <button
                  className="w-[45%] h-[100%] text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 py-1"
                  onClick={() => saveProfilePicture()}
                  // style={{ marginLeft: "20px" }}
                >
                  Save
                </button>
              ) : (
                <button className="rounded-[40px] border border-gray-300 px-5 py-1">
                  <label
                    htmlFor="choosefile"
                    className="m-0 p-0 sm:text-base text-sm"
                    style={{ cursor: "pointer" }}
                  >
                    Upload Profile Picture
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
              )}

              <div className="flex flex-row">
                <div>
                  <h2 className="pt-1 sm:text-1xl text-2xl font-normal text-black mt-3 font-prata">
                    @
                    {`${account.slice(0, 6)}...${account.slice(
                      account.length - 4,
                      account.length
                    )}`}
                  </h2>
                </div>
                <div>
                  <img
                    onClick={() =>
                      navigator.clipboard
                        .writeText(account)
                        .then((r) => toast("✅ Address Copied!"))
                    }
                    src="/images/icons/clipboards.png"
                    alt=""
                    className="w-5 h-5 ml-3 cursor-pointer mt-[18px]"
                  />
                </div>
              </div>
              <Modal
                open={editProfile}
                center
                classNames="rounded-lg"
                onClose={() => setEditProfile(false)}
              >
                {/* <div className="p-3 flex flex-col items-center">
                  
                </div> */}
                <p
                  className="pt-4 pb-4 px-2 border border-gray-200 rounded-[5px] text-center mb-1 sm:ml-0 ml-0 font-poppins w-full"
                  style={{ fontWeight: "bold" }}
                >
                  Edit Profile Information
                </p>
                <div className="flex-[0.5] font-poppins px-2">
                  <div className="flex space-x-3 relative">
                    <div>
                      <label htmlFor="name" className="sm:text-base text-sm">
                        Username
                      </label>
                      <label htmlFor="name" className="sm:text-base text-sm">
                        Bio
                      </label>
                      <label htmlFor="name" className="sm:text-base text-sm">
                        Facebook Profile Link
                      </label>
                      <hr className="absolute w-full bg-gray-200" />
                      <label
                        htmlFor="name"
                        className="pt-3 sm:text-base text-sm"
                      >
                        Instagram Profile Link
                      </label>
                      <hr className="absolute w-full bg-gray-200" />
                      <label
                        htmlFor="name"
                        className="pt-3 sm:text-base text-sm"
                      >
                        Twitter Profile Link
                      </label>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={profileInfo.username}
                        onChange={(e) =>
                          setProfileInfo({
                            ...profileInfo,
                            username: e.target.value,
                          })
                        }
                        placeholder="Username"
                        className="pt-3 sm:text-base text-sm"
                      />
                      <input
                        type="text"
                        value={profileInfo.bio}
                        onChange={(e) =>
                          setProfileInfo({
                            ...profileInfo,
                            bio: e.target.value,
                          })
                        }
                        placeholder="User Bio"
                        className="pt-3 sm:text-base text-sm"
                      />
                      <input
                        type="text"
                        value={profileInfo.facebook}
                        onChange={(e) =>
                          setProfileInfo({
                            ...profileInfo,
                            facebook: e.target.value,
                          })
                        }
                        placeholder="Facebook"
                        className="sm:text-base text-sm"
                      />
                      <input
                        type="text"
                        value={profileInfo.instagram}
                        onChange={(e) =>
                          setProfileInfo({
                            ...profileInfo,
                            instagram: e.target.value,
                          })
                        }
                        placeholder="Instagram"
                        className="pt-3 sm:text-base text-sm"
                      />
                      <input
                        type="text"
                        value={profileInfo.twitter}
                        onChange={(e) =>
                          setProfileInfo({
                            ...profileInfo,
                            twitter: e.target.value,
                          })
                        }
                        placeholder="Twitter"
                        className="pt-3 sm:text-base text-sm"
                      />
                    </div>
                  </div>{" "}
                  <button
                    className="w-[45%] h-[100%] text-3xl  text-black rounded-[50px] border sm:text-base text-3xl border-gray-300 py-1"
                    onClick={() => setEditProfile(false)}
                  >
                    Close
                  </button>
                  <button
                    className="w-[45%] h-[100%] text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 py-1"
                    onClick={() => saveProfileInfo()}
                    style={{ marginLeft: "20px" }}
                  >
                    Save
                  </button>
                </div>
              </Modal>
              <ToastContainer />
              <h2 className="sm:text-3xl text-3xl font-medium text-black mb-3 mt-2 font-prata">
                {profileInfo.username}
              </h2>
              <p className="pt-4 pb-4 px-2 border border-gray-200 rounded-[5px] text-center mb-1 sm:ml-0 ml-0 font-poppins w-full">
                {profileInfo.bio}
              </p>
              <div className="p-2 border border-gray-200 lg:flex space-x-1 w-full font-poppins">
                <div className="rounded-[5px] border border-gray-200 flex flex-col items-center p-3">
                  <h4>{userNFT.mintedNFTs}</h4>
                  <p className="text-1xl text-center">Minted NFTs</p>
                </div>
                <div className="rounded-[5px] border border-gray-200 flex flex-col items-center p-3">
                  <h4>{userNFT.soldNFTs}</h4>
                  <p className="text-1xl text-center">Sold NFTs</p>
                </div>

                <div className="rounded-[5px] border border-gray-200 flex flex-col items-center p-3">
                  <h4>
                    {balance.formatted === "" ? "0 BNB" : balance.formatted}
                  </h4>
                  <p className="text-1xl">Wallet Balance</p>
                </div>
              </div>

              <div className="flex justify-between space-x-5 my-5">
                <img
                  src="/images/icons/fb.png"
                  alt=""
                  className="w-[40px] h-[40px] rounded-full object-cover cursor-pointer"
                  onClick={() => {
                    profileInfo.facebook == ""
                      ? toast("You have not added your facebook profile")
                      : window.open(profileInfo.facebook, "_blank");
                  }}
                />
                <img
                  src="/images/icons/insta.png"
                  alt=""
                  className="w-[40px] h-[40px] rounded-full object-cover cursor-pointer"
                  onClick={() => {
                    profileInfo.instagram == ""
                      ? toast("You have not added your facebook profile")
                      : window.open(profileInfo.instagram, "_blank");
                  }}
                />
                <img
                  src="/images/icons/twitter.png"
                  alt=""
                  className="w-[40px] h-[40px] rounded-full object-cover cursor-pointer"
                  onClick={() => {
                    profileInfo.twitter == ""
                      ? toast("You have not added your facebook profile")
                      : window.open(profileInfo.twitter, "_blank");
                  }}
                />
              </div>
              <div className="lg:flex space-x-1 w-full h-max font-poppins">
                <div
                  className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1
                                flex flex-col items-center w-full h-max"
                >
                  <button
                    className="w-[70%] h-[100%] text-3xl  text-black rounded-[50px] border sm:text-base text-3xl border-gray-300 py-1"
                    onClick={() => setEditProfile(true)}
                  >
                    Edit Profile
                  </button>
                </div>
                <div
                  className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1
                                flex flex-col items-center w-full h-max"
                >
                  {authError && (
                    <p>
                      {authError.name}
                      {authError.message}
                    </p>
                  )}
                  <button
                    className="w-[70%] h-[100%] text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 py-1"
                    onClick={logout}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-[0.6]">
              {NFTFound ? (
                <ProfileGallery
                  imageURIs={userNFT.imageURIs}
                  tokenIds={userNFT.tokenIds}
                  owner={account}
                />
              ) : (
                <div className="flex flex-col h-[90%] mt-[10%] content-center	items-center justify-center w-full p-3 border border-gray-200 rounded-[5px] mb-1">
                  <img
                    src="/images/logo.png"
                    alt=""
                    className="h-[220px] w-[220px] rounded-[10px] mb-4"
                  />
                  <p className="p-1 text-center text-4xl font-medium">
                    NFT Record Not Found!
                  </p>
                  <p className="p-1 text-center text-4xl font-medium">
                    Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-20 w-full flex-col flex items-center">
            <img
              src="/images/logo.png"
              alt=""
              className="h-[220px] w-[220px] rounded-[10px] mb-4"
            />
            <div className="w-full p-3 border border-gray-200 rounded-[5px] mb-1">
              <p className="p-1 text-center text-2xl font-medium">
                You're not Logged In!
              </p>
              <p className="p-1 text-center text-2xl font-medium">
                Please Select Binance Smart Chain Network
              </p>
            </div>
            <div className="lg:flex space-x-1 w-full h-max font-poppins">
              <div
                className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1
                                flex flex-col items-center w-full h-max"
              >
                {authError && (
                  <p>
                    {authError.name}
                    {authError.message}
                  </p>
                )}
                <button
                  className="w-[22%] h-[100%] text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 px-5 py-1"
                  onClick={connectWithProfile}
                >
                  Log In with Metamask
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
