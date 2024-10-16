import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const interfaces = os.networkInterfaces();
  let ipv4Address = "localhost";

  // Wi-Fi 인터페이스만 필터링
  for (let iface in interfaces) {
    if (
      iface.toLowerCase().includes("wifi") ||
      iface.toLowerCase().includes("wi-fi") ||
      iface.toLowerCase().includes("wlan")
    ) {
      // Wi-Fi 인터페이스만 선택
      for (let alias of interfaces[iface]) {
        if (alias.family === "IPv4" && !alias.internal) {
          ipv4Address = alias.address;
          break;
        }
      }
    }
    if (ipv4Address !== "localhost") break; // Wi-Fi의 IPv4 주소가 설정되면 루프 종료
  }

  return NextResponse.json({ ipv4: ipv4Address });
}
