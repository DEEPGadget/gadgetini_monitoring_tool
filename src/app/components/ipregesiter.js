"use client";

import React, { useEffect, useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { FaCheck, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import { fetchIPList } from "../utils/fetchIPList";
import LoadingSpinner from "../utils/LoadingSpinner";

export default function IPRegister() {
  const [nodelist, setNodelist] = useState([]);
  const [localIP, setLocalIP] = useState("localhost");
  const [formData, setFormData] = useState({
    username: "",
    ipaddress: "",
    password: "",
    alias: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadIPList();
    fetchLocalIP();
  }, []);
  const loadIPList = async () => {
    const data = await fetchIPList();
    setNodelist(data);
  };
  const fetchLocalIP = async () => {
    try {
      const response = await fetch("/localhost");
      const data = await response.json();
      setLocalIP(data.ipv4);
    } catch (error) {
      console.error("Failed to fetch local IP:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
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
      setFormData({
        username: "",
        ipaddress: "",
        password: "",
        alias: "",
        description: "",
      });
    } catch (error) {
      console.error("등록 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (username, ipaddress) => {
    try {
      const response = await fetch("/api/ip", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, ipaddress }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await response.json();
      console.log(result.message);

      await loadIPList();
    } catch (error) {
      console.error("삭제 오류:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Username"
            className="border p-2"
          />
          <input
            type="text"
            name="ipaddress"
            value={formData.ipaddress}
            onChange={handleInputChange}
            placeholder="IP Address"
            className="border p-2"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="border p-2"
          />
          <input
            type="text"
            name="alias"
            value={formData.alias}
            onChange={handleInputChange}
            placeholder="Alias"
            className="border p-2"
          />
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="border p-2"
          />
          <button
            onClick={handleRegister}
            className="flex items-center bg-green-500 text-white p-2 rounded"
            disabled={loading} // 로딩 중 버튼 비활성화
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
                <th className="py-2 w-1/6 border border-gray-300">
                  Username@IP
                </th>
                <th className="py-2 w-1/6 border border-gray-300">Alias</th>
                <th className="py-2 w-1/2 border border-gray-300">
                  Description
                </th>
                <th className="py-2 w-1/16 border border-gray-300">
                  <Image
                    src="/icons/terminal.png"
                    alt="SSH"
                    width={24}
                    height={24}
                    className="inline-block mr-1"
                  />
                  SSH
                </th>
                <th className="py-2 w-1/16 border border-gray-300">
                  <Image
                    src="/icons/grafana.png"
                    alt="Grafana"
                    width={20}
                    height={20}
                    className="inline-block mx-1"
                  />
                  Grafana
                </th>
                <th className="py-2 w-1/16 border border-gray-300">Delete</th>
              </tr>
            </thead>
            <tbody>
              {nodelist.map((node) => (
                <tr
                  key={node.ipaddress}
                  className="text-center border-t border-gray-300"
                >
                  <td className="truncate border border-gray-300">
                    {node.username}@{node.ipaddress}
                  </td>
                  <td className="truncate border border-gray-300">
                    {node.alias}
                  </td>
                  <td className="truncate border border-gray-300">
                    {node.description}
                  </td>
                  <td className="border border-gray-300 w-1/16">
                    <a
                      href={`http://${localIP}:2222/ssh/host/${node.ipaddress}`}
                      target="_blank"
                      className="flex items-center bg-blue-500 text-white p-1 rounded mx-2 my-1"
                    >
                      <FaCheck className="mr-1" /> Connect
                    </a>
                  </td>
                  <td className="border border-gray-300 w-1/16">
                    <a
                      href={`http://${node.ipaddress}:3000`}
                      target="_blank"
                      className="flex items-center bg-green-500 text-white p-1 rounded mx-2 my-1"
                    >
                      <FaExternalLinkAlt className="mr-1" /> Connect
                    </a>
                  </td>
                  <td className="border border-gray-300 w-1/16">
                    <button
                      onClick={() =>
                        handleDelete(node.username, node.ipaddress)
                      }
                      className="flex items-center bg-red-500 text-white p-1 rounded mx-2 my-1"
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
