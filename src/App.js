import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import './App.css';
import './il8n';


function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const googleProvider = new GoogleAuthProvider();
  
  useEffect(() => {
    console.log('App mounted, checking auth state...');
    if (process.env.NODE_ENV === 'development') {
      signOut(auth)
        .then(() => console.log('Auto signed out for development'))
        .catch((error) => console.error('Auto sign-out failed:', error));
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const newUser = result.user;
      const userDocRef = doc(db, 'users', newUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: newUser.email,
          createdAt: new Date().toISOString(),
          isPremium: false,
          messageCount: {},
        });
      }
    } catch (error) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const handleRegister = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await setDoc(doc(db, 'users', newUser.uid), {
        email,
        createdAt: new Date().toISOString(),
        isPremium: false,
        messageCount: {},
      });
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };



  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>

      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <LoginPage
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
                onSwitchToRegister={() => {}}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => {}} />
            )
          }
        />
        <Route
          path="/"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;