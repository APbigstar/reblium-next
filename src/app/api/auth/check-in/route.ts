import { NextRequest, NextResponse } from "next/server";

const loginStatusStore = new Map();

export async function POST(req: NextRequest) {
  const userIP = req.headers.get("x-forwarded-for") || req.ip;
  const normalizedIP = userIP === "::1" ? "localhost" : userIP; // Normalize localhost IP
  console.log(normalizedIP)
  console.log(loginStatusStore.get(normalizedIP))
  const isLoggedIn = loginStatusStore.get(normalizedIP);

  if (isLoggedIn) {
    return NextResponse.json({
      message: "User is logged in",
      status: "success",
    });
  } else {
    return NextResponse.json({
      message: "User is not logged in",
      status: "fail",
    });
  }
}
