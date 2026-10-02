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
          background: "linear-gradient(145deg,#f8dce9 0%,#eadcf6 100%)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 116,
            height: 116,
            borderRadius: "50%",
            background: "linear-gradient(145deg,#e98bad 0%,#b86597 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1,
            paddingBottom: 9,
          }}
        >
          p
        </div>
      </div>
    ),
    { ...size }
  );
}
