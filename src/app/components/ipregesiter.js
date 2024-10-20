"use client";

import React, { useEffect, useState, useRef } from "react";
import { PlusCircleIcon } from "@heroicons/react/solid";
import LoadingSpinner from "../utils/LoadingSpinner";
import { FaCheck, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import { fetchIPList } from "../utils/fetchIPList";
import Image from "next/image";

export default function IPRegister() {
  const [nodelist, setNodelist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localIP, setLocalIP] = useState("localhost");

  const serverUsernameRef = useRef();
  const serverAliasRef = useRef();
  const serverIPRef = useRef();
  const serverPasswordRef = useRef();
  const piIPRef = useRef();

  useEffect(() => {
    loadIPList();
    fetchLocalIP();
    fetchUsername();
  }, []);

  const fetchLocalIP = async () => {
    try {
      const response = await fetch("/api/localhostip");
      const data = await response.json();
      setLocalIP(data.ipv4);
    } catch (error) {
      console.error("Failed to fetch local IP:", error);
    }
  };

  const fetchUsername = async () => {
    try {
      const response = await fetch("/api/username");
      const data = await response.json();
      setUsername(data.username);
    } catch (error) {
      console.error("Failed to fetch username:", error);
    }
  };

  const loadIPList = async () => {
    const data = await fetchIPList();
    setNodelist(data);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const formData = {
        serverusername: serverUsernameRef.current.value,
        serveralias: serverAliasRef.current.value,
        serveripaddress: serverIPRef.current.value,
        serverpassword: serverPasswordRef.current.value,
        piipaddress: piIPRef.current.value,
      };

      const response = await fetch("/api/ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Something went wrong during registration.");
        throw new Error("Network response was not ok.");
      }

      console.log(result.message);
      await loadIPList();

      serverUsernameRef.current.value = "";
      serverAliasRef.current.value = "";
      serverIPRef.current.value = "";
      serverPasswordRef.current.value = "";
      piIPRef.current.value = "";
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serveripaddress, piipaddress) => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete?");

    // If user clicks "Yes" (OK)
    if (confirmed) {
      try {
        const response = await fetch("/api/ip", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serveripaddress, piipaddress }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }

        const result = await response.json();
        console.log(result.message);

        await loadIPList(); // Reload the IP list after successful deletion
      } catch (error) {
        console.error("Delete error:", error);
      }
    } else {
      // If user clicks "No" (Cancel), do nothing
      console.log("Deletion cancelled.");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            ref={serverUsernameRef}
            placeholder="Server Username"
            className="border p-2"
          />
          <input
            type="text"
            ref={serverAliasRef}
            placeholder="Server Alias"
            className="border p-2"
          />
          <input
            type="text"
            ref={serverIPRef}
            placeholder="Server IP Address"
            className="border p-2"
          />
          <input
            type="password"
            ref={serverPasswordRef}
            placeholder="Server Password"
            className="border p-2"
          />
          <input
            type="text"
            ref={piIPRef}
            placeholder="RaspberryPi IP Address"
            className="border p-2"
          />
          <button
            onClick={handleRegister}
            className="flex items-center bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <PlusCircleIcon className="w-5 h-5 mr-1" />
            )}
            {loading ? null : "Register"}
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">IP Table</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white table-auto border-separate border-spacing-0">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="py-2 w-1/5 border border-gray-300" rowSpan="2">
                  Server Alias
                </th>
                <th className="py-2 w-1/5 border border-gray-300" rowSpan="2">
                  Server IP
                </th>
                <th className="py-2 w-1/5 border border-gray-300" rowSpan="2">
                  RaspberryPi IP Address
                </th>
                <th
                  className="py-2 w-1/4 border border-gray-300 text-center"
                  colSpan="2"
                >
                  <Image
                    src="/icons/terminal.png"
                    alt="SSH"
                    width={24}
                    height={24}
                    className="inline-block mr-1"
                  />
                  SSH
                </th>
                <th
                  className="py-2 w-1/5 border border-gray-300 text-center"
                  rowSpan="2"
                >
                  <Image
                    src="/icons/grafana.png"
                    alt="Grafana"
                    width={20}
                    height={20}
                    className="inline-block mx-1"
                  />
                  Grafana
                </th>
                <th
                  className="py-2 w-1/5 border border-gray-300 text-center"
                  rowSpan="2"
                >
                  Delete
                </th>
              </tr>
              <tr className="border-b-2 border-gray-400">
                <th className="py-2 w-1/8 border border-gray-300 text-center">
                  Server SSH
                </th>
                <th className="py-2 w-1/8 border border-gray-300 text-center">
                  Pi SSH
                </th>
              </tr>
            </thead>
            <tbody>
              {nodelist
                .sort((a, b) => a.serveralias.localeCompare(b.serveralias))
                .map((node) => (
                  <tr
                    key={`${node.serveripaddress}-${node.piipaddress}`}
                    className="text-center border-t border-gray-300"
                  >
                    <td className="truncate border border-gray-300 py-2">
                      {node.serveralias}
                    </td>
                    <td className="truncate border border-gray-300 py-2">
                      {node.serveripaddress}
                    </td>
                    <td className="truncate border border-gray-300 py-2">
                      {node.piipaddress}
                    </td>
                    <td className="border border-gray-300 w-1/8 text-center py-1">
                      <a
                        href={`http://${localIP}:2222/ssh/host/${node.serveripaddress}`}
                        target="_blank"
                        className="flex justify-center items-center bg-blue-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-blue-600 transition-all mx-auto"
                      >
                        <FaCheck className="mr-1" /> Connect
                      </a>
                    </td>
                    <td className="border border-gray-300 w-1/8 text-center py-1">
                      <a
                        href={`http://${localIP}:2222/ssh/host/${node.piipaddress}`}
                        target="_blank"
                        className="flex justify-center items-center bg-blue-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-blue-600 transition-all mx-auto"
                      >
                        <FaCheck className="mr-1" /> Connect
                      </a>
                    </td>
                    <td className="border border-gray-300 w-1/5 text-center">
                      <a
                        href={`http://${node.piipaddress}:3000`}
                        target="_blank"
                        className="flex justify-center items-center bg-green-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-green-600 transition-all mx-auto"
                      >
                        <FaExternalLinkAlt className="mr-1" /> Connect
                      </a>
                    </td>
                    <td className="border border-gray-300 w-1/5 text-center">
                      <button
                        onClick={() =>
                          handleDelete(node.serveripaddress, node.piipaddress)
                        }
                        className="flex justify-center items-center bg-red-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-red-600 transition-all mx-auto"
                      >
                        <FaTimes className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
