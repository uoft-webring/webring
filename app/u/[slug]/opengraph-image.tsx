import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
    const title = decodeURIComponent((params.slug ?? "Untitled").replace(/[-_]+/g, " ")) || "Untitled";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    padding: 64,
                    background: "#010414",
                    color: "#d5e1f7",
                }}
            >
                <div
                    style={{
                        width: "60%",
                        height: "20%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        backdropFilter: "blur(12px)",
                    }}
                >
                    <img src="https://uoftwebring.com/logo.svg" alt="UofT Webring Logo" />
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        textAlign: "center",
                        textWrap: "pretty",
                    }}
                >
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: -1,
                            background: "linear-gradient(90deg, #38bdf8, #a78bfa, #f472b6)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 2px 4px rgba(0,0,0,0.4), 0 4px 12px rgba(167,139,250,0.6)",
                            WebkitTextStroke: "1px rgba(255,255,255,0.3)",
                        }}
                    >
                        {title}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
