import React from "react";

const TransItem = ({ img1, name, date, time, price, img2, boughtName }) => {
  return (
    <div className="border-b border-gray-200 mb-2 p-1">
      <div className="flex justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={img1}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <h4>{name}</h4>
          <p className="sm:text-base text-sm text-gray-400">{date}</p>
        </div>
        <div>
        
          {/* <p className="sm:text-base text-sm text-gray-400">{time}</p> */}
        </div>
        <div className="flex items-center space-x-3">
          <h4 className="sm:text-lg text-sm">{price} NFT</h4>
          <img
            src={img2}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>

      <p className="sm:text-base text-sm text-gray-400">
        Bought “{boughtName}”
      </p>
    </div>
  );
};

export default TransItem;
