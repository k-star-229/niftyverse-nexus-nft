import React from "react";

const MenuPop = () => {
  return (
    <div className="absolute top-10 right-0 w-[200px] bg-white rounded-md shadow-my transition duration-500">
      <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
        <img src="/images/icons/copy.png" alt="" className="h-4 w-4" />
        <p className="font-roboto font-medium">Copy</p>
      </div>
      <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
        <img src="/images/icons/giftbox.png" alt="" className="h-4 w-4" />
        <p className="font-roboto font-medium">Gift</p>
      </div>{" "}
      <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
        <img src="/images/icons/share.png" alt="" className="h-4 w-4" />
        <p className="font-roboto font-medium">Share</p>
      </div>{" "}
      <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
        <img src="/images/icons/block.png" alt="" className="h-4 w-4" />
        <p className="font-roboto font-medium">Report</p>
      </div>
      <div className="flex items-center space-x-5 hover:bg-gray-200 transition duration-300 cursor-pointer px-3 py-2">
        <img src="/images/icons/close.png" alt="" className="h-4 w-4" />
        <p className="font-roboto font-medium">Cancel</p>
      </div>
    </div>
  );
};

export default MenuPop;
