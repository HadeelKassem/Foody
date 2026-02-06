// If running on the same device (PC browser), use localhost
// If running on a different device (phone), use your PC's LAN IP

const getApiUrl = () => {
  const hostname = window.location.hostname;

  // For development on PC
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // For phone or other devices on the same network
  // Replace '192.168.1.10' with your PC's local IP
  return "http://192.168.1.10:5000";
};

export default getApiUrl;
