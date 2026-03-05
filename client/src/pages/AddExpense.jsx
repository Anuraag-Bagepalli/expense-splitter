import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiUser, FiUsers, FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AddExpense.css';

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: user?._id || '',
    category: 'other',
    notes: ''
  });
  const [splits, setSplits] = useState([]);
  const [splitType, setSplitType] = useState('equal'); // equal, custom

  useEffect(() => {
    fetchGroup();
  }, [id]);

  useEffect(() => {
    if (group) {
      initializeSplits();
    }
  }, [group]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/api/groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load group');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const initializeSplits = () => {
    const initialSplits = [];
    
    // Add all members
    group.members.forEach(member => {
      initialSplits.push({
        user: member.user._id,
        name: member.user.name,
        amount: 0,
        type: 'member'
      });
    });
    
    // Add all guests
    group.guests.forEach(guest => {
      initialSplits.push({
        guestName: guest.name,
        guestEmail: guest.email,
        amount: 0,
        type: 'guest'
      });
    });
    
    setSplits(initialSplits);
  };

  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setFormData({ ...formData, amount: e.target.value });
    
    if (splitType === 'equal' && amount > 0) {
      const equalAmount = amount / splits.length;
      setSplits(splits.map(split => ({
        ...split,
        amount: equalAmount
      })));
    }
  };

  const handleSplitTypeChange = (type) => {
    setSplitType(type);
    if (type === 'equal' && formData.amount) {
      const equalAmount = parseFloat(formData.amount) / splits.length;
      setSplits(splits.map(split => ({
        ...split,
        amount: equalAmount
      })));
    }
  };

  const handleSplitAmountChange = (index, amount) => {
    const newSplits = [...splits];
    newSplits[index].amount = parseFloat(amount) || 0;
    setSplits(newSplits);
  };

  const validateSplits = () => {
    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
    const expenseAmount = parseFloat(formData.amount) || 0;
    
    return Math.abs(totalSplit - expenseAmount) < 0.01; // Allow small floating point difference
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.paidBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!validateSplits()) {
      toast.error('Split amounts must total the expense amount');
      return;
    }

    setSubmitting(true);
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        group: id,
        splits: splits.map(split => ({
          user: split.type === 'member' ? split.user : null,
          guestName: split.type === 'guest' ? split.guestName : null,
          amount: split.amount
        }))
      };

      await api.post('/api/expenses', expenseData);
      toast.success('Expense added successfully!');
      navigate(`/groups/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add expense');
    } finally {
      setSubmitting(false);
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
    <div className="add-expense-container">
      <motion.div 
        className="add-expense-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Add Expense</h1>
        <p className="group-name">in {group?.name}</p>

        <form onSubmit={handleSubmit} className="add-expense-form">
          {/* Basic Details */}
          <div className="form-section">
            <h2>Expense Details</h2>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="e.g., Dinner, Movie tickets, Groceries"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount *</label>
                <div className="amount-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="paidBy">Paid By *</label>
                <select
                  id="paidBy"
                  value={formData.paidBy}
                  onChange={(e) => setFormData({...formData, paidBy: e.target.value})}
                  required
                >
                  <option value="">Select who paid</option>
                  {group?.members.map(member => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="food">Food & Dining</option>
                <option value="transport">Transportation</option>
                <option value="entertainment">Entertainment</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any additional details"
                rows="2"
              />
            </div>
          </div>

          {/* Split Details */}
          <div className="form-section">
            <h2>Split Details</h2>
            
            <div className="split-type-selector">
              <button
                type="button"
                className={`split-type-btn ${splitType === 'equal' ? 'active' : ''}`}
                onClick={() => handleSplitTypeChange('equal')}
              >
                <FiUsers /> Split Equally
              </button>
              <button
                type="button"
                className={`split-type-btn ${splitType === 'custom' ? 'active' : ''}`}
                onClick={() => handleSplitTypeChange('custom')}
              >
                <FiDollarSign /> Custom Amounts
              </button>
            </div>

            <div className="splits-list">
              <div className="splits-header">
                <span>Person</span>
                <span>Amount</span>
                {splitType === 'custom' && <span></span>}
              </div>
              
              {splits.map((split, index) => (
                <div key={index} className="split-item">
                  <div className="split-person">
                    {split.type === 'member' ? (
                      <>
                        <div className="person-avatar">{split.name.charAt(0)}</div>
                        <span>{split.name}</span>
                      </>
                    ) : (
                      <>
                        <div className="person-avatar guest">{split.guestName.charAt(0)}</div>
                        <span>{split.guestName} (Guest)</span>
                      </>
                    )}
                  </div>
                  
                  {splitType === 'equal' ? (
                    <div className="split-amount">
                      ${split.amount.toFixed(2)}
                    </div>
                  ) : (
                    <div className="split-amount-input">
                      <span className="currency">$</span>
                      <input
                        type="number"
                        value={split.amount.toFixed(2)}
                        onChange={(e) => handleSplitAmountChange(index, e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="split-summary">
              <span>Total Split:</span>
              <span className={validateSplits() ? 'valid' : 'invalid'}>
                ${splits.reduce((sum, split) => sum + split.amount, 0).toFixed(2)}
                {!validateSplits() && ' (must equal expense amount)'}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button"
              onClick={() => navigate(`/groups/${id}`)}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting || !validateSplits()}
            >
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddExpense;