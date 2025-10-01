"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedPage from "@/components/ProtectedPage";

export default function UserDashboard() {
  const [_, setData] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasksCompleted: 12,
    projects: 3,
    weeklyProgress: 75
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let token = sessionStorage.getItem("accessToken");
      if (!token) return;

      try {
        // First try with current access token
        let res = await fetch("/api/user-data", {
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

            res = await fetch("/api/user-data", {
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
    <ProtectedPage role="user">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Main Content */}
        <div className="p-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
                <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your account today</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm">User Account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Tasks Completed</h2>
                <p className="text-3xl font-bold mt-2 text-blue-600">{stats.tasksCompleted}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
                <p className="text-3xl font-bold mt-2 text-green-600">{stats.projects}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Weekly Progress</h2>
                <p className="text-3xl font-bold mt-2 text-purple-600">{stats.weeklyProgress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}