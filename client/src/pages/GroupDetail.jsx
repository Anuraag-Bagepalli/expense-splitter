import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiPlus, FiUser, FiMail, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './GroupDetail.css';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        api.get(`/api/groups/${id}`),
        api.get(`/api/expenses/group/${id}`)
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      calculateBalances(expensesRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (expensesData) => {
    const balances = {};
    
    expensesData.forEach(expense => {
      // Add what was paid by the payer
      if (!balances[expense.paidBy._id]) {
        balances[expense.paidBy._id] = {
          name: expense.paidBy.name,
          owed: 0,
          owes: 0
        };
      }
      
      expense.splits.forEach(split => {
        if (split.user) {
          if (!balances[split.user._id]) {
            balances[split.user._id] = {
              name: split.user.name,
              owed: 0,
              owes: 0
            };
          }
          
          if (split.user._id === expense.paidBy._id) {
            // Payer doesn't owe themselves
          } else {
            balances[split.user._id].owes += split.amount;
            balances[expense.paidBy._id].owed += split.amount;
          }
        }
      });
    });
    
    setBalances(balances);
  };

  const searchUsers = async (query) => {
    if (query.length < 2) return;
    try {
      const res = await api.get(`/api/users/search?query=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/api/groups/${id}/members`, { userId });
      toast.success('Member added successfully');
      fetchGroupData();
      setShowAddMember(false);
      setSearchEmail('');
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add member');
    }
  };

  const addGuest = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/groups/${id}/guests`, {
        name: guestName,
        email: guestEmail
      });
      toast.success('Guest added successfully');
      fetchGroupData();
      setShowAddGuest(false);
      setGuestName('');
      setGuestEmail('');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add guest');
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
    <div className="group-detail">
      <div className="group-header">
        <button onClick={() => navigate('/groups')} className="back-btn">
          <FiArrowLeft /> Back to Groups
        </button>
        <h1>{group?.name}</h1>
        <Link to={`/groups/${id}/add-expense`} className="add-expense-btn">
          <FiPlus /> Add Expense
        </Link>
      </div>

      <div className="group-content">
        <div className="group-main">
          <div className="balances-section">
            <h2>Balances</h2>
            <div className="balances-list">
              {Object.entries(balances).map(([userId, balance]) => (
                <div key={userId} className="balance-item">
                  <span className="user-name">{balance.name}</span>
                  <span className={`balance-amount ${balance.owed - balance.owes >= 0 ? 'positive' : 'negative'}`}>
                    ${Math.abs(balance.owed - balance.owes).toFixed(2)}
                    {balance.owed - balance.owes >= 0 ? ' (to receive)' : ' (to pay)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="expenses-section">
            <h2>Expenses</h2>
            {expenses.length === 0 ? (
              <p className="no-expenses">No expenses yet. Add your first expense!</p>
            ) : (
              <div className="expenses-list">
                {expenses.map(expense => (
                  <div key={expense._id} className="expense-item">
                    <div className="expense-info">
                      <h3>{expense.description}</h3>
                      <p className="expense-date">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="expense-amount">
                      ${expense.amount.toFixed(2)}
                    </div>
                    <div className="expense-paid">
                      Paid by {expense.paidBy.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="group-sidebar">
          <div className="members-section">
            <div className="section-header">
              <h3>Members</h3>
              <button onClick={() => setShowAddMember(true)} className="add-btn">
                <FiUser /> Add
              </button>
            </div>
            <div className="members-list">
              {group?.members.map(member => (
                <div key={member.user._id} className="member-item">
                  <div className="member-avatar">
                    {member.user.name.charAt(0)}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.user.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="guests-section">
            <div className="section-header">
              <h3>Guests</h3>
              <button onClick={() => setShowAddGuest(true)} className="add-btn">
                <FiUser /> Add
              </button>
            </div>
            <div className="guests-list">
              {group?.guests.map((guest, index) => (
                <div key={index} className="guest-item">
                  <div className="guest-avatar">
                    {guest.name.charAt(0)}
                  </div>
                  <div className="guest-info">
                    <span className="guest-name">{guest.name}</span>
                    <span className="guest-email">{guest.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Member</h3>
            <input
              type="email"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                searchUsers(e.target.value);
              }}
            />
            <div className="search-results">
              {searchResults.map(user => (
                <div key={user._id} className="search-result" onClick={() => addMember(user._id)}>
                  <div className="result-avatar">{user.name.charAt(0)}</div>
                  <div className="result-info">
                    <div className="result-name">{user.name}</div>
                    <div className="result-email">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAddMember(false)} className="close-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuest && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Guest</h3>
            <form onSubmit={addGuest}>
              <input
                type="text"
                placeholder="Guest Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Guest Email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Add Guest</button>
                <button type="button" onClick={() => setShowAddGuest(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;