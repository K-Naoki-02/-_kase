const express = require('express');
const cors = require('cors');
const app = express();
const port = 5916;

app.use(cors({
  origin: 'http://localhost'
}));

app.get('/', (req, res) => {
  res.send('conglatulation');
});

//ここから下は追記
const { Pool } = require('pg');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  host: 'db',
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

app.post('/customers', async (req, res) => {
  const { company_name, industry, contact, location } = req.body;

  try {
    await pool.query(
      `INSERT INTO customers (company_name, industry, contact, location)
       VALUES ($1, $2, $3, $4)`,
      [company_name, industry, contact, location]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get('/customers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT customer_id, company_name, industry, contact, location, created_date, updated_date
       FROM customers
       ORDER BY customer_id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get('/customers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT customer_id,
              company_name,
              industry,
              contact,
              location,
              created_date,
              updated_date
       FROM customers
       WHERE customer_id = $1`,
      [id]
    );

    // 該当データが存在しない場合
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // 1件だけ返す
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false
    });
  }
});

app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `DELETE FROM customers
       WHERE customer_id = $1`,
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put('/customers/:id', async (req, res) => {

  const id = req.params.id;

  const {
    company_name,
    industry,
    contact,
    location
  } = req.body;

  try {

    await pool.query(
      `UPDATE customers
       SET
         company_name = $1,
         industry = $2,
         contact = $3,
         location = $4
       WHERE customer_id = $5`,
      [
        company_name,
        industry,
        contact,
        location,
        id
      ]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});

app.listen(port, '0.0.0.0', () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
