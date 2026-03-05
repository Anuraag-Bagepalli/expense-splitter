import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiUsers, FiUser, FiMail, FiX, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CreateGroup.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [members, setMembers] = useState([]);
  const [guests, setGuests] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/api/users/search?query=${query}`);
      // Filter out users already added
      const filteredResults = res.data.filter(
        user => !members.some(member => member._id === user._id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error(err);
    }
  };

  const addMember = (user) => {
    setMembers([...members, user]);
    setSearchEmail('');
    setSearchResults([]);
  };

  const removeMember = (userId) => {
    setMembers(members.filter(m => m._id !== userId));
  };

  const addGuest = () => {
    if (guestName && guestEmail) {
      setGuests([...guests, { name: guestName, email: guestEmail }]);
      setGuestName('');
      setGuestEmail('');
    }
  };

  const removeGuest = (index) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const groupData = {
        name: formData.name,
        description: formData.description,
        members: members.map(m => m._id),
        guests: guests
      };

      const res = await api.post('/api/groups', groupData);
      toast.success('Group created successfully!');
      navigate(`/groups/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-container">
      <motion.div 
        className="create-group-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Create New Group</h1>
        <p>Start splitting expenses with friends</p>

        <form onSubmit={handleSubmit} className="create-group-form">
          {/* Group Details */}
          <div className="form-section">
            <h2>Group Details</h2>
            <div className="form-group">
              <label htmlFor="name">Group Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Trip to Goa, Roommates, Team Lunch"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What's this group about?"
                rows="3"
              />
            </div>
          </div>

          {/* Add Members */}
          <div className="form-section">
            <h2>Add Members</h2>
            <p className="section-subtitle">Search and add registered users</p>
            
            <div className="search-box">
              <FiUser className="search-icon" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  searchUsers(e.target.value);
                }}
              />
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div key={user._id} className="search-result-item">
                    <div className="result-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <div className="result-info">
                      <div className="result-name">{user.name}</div>
                      <div className="result-email">{user.email}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => addMember(user)}
                      className="add-btn"
                    >
                      <FiPlus /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {members.length > 0 && (
              <div className="selected-members">
                <h3>Selected Members ({members.length})</h3>
                <div className="members-list">
                  {members.map(member => (
                    <div key={member._id} className="member-tag">
                      <span className="member-tag-avatar">{member.name.charAt(0)}</span>
                      <span className="member-tag-name">{member.name}</span>
                      <button 
                        type="button"
                        onClick={() => removeMember(member._id)}
                        className="remove-btn"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Guests */}
          <div className="form-section">
            <h2>Add Guests</h2>
            <p className="section-subtitle">Add people who don't have an account yet</p>
            
            <div className="guest-inputs">
              <input
                type="text"
                placeholder="Guest Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Guest Email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <button 
                type="button"
                onClick={addGuest}
                className="add-guest-btn"
                disabled={!guestName || !guestEmail}
              >
                Add Guest
              </button>
            </div>

            {guests.length > 0 && (
              <div className="selected-guests">
                <h3>Added Guests ({guests.length})</h3>
                <div className="guests-list">
                  {guests.map((guest, index) => (
                    <div key={index} className="guest-tag">
                      <FiMail className="guest-icon" />
                      <span className="guest-info">
                        {guest.name} ({guest.email})
                      </span>
                      <button 
                        type="button"
                        onClick={() => removeGuest(index)}
                        className="remove-btn"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button"
              onClick={() => navigate('/groups')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGroup;