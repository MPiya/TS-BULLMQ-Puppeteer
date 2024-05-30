import { NextResponse } from "next/server";
import { SHA256 as sha256 } from "crypto-js";
import { SignJWT } from "jose";
import { prisma } from "@/app/lib";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_KEY as string);
const alg = "HS256";
const createToken = async (email: string, userId: number) => {
  return await new SignJWT({ email, userId, isAdmin: true })
    .setProtectedHeader({ alg })
    .setExpirationTime("48h")
    .sign(secret);
};

export async function POST(request: Request) {

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password is required." },
        { status: 400 }
      );
    }

    const user = await prisma.admin.findUnique({
      where: { email, password },
    });

    if (!user) {
      return NextResponse.json(
        { msg: "Invalid Email or Password" },
        { status: 404 }
      );
    } else {
      const token = await createToken(user.email, user.id);
      cookies().set("access_token", token);

      return NextResponse.json(
        {
          userInfo: {
            id: user.id,
            email: user.email,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
