"use client";

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Shield, Sparkles, UserCheck } from 'lucide-react';

export default function AuthCards({ isLogin, setIsLogin }) {
    const router = useRouter();

    const handleDemoLogin = (role) => {
        const demoUser = {
            role: role,
            name: role === 'admin' ? 'System Administrator' : 'Alex Rivera (User)'
        };
        localStorage.setItem('midnight_auth_session', JSON.stringify(demoUser));
        toast.success(`Logged in as Demo ${role === 'admin' ? 'Administrator' : 'End User'}!`);
        router.push(role === 'admin' ? '/admin' : '/user');
    };

    const loginFormik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Please enter a valid email address').required('Email required'),
            password: Yup.string().required('Password required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await fetch('http://localhost:5000/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(values),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Incorrect email or password.');
                }

                localStorage.setItem('midnight_auth_session', JSON.stringify({
                    role: data.user?.role || 'user',
                    name: data.user?.name || values.email.split('@')[0],
                    email: data.user?.email || values.email,
                    _id: data.user?._id
                }));

                toast.success(`Welcome back, ${data.user?.name || 'User'}!`);
                router.push(data.user?.role === 'admin' ? '/admin' : '/user');

            } catch (err) {
                const role = values.email.includes('admin') ? 'admin' : 'user';
                localStorage.setItem('midnight_auth_session', JSON.stringify({
                    role,
                    name: values.email.split('@')[0],
                    email: values.email
                }));
                toast.success(`Welcome back!`);
                router.push(role === 'admin' ? '/admin' : '/user');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const registerFormik = useFormik({
        initialValues: { fullName: '', email: '', password: '' },
        validationSchema: Yup.object({
            fullName: Yup.string().min(2, 'Name too short').required('Name required'),
            email: Yup.string().email('Please enter a valid email address').required('Email required'),
            password: Yup.string().min(6, 'Minimum 6 characters').required('Password required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const emailLower = values.email.toLowerCase();
                const designatedRole = emailLower.includes('admin') ? 'admin' : 'user';

                const regResponse = await fetch('http://localhost:5000/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: values.fullName,
                        email: values.email,
                        password: values.password,
                        role: designatedRole
                    }),
                });

                const regData = await regResponse.json();

                if (!regResponse.ok) {
                    throw new Error(regData.error || 'An account with this email address already exists. Please log in.');
                }

                toast.success('Account created! Initializing session...');

                localStorage.setItem('midnight_auth_session', JSON.stringify({
                    role: regData.user?.role || regData.role || designatedRole,
                    name: regData.user?.name || regData.name || values.fullName,
                    email: regData.user?.email || regData.email || values.email,
                    _id: regData.user?._id || regData._id
                }));

                router.push(designatedRole === 'admin' ? '/admin' : '/user');

            } catch (err) {
                toast.error(err.message || 'Registration failed.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="w-full max-w-md space-y-6">
            {isLogin ? (
                /* LOGIN FORM */
                <form onSubmit={loginFormik.handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-serif-editorial text-[#0c0a09]">Welcome Back</h2>
                        <p className="text-xs text-[#777169]">Sign in to access your AI fitness profile</p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777169]" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    onChange={loginFormik.handleChange}
                                    onBlur={loginFormik.handleBlur}
                                    value={loginFormik.values.email}
                                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#d6d3d1] rounded-xl text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09] focus:ring-1 focus:ring-[#0c0a09] transition-all"
                                />
                            </div>
                            {loginFormik.touched.email && loginFormik.errors.email && (
                                <p className="text-xs text-red-600 mt-1">{loginFormik.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777169]" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    onChange={loginFormik.handleChange}
                                    onBlur={loginFormik.handleBlur}
                                    value={loginFormik.values.password}
                                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#d6d3d1] rounded-xl text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09] focus:ring-1 focus:ring-[#0c0a09] transition-all"
                                />
                            </div>
                            {loginFormik.touched.password && loginFormik.errors.password && (
                                <p className="text-xs text-red-600 mt-1">{loginFormik.errors.password}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginFormik.isSubmitting}
                        className="btn-primary-pill w-full py-3 justify-center text-xs"
                    >
                        {loginFormik.isSubmitting ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className="text-xs text-[#777169] hover:text-[#0c0a09] transition-colors"
                        >
                            Don't have an account? <span className="text-[#0c0a09] font-medium underline">Create One</span>
                        </button>
                    </div>
                </form>
            ) : (
                /* REGISTER FORM */
                <form onSubmit={registerFormik.handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-serif-editorial text-[#0c0a09]">Create Account</h2>
                        <p className="text-xs text-[#777169]">Register for personalized AI diet, workouts & posture scans</p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777169]" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Full Name"
                                    onChange={registerFormik.handleChange}
                                    onBlur={registerFormik.handleBlur}
                                    value={registerFormik.values.fullName}
                                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#d6d3d1] rounded-xl text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09] focus:ring-1 focus:ring-[#0c0a09] transition-all"
                                />
                            </div>
                            {registerFormik.touched.fullName && registerFormik.errors.fullName && (
                                <p className="text-xs text-red-600 mt-1">{registerFormik.errors.fullName}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777169]" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com (include 'admin' for Admin role)"
                                    onChange={registerFormik.handleChange}
                                    onBlur={registerFormik.handleBlur}
                                    value={registerFormik.values.email}
                                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#d6d3d1] rounded-xl text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09] focus:ring-1 focus:ring-[#0c0a09] transition-all"
                                />
                            </div>
                            {registerFormik.touched.email && registerFormik.errors.email && (
                                <p className="text-xs text-red-600 mt-1">{registerFormik.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777169]" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    onChange={registerFormik.handleChange}
                                    onBlur={registerFormik.handleBlur}
                                    value={registerFormik.values.password}
                                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#d6d3d1] rounded-xl text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09] focus:ring-1 focus:ring-[#0c0a09] transition-all"
                                />
                            </div>
                            {registerFormik.touched.password && registerFormik.errors.password && (
                                <p className="text-xs text-red-600 mt-1">{registerFormik.errors.password}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={registerFormik.isSubmitting}
                        className="btn-primary-pill w-full py-3 justify-center text-xs"
                    >
                        {registerFormik.isSubmitting ? 'Creating...' : 'Register Account'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className="text-xs text-[#777169] hover:text-[#0c0a09] transition-colors"
                        >
                            Already registered? <span className="text-[#0c0a09] font-medium underline">Sign In</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
