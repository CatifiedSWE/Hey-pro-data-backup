import * as React from "react";

const text = "HEYLIGHTS";

type HighlightsTextProps = {
  className?: string;
  letterClassName?: string;
};

export default function HighlightsText({
  className = "",
  letterClassName = "",
}: HighlightsTextProps) {
  return (
    <div
      className={`flex flex-col items-center justify-start ${className}`}
      style={{ 
        width: '33px',
        gap: '7px'
      }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: '22px',
            lineHeight: '100%',
            letterSpacing: '0%',
            textAlign: 'center',
            background: 'linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
