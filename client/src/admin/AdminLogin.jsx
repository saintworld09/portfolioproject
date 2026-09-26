import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import "../styles/Auth.css";

import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api`;

const AdminLogin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError(
                "Please enter your email and password."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to sign in."
                );
            }

            localStorage.setItem(
                "token",
                data.token
            );

            if (data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            navigate(
                "/admin/dashboard",
                { replace: true }
            );

        } catch (error) {
            setError(
                error.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-background-shape auth-shape-one" />
            <div className="auth-background-shape auth-shape-two" />

            <div className="auth-container">

                {/* =====================================================
                    LEFT SIDE
                ===================================================== */}

                <div className="auth-showcase">

                    <div className="auth-showcase-content">

                        <div className="auth-brand">
                            <div className="auth-brand-mark">
                                A
                            </div>

                            <span>
                                Portfolio Admin
                            </span>
                        </div>

                        <div className="auth-showcase-main">

                            <span className="auth-eyebrow">
                                PORTFOLIO MANAGEMENT
                            </span>

                            <h1>
                                Your work.
                                <br />
                                Your story.
                                <br />
                                <span>Your platform.</span>
                            </h1>

                            <p>
                                Manage your professional
                                portfolio, projects,
                                experience, education and
                                achievements from one place.
                            </p>

                        </div>

                        <div className="auth-showcase-footer">
                            <span className="auth-footer-dot" />
                            Secure portfolio workspace
                        </div>

                    </div>

                </div>


                {/* =====================================================
                    RIGHT SIDE
                ===================================================== */}

                <div className="auth-form-section">

                    <div className="auth-form-card">

                        <div className="auth-form-header">

                            <span className="auth-mobile-brand">
                                Portfolio Admin
                            </span>

                            <h2>
                                Welcome back
                            </h2>

                            <p>
                                Sign in to manage your portfolio.
                            </p>

                        </div>


                        {error && (
                            <div className="auth-alert">
                                <span className="auth-alert-icon">
                                    !
                                </span>

                                <span>
                                    {error}
                                </span>
                            </div>
                        )}


                        <form
                            className="auth-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="auth-field">

                                <label htmlFor="email">
                                    Email address
                                </label>

                                <div className="auth-input-wrapper">

                                    <span className="auth-input-icon">
                                        @
                                    </span>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />

                                </div>

                            </div>


                            <div className="auth-field">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="auth-input-wrapper">

                                    <span className="auth-input-icon">
                                        •
                                    </span>

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                    >
                                        {
                                            showPassword
                                                ? "Hide"
                                                : "Show"
                                        }
                                    </button>

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="auth-submit-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign in"}
                            </button>

                        </form>


                        <div className="auth-divider">
                            <span />
                            <span>OR</span>
                            <span />
                        </div>


                        <p className="auth-switch">

                            Don't have an account?

                            <Link to="/admin/signup">
                                Create account
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AdminLogin;