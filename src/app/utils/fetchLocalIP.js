export const fetchLocalIP = async () => {
  try {
    const response = await fetch("/api/localhostip");
    const data = await response.json();
    setLocalIP(data.ipv4);
  } catch (error) {
    console.error("Failed to fetch local IP:", error);
  }
};
