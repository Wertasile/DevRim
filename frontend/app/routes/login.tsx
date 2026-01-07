import React, { useState } from 'react'
import SignInTab from '~/components/auth/signin-tab'
import SignUpTab from '~/components/auth/signup-tab'

const login = () => {
    const [tab, setTab] = useState<"signin" | "signup">("signin")

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3E0E9] via-[#EDEDE9] to-[#D6D6CD] p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img src="/Images/DevRim_Logo_0.png" width="48" alt="DevRim Logo" />
                        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>DevRim</h1>
                    </div>
                    <p className="text-gray-700 opacity-80">Connect, Learn, and Grow with the Developer Community</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-black overflow-hidden">
                    {/* Tab Switcher */}
                    <div className='bg-[#262626] flex gap-0 border-b-2 border-black'>
                        <button
                            className={`flex-1 p-4 font-semibold transition-all duration-200 ${
                                tab === "signin" 
                                    ? "text-gray-300 hover:text-white hover:bg-[#353535]" 
                                    : "bg-white text-black shadow-inner"
                            }`}
                            onClick={() => setTab('signin')}
                            style={{ fontFamily: 'Manrope, sans-serif' }}
                        >
                            Sign In
                        </button>
                        <button
                            className={`flex-1 p-4 font-semibold transition-all duration-200 ${
                                tab === "signup" 
                                    ? "text-gray-300 hover:text-white hover:bg-[#353535]" 
                                    : "bg-white text-black shadow-inner"
                            }`}
                            onClick={() => setTab('signup')}
                            style={{ fontFamily: 'Manrope, sans-serif' }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {tab === 'signin' && <SignInTab />}
                        {tab === 'signup' && <SignUpTab />}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-600 opacity-75">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </div>
    )
}

export default login