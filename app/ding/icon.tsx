import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "112px",
        }}
      >
        <div
          style={{
            width: 250,
            height: 250,
            borderRadius: "50%",
            border: "34px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: "50%",
              background: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#30D158",
              top: 8,
              right: 8,
              boxShadow: "0 0 0 14px #111113",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
