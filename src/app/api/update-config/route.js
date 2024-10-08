import { Client } from "ssh2";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  database: "gadgetini",
};

export async function POST(request) {
  try {
    const { status } = await request.json();

    // Fetch node IP addresses and credentials from the database
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT username, ipaddress, password FROM iplists");
    await connection.end();

    const updateModes = (username, ipaddress, password, status) => {
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on("ready", () => {
          // Command to update modes (cpu, gpu, psu, network, sensors) in config.ini
          const command = `sed -i 's/^cpumode=.*/cpumode=${status.cpu ? 'on' : 'off'}/' ~/config.ini && \
                           sed -i 's/^gpumode=.*/gpumode=${status.gpu ? 'on' : 'off'}/' ~/config.ini && \
                           sed -i 's/^psumode=.*/psumode=${status.psu ? 'on' : 'off'}/' ~/config.ini && \
                           sed -i 's/^networkmode=.*/networkmode=${status.network ? 'on' : 'off'}/' ~/config.ini && \
                           sed -i 's/^sensormode=.*/sensormode=${status.sensors ? 'on' : 'off'}/' ~/config.ini`;

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
        }).on("error", (err) => {
          reject(err);
        }).connect({
          host: ipaddress,
          port: 22,
          username: username,
          password: password,
        });
      });
    };

    // Iterate over each node and update the modes
    for (const node of rows) {
      await updateModes(node.username, node.ipaddress, node.password, status);
    }

    return new Response(JSON.stringify({ message: "Modes updated on all nodes!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating modes:", error);
    return new Response(JSON.stringify({ error: "Failed to update modes." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
