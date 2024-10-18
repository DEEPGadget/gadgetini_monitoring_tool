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
      "SELECT serveralias, serveripaddress, piipaddress FROM iplists"
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
    const {
      serverusername,
      serveralias,
      serveripaddress,
      serverpassword,
      piipaddress,
    } = await request.json();
    const piusername = "gadgetini";
    const pipassword = "gadgetinidg12!@";

    if (
      !serverusername ||
      !serveripaddress ||
      !serverpassword ||
      !piipaddress
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Required missing : serverusername, serveripaddress, serverpassword or piipaddress.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const serverSshConnect = (
      serverusername,
      serverpassword,
      serveripaddress
    ) => {
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
          .on("ready", () => {
            console.log("Server SSH Connection Successful");
            resolve(true);
            conn.end();
          })
          .on("error", (err) => {
            console.error("Server SSH Connection Failed:", err);
            reject(err);
          })
          .connect({
            host: serveripaddress,
            port: 22,
            username: serverusername,
            password: serverpassword,
          });
      });
    };

    const piSshConnect = (piipaddress) => {
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
          .on("ready", () => {
            console.log("RaspberryPiPi SSH Connection Successful");
            resolve(true);
            conn.end();
          })
          .on("error", (err) => {
            console.error("RaspberryPi SSH Connection Failed:", err);
            reject(err);
          })
          .connect({
            host: piipaddress,
            port: 22,
            username: piusername,
            password: pipassword,
          });
      });
    };

    try {
      await serverSshConnect(serverusername, serverpassword, serveripaddress);
      await piSshConnect(piipaddress);
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
        "INSERT INTO iplists (serveralias, serveripaddress, piusername, piipaddress, pipassword) VALUES (?, ?, ?, ?, ?)",
        [serveralias, serveripaddress, piusername, piipaddress, pipassword]
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
