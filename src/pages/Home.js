import React, { useEffect, useState } from "react";
import HomeGallery from "../components/HomeGallery";
import HomeSide from "../components/HomeSide";
import ContractAddress from "../contract/ContractAddress";
import ERC1155ABI from "../contract/ERC1155ABI";
import { useMoralis } from "react-moralis";
import { list } from "postcss";
import { useLocation } from "react-router-dom";
import { getLocationOrigin } from "next/dist/shared/lib/utils";

function Home(props) {
  const location = useLocation();
  let description = "";
  if (location.state) {
    description = location.state.description;
  }

  const [isSidebar, setIsSidebar] = useState(false);
  const {
    isWeb3Enabled,
    enableWeb3,
    isAuthenticated,
    isWeb3EnableLoading,
    Moralis,
  } = useMoralis();
  const [state, setState] = useState({
    listings: [],
    imageURIs: [],
    tokenIds: [],
  });
  const [inputValue, setInputValue] = useState("explore");
  const { ERC1155ContractAddress } = ContractAddress;

  async function getListedNFTs() {
    const Listing = Moralis.Object.extend("Listing");
    const query = new Moralis.Query(Listing);
    query.greaterThan("amount", 0);
    const results = await query.find();
    const listings = [],
      tokenIds = [];

    results.forEach((listedNFTs) => {
      const { owner, tokenId, price, amount, createdAt } =
        listedNFTs.attributes;
      listings.push({
        id: listedNFTs.id,
        owner,
        tokenId,
        price,
        amount,
        createdAt,
        views: 0,
        likes: 0,
      });
      tokenIds.push(tokenId);
    });
    const imageURIs = await getNFTs(tokenIds);
    const metaData = await Moralis.executeFunction({
      contractAddress: ERC1155ContractAddress,
      functionName: "getMetaDataBatch",
      abi: ERC1155ABI,
      params: { tokenId_: tokenIds },
    });

    listings.forEach(async (listing, index) => {
      const NFT = Moralis.Object.extend("NFT");
      const query = new Moralis.Query(NFT);

      query.get(metaData[index]).then((metaData) => {
        const { likes, views } = metaData.attributes;
        listings[index].likes = likes;
        listings[index].views = views;
      });
    });
    setState({ listings, imageURIs, tokenIds });
  }

  async function getNFTs(tokenIds) {
    const readOptions = {
      contractAddress: ERC1155ContractAddress,
      functionName: "tokenURIBatch",
      abi: ERC1155ABI,
      params: {
        tokenId_: tokenIds,
      },
    };

    const imageURIs = await Moralis.executeFunction(readOptions);
    return imageURIs;
  }

  useEffect(async () => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    getListedNFTs();
  }, [isAuthenticated, isWeb3Enabled]);

  async function filterNFTs(type, value) {
    if (type == "rank") {
      let { listings, tokenIds } = state;
      let newArray = [];
      for (let i = 0; i < listings.length; i++) {
        newArray.push({
          listing: listings[i],
          tokenId: tokenIds[i],
        });
      }
      if (value == "price") {
        newArray.sort(function (a, b) {
          return b.listing.price - a.listing.price;
        });
      } else if (value == "time") {
        newArray.sort(function (a, b) {
          return b.listing.createdAt - a.listing.createdAt;
        });
      } else if (value == "views" || value == "trending") {
        newArray.sort(function (a, b) {
          return b.listing.views - a.listing.views;
        });
      } else if (value == "likes" || value == "fame") {
        newArray.sort(function (a, b) {
          return b.listing.likes - a.listing.likes;
        });
      }
      for (let i = 0; i < newArray.length; i++) {
        listings[i] = newArray[i].listing;
        tokenIds[i] = newArray[i].tokenId;
      }
      console.log(listings);
      setState({ listings, imageURIs: await getNFTs(tokenIds), tokenIds });
    }
  }

  return (
    <section className="relative">
      <div className="rounded-md absolute lg:hidden top-7 left-5 bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] cursor-pointer p-1 z-[200]">
        <img
          src="/images/icons/square.png"
          alt=""
          className="h-6 w-6"
          onClick={() => {
            setIsSidebar(!isSidebar);
          }}
        />
      </div>
      <div className="max-w-5xl mx-auto lg:flex ">
        <div
          className={`flex-[0.3] lg:block ${
            isSidebar ? "block px-3" : "hidden"
          } lg:static fixed h-full pr-5 overflow-auto scrollbar-hidden h-screen left-0 top-0 bg-white z-[100]`}
        >
          <HomeSide filterNFTs={filterNFTs} />
        </div>

        <div className="flex-[0.7] lg:ml-5 mx-2">
          <HomeGallery imageURIs={state.imageURIs} listings={state.listings} />
        </div>
      </div>
    </section>
  );
}

export default Home;
