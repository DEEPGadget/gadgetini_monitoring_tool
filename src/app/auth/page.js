"use client";
import React, { useState, useEffect } from "react";
import { DocumentAddIcon, CogIcon } from "@heroicons/react/solid";
import IPRegister from "../components/ipregesiter";
import DisplayControl from "../components/displaycontrol";

export default function Auth() {
  const [activeMenu, setActiveMenu] = useState("IP Register");
  const [username, setUsername] = useState("");
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await fetch("/api/username");
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error("Failed to fetch username:", error);
      }
    }

    fetchUsername();
  }, []);

  const renderComponent = () => {
    switch (activeMenu) {
      case "IP Register":
        return <IPRegister />;
      case "Display Control":
        return <DisplayControl />;
      default:
        return <div>Select a menu</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 bg-gray-200">
        <h1 className="text-gray-800 font-bold text-lg">
          {username ? `${username}` : "Loading..."}
        </h1>
        <div>Current Menu: {activeMenu}</div>
      </header>
      <div className="flex flex-1">
        <aside className="w-1/10 p-4 bg-gray-100">
          <ul>
            <li
              className={`cursor-pointer p-2 ${
                activeMenu === "IP Register" ? "bg-gray-300" : ""
              }`}
              onClick={() => setActiveMenu("IP Register")}
            >
              <DocumentAddIcon className="inline-block w-5 h-5 mr-2" /> IP
              Register
            </li>
            <li
              className={`cursor-pointer p-2 ${
                activeMenu === "Display Control" ? "bg-gray-300" : ""
              }`}
              onClick={() => setActiveMenu("Display Control")}
            >
              <CogIcon className="inline-block w-5 h-5 mr-2" />
              Display Control
            </li>
          </ul>
        </aside>
        <main className="w-4/5 p-4 overflow-y-auto">{renderComponent()}</main>
      </div>
    </div>
  );
}
