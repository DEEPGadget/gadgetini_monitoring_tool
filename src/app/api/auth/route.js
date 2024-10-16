import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import os from "os";

const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  database: "gadgetini",
};

export async function POST(request) {
  const { username,password } = await request.json();

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      "SELECT password FROM auth WHERE username = ?",
      [username]
    );

    await connection.end();

    if (rows.length > 0) {
      const dbPassword = rows[0].password;
      if (dbPassword === password) {
        return NextResponse.json({
          success: true,
          message: "Login successful",
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Invalid password",
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: "Username not found",
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ success: false, message: "An error occurred" });
  }
}
