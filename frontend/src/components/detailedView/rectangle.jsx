import { getHueFromNumber, getTextColorBasedOnBackground } from './utils';

function Rectangle({ x, y, width, height, text, onHover, onLeave, ocupation })  {
    const hue = ocupation!==undefined ? getHueFromNumber(Number(ocupation)) : "hsl(0, 0%, 0%)";
    const textColor = ocupation!==undefined ? getTextColorBasedOnBackground({ h: hue, s: 1, l: 0.5 }) : "white";

    return (
        <>
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={hue}
            onMouseEnter={() => onHover(text)}
            onMouseLeave={onLeave}
            rx={10}
            ry={10}
        />
        <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={textColor}
            fontSize="14"
            fontWeight="bold"
        >
            {text}
        </text>
        </>
    );
}

export default Rectangle;