import { useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import "../styles/Auth.css";

import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api`;

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

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

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError(
                "Please complete all fields."
            );
            return;
        }

        if (formData.password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/auth/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to create your account."
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
                                BUILD YOUR PRESENCE
                            </span>

                            <h1>
                                Turn your
                                <br />
                                experience into
                                <br />
                                <span>opportunity.</span>
                            </h1>

                            <p>
                                Create your account and
                                start building a portfolio
                                that brings your professional
                                experience together in one
                                place.
                            </p>

                        </div>

                        <div className="auth-showcase-footer">
                            <span className="auth-footer-dot" />
                            Your portfolio starts here
                        </div>

                    </div>

                </div>


                {/* =====================================================
                    RIGHT SIDE
                ===================================================== */}

                <div className="auth-form-section">

                    <div className="auth-form-card signup-card">

                        <div className="auth-form-header">

                            <span className="auth-mobile-brand">
                                Portfolio Admin
                            </span>

                            <h2>
                                Create your account
                            </h2>

                            <p>
                                Set up your portfolio workspace
                                in a few steps.
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

                                <label htmlFor="name">
                                    Full name
                                </label>

                                <div className="auth-input-wrapper">

                                    <span className="auth-input-icon">
                                        A
                                    </span>

                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        autoComplete="name"
                                    />

                                </div>

                            </div>


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
                                        placeholder="At least 8 characters"
                                        autoComplete="new-password"
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


                            <div className="auth-field">

                                <label htmlFor="confirmPassword">
                                    Confirm password
                                </label>

                                <div className="auth-input-wrapper">

                                    <span className="auth-input-icon">
                                        •
                                    </span>

                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                    >
                                        {
                                            showConfirmPassword
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
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>

                        </form>


                        <p className="auth-switch">

                            Already have an account?

                            <Link to="/admin/login">
                                Sign in
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Signup;