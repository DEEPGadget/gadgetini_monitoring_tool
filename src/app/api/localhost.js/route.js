import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const interfaces = os.networkInterfaces();
  let ipv4Address = "localhost";

  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        ipv4Address = alias.address;
        break;
      }
    }
    if (ipv4Address !== "localhost") break; // Exit loop once IPv4 is found
  }

  return NextResponse.json({ ipv4: ipv4Address });
}
