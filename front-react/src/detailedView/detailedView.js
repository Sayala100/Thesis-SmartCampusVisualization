import React, { useState, useEffect } from "react";

function DetailedView() {
    const [imageSrc, setImageSrc] = useState("placeholder.jpg");
  
    useEffect(() => {
      const queryParams = new URLSearchParams(window.location.search);
      const building = queryParams.get("building");
      const floor = queryParams.get("floor");
  
      fetch("https://tesis.notadev.lat/gen_images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [building]: floor,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.blob();
        })
        .then((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          setImageSrc(imageUrl);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
          setImageSrc("error.jpg");
        });
    }, []);
  
    return (
      <div>
        <img id="placeholder" src={imageSrc} alt="Loading..." width="200" height="200" />
      </div>
    );
  }

export default DetailedView;