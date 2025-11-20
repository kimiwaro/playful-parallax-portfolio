import React from "react";

type Props = {
  src: string;
  depth: number; // 0 (closest) .. 1 (farthest)
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
};

export default function ParallaxLayer({ src, depth, style, className, alt }: Props) {
  const translateFactor = (1 - depth) * 25; // adjust for parallax amplitude
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transform: `translate3d(0,0,0)`,
    willChange: "transform, opacity",
    pointerEvents: "none",
    ...style,
  };

  return <div className={className} style={baseStyle} aria-hidden="true" role="img" />;
}
