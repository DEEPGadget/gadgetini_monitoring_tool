import { Client } from "ssh2";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import os from "os";

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost"; // Fallback to localhost if no external IP found
}

const dbConfig = {
  host: getLocalIPAddress(),
  user: "root",
  database: "gadgetini",
};

export async function POST(request) {
  try {
    const { status } = await request.json();

    // Fetch node IP addresses and credentials from the database
    const connection = await mysql.createConnection(dbConfig);
    console.log(connection);
    const [rows] = await connection.execute(
      "SELECT username, ipaddress, password FROM iplists"
    );
    await connection.end();

    const updateModes = (
      username,
      ipaddress,
      password,
      status,
      rotationTime
    ) => {
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
          .on("ready", () => {
            // Command to update modes (cpu, gpu, psu, network, sensors) in config.ini
            const command = `
        sed -i 's/^cpumode\\s*=\\s*.*/cpumode=${
          status.cpu ? "on" : "off"
        }/' ~/config.ini;
        sed -i 's/^gpumode\\s*=\\s*.*/gpumode=${
          status.gpu ? "on" : "off"
        }/' ~/config.ini;
        sed -i 's/^psumode\\s*=\\s*.*/psumode=${
          status.psu ? "on" : "off"
        }/' ~/config.ini;
        sed -i 's/^networkmode\\s*=\\s*.*/networkmode=${
          status.network ? "on" : "off"
        }/' ~/config.ini;
        sed -i 's/^sensormode\\s*=\\s*.*/sensormode=${
          status.sensors ? "on" : "off"
        }/' ~/config.ini;
        sed -i 's/^time\\s*=\\s*.*/time=${rotationTime}/' ~/config.ini;
      `;

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

    const updateLocalConfig = async (status) => {
      const homeDir = require("os").homedir(); // Get home directory
      const configPath = path.join(homeDir, "config.ini"); // Path to config.ini in home directory

      // Read the existing config file
      let config = await fs.promises.readFile(configPath, "utf-8");

      // Update the relevant lines in the config file
      config = config
        .replace(/^cpumode\s*=\s*.*/m, `cpumode=${status.cpu ? "on" : "off"}`)
        .replace(/^gpumode\s*=\s*.*/m, `gpumode=${status.gpu ? "on" : "off"}`)
        .replace(/^psumode\s*=\s*.*/m, `psumode=${status.psu ? "on" : "off"}`)
        .replace(
          /^networkmode\s*=\s*.*/m,
          `networkmode=${status.network ? "on" : "off"}`
        )
        .replace(
          /^sensormode\s*=\s*.*/m,
          `sensormode=${status.sensors ? "on" : "off"}`
        )
        .replace(/^time\s*=\s*.*/m, `time=${rotationTime}`);

      // Write the updated config file back to the file system
      await fs.promises.writeFile(configPath, config, "utf-8");
    };

    // Update the local config file first
    await updateLocalConfig(status);

    // Iterate over each node and update the modes
    for (const node of rows) {
      await updateModes(node.username, node.ipaddress, node.password, status);
    }

    return new Response(
      JSON.stringify({ message: "Modes updated on all nodes!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating modes:", error);
    return new Response(JSON.stringify({ error: "Failed to update modes." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
