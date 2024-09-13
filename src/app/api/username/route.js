// app/api/username/route.js

import os from "os";

export async function GET(request) {
  // 시스템의 현재 사용자의 Username을 가져옵니다.
  const username = os.userInfo().username;

  // JSON 형식으로 Username을 반환합니다.
  return new Response(JSON.stringify({ username }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
