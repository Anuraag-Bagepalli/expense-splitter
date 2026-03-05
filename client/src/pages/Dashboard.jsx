import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiArrowRight, FiUsers, FiPlus, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './Dashboard.css';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState({ owedToMe: 0, iOwe: 0, totalBalance: 0 });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balancesRes, groupsRes] = await Promise.all([
       api.get('/api/expenses/user'),
        api.get('/api/groups')
      ]);
      setBalances(balancesRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'You are owed', value: balances.owedToMe, color: '#4caf50' },
    { name: 'You owe', value: balances.iOwe, color: '#f44336' }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <motion.aside 
        className="sidebar"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sidebar-header">
          <h2>SplitEasy</h2>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <FiPieChart />
            <span>Dashboard</span>
          </Link>
          <Link to="/groups" className="nav-item">
            <FiUsers />
            <span>Groups</span>
          </Link>
        </nav>
        
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0)}
          </div>
          <div className="user-info">
            <h4>{user?.name}</h4>
            <p>{user?.email}</p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <motion.div 
          className="welcome-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your financial summary</p>
        </motion.div>

        {/* Balance Cards */}
        <div className="balance-cards">
          <motion.div 
            className="balance-card owed-to-me"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-icon">
              <FiArrowLeft />
            </div>
            <div className="card-content">
              <h3>You are owed</h3>
              <p className="amount">${balances.owedToMe.toFixed(2)}</p>
            </div>
          </motion.div>

          <motion.div 
            className="balance-card i-owe"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-icon">
              <FiArrowRight />
            </div>
            <div className="card-content">
              <h3>You owe</h3>
              <p className="amount">${balances.iOwe.toFixed(2)}</p>
            </div>
          </motion.div>

          <motion.div 
            className="balance-card total"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-icon">
              <FiDollarSign />
            </div>
            <div className="card-content">
              <h3>Net Balance</h3>
              <p className={`amount ${balances.totalBalance >= 0 ? 'positive' : 'negative'}`}>
                ${Math.abs(balances.totalBalance).toFixed(2)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Chart and Groups */}
        <div className="dashboard-grid">
          <motion.div 
            className="chart-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2>Balance Overview</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No balances to show</div>
            )}
            <div className="chart-legend">
              {pieData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="color-dot" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}: ${item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="recent-groups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="section-header">
              <h2>Your Groups</h2>
              <Link to="/create-group" className="btn-add">
                <FiPlus /> New Group
              </Link>
            </div>
            
            {groups.length > 0 ? (
              <div className="groups-list">
                {groups.slice(0, 3).map(group => (
                  <Link to={`/groups/${group._id}`} key={group._id} className="group-item">
                    <div className="group-avatar">
                      {group.name.charAt(0)}
                    </div>
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <p>{group.members.length} members</p>
                    </div>
                    <FiArrowRight className="group-arrow" />
                  </Link>
                ))}
                {groups.length > 3 && (
                  <Link to="/groups" className="view-all">
                    View all {groups.length} groups
                  </Link>
                )}
              </div>
            ) : (
              <div className="no-groups">
                <p>You haven't joined any groups yet</p>
                <Link to="/create-group" className="btn-primary">Create your first group</Link>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;