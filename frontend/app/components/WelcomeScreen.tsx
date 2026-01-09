import React from 'react';

const WelcomeScreen = () => { 
  
  return (
    <div className='flex flex-col gap-[10px] items-center justify-center min-h-screen text-center p-6'>
      <h1>WELCOME TO MIRVED</h1>
      <p>
        Please log in or sign up to explore personalized blog recommendations and trending posts.
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="primary-btn bg-[#FFD700]"
          aria-label="Navigate to login page"
        >
          Log In
        </a>
        <a
          href="/register"
          className="secondary-btn"
          aria-label="Navigate to sign up page"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default WelcomeScreen;

