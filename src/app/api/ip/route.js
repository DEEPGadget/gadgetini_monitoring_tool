import mysql from "mysql2/promise";

// MariaDB 연결 설정
const dbConfig = {
  host: "localhost",
  user: "yjeon",
  password: "gadgetini",
  database: "gadgetini",
};

export async function GET(request) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT username, ipaddress, alias, description FROM iplists"
    );
    await connection.end();

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Database error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const { username, ipaddress, password, alias, description } =
      await request.json();

    if (!username || !ipaddress || !password || !alias || !description) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO iplists (username, ipaddress, password, alias, description) VALUES (?, ?, ?, ?, ?)",
      [username, ipaddress, password, alias, description]
    );
    await connection.end();

    return new Response(
      JSON.stringify({ message: "Data inserted successfully!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Database error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
