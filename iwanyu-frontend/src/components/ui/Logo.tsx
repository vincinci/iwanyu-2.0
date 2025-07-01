import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', width = 160, height = 50 }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 600 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Shopping bag icon */}
        <g>
          <rect
            x="8"
            y="25"
            width="48"
            height="60"
            rx="6"
            stroke="black"
            strokeWidth="4"
            fill="white"
          />
          <path
            d="M20 25V20C20 15.5817 23.5817 12 28 12H36C40.4183 12 44 15.5817 44 20V25"
            stroke="black"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        
        {/* .store text in orange */}
        <text
          x="65"
          y="30"
          fontFamily="Arial, sans-serif"
          fontSize="20"
          fontWeight="bold"
          fill="#FF6B35"
        >
          .store
        </text>
        
        {/* iwanyu text in black */}
        <text
          x="8"
          y="75"
          fontFamily="Arial, sans-serif"
          fontSize="42"
          fontWeight="900"
          fill="black"
          letterSpacing="-1px"
        >
          iwanyu
        </text>
      </svg>
    </div>
  );
};

export default Logo;
