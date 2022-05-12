import React from "react";
import "react-responsive-modal/styles.css";
import {Modal} from "react-responsive-modal";
import {useNavigate} from "react-router-dom";

const PostPop = ({showPopup, setShowPopup}) => {
    const navigate = useNavigate();

    const doneHandling = () => {
        setShowPopup(false);
        navigate("/");
    };

    return (
        <div className=" rounded-lg">
            <Modal open={showPopup} center classNames="rounded-lg">
                <div className="p-3 flex flex-col items-center">
                    <h3>NFT Posted Successfully!</h3>
                    <button className="homecate mt-2" onClick={() => doneHandling()}>
                        Done
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default PostPop;
