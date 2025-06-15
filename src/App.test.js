// src/app.test.js
import { render, screen } from '@testing-library/react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

test('renders login page', () => {
  render(<LoginPage onLogin={() => {}} onGoogleLogin={() => {}} onSwitchToRegister={() => {}} />);
  expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
});

test('renders register page', () => {
  render(<RegisterPage onRegister={() => {}} onSwitchToLogin={() => {}} />);
  expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Retype password/i)).toBeInTheDocument();
});