"use client";

import React, { useEffect, useState, useRef } from "react";
import { PlusCircleIcon } from "@heroicons/react/solid";
import LoadingSpinner from "../utils/LoadingSpinner";
import { fetchIPList } from "../utils/fetchIPList";

export default function IPRegister() {
  const [nodelist, setNodelist] = useState([]);
  const [loading, setLoading] = useState(false);

  const serverAliasRef = useRef();
  const serverIPRef = useRef();
  const serverPasswordRef = useRef();
  const piIPRef = useRef();

  useEffect(() => {
    loadIPList();
  }, []);

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

      // Clear input fields
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
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <div className="flex gap-4 mb-4">
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
            placeholder="Pi IP Address"
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
          <table className="min-w-full bg-white table-fixed border-separate border-spacing-0">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="py-2 w-1/5 border border-gray-300">
                  Server Alias@Server IP
                </th>
                <th className="py-2 w-1/5 border border-gray-300">
                  Pi IP Address
                </th>
                <th className="py-2 w-1/8 border border-gray-300 text-center">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {nodelist.map((node) => (
                <tr
                  key={`${node.serveripaddress}-${node.piipaddress}`}
                  className="text-center border-t border-gray-300"
                >
                  <td className="truncate border border-gray-300 py-2">
                    {node.serveralias}@{node.serveripaddress}
                  </td>
                  <td className="truncate border border-gray-300 py-2">
                    {node.piipaddress}
                  </td>
                  <td className="border border-gray-300 w-1/8 text-center">
                    <button
                      onClick={() =>
                        handleDelete(node.serveripaddress, node.piipaddress)
                      }
                      className="flex justify-center items-center bg-red-500 text-white w-32 px-6 py-1 rounded-lg hover:bg-red-600 transition-all mx-auto"
                    >
                      Delete
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
