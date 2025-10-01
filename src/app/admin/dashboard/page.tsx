"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedPage from "@/components/ProtectedPage";

export default function AdminDashboard() {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Admin Data</h2>
              <p className="text-sm text-gray-600 mt-1">Secure administrative information</p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-800 font-medium">{data}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}