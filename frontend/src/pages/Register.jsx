import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2, Mail, Lock, User, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GDGBracket } from "@/components/ui/gdg-bracket";
import { cn } from "@/lib/utils";
import { isGoogleAuthEnabled } from "@/lib/googleAuth";

function getSafeNextUrl(searchParams) {
  const next = searchParams.get("next");
  if (!next) return "/";
  if (
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !next.includes(":")
  ) {
    return next;
  }
  return "/";
}

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleBack = () => {
    const next = searchParams.get("next");
    if (next && next !== "/" && next !== "/register") {
      navigate(next);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errors.form) {
      setErrors((prev) => ({ ...prev, form: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      const nextUrl = getSafeNextUrl(searchParams);
      navigate(nextUrl, { replace: true });
    } catch (err) {
      if (err.fields) {
        const fieldErrors = {};
        for (const [key, msgs] of Object.entries(err.fields)) {
          fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
        setErrors(fieldErrors);
      } else {
        const lowerMsg = (err.message || "").toLowerCase();
        if (lowerMsg.includes("password")) {
          setErrors({ password: err.message });
        } else if (lowerMsg.includes("email") || lowerMsg.includes("already exists")) {
          setErrors({ email: err.message });
        } else {
          setErrors({ form: err.message });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setErrors({});
    try {
      await loginWithGoogle(credentialResponse.credential);
      const nextUrl = getSafeNextUrl(searchParams);
      navigate(nextUrl, { replace: true });
    } catch (err) {
      setErrors({ form: err.message || "Google sign-in failed. Please try again." });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ form: "Google sign-in could not be completed. Please try again." });
  };

  const nextParam = searchParams.get("next");
  const loginUrl = nextParam
    ? `/login?next=${encodeURIComponent(nextParam)}`
    : "/login";

  return (
    <div className="min-h-screen w-full bg-[#080808] flex items-center justify-center p-4 sm:p-6 text-white select-none">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#10131d] p-8 sm:p-10 shadow-2xl">
        {/* Back button on top left corner of the create account box */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="absolute top-5 left-5 sm:top-6 sm:left-6 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] rounded-md px-1.5 py-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>BACK</span>
        </button>

        {/* GDG Mark at top */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4] rounded-lg p-1"
          >
            <GDGBracket type="left" className="w-6 h-6" glow={false} />
            <GDGBracket type="right" className="w-6 h-6" glow={false} />
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Create account
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Join Google Developer Groups On Campus
          </p>
        </div>

        {/* Generic error */}
        {errors.form && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-[#ea4335]/30 bg-[#ea4335]/10 p-3 text-xs text-[#ea4335]"
          >
            {errors.form}
          </div>
        )}

        {/* Google sign-in */}
        <div className="mb-6">
          <div className="flex justify-center w-full">
            {isGoogleAuthEnabled ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                width="100%"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setErrors({
                    form: "Google Sign-Up is not configured yet. Add your VITE_GOOGLE_CLIENT_ID to the frontend .env file, or register below with your email and password.",
                  });
                }}
                className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-[#131314] hover:bg-[#1e1f20] active:scale-[0.99] px-4 py-2.5 text-xs font-semibold tracking-wide text-neutral-200 hover:text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}
          </div>
          {googleLoading && (
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-neutral-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4285f4]" />
              Authenticating with Google...
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#10131d] px-3 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
            or register with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-neutral-300 mb-1.5"
            >
              Full name
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Rivers"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={cn(
                  "w-full rounded-xl border bg-black/40 pl-9 pr-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                  errors.name ? "border-[#ea4335]" : "border-white/15 focus:border-[#4285f4]"
                )}
              />
            </div>
            {errors.name && (
              <p id="name-error" className="mt-1.5 text-xs text-[#ea4335]">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-neutral-300 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  "w-full rounded-xl border bg-black/40 pl-9 pr-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                  errors.email ? "border-[#ea4335]" : "border-white/15 focus:border-[#4285f4]"
                )}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-xs text-[#ea4335]">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-neutral-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={cn(
                  "w-full rounded-xl border bg-black/40 pl-9 pr-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
                  errors.password ? "border-[#ea4335]" : "border-white/15 focus:border-[#4285f4]"
                )}
              />
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1.5 text-xs text-[#ea4335]">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || googleLoading}
            className={cn(
              "w-full mt-2 h-11 rounded-xl bg-[#4285f4] text-white text-sm font-semibold",
              "flex items-center justify-center gap-2",
              "transition-all duration-200 hover:bg-[#4285f4]/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{submitting ? "Creating account..." : "Create account"}</span>
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-8 text-center text-xs text-neutral-400">
          Already have an account?{" "}
          <Link
            to={loginUrl}
            className="text-[#4285f4] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4285f4] rounded"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
