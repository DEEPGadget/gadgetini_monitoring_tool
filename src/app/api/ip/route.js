import mysql from "mysql2/promise";
import { Client } from "ssh2";

const dbConfig = {
  host: "127.0.0.1",
  user: "root",
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
    const { serveralias, serveripaddress, serverpassword, piipaddress } =
      await request.json();

    if (!serveripaddress || !serverpassword || !piipaddress) {
      return new Response(
        JSON.stringify({
          error:
            "Required missing : serveripaddress, serverpassword or piipaddress.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const sshConnect = (username, ipaddress, password) => {
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
          .on("ready", () => {
            console.log("SSH Connection Successful");
            resolve(true);
            conn.end();
          })
          .on("error", (err) => {
            console.error("SSH Connection Failed:", err);
            reject(err);
          })
          .connect({
            host: ipaddress,
            port: 22,
            username: username,
            password: password,
          });
      });
    };

    try {
      await sshConnect(username, ipaddress, password);
    } catch (sshError) {
      return new Response(
        JSON.stringify({
          error: `SSH connection failed: ${sshError.message}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      await connection.execute(
        "INSERT INTO iplists (username, ipaddress, password, alias, description) VALUES (?, ?, ?, ?, ?)",
        [username, ipaddress, password, alias, description]
      );
    } catch (dbError) {
      if (dbError.code === "ER_DUP_ENTRY") {
        return new Response(
          JSON.stringify({
            error: "Duplicate entry: username and IP address already exist.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw dbError;
    } finally {
      await connection.end();
    }

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

export async function DELETE(request) {
  try {
    const { username, ipaddress } = await request.json();

    if (!username || !ipaddress) {
      return new Response(
        JSON.stringify({ error: "Username and IP address are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "DELETE FROM iplists WHERE username = ? AND ipaddress = ?",
      [username, ipaddress]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: "No record found to delete." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Data deleted successfully!" }),
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
