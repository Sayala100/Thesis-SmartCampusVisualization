import React from 'react';

const ColorRange = ({ height = 30, showLabels = true, backgroundColor = '#333' }) => {

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        padding: '20px 0',
        width: '100%', // Full width
        textAlign: 'center', // Centers the content
      }}
    >
      <div
        style={{
          width: '80%', // Adjust this for the color range's width relative to the container
          maxWidth: '600px', // Optional: cap the max width
          height: `${height}px`,
          background: 'linear-gradient(to right, rgb(76, 175, 80), rgb(255, 255, 0), rgb(191, 63, 63))',
          borderRadius: '5px',
          margin: '0 auto', // Center the gradient
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
      ></div>
      {showLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '80%', // Match the gradient width
            maxWidth: '600px', // Optional: cap the max width
            margin: '10px auto 0 auto', // Center the labels
            fontSize: '14px',
          }}
        >
        <span style={{ color: "rgb(76, 175, 80)", fontSize:"24px" }}>0%</span>
        <span style={{ color: "rgb(121, 195, 60)" , fontSize:"24px"}}>25%</span>
        <span style={{ color: "rgb(255, 255, 0)" , fontSize:"24px"}}>50%</span>
        <span style={{ color: "rgb(239, 207, 47)" , fontSize:"24px"}}>75%</span>
        <span style={{ color: "rgb(191, 63, 63)" , fontSize:"24px"}}>100%</span>
        </div>
      )}
    </div>
  );
};

export default ColorRange;
