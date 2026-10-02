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
          background: "linear-gradient(145deg,#f8dce9 0%,#eadcf6 100%)",
          borderRadius: 112,
        }}
      >
        <div
          style={{
            width: 330,
            height: 330,
            borderRadius: "50%",
            background: "linear-gradient(145deg,#e98bad 0%,#b86597 100%)",
            boxShadow: "0 28px 60px rgba(121,67,94,.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 250,
            fontWeight: 800,
            lineHeight: 1,
            paddingBottom: 28,
          }}
        >
          p
        </div>
      </div>
    ),
    { ...size }
  );
}
