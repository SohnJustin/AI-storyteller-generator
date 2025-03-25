// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// We need to now start the process of logging in the user
// We need to check if the user exists and if the password is correct
// If the user exists and the password is correct, we will log the user in
// If the user does not exist or the password is incorrect, we will return an error
const prisma = new PrismaClient();

export async function POST(request: Request, res: NextResponse) {
  try {
    const { email, password } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 }
      );
    }

    console.log("User logged in");
    return NextResponse.json({ message: "Logged in", user: existingUser });
  } catch (error: any) {
    console.error("Error logging in user:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
