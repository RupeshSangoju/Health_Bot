import React, { useState } from 'react';
import { motion } from 'framer-motion';

function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== retypePassword) {
      alert('Passwords do not match!');
      return;
    }
    onRegister(email, password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/b.jpg')" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-semibold text-green-600 mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border border-green-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-green-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              placeholder="Retype Password"
              className="w-full p-3 border border-green-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition duration-300"
          >
            Register
          </motion.button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <span className="text-green-500 cursor-pointer" onClick={onSwitchToLogin}>
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}

export default RegisterPage;