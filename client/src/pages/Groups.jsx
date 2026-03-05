import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiPlus, FiArrowRight, FiHome } from 'react-icons/fi';
import './Groups.css';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="groups-page">
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
          <Link to="/dashboard" className="nav-item">
            <FiHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/groups" className="nav-item active">
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
      <main className="groups-main">
        <div className="groups-header">
          <h1>My Groups</h1>
          <Link to="/create-group" className="create-group-btn">
            <FiPlus /> Create New Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <motion.div 
            className="no-groups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiUsers size={80} color="#ccc" />
            <h2>No groups yet</h2>
            <p>Create your first group to start splitting expenses</p>
            <Link to="/create-group" className="btn-primary">
              Create Group
            </Link>
          </motion.div>
        ) : (
          <div className="groups-grid">
            {groups.map((group, index) => (
              <motion.div
                key={group._id}
                className="group-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="group-card-header">
                  <div className="group-avatar-large">
                    {group.name.charAt(0)}
                  </div>
                  <h3>{group.name}</h3>
                  {group.description && <p>{group.description}</p>}
                </div>
                
                <div className="group-stats">
                  <div className="stat">
                    <span className="stat-label">Members</span>
                    <span className="stat-value">{group.members.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Guests</span>
                    <span className="stat-value">{group.guests?.length || 0}</span>
                  </div>
                </div>

                <div className="group-members-preview">
                  {group.members.slice(0, 3).map((member, i) => (
                    <div key={i} className="member-avatar-small" title={member.user?.name}>
                      {member.user?.name?.charAt(0)}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="member-count">+{group.members.length - 3}</div>
                  )}
                </div>

                <Link to={`/groups/${group._id}`} className="view-group-btn">
                  View Group <FiArrowRight />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Groups;