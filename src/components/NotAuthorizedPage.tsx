// /src/components/NotAuthorizedPage.tsx
"use client";

import { useRouter } from "next/navigation";

interface NotAuthorizedPageProps {
  currentRole?: string;
}

export default function NotAuthorizedPage({ currentRole }: NotAuthorizedPageProps) {
  const router = useRouter();

  const getDashboardPath = () => {
    switch (currentRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'user':
        return '/user/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        {currentRole && (
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-medium capitalize">{currentRole}</span>
          </p>
        )}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push(getDashboardPath())}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}