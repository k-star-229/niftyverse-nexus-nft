import React, { useState } from "react";

const HomeSide = ({ filterNFTs }) => {
  const [fileTypes, setFileTypes] = useState("text");
  const [rank, setRank] = useState("views");
  const [ranges, setRanges] = useState("");

  return (
    <>
      <div className="flex justify-between mt-[95px]">
        <button className="rounded-[40px] border border-gray-300 px-5 py-1">
          <img
            src="/images/icons/thumbnails.png"
            alt=""
            className="w-4 h-4 object-cover"
          />
        </button>
        <button className="rounded-[40px] border border-gray-300 px-5 py-1">
          <img
            src="/images/icons/filter.png"
            alt=""
            className="w-4 h-4 object-cover"
          />
        </button>
        <button className="rounded-[40px] border border-gray-300 px-5 py-1">
          <img
            src="/images/icons/network.png"
            alt=""
            className="w-4 h-4 object-cover"
          />
        </button>
      </div>

      <p className="text-base text-center my-2">File Types</p>
      <div className="grid grid-cols-3 gap-3 p-3 border border-gray-300 rounded-3xl">
        <button
          className={`homecate ${fileTypes === "text" && "homecate_active"}`}
          onClick={() => setFileTypes("text")}
        >
          Text
        </button>
        <button
          className={`homecate ${fileTypes === "audio" && "homecate_active"}`}
          onClick={() => setFileTypes("audio")}
        >
          Audio
        </button>
        <button
          className={`homecate ${fileTypes === "images" && "homecate_active"}`}
          onClick={() => setFileTypes("images")}
        >
          Images
        </button>
        <button
          className={`homecate ${fileTypes === "video" && "homecate_active"}`}
          onClick={() => setFileTypes("video")}
        >
          Video
        </button>
        <button
          className={`homecate ${fileTypes === "3d" && "homecate_active"}`}
          onClick={() => setFileTypes("3d")}
        >
          3D
        </button>
        <button
          className={`homecate ${fileTypes === "sim" && "homecate_active"}`}
          onClick={() => setFileTypes("sim")}
        >
          Sim
        </button>
      </div>

      <p className="text-base text-center mt-7 my-2">Rank</p>
      <div className="grid grid-cols-3 gap-3 p-3 border border-gray-300 rounded-3xl">
        <button
          className={`homecate ${rank === "price" && "homecate_active"}`}
          onClick={() => {
            setRank("price");
            filterNFTs("rank", "price");
          }}
        >
          Price
        </button>
        <button
          className={`homecate ${rank === "time" && "homecate_active"}`}
          onClick={() => {
            setRank("time");
            filterNFTs("rank", "time");
          }}
        >
          Time
        </button>
        <button
          className={`homecate homecate_bug ${
            rank === "trending" && "homecate_active"
          }`}
          onClick={() => {
            setRank("trending");
            filterNFTs("rank", "trending");
          }}
        >
          Trending
        </button>
        <button
          className={`homecate ${rank === "views" && "homecate_active"}`}
          onClick={() => {
            setRank("views");
            filterNFTs("rank", "views");
          }}
        >
          Views
        </button>
        <button
          className={`homecate ${rank === "like" && "homecate_active"}`}
          onClick={() => {
            setRank("like");
            filterNFTs("rank", "likes");
          }}
        >
          Like
        </button>
        <button
          className={`homecate ${rank === "fame" && "homecate_active"}`}
          onClick={() => {
            setRank("fame");
            filterNFTs("rank", "fame");
          }}
        >
          Fame
        </button>
      </div>

      <p className="text-base text-center mt-7 my-2">Ranges</p>
      <div className="grid grid-cols-3 gap-3 p-3 border border-gray-300 rounded-3xl">
        <button
          className={`homecate ${ranges === "price" && "homecate_active"}`}
          onClick={() => setRanges("price")}
        >
          Price
        </button>
        <button
          className={`homecate ${ranges === "time" && "homecate_active"}`}
          onClick={() => setRanges("time")}
        >
          Time
        </button>
        <button
          className={`homecate homecate_bug ${
            ranges === "trending" && "homecate_active"
          }`}
          onClick={() => setRanges("trending")}
        >
          Trending
        </button>
        <p className="col-span-full h-8 py-2 relative rounded-[40px] border border-gray-300">
          <span className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-[#dda5ff] to-[#64e2ff] rounded-[40px]"></span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 border border-gray-300 rounded-3xl mt-1">
        <button className="homecate">1pm 1/1/21</button>
        <button className="homecate">Time</button>
        <button className="homecate">Now</button>
      </div>
    </>
  );
};

export default HomeSide;
