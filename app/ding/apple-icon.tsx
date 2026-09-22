import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111113",
        }}
      >
        <div
          style={{
            width: 94,
            height: 94,
            borderRadius: "50%",
            border: "14px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "#30D158",
              top: 2,
              right: 2,
              boxShadow: "0 0 0 5px #111113",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
