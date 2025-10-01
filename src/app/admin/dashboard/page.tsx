"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedPage from "@/components/ProtectedPage";

export default function AdminDashboard() {
  const [_, setData] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [currentStats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    systemHealth: "Healthy"
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let token = sessionStorage.getItem("accessToken");
      if (!token) return;

      try {
        // First try with current access token
        let res = await fetch("/api/admin-data", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (res.status === 401) {
          // Try refresh if access token expired
          const refresh = await fetch("/api/refresh", {
            method: "POST",
            credentials: "include",
          });

          const rdata = await refresh.json();

          if (refresh.ok) {
            sessionStorage.setItem("accessToken", rdata.accessToken);
            token = rdata.accessToken;

            res = await fetch("/api/admin-data", {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
          } else {
            setData("Session expired, please log in again.");
            return;
          }
        }

        const d = await res.json();
        setData(d.secret || d.error);
        
        // Mock stats - replace with actual API calls
        setStats({
          totalUsers: 1247,
          activeSessions: 89,
          systemHealth: "Healthy"
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setData("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <ProtectedPage role="admin">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your platform and monitor system performance</p>
          </div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Total Users</h2>
                <p className="text-3xl font-bold mt-2 text-blue-600">{currentStats.totalUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
                <p className="text-3xl font-bold mt-2 text-green-600">{currentStats.activeSessions}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
                <p className="text-3xl font-bold mt-2 text-purple-600">{currentStats.systemHealth}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}