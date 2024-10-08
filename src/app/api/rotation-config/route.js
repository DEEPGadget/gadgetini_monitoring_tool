import { Client } from "ssh2";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

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
            const command = `sed -i 's/^orientation\\s*=.*/orientation=${rotation}/' ~/config.ini`;
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

    const updateLocalRotation = async (rotation) => {
      const homeDir = require("os").homedir(); // Get home directory
      const configPath = path.join(homeDir, "config.ini"); // Path to config.ini in home directory

      // Read the existing config file
      let config = await fs.promises.readFile(configPath, "utf-8");

      // Update the orientation in the config file
      config = config.replace(/^orientation\s*=.*/m, `orientation=${rotation}`);

      // Write the updated config file back to the file system
      await fs.promises.writeFile(configPath, config, "utf-8");

      console.log(`Local config.ini updated with orientation=${rotation}`);
    };

    // Update the local config.ini file first
    await updateLocalRotation(rotation);

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
