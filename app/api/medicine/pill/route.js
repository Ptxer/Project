import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// Function to add a new pill
export async function addPill(request) {
  let body;

  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { pill_name, dose, type_id } = body;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `INSERT INTO pill (pill_name, dose, type_id) VALUES (?, ?, ?)`,
      [pill_name, dose, type_id]
    );

    return new Response(JSON.stringify({ message: 'Pill added successfully', pill_id: result.insertId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Function to retrieve all pills
export async function getPills() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`SELECT * FROM pill`);

    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Function to update a pill
export async function updatePill(request, { params }) {
  const { pill_id } = params;
  let body;

  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { pill_name, dose, type_id } = body;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `UPDATE pill SET pill_name = ?, dose = ?, type_id = ? WHERE pill_id = ?`,
      [pill_name, dose, type_id, pill_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Pill not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Pill updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Function to delete a pill
export async function deletePill(request, { params }) {
  const { pill_id } = params;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `DELETE FROM pill WHERE pill_id = ?`,
      [pill_id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Pill not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Pill deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
