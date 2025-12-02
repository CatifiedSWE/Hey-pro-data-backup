import * as React from "react";

const palette = [
  "#FA6E80",
  "#F2748E",
  "#D47AA8",
  "#A584BF",
  "#7F8FC7",
  "#6BA1C6",
  "#5FB5C4",
  "#56C1BE",
  "#31A7AC",
];

const text = "HEYLIGHTS";

type HighlightsTextProps = {
  className?: string;
  letterClassName?: string;
};

export default function HighlightsText({
  className = "",
  letterClassName = "text-[50px] font-[700] leading-none",
}: HighlightsTextProps) {
  return (
    <div
      className={`[writing-mode:vertical-rl] rotate-180 ${className}`}
      style={{ lineHeight: "1" }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={letterClassName}
          style={{ color: palette[i % palette.length] }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
