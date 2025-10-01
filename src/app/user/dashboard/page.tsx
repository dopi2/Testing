"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedPage from "@/components/ProtectedPage";

export default function UserDashboard() {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);

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

          {/* Data Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Secure Data</h2>
              <p className="text-sm text-gray-600 mt-1">Personalized information for your account</p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-purple-800 font-medium">{data}</p>
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