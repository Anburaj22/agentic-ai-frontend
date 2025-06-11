import React from "react";

const PreLoader = () => {
  return (
    <div
      className="preloader-wrapper flex justify-center items-center text-center absolute top-0 left-0 cursor-no-drop"
      style={{
        backgroundColor: 'rgba(37, 37, 37, 0.1)',
        zIndex: '999',
        borderRadius: '0.5 rem',
        width: '100%',
        height: '100%',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
    </div>
  );
};

export default PreLoader;
