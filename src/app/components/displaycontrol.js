"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/solid";
import LoadingSpinner from "../utils/LoadingSpinner";

export default function DisplayControl({ nodelist }) {
  const [loadingVertical, setLoadingVertical] = useState(false);
  const [loadingHorizontal, setLoadingHorizontal] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rotationTime, setRotationTime] = useState(5);

  // State to manage the on/off status of each info item
  const [status, setStatus] = useState({
    orientation: "vertical",
    cpu: false,
    gpu: false,
    psu: false,
    network: false,
    sensors: false,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/rotation-config"); // Change to the correct API endpoint
        const data = await response.json();

        setStatus({
          orientation: data.orientation,
          cpu: data.cpu === "on",
          gpu: data.gpu === "on",
          psu: data.psu === "on",
          network: data.network === "on",
          sensors: data.sensors === "on",
        });
        setRotationTime(data.rotationTime);
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Function to handle rotation API calls
  const handleRotation = async (rotationValue, setLoading) => {
    setLoading(true);
    const payload = { rotation: rotationValue };
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

  // Separate handlers for Horizontal and Vertical buttons
  const setHorizontal = () => {
    handleRotation("horizontal", setLoadingHorizontal);
  };
  const setVertical = () => {
    handleRotation("vertical", setLoadingVertical);
  };

  // Function to toggle status
  const toggleStatus = (key) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [key]: !prevStatus[key],
    }));
  };

  // Function to handle status apply button
  const handleApply = async () => {
    setLoadingApply(true);
    const payload = { status, rotationTime };
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
    } finally {
      setLoadingApply(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Display direction</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={setVertical}
            className={`flex items-center bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all ${
              status.orientation === "vertical" ? "border-2 border-black" : ""
            }`}
            disabled={loadingVertical}
          >
            {loadingVertical ? (
              <LoadingSpinner />
            ) : (
              <>
                <ArrowUpIcon className="w-5 h-5 mr-1" />
                Vertical
              </>
            )}
          </button>
          <button
            onClick={setHorizontal}
            className={`flex items-center bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all ${
              status.orientation === "horizontal" ? "border-2 border-black" : ""
            }`}
            disabled={loadingHorizontal}
          >
            {loadingHorizontal ? (
              <LoadingSpinner />
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
                        status[key.toLowerCase()]
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      <span
                        className={`absolute left-1 transition-transform duration-300 transform ${
                          status[key.toLowerCase()]
                            ? "translate-x-11"
                            : "translate-x-0"
                        } bg-white rounded-full w-6 h-6`}
                      />
                      <span
                        className={`text-white font-bold transition-all duration-300 ${
                          status[key.toLowerCase()] ? "ml-2" : "ml-10"
                        }`}
                      >
                        {status[key.toLowerCase()] ? "On" : "Off"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end items-center">
          <label
            className="mr-2 text-gray-700 font-bold"
            htmlFor="rotationTime"
          >
            Mode rotation time (seconds):
          </label>
          <input
            type="number"
            placeholder="5"
            value={rotationTime}
            onChange={(e) =>
              setRotationTime(Math.floor(Number(e.target.value)))
            }
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 
               border-gray-600 w-16"
          />
          <button
            onClick={handleApply}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all ml-2"
            disabled={loadingApply}
          >
            {loadingApply ? (
              <LoadingSpinner />
            ) : (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
