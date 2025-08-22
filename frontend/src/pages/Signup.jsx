// frontend/pages/Signup.jsx
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("farmer"); // default role
  const [state, setState] = useState("");
  const [districtPreferences, setDistrictPreferences] = useState([]);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  // Load states on mount
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/states")
      .then((res) => setStates(res.data.states || []))
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (role === "dealer" && state) {
      axios
        .get(`http://127.0.0.1:5000/api/districts?state=${state}`)
        .then((res) => setDistricts(res.data.districts || []))
        .catch((err) => console.error("Error fetching districts:", err));
    } else {
      setDistricts([]);
    }
  }, [state, role]);

  const handleDistrictToggle = (district) => {
    setDistrictPreferences((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({
        name,
        email,
        password,
        role,
        contact,
        state: role === "dealer" ? state : "",
        districtPreferences: role === "dealer" ? districtPreferences : [],
      });
      navigate(role === "dealer" ? "/dealer" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="flex min-h-screen bg-cover bg-center font-[Poppins]"
      style={{ backgroundImage: "url('/team/sign.jpg')" }}
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
                Create your Account
              </h2>
              {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}

              {/* Role Selection */}
              <div className="flex justify-center gap-6 mb-5">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="farmer"
                    checked={role === "farmer"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  Farmer
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="dealer"
                    checked={role === "dealer"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  Dealer
                </label>
              </div>

              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-5 border-2 border-green-300 rounded-xl"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-5 border-2 border-green-300 rounded-xl"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-5 border-2 border-green-300 rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-3 mb-5 border-2 border-green-300 rounded-xl"
                required
              />

              {/* Dealer-specific fields */}
              {role === "dealer" && (
                <>
                  {/* State Dropdown */}
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 mb-5 border-2 border-green-300 rounded-xl"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* District Checkboxes */}
                  <div className="mb-5">
                    <p className="mb-2 font-semibold text-green-800">
                      Select Districts:
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-3 rounded-xl">
                      {districts.map((d) => (
                        <label key={d} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={d}
                            checked={districtPreferences.includes(d)}
                            onChange={() => handleDistrictToggle(d)}
                          />
                          {d}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-700 to-yellow-500 text-white py-3 rounded-xl font-bold shadow-md"
              >
                Sign Up
              </button>

              <p className="mt-5 text-center text-sm text-gray-700">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-green-700 font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;
