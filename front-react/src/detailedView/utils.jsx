function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s; // Chroma
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); // Second largest component
    const m = l - c / 2; // Match value
    
    let r, g, b;
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
  
    // Adjust RGB to match the lightness
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
  
    return { r, g, b };
  }
function getHueFromNumber(num, max = 40) {
    // Ensure the number is within the 0 to max range
    const clampedNum = Math.min(Math.max(num, 0), max);
    
    // Invert the calculation so lowest values map to green
    if (clampedNum <= max / 2) {
        // From 0 to max/2: transition from green to yellow
        const hue = 120 - (clampedNum / (max / 2)) * 60;
        return `hsl(${hue}, 100%, 70%)`;
    } else {
        // From max/2 to max: transition from yellow to red
        const hue = 60 - ((clampedNum - (max / 2)) / (max / 2)) * 60;
        return `hsl(${hue}, 100%, 70%)`;
    }
}

function calculateLuminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function getTextColorBasedOnBackground(hslColor) {
    const { r, g, b } = hslToRgb(hslColor.h, hslColor.s, hslColor.l);
    const luminance = calculateLuminance(r, g, b);
    
    // If luminance is lower than a threshold, return light text color (white)
    return luminance < 0.5 ? "white" : "black";
  }


  const calculateSVGSize = (rectangles) => {
    const padding = 30;
    let maxWidth = 0, maxHeight = 0;
  
    Object.values(rectangles).forEach(({ positionx, positiony, width, height }) => {
      maxWidth = Math.max(maxWidth, positionx + width);
      maxHeight = Math.max(maxHeight, positiony + height);
    });
  
    return {
      width: maxWidth + padding * 2,
      height: maxHeight + padding * 2,
      xOffset: padding,
      yOffset: padding,
    };
  };
export { getHueFromNumber, getTextColorBasedOnBackground, calculateSVGSize };