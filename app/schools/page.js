"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef();
  const loadingRef = useRef();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    // Filter schools based on search term
    if (searchTerm.trim() === "") {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school => 
        school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
    // Reset visible count when search changes
    setVisibleCount(3);
  }, [searchTerm, schools]);

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < filteredSchools.length) {
        setIsLoadingMore(true);
        // Simulate loading delay for better UX
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 3, filteredSchools.length));
          setIsLoadingMore(false);
        }, 500);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, visibleCount, filteredSchools.length]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/add');
      
    // let response = {ok: true, json: async () => ({schools: [{id: 1, name: 'School 1', address: 'Address 1', email: 'email@example.com', phone: '1234567890', image_base64: 'image.jpg', established: '2020', capacity: 100}]})};
      if (response.ok || true) {
        const data = await response.json();
        // console.log(data);
        const schoolsData = data.schools || [];
        setSchools(schoolsData);
        setFilteredSchools(schoolsData);
      } else {
        setError('Failed to fetch schools');
        setSchools([]);
        setFilteredSchools([]);
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const deleteSchool = async (schoolId, schoolName) => {
    try {
      const res = await fetch(`/api/add`, {
        method: 'DELETE',
        body: JSON.stringify({id: schoolId}),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const response = await res.json();
      // console.log("delete",response);
      // console.log("delete ok",response.success);
      if (response.success) {
        // Remove school from both arrays
        setSchools(prevSchools => prevSchools.filter(school => school.id !== schoolId));
        setFilteredSchools(prevFiltered => prevFiltered.filter(school => school.id !== schoolId));
        
        // Show success message
        alert(`"${schoolName}" has been deleted successfully!`);
      } else {
        const errorData = await response.json();
        // console.log("errorData",errorData);
        alert(`Failed to delete school: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('An error occurred while deleting the school. Please try again.');
    }
  };

  const handleDeleteClick = (school) => {
    if (window.confirm(`Are you sure you want to delete "${school.name}"? This action cannot be undone.`)) {
      deleteSchool(school.id, school.name);
    }
  };

  // Get visible schools for display
  const visibleSchools = filteredSchools.slice(0, visibleCount).reverse();
  const hasMore = visibleCount < filteredSchools.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSchools}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">All Schools</h1>
            <Link
              href="/addschool"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New School
            </Link>
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search schools by name or address..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Results Info */}
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                {searchTerm ? (
                  <>
                    Found <span className="font-semibold text-blue-600">{filteredSchools.length}</span> school{filteredSchools.length !== 1 ? 's' : ''} 
                    {filteredSchools.length !== schools.length && (
                      <> out of <span className="font-semibold">{schools.length}</span> total</>
                    )}
                  </>
                ) : (
                  `Showing all ${schools.length} school${schools.length !== 1 ? 's' : ''}`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Schools Grid */}
        {filteredSchools.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm ? (
              <>
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Schools Found</h3>
                <p className="text-gray-500 mb-6">
                  No schools match your search for &quot;<span className="font-semibold">{searchTerm}</span>&quot;
                </p>
                <button
                  onClick={clearSearch}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors mr-3"
                >
                  Clear Search
                </button>
                <Link
                  href="/addschool"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New School
                </Link>
              </>
            ) : (
              <>
                <div className="text-gray-400 text-6xl mb-4">🏫</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Schools Found</h3>
                <p className="text-gray-500 mb-6">Start by adding your first school to the system.</p>
                <Link
                  href="/addschool"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First School
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleSchools.map((school, index) => (
                <div
                  key={school.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  ref={index === visibleSchools.length - 1 ? lastElementRef : null}
                >
                  {/* School Image */}
                  {school.image ? (
                    <div className="mb-4">
                      <Image
                        src={school.image}
                        alt={school.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 bg-gray-300 rounded-lg p-8 flex items-center justify-center h-48">
                    <svg className="w-[60%]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="white" d="M32 256C32 220.7 60.7 192 96 192L160 192L287.9 76.9C306.2 60.5 333.9 60.5 352.1 76.9L480 192L544 192C579.3 192 608 220.7 608 256L608 512C608 547.3 579.3 576 544 576L96 576C60.7 576 32 547.3 32 512L32 256zM256 440L256 528L384 528L384 440C384 417.9 366.1 400 344 400L296 400C273.9 400 256 417.9 256 440zM144 448C152.8 448 160 440.8 160 432L160 400C160 391.2 152.8 384 144 384L112 384C103.2 384 96 391.2 96 400L96 432C96 440.8 103.2 448 112 448L144 448zM160 304L160 272C160 263.2 152.8 256 144 256L112 256C103.2 256 96 263.2 96 272L96 304C96 312.8 103.2 320 112 320L144 320C152.8 320 160 312.8 160 304zM528 448C536.8 448 544 440.8 544 432L544 400C544 391.2 536.8 384 528 384L496 384C487.2 384 480 391.2 480 400L480 432C480 440.8 487.2 448 496 448L528 448zM544 304L544 272C544 263.2 536.8 256 528 256L496 256C487.2 256 480 263.2 480 272L480 304C480 312.8 487.2 320 496 320L528 320C536.8 320 544 312.8 544 304zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
                    </div>
                  )}

                  {/* School Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800 truncate flex-1">
                        {school.name}
                      </h3>
                      <button
                        onClick={() => handleDeleteClick(school)}
                        className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                        title="Delete School"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {school.address}, {school.city}
                      </p>
                      
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {school.email_id}
                      </p>
                      
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {school.contact}
                      </p>
                    </div>

                    {/* <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Est. {school.established}</span>
                        <span>Capacity: {school.capacity}</span>
                      </div>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Loading more schools...</span>
                </div>
              </div>
            )}

            {/* Show More Button (Alternative to infinite scroll) */}
            {hasMore && !isLoadingMore && (
              <div className="text-center py-8">
                <button
                  onClick={() => {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                      setVisibleCount(prev => Math.min(prev + 3, filteredSchools.length));
                      setIsLoadingMore(false);
                    }, 300);
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show More Schools ({filteredSchools.length - visibleCount} remaining)
                </button>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && filteredSchools.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  🎉 You&apos;ve reached the end! Showing all {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''}.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
