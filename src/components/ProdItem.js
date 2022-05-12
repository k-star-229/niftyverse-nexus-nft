import React from "react";
import { useNavigate } from "react-router-dom";

const ProdItem = ({ img, comp, tokenId, owner, objectId }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-[10px]">
      <img
        src={img}
        alt=""
        className={comp ? comp : "w-[full] h-[220px] object-cover"}
        onClick={() =>
          navigate(`/transaction/${owner.address}/${tokenId}/${objectId}`)
        }
      />
    </div>
  );
};

export default ProdItem;
