import { Client } from "ssh2";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  database: "gadgetini",
};

export async function POST(request) {
  try {
    const { rotation } = await request.json();

    // Fetch node IP addresses and credentials from the database
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT username, ipaddress, password FROM iplists"
    );
    console.log("Fetched IP list from database:", rows);
    await connection.end();

    const updateRotation = (username, ipaddress, password, rotation) => {
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
          .on("ready", () => {
            // Command to update only the orientation in config.ini
            const command = `sed -i 's/^orientation=.*/orientation=${rotation}/' /home/yonsei/config.ini`;
            console.log("Running command on remote:", command);
            // Execute the command on the remote node
            conn.exec(command, (err) => {
              if (err) {
                reject(err);
                conn.end();
              } else {
                resolve(true);
                conn.end();
              }
            });
          })
          .on("error", (err) => {
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

    // Iterate over each node and update only the orientation
    for (const node of rows) {
      await updateRotation(
        node.username,
        node.ipaddress,
        node.password,
        rotation
      );
    }

    return new Response(
      JSON.stringify({ message: "Rotation updated on all nodes!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating rotation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update rotation." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
