"use client";
import React, { useState, useEffect } from "react";
import { CogIcon } from "@heroicons/react/solid";
import IPRegister from "./components/ipregesiter";
import DisplayControl from "./components/displaycontrol";
import Settings from "./components/settings";
import { fetchLocalIP } from "./utils/fetchLocalIP";

export default function Auth() {
  const [activeMenu, setActiveMenu] = useState("Settings");
  const [localIP, setLocalIP] = useState("localhost");

  useEffect(() => {
    fetchLocalIP().then(setLocalIP);
  }, []);
  const renderComponent = () => {
    switch (activeMenu) {
      case "Settings":
        return <Settings />;
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
          Gadgetini{" "}
          <span className="text-gray-500 font-semibold text-base">v1.0</span>
        </h1>
        <div>{activeMenu}</div>
      </header>
      <div className="flex flex-1">
        <aside className="w-1/10 p-4 bg-gray-100">
          <ul>
            <li
              className={`cursor-pointer p-2 ${
                activeMenu === "Settings" ? "bg-gray-300" : ""
              }`}
              onClick={() => setActiveMenu("Settings")}
            >
              <CogIcon className="inline-block w-5 h-5 mr-2" />
              Settings
            </li>
          </ul>
        </aside>
        <main className="w-4/5 p-4 overflow-y-auto">{renderComponent()}</main>
      </div>
    </div>
  );
}
