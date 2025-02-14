"use client";

import React, { useEffect, useState, useRef } from "react";
import { PlusCircleIcon } from "@heroicons/react/solid";
import LoadingSpinner from "../utils/LoadingSpinner";
import { FaCheck, FaExternalLinkAlt, FaTimes, FaEdit } from "react-icons/fa";
import { fetchIPList } from "../utils/fetchIPList";
import Image from "next/image";
import { fetchLocalIP } from "../utils/fetchLocalIP";

export default function IPRegister() {
  const [nodelist, setNodelist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localIP, setLocalIP] = useState("localhost");

  const serverAliasRef = useRef();
  const serverIPRef = useRef();
  const piIPRef = useRef();

  useEffect(() => {
    loadIPList();
    fetchLocalIP();
    fetchUsername();
  }, []);

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
        serveralias: serverAliasRef.current.value,
        serveripaddress: serverIPRef.current.value,
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

      serverAliasRef.current.value = "";
      serverIPRef.current.value = "";
      piIPRef.current.value = "";
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serveripaddress, piipaddress) => {
    const confirmed = window.confirm("Are you sure you want to delete?");
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

        await loadIPList();
      } catch (error) {
        console.error("Delete error:", error);
      }
    } else {
      console.log("Deletion cancelled.");
    }
  };

  const handleEdit = async (node, field) => {
    const currentValue = node[field];
    const newValue = window.prompt(`Edit ${field}`, currentValue);

    if (newValue && newValue !== currentValue) {
      try {
        const response = await fetch("/api/ip", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serveripaddress: node.serveripaddress,
            piipaddress: node.piipaddress,
            field: field,
            value: newValue,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          alert(result.error || "Failed to update.");
        } else {
          console.log(result.message);
          await loadIPList();
        }
      } catch (error) {
        console.error("Edit error:", error);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            ref={serverAliasRef}
            placeholder="Server Alias (30)"
            className="border p-2"
          />
          <input
            type="text"
            ref={serverIPRef}
            placeholder="Server IP Address"
            className="border p-2"
          />
          <input
            type="text"
            ref={piIPRef}
            placeholder="Monitoring IP Address"
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
          <table className="min-w-full bg-white border-separate border-spacing-0 table-fixed">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="w-[12.5%] border border-gray-300 " rowSpan="2">
                  Server Alias
                </th>
                <th className="w-[12.5%] border border-gray-300 " rowSpan="2">
                  Server IP
                </th>
                <th className="w-[12.5%] border border-gray-300 " rowSpan="2">
                  Monitoring IP
                </th>
                <th
                  className="w-[25%] border border-gray-300 text-center py-2"
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
                  className="w-[12.5%] border border-gray-300 text-center"
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
                  className="w-[12.5%] border border-gray-300 text-center"
                  rowSpan="2"
                >
                  Delete
                </th>
              </tr>
              <tr className="border-b-2 border-gray-400">
                <th className="w-[12.5%] border border-gray-300 text-center py-2">
                  Server SSH
                </th>
                <th className="w-[12.5%] border border-gray-300 text-center py-2">
                  Monitoring SSH
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
                      <button
                        onClick={() => handleEdit(node, "serveralias")}
                        className="ml-2 bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 inline-flex items-center"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                    </td>
                    <td className="truncate border border-gray-300 py-2">
                      {node.serveripaddress}
                      <button
                        onClick={() => handleEdit(node, "serveripaddress")}
                        className="ml-2 bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 inline-flex items-center"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                    </td>
                    <td className="truncate border border-gray-300 py-2">
                      {node.piipaddress}
                      <button
                        onClick={() => handleEdit(node, "piipaddress")}
                        className="ml-2 bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 inline-flex items-center"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                    </td>
                    <td className="w-[12.5%] border border-gray-300 text-center py-1">
                      <a
                        href={`http://${localIP}:2222/ssh/host/${node.serveripaddress}`}
                        target="_blank"
                        className="flex justify-center items-center bg-blue-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-blue-600 transition-all mx-auto"
                      >
                        <FaCheck className="mr-1" /> Connect
                      </a>
                    </td>
                    <td className="w-[12.5%] border border-gray-300 text-center py-1">
                      <a
                        href={`http://${localIP}:2222/ssh/host/${node.piipaddress}`}
                        target="_blank"
                        className="flex justify-center items-center bg-blue-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-blue-600 transition-all mx-auto"
                      >
                        <FaCheck className="mr-1" /> Connect
                      </a>
                    </td>
                    <td className="w-[12.5%] border border-gray-300 text-center">
                      <a
                        href={`http://${node.piipaddress}:3000`}
                        target="_blank"
                        className="flex justify-center items-center bg-green-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-green-600 transition-all mx-auto"
                      >
                        <FaExternalLinkAlt className="mr-1" /> Connect
                      </a>
                    </td>
                    <td className="w-[12.5%] border border-gray-300 text-center">
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
