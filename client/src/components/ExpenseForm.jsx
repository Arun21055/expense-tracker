import { useState, useEffect } from 'react';
import api from '../api';

function ExpenseForm({ onSaved, editing, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data);
      if (res.data.length > 0) setCategoryId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (editing) {
      setCategoryId(editing.category_id);
      setAmount(editing.amount);
      setNote(editing.note || '');
      setDate(editing.expense_date);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = { category_id: categoryId, amount, note, expense_date: date };
    try {
      if (editing) {
        await api.put(`/expenses/${editing.id}`, data);
      } else {
        await api.post('/expenses', data);
      }
      setAmount('');
      setNote('');
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-3">
        {editing ? 'Edit expense' : 'Add expense'}
      </h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded p-2"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded p-2"
          required
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
          {editing ? 'Update' : 'Add'}
        </button>
        {editing && (
          <button type="button" onClick={onCancel} className="border rounded px-4 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ExpenseForm;