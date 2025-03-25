// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request, res: NextResponse) {
  try {
    const { email, password, fName, lName } = await request.json();

    // // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }
    // At this point, you should verify that password is defined
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fName,
        lName,
      },
    });

    return NextResponse.json({ message: "User created", user: newUser });
  } catch (error: any) {
    console.error("Error creating user:", error);
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
