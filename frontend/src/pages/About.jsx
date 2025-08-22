import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

// Team data
const teamMembers = [
  {
    name: "Ansu Kumar Singh",
    role: "Project Lead & Backend Developer",
    img: "/team/Ansu.jpg",
    bio: "Powering KrishiMitra with Flask and guiding the team to success.",
  },
  {
    name: "Divyanshi Priya",
    role: "UI/UX Designer",
    img: "/team/Divyanshi.jpg",
    bio: "Creating smooth, intuitive, and engaging interfaces that make KrishiMitra a joy to use.",
  },
  {
    name: "Sujeet Yadav",
    role: "Cloud Specialist",
    img: "/team/Sujeet.jpg",
    bio: "Ensuring our platform runs reliably, scales seamlessly, and stays always available.",
  },
  {
    name: "Sushma Kumari",
    role: "Machine Learning Engineer", // ✅ updated role
    img: "/team/Sushma.jpg",
    bio: "Designing and training AI models to provide farmers with accurate price predictions.",
  },
  {
    name: "Sonu Kr Shaw",
    role: "Frontend Developer",
    img: "/team/Sonu.jpg",
    bio: "Building responsive, maintainable, and user-friendly web interfaces.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-100">
      
      {/* HERO */}
      <motion.header
        className="w-full relative overflow-hidden text-white py-16 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-green-600 to-emerald-500"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl"></div>

        <div className="relative text-center max-w-4xl mx-auto">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            About KrishiMitra
          </motion.h1>
          <motion.p
            className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            An AI-powered crop market portal helping farmers get fair prices, connect with buyers, and plan better.
          </motion.p>
        </div>
      </motion.header>

      {/* MISSION */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <motion.div
          className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 p-10 border-l-[10px] border-green-600"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-3xl font-extrabold text-green-700 mb-5">🌱 Our Mission</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            KrishiMitra empowers farmers with real-time crop price predictions, 
            market insights, and direct connections with buyers. Our mission is to 
            reduce middlemen, minimize losses, and maximize farmer income through AI innovation.
          </p>
        </motion.div>
      </section>

      {/* TEAM */}
      <section className="bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 py-16 px-6">
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-gray-800 mb-12">
           Meet Our Team Members!
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-200 hover:-translate-y-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className="w-full aspect-square overflow-hidden rounded-t-xl">
                <img
                 src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-green-600 font-medium">{member.role}</p>
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HELPLINE */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 text-white rounded-3xl p-10 shadow-xl">
          <h2 className="text-3xl font-extrabold mb-6">📞 KrishiMitra Helpline</h2>
          <div className="space-y-4 text-lg">
            <p className="flex items-center gap-3">
              <Mail className="w-6 h-6" /> support@krishimitra.com
            </p>
            <p className="flex items-center gap-3">
              <Phone className="w-6 h-6" /> +91 8582868147
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="w-6 h-6" /> TIU Salt Lake, Kolkata, India
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative mt-auto">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg
            className="relative block w-full h-20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M321.39,56.24c58.9,13.34,125.36,35.18,186.21,36.37,61.6,1.2,116.55-19.2,172.09-35.36,55.54-16.15,117.56-27.26,179.05-22.73C920.78,39.06,984,59.67,1044,76.18c60,16.5,120,29.7,156,37.7V0H0V27.35C54.82,39.65,108.65,42.9,162.48,50.71,216.3,58.51,270.73,69.77,321.39,56.24Z"
              fill="#15803d"
            ></path>
          </svg>
        </div>
        <div className="bg-green-700 text-white py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-lg font-semibold">About KrishiMitra</h3>
              <p className="text-sm text-white/80 mt-2 max-w-sm">
                KrishiMitra is an AI-powered platform to predict crop prices and 
                connect farmers directly with buyers, ensuring fair trade and better income.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <p className="text-sm text-white/80">📧 support@krishimitra.com</p>
              <p className="text-sm text-white/80">📞 +91-8582868147</p>
            </div>
          </div>
          <div className="text-center text-white/70 text-xs mt-6">
            © {new Date().getFullYear()} KrishiMitra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
