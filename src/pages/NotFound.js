import React from "react";
import 'react-toastify/dist/ReactToastify.css';
import {useNavigate} from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <section className="mt-[75px]">
            <section>
                <div className="flex-[1] max-w-5xl lg:mx-auto md:mx-5 sm:mx-5 mx-0 ">
                    <div className="w-full flex-col flex items-center">
                    <img
                        src="/images/logo.png"
                        alt=""
                        className="h-[220px] w-[220px] rounded-[10px] mb-4"
                    />
                    </div>
                    <div className="w-full p-3 border border-gray-200 rounded-[5px] mb-1">
                        <p className="p-1 text-center text-2xl font-medium">No page found!</p>
                    </div>
                    <div className="flex-[1] p-3 border border-gray-200 rounded-[5px] mb-1
                                flex flex-col items-center w-full h-max">
                        <button
                            className="w-[22%] h-[100%] text-3xl bg-gradient-to-r from-[#3b39e3] to-[#ca0dff] hover:from-[#ca0dff] hover:to-[#3b39e3] text-white rounded-[50px] border sm:text-base text-3xl border-gray-300 px-5 py-1"
                            onClick={navigate("/")}>
                            Go back to Homepage
                        </button>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default NotFound;
