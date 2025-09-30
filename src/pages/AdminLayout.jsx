import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = 220;

  return (
    <div style={styles.container}>
      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <main
        style={{
          ...styles.main,
          marginLeft: isMobile ? 0 : sidebarOpen ? sidebarWidth : 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    position: "relative",
  },
  main: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    minHeight: "100vh",
    boxSizing: "border-box",
  },
};

export default AdminLayout;
