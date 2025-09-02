"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleAddSchool = () => {
    router.push('/addschool');
  };

  const handleShowSchools = () => {
    router.push('/schools');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            School Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your schools efficiently with our comprehensive platform. 
            Add new schools, view existing ones, and keep track of all your educational institutions.
          </p>
        </div>

        {/* Main Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Add School Button */}
          <div className="group">
            <button
              onClick={handleAddSchool}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              <div className="flex flex-col items-center space-y-3">
                <svg 
                  className="w-16 h-16 text-blue-100 group-hover:text-blue-50 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
                <span className="text-2xl">Add School</span>
                <p className="text-blue-100 text-sm font-normal">
                  Register a new educational institution
                </p>
              </div>
            </button>
          </div>

          {/* Show Schools Button */}
          <div className="group">
            <button
              onClick={handleShowSchools}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              <div className="flex flex-col items-center space-y-3">
                <svg 
                  className="w-16 h-16 text-green-100 group-hover:text-green-50 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                  />
                </svg>
                <span className="text-2xl">Show Schools</span>
                <p className="text-green-100 text-sm font-normal">
                  View all registered schools
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-gray-500">
          <p className="text-sm">
            Click on any button above to get started with school management
          </p>
        </div>
      </div>
    </div>
  );
}
