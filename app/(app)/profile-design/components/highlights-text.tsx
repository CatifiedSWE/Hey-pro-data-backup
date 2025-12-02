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
]

const letters = ["H", "E", "Y", "L", "I", "G", "H", "T", "S"]

type HighlightsTextProps = {
    direction?: "column" | "row"
    className?: string
    letterClassName?: string
}

export default function HighlightsText({
    direction = "column",
    className = "",
    letterClassName = "text-2xl font-semibold leading-none",
}: HighlightsTextProps) {
    const orientationClass = direction === "column" ? "flex-col" : "flex-row"
    const rotationAngle = direction === "column" ? "rotate-90" : "rotate-0"
    return (
        <div className={`flex ${orientationClass} items-center ${className}`}>
            {letters.map((letter, index) => (
                <span
                    key={`heylights-letter-${index}`}
                    className={`inline-flex items-center font-[700] text-[22px] justify-center -my-[4px] -mx-0.5 ${letterClassName} ${rotationAngle}`}
                    style={{ color: palette[index % palette.length] }}
                >
                    {letter}
                </span>
            ))}
        </div>
    )
}

