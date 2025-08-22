// Login.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(email, password); // ✅ no role here
      if (loggedInUser.role === "dealer") navigate("/dealer");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="flex min-h-screen bg-cover bg-center font-[Poppins]"
      style={{ backgroundImage: "url('/team/log.jpg')" }}
    >
      {/* Left side */}
      <div className="flex flex-col justify-center items-start pl-16 w-1/2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="backdrop-blur-lg bg-gradient-to-r from-yellow-100/70 to-green-100/70 p-10 rounded-3xl shadow-2xl border border-green-300"
        >
          <h1 className="text-4xl font-bold text-green-900 mb-3 tracking-wide drop-shadow-lg">
            Welcome to
          </h1>
          <h2 className="text-5xl font-extrabold text-green-700 drop-shadow-lg">
            <Typewriter
              words={["Krishiमित्र"]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={100}
              deleteSpeed={50}
              delaySpeed={2000}
            />
          </h2>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="flex flex-col justify-center items-center w-1/2 relative">
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-600 to-yellow-500 text-white px-10 py-4 rounded-full 
                     shadow-xl text-xl font-bold tracking-wide 
                     animate-pulse transition-all duration-300"
          style={{
            boxShadow:
              "0 0 25px rgba(34,197,94,0.8), 0 0 50px rgba(234,179,8,0.7)",
          }}
        >
          LogIn / Register
        </motion.button>

        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={handleSubmit}
              className="backdrop-blur-xl bg-white/90 border border-green-300 p-10 rounded-3xl shadow-2xl w-full max-w-md mt-8"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold mb-6 text-green-800 text-center tracking-wide">
                Login to KrishiMitra
              </h2>
              {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-5 border-2 border-green-300 rounded-xl 
                           focus:outline-none focus:ring-4 focus:ring-green-400/60 
                           transition duration-200"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-6 border-2 border-green-300 rounded-xl 
                           focus:outline-none focus:ring-4 focus:ring-green-400/60 
                           transition duration-200"
                required
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-700 to-yellow-500 
                           text-white py-3 rounded-xl font-bold shadow-md 
                           hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                Login
              </button>

              <p className="mt-5 text-center text-sm text-gray-700">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-green-700 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
