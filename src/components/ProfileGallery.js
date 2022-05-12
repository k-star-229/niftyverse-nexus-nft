import React from "react";
import "../styles/home.css";
import ProdItem from "./ProdItem";

export default function ProfileGallery({ imageURIs, tokenIds, owner }) {
  return (
    <div className="overflow-auto profile_gallery grid sm:grid-cols-3 grid-cols-2 gap-[5px] h-[84vh] mt-[60px] overflow-auto">
      {imageURIs.map((imageURI, index) => {
        return (
          <ProdItem
            img={
              imageURI.match(/\.(jpeg|jpg|gif|png|jfif|svg|gif)$/) != null
                ? imageURI
                : "/images/document.png"
            }
            tokenId={tokenIds[index]}
            owner={owner}
            alt=""
            // className="w-full h-[150px] object-cover"
          />
        );
      })}
    </div>
  );
}
