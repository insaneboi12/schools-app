"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let data = localStorage.getItem('userAuthMJ');
    let userData =data? JSON.parse(data):null;
    if(!userData){
      setIsLoading(false);
      return;
    };
    let finalData = userData;
    fetch(`/api/auth?email=${userData.email}`, {
      method: 'GET',
    }).then(res => res.json()).then(data => {
      if(data.success){
        let user = data.user;
        if(user.isAuth!==userData.isAuth||user.userName!==userData.userName||user.email!==userData.email){
          finalData = user;
          localStorage.setItem('userAuthMJ', JSON.stringify(finalData));
        }
      }else{
        localStorage.removeItem('userAuthMJ');
        finalData = null;
      }
      setUserData(finalData);
      setIsLoading(false);
    });
    // setUserData(userData);
  }, []);

  const handleAddSchool = () => {
    // console.log(userData.isAuth);
    router.push('/addschool');
    // if(userData?.isAuth){
    //   router.push('/addschool');
    // }else{
    //   let res = confirm('Login to add school');
    //   if(res){
    //     router.push('/auth');
    //   }
    // }
  };

  const handleShowSchools = () => {
    router.push('/schools');
  };

  const handleLogout = () => {
    setIsLoading(true);
    fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email: userData.email, type: 'logout' }),
    }).then(res => res.json()).then(data => {
      if(data.success){
        localStorage.removeItem('userAuthMJ');
        setUserData(null);
        alert('Logged out successfully');
        // router.push('/');
      }else{
        alert('Failed to logout');
      }
      setIsLoading(false);
    });
  };

  return (
    isLoading?<span className="flex w-[100vw] h-[99vh] items-center justify-center"> <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div></span>
    :
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    {userData?.isAuth && (
          <button
            onClick={handleLogout}
            className="absolute z-[9999] top-4 md:top-10 right-4 md:right-10 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 md:px-4 rounded-lg shadow transition-colors"
          >
            <div className="flex items-center">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span className="hidden md:inline ml-2">Logout</span>
            </div>
          </button>
        )}
      <div className="max-w-4xl mx-auto text-center relative">
        {/* Logout Button */}
        

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

        {/* Sign In/Sign Up Button */}
        {!userData?.isAuth && <div className="mt-8 group">
          <button
            onClick={() => router.push('/auth')}
            className="w-60 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-0"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg 
                className="w-6 h-6 text-purple-100 group-hover:text-purple-50 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-lg">Sign In / Sign Up</span>
            </div>
          </button>
        </div>}

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
