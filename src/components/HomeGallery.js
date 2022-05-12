import React from "react";
import "../styles/home.css";
import ProdItem from "./ProdItem";

const HomeGallery = ({ imageURIs, listings }) => {
  return (
    <div className="home_gallery grid sm:grid-cols-3 grid-cols-2 gap-[15px] mt-[95px] overflow-auto">
      {imageURIs.map((imageURI, index) => {
        return (
          <ProdItem
            key={imageURI}
            img={imageURI}
            tokenId={listings[index].tokenId}
            owner={listings[index].owner}
            objectId={listings[index].id}
            alt=""
            // className="w-full h-[150px] object-cover"
          />
        );
      })}
    </div>
  );
};

export default HomeGallery;
