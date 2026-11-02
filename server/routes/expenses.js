const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Add expense
router.post('/', async (req, res) => {
  try {
    const { category_id, amount, note, expense_date } = req.body;

    if (!category_id || !amount || !expense_date) {
      return res.status(400).json({ error: 'category_id, amount and expense_date are required' });
    }

    const [result] = await db.query(
      'INSERT INTO expenses (user_id, category_id, amount, note, expense_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, category_id, amount, note || null, expense_date]
    );

    res.status(201).json({ id: result.insertId, message: 'Expense added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List my expenses
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.id, e.amount, e.note, e.category_id,
        DATE_FORMAT(e.expense_date, '%Y-%m-%d') AS expense_date,
        c.name AS category
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.expense_date DESC, e.id DESC`,
        [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { category_id, amount, note, expense_date } = req.body;

    if (!category_id || !amount || !expense_date) {
      return res.status(400).json({ error: 'category_id, amount and expense_date are required' });
    }

    const [result] = await db.query(
      `UPDATE expenses
       SET category_id = ?, amount = ?, note = ?, expense_date = ?
       WHERE id = ? AND user_id = ?`,
      [category_id, amount, note || null, expense_date, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Spending per category
// Spending per category
router.get('/summary', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.name, SUM(e.amount) AS total
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = ?
       GROUP BY c.name`,
      [req.user.id]
    );
    res.json(rows.map((r) => ({ name: r.name, total: Number(r.total) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;