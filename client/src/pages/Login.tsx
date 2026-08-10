import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);

      // Redirect to desktop route automatically
      navigate("/desktop");
    } catch (err: unknown) {
      console.error("Login failed:", err);

      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        apiError.response?.data?.message ||
          "Failed to log in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-950 font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* OS Background Subtle Glow FX */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl transition-all">
        {/* User / System Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-800/80 shadow-lg shadow-cyan-500/10">
            <svg
              className="h-10 w-10 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Authenticate to access your workspace
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="username@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-cyan-500 focus:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Unlocking...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
