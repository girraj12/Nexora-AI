import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
function Auth({ onLogin }) {

  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async () => {

    const url = isLogin
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;

      console.log(url,"url");
    const body = isLogin
      ? {
          email: form.email,
          password: form.password,
        }
      : form;

    const res = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {

      alert(
        data.message ||
        data.error ||
        'Something went wrong'
      );

      return;

    }

    if (isLogin) {

      localStorage.setItem('token', data.token);

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      onLogin(data.user);

    } else {

      alert('Register successful. Please login now.');

      setIsLogin(true);

    }

  };

  return (

    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">

        <h1 className="text-3xl font-bold mb-2 text-center">
          NEXORA AI
        </h1>

        <p className="text-slate-400 text-center mb-8">

          {isLogin
            ? 'Login to your AI workspace'
            : 'Create your AI account'}

        </p>

        {!isLogin && (

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full mb-4 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
          />

        )}

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-4 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
        />

        {/* Password */}

        <div className="relative mb-6">

          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none pr-14"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-3 text-slate-400 hover:text-white"
          >

            {showPassword ? '🙈' : '👁️'}

          </button>

        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold"
        >

          {isLogin ? 'Login' : 'Register'}

        </button>

        <p className="text-center text-slate-400 mt-6">

          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          {' '}

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
            className="text-blue-400"
          >

            {isLogin ? 'Register' : 'Login'}

          </button>

        </p>

      </div>

    </div>

  );

}

export default Auth;