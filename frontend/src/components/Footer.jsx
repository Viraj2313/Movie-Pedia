import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";
// import "tippy.js/dist/tippy.css";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/Viraj2313",
      icon: (
        <FaGithub className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
      ),
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/virajmahajan/",
      icon: (
        <FaLinkedin className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
      ),
    },
    {
      name: "Email",
      url: "mailto:virajmm231@gmail.com",
      icon: (
        <FaEnvelope className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
      ),
    },
  ];

  return (
    <footer className="border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-wide">
              Discover More with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-bold">
                {" "}
                Moviepedia
              </span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-light max-w-md mx-auto leading-relaxed">
              Join our community to explore movies, share watchlists, and
              connect with friends.
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            {socialLinks.map((link) => (
              <Tippy content={`Open ${link.name}`} key={link.name}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              </Tippy>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-300 dark:border-gray-600">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-500 dark:text-gray-400 font-light text-sm">
                © {currentYear} Moviepedia. Created by Viraj (me).
              </p>
              <div className="flex space-x-6 text-sm">
                <Link
                  to="/"
                  className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-light"
                >
                  Home
                </Link>
                <Link
                  to="/wishlist"
                  className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-light"
                >
                  WatchList
                </Link>
                <Link
                  to="/friends"
                  className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-light"
                >
                  Friends
                </Link>
                <Link
                  to="/recommendations"
                  className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-light"
                >
                  Recommendations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
