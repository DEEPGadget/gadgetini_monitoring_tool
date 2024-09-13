"use client";

import React, { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { FaCheck, FaExternalLinkAlt, FaTimes } from "react-icons/fa";

export default function IPRegister() {
  const [formData, setFormData] = useState({
    username: "",
    ipaddress: "",
    password: "",
    alias: "",
    description: "",
  });

  const [nodes, setNodes] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    try {
      const { username, ipaddress, password, alias, description } = formData;
      setNodes([...nodes, { username, ipaddress, alias, description }]);
      // 필드 초기화
      setFormData({
        username: "",
        ipaddress: "",
        password: "",
        alias: "",
        description: "",
      });
    } catch (error) {
      console.error("등록 오류:", error);
    }
  };

  // 삭제 버튼 클릭 시 처리
  const handleDelete = (index) => {
    const updatedNodes = nodes.filter((_, i) => i !== index);
    setNodes(updatedNodes);
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
          >
            <PlusCircleIcon className="w-5 h-5 mr-1" />
            Register
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
                </th>{" "}
                <th className="py-2 w-1/16 border border-gray-300">
                  <Image
                    src="/icons/terminal.png"
                    alt="SSH"
                    width={16}
                    height={16}
                    className="inline-block mr-1"
                  />
                  SSH
                </th>
                <th className="py-2 w-1/16 border border-gray-300">
                  <Image
                    src="/icons/grafana.png"
                    alt="Grafana"
                    width={16}
                    height={16}
                    className="inline-block ml-1"
                  />
                  Grafana
                </th>
                <th className="py-2 w-1/16 border border-gray-300">Delete</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node, index) => (
                <tr
                  key={index}
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
                    <button className="flex items-center bg-blue-500 text-white p-1 rounded">
                      <FaCheck className="mr-1" /> Connect
                    </button>
                  </td>
                  <td className="border border-gray-300 w-1/16">
                    <button className="flex items-center bg-green-500 text-white p-1 rounded">
                      <FaExternalLinkAlt className="mr-1" /> Connect
                    </button>
                  </td>
                  <td className="border border-gray-300 w-1/16">
                    <button
                      onClick={() => handleDelete(index)}
                      className="flex items-center bg-red-500 text-white p-1 rounded"
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
