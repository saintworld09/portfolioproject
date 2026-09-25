import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";


// =========================================================
// ADMIN PAGES
// =========================================================

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import ProtectedRoute from "./admin/ProtectedRoute";
import Signup from "./admin/Signup";
import AuthRedirect from "./admin/AuthRedirect";

import Profile from "./admin/Profile";
import AboutAdmin from "./admin/About";
import Projects from "./admin/Projects";
import ProjectInsights from "./admin/ProjectInsights";
import Experience from "./admin/Experience";
import Education from "./admin/Education";
import Skills from "./admin/Skills";
import Certifications from "./admin/Certifications";
import SocialLinks from "./admin/SocialLinks";
import Settings from "./admin/Settings";


// =========================================================
// PUBLIC PAGES
// =========================================================

import Home from "./pages/Home";
import About from "./pages/About";
import PublicProjects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import PublicExperience from "./pages/Experience";
import PublicEducation from "./pages/Education";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* =====================================================
                    PUBLIC PORTFOLIO HOME

                    Examples:
                    /babatunde
                    /babatunde-adekola
                ===================================================== */}

                <Route
                    path="/:portfolioSlug"
                    element={<Home />}
                />


                {/* =====================================================
                    PUBLIC PORTFOLIO ABOUT

                    Examples:
                    /babatunde/about
                    /babatunde-adekola/about
                ===================================================== */}

                <Route
                    path="/:portfolioSlug/about"
                    element={<About />}
                />


                {/* =====================================================
                    PUBLIC PORTFOLIO EXPERIENCE

                    Examples:
                    /babatunde/experience
                    /babatunde-adekola/experience
                ===================================================== */}

                <Route
                    path="/:portfolioSlug/experience"
                    element={<PublicExperience />}
                />


                {/* =====================================================
                    PUBLIC PORTFOLIO EDUCATION

                    Examples:
                    /babatunde/education
                    /babatunde-adekola/education
                ===================================================== */}

                <Route
                    path="/:portfolioSlug/education"
                    element={<PublicEducation />}
                />


                {/* =====================================================
                    PUBLIC PORTFOLIO PROJECTS

                    Examples:
                    /babatunde/projects
                    /babatunde-adekola/projects
                ===================================================== */}

                <Route
                    path="/:portfolioSlug/projects"
                    element={<PublicProjects />}
                />


                {/* =====================================================
                    PUBLIC PORTFOLIO PROJECT DETAILS

                    Examples:
                    /babatunde/projects/1
                    /babatunde-adekola/projects/15
                ===================================================== */}

                <Route
                    path="/:portfolioSlug/projects/:id"
                    element={<ProjectDetails />}
                />


                {/* =====================================================
                    ADMIN LOGIN
                ===================================================== */}

                <Route
                    path="/admin/login"
                    element={
                        <AuthRedirect>
                            <AdminLogin />
                        </AuthRedirect>
                    }
                />


                {/* =====================================================
                    ADMIN SIGNUP
                ===================================================== */}

                <Route
                    path="/admin/signup"
                    element={
                        <AuthRedirect>
                            <Signup />
                        </AuthRedirect>
                    }
                />


                {/* =====================================================
                    ADMIN DASHBOARD
                ===================================================== */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN PROFILE
                ===================================================== */}

                <Route
                    path="/admin/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN ABOUT
                ===================================================== */}

                <Route
                    path="/admin/about"
                    element={
                        <ProtectedRoute>
                            <AboutAdmin />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN PROJECTS
                ===================================================== */}

                <Route
                    path="/admin/projects"
                    element={
                        <ProtectedRoute>
                            <Projects />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN PROJECT INSIGHTS
                ===================================================== */}

                <Route
                    path="/admin/project-insights"
                    element={
                        <ProtectedRoute>
                            <ProjectInsights />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN EXPERIENCE
                ===================================================== */}

                <Route
                    path="/admin/experience"
                    element={
                        <ProtectedRoute>
                            <Experience />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN EDUCATION
                ===================================================== */}

                <Route
                    path="/admin/education"
                    element={
                        <ProtectedRoute>
                            <Education />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN SKILLS
                ===================================================== */}

                <Route
                    path="/admin/skills"
                    element={
                        <ProtectedRoute>
                            <Skills />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN CERTIFICATIONS
                ===================================================== */}

                <Route
                    path="/admin/certifications"
                    element={
                        <ProtectedRoute>
                            <Certifications />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN SOCIAL LINKS
                ===================================================== */}

                <Route
                    path="/admin/social-links"
                    element={
                        <ProtectedRoute>
                            <SocialLinks />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================================
                    ADMIN SETTINGS
                ===================================================== */}

                <Route
                    path="/admin/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
