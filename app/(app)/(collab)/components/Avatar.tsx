"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
    src: string | null | undefined;
    alt: string;
    width: number;
    height: number;
    className?: string;
    style?: React.CSSProperties;
};

const PLACEHOLDER_AVATAR = "/default-profile.png";

export function Avatar({ src, alt, width, height, className = "", style }: AvatarProps) {
    const [imgSrc, setImgSrc] = useState<string>(src || PLACEHOLDER_AVATAR);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // Fallback to placeholder
            setImgSrc(PLACEHOLDER_AVATAR);
        }
    };

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            onError={handleError}
            unoptimized
        />
    );
}
