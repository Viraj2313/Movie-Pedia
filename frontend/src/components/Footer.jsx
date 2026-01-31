import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import Tippy from "@tippyjs/react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/Viraj2313",
      icon: FaGithub,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/virajmahajan/",
      icon: FaLinkedin,
    },
    {
      name: "Email",
      url: "mailto:virajmm231@gmail.com",
      icon: FaEnvelope,
    },
  ];

  const footerLinks = [
    { to: "/", label: "Home" },
    { to: "/wishlist", label: "WatchList" },
    { to: "/friends", label: "Friends" },
    { to: "/recommendations", label: "Recommendations" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Discover More with
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-bold">
                {" "}Moviepedia
              </span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Join our community to explore movies, share watchlists, and
              connect with friends.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex justify-center space-x-4"
          >
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Tippy content={`Visit ${link.name}`} key={link.name}>
                  <motion.a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={link.name}
                  >
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </motion.a>
                </Tippy>
              );
            })}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="pt-8 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                © {currentYear} Moviepedia. Created by Viraj.
              </p>

              <nav className="flex flex-wrap justify-center gap-6 text-sm">
                {footerLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
