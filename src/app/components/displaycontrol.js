"use client";

import React, { useState } from "react";
import { ArrowUpIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/solid";
import LoadingSpinner from "../utils/LoadingSpinner";

export default function DisplayControl({ nodelist }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // State to manage the on/off status of each info item
  const [status, setStatus] = useState({
    cpu: false,
    gpu: false,
    psu: false,
    network: false,
    sensors: false,
  });

  // State for the rotation value
  const [rotation, setRotation] = useState("");
  const setHorizontal = () => {
    setRotation("horizontal");
    handleRotation("horizontal");
  };
  const setVertical = () => {
    setRotation("vertical");
    handleRotation("vertical");
  };

  // Function to toggle status
  const toggleStatus = (key) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [key]: !prevStatus[key],
    }));
  };

  // Function to handle apply button click
  const handleRotation = async (rotationValue) => {
    setLoading(true);
    const payload = {
      rotation: rotationValue,
    };
    try {
      const response = await fetch("/api/rotation-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        console.log("Rotation updated successfully");
      } else {
        console.error("Failed to update rotation");
      }
    } catch (error) {
      console.error("Error applying rotation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    const payload = {
      status,
    };
    try {
      const response = await fetch("/api/update-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Config updated successfully");
      } else {
        console.error("Failed to update config");
      }
    } catch (error) {
      console.error("Error applying config:", error);
    }
    console.log("Mode applied:", rotation);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Display direction</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={setVertical}
            className="flex items-center bg-green-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner /> // Show spinner when loading
            ) : (
              <>
                <ArrowUpIcon className="w-5 h-5 mr-1" />
                Vertical
              </>
            )}
          </button>
          <button
            onClick={setHorizontal}
            className="flex items-center bg-green-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner /> // Show spinner when loading
            ) : (
              <>
                <ArrowRightIcon className="w-5 h-5 mr-1" />
                Horizontal
              </>
            )}
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Control Info</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white table-fixed border-separate border-spacing-0">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="py-2 border border-gray-300 text-center">
                  Info
                </th>
                <th className="py-2 border border-gray-300 text-center">
                  Description
                </th>
                <th className="py-2 border border-gray-300 text-center">
                  On/Off
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries({
                CPU: "Monitors CPU usage, clock speed, and temperature.",
                GPU: "Monitors GPU memory usage, load, and temperature.",
                PSU: "Monitors power supply health and voltage levels.",
                network:
                  "Monitors network bandwidth, latency, and packet loss.",
                sensors:
                  "Monitors internal temperature and humidity, water leakage detection, and coolant level",
              }).map(([key, description]) => (
                <tr key={key} className="border-b border-gray-300 text-center">
                  <td className="py-2 border border-gray-300">
                    {key.charAt(0).toUpperCase() + key.slice(1)} Info
                  </td>
                  <td className="py-2 border border-gray-300">{description}</td>
                  <td className="py-2 border border-gray-300 flex justify-center">
                    <button
                      onClick={() => toggleStatus(key)}
                      className={`relative flex items-center w-20 h-8 rounded-full border-2 border-gray-400 transition-colors duration-300 ${
                        status[key] ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span
                        className={`absolute left-1 transition-transform duration-300 transform ${
                          status[key] ? "translate-x-11" : "translate-x-0"
                        } bg-white rounded-full w-6 h-6`}
                      />
                      <span
                        className={`text-white font-bold transition-all duration-300 ${
                          status[key] ? "ml-2" : "ml-10"
                        }`}
                      >
                        {status[key] ? "On" : "Off"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end">
          <input
            type="number"
            value={rotation}
            onChange={(e) => setRotation(e.target.value)}
            placeholder="Enter rotation value"
            className="p-2 border rounded-l-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleApply}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-r-md border border-green-700 hover:bg-green-600"
          >
            <CheckIcon className="w-5 h-5 mr-2" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
