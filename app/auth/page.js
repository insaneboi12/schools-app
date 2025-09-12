"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Auth() {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [showOtpField, setShowOtpField] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const router = useRouter();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleGetOtp = async () => {
        if (!userName.trim() || !email.trim()) {
            alert("Please fill in all fields");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        setEmailError("");

        try {
            setIsLoading(true);
            const response = await fetch('/api/auth', {
                method: 'POST',
                body: JSON.stringify({ email, userName, type: 'generate' }),
            });
            const data = await response.json();
            if (data.success) {
                setShowOtpField(true);
                setCountdown(600);
                const timer = setInterval(() => {
                    setCountdown(prev => prev - 1);
                }, 1000);
                return () => clearInterval(timer);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setOtpError("Please enter OTP");
            return;
        }
        
        if (otp.length !== 6) {
            setOtpError("OTP must be exactly 6 digits");
            return;
        }
        
        setOtpError("");

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                body: JSON.stringify({ email, otp, userName, type: 'verify' }),
            });
            const data = await response.json();
            if(data.success){
                alert("OTP verified successfully");
                router.push('/');
            } else {
                alert(data.message);
            }

            localStorage.setItem('userAuthMJ', JSON.stringify({
                isAuth: true,
                userName,
                email
            }));
            
        } catch (error) {
            console.error(error);
            alert("Verification failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="relative">
                    <Link href="/" className="absolute left-0 top-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </Link>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Sign In / Sign Up</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                // Clear error when user starts typing
                                if (emailError) {
                                    setEmailError("");
                                }
                            }}
                            className={`mt-1 text-black block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                emailError ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your email"
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                    </div>

                    {!showOtpField ? (
                        <button
                            onClick={handleGetOtp}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                           {isLoading ? "Processing..." : "Get OTP"}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setOtp(value);
                                        // Clear error when user starts typing
                                        if (otpError) {
                                            setOtpError("");
                                        }
                                    }}
                                    className={`mt-1 text-black block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                        otpError ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                />
                                {otpError && (
                                    <p className="text-red-500 text-sm mt-1">{otpError}</p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    {countdown > 0 ? `Resend OTP in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` :
                                        <button
                                            onClick={handleGetOtp}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            Resend OTP
                                        </button>
                                    }
                                </p>
                            </div>
                            <button
                                onClick={handleVerifyOtp}
                                disabled={isSubmitting}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {isSubmitting ? "Verifying..." : "Verify OTP"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
