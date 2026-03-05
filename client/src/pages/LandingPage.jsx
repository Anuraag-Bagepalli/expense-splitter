import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiDollarSign, FiPieChart, FiShield } from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const containerRef = useRef(null);

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${scrollPosition * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FiUsers />,
      title: 'Group Expenses',
      description: 'Create groups for trips, roommates, or events and split expenses easily'
    },
    {
      icon: <FiDollarSign />,
      title: 'Smart Splitting',
      description: 'Split bills equally, by percentage, or custom amounts'
    },
    {
      icon: <FiPieChart />,
      title: 'Real-time Balances',
      description: 'See who owes whom at a glance with beautiful visualizations'
    },
    {
      icon: <FiShield />,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section with Parallax */}
      <section className="hero">
        <div className="parallax-bg" ref={containerRef}>
          <div className="gradient-sphere"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <motion.div 
          className="hero-content"
          style={{ y: y1, opacity, scale }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Split Expenses
            <span className="gradient-text"> Effortlessly</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The smartest way to split bills with friends, roommates, and groups
          </motion.p>
          
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/register" className="btn btn-primary">
              Get Started <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>
          </motion.div>
          
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h3>$10M+</h3>
              <p>Expenses Tracked</p>
            </div>
            <div className="stat-item">
              <h3>100K+</h3>
              <p>Groups Created</p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="hero-image"
          style={{ y: y2 }}
        >
          <img src="/dashboard-preview.png" alt="Dashboard Preview" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Everything you need to manage group expenses
        </motion.h2>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
        
        <div className="steps">
          {[
            { number: '01', title: 'Create a Group', desc: 'Start by creating a group for your trip, house, or event' },
            { number: '02', title: 'Add Members', desc: 'Invite friends via email or add them as guests' },
            { number: '03', title: 'Add Expenses', desc: 'Log expenses and choose how to split them' },
            { number: '04', title: 'Settle Up', desc: 'See who owes what and settle up easily' }
          ].map((step, index) => (
            <motion.div
              key={index}
              className="step-card"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Ready to start splitting?</h2>
          <p>Join thousands of users who are already managing their group expenses effortlessly</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Create Your Free Account
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;