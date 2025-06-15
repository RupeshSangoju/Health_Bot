// src/components/LoginPage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin, onGoogleLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email });
      await onLogin(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onGoogleLogin();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google login failed.');
      console.error('Google login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 p-8 rounded-2xl shadow-xl w-full max-w-md"
        role="dialog"
        aria-labelledby="login-title"
      >
        <h2 id="login-title" className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-6 text-center">
          Welcome Back
        </h2>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mb-4 text-center"
            role="alert"
          >
            {error}
          </motion.p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400 dark:text-gray-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 border border-blue-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
              required
              aria-label="Email address"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400 dark:text-gray-300" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 border border-blue-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
              required
              aria-label="Password"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300 flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Log in"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              'Log In'
            )}
          </motion.button>
        </form>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`w-full mt-4 bg-red-500 text-white py-3 rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition duration-300 flex items-center justify-center ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Log in with Google"
        >
          <FaGoogle className="mr-2" />
          {isLoading ? 'Loading...' : 'Log In with Google'}
        </motion.button>
        <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
          Don’t have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-500 dark:text-blue-400 hover:underline focus:outline-none"
            aria-label="Switch to register"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
