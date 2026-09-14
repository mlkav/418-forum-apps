import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addThread } from '../../store/slices/threadSlice';
import Input from '../common/Input';
import Button from '../common/Button';

const ThreadForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.threads);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(addThread(formData)).unwrap();
      navigate('/');
    } catch (err) {
      // Error handling sudah ditangani oleh Redux state
    }
  };

  return (
    <div className="thread-form">
      <h2>Create New Thread</h2>

      {error && (
        <div className="error-message" role="alert">
          Failed to create thread:
          {' '}
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter thread title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category (optional)
          </label>
          <Input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Technology, General, etc."
          />
        </div>

        <div className="form-group">
          <label htmlFor="body" className="form-label">
            Content
          </label>
          <Input
            as="textarea"
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Write your thread content here..."
            rows="8"
            required
          />
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.title.trim() || !formData.body.trim()}
          >
            {loading ? 'Creating...' : 'Create Thread'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ThreadForm;
