import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ExpenseForm from '../components/ExpenseForm';
import CategoryChart from '../components/CategoryChart';

function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadExpenses = async () => {
    const [list, sum] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary'),
    ]);
    setExpenses(list.data);
    setSummary(sum.data);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSaved = () => {
    setEditing(null);
    loadExpenses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    loadExpenses();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hello, {user.name}</h1>
        <button onClick={logout} className="bg-gray-800 text-white rounded px-4 py-2">
          Logout
        </button>
      </div>

      <ExpenseForm
        onSaved={handleSaved}
        editing={editing}
        onCancel={() => setEditing(null)}
      />

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Spending by category</h2>
        <CategoryChart data={summary} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-semibold">My expenses</h2>
          <span className="font-semibold">Total: ₹{total.toFixed(2)}</span>
        </div>

        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses yet.</p>
        ) : (
          <ul>
            {expenses.map((e) => (
              <li key={e.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">₹{e.amount} · {e.category}</p>
                  <p className="text-sm text-gray-500">{e.expense_date} {e.note && `· ${e.note}`}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(e)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-600">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;