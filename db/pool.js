const moment = require("moment");
const { Pool } = require("pg");

const pool = new Pool({
  user: "bancosolar",
  host: "localhost",
  database: "bancosolar",
  password: "12345",
  port: 5432,
});

const crearUsuario = async (datos) => {
  const client = await pool.connect();
  const query1 = {
    text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *",
    values: datos,
  };

  try {
    const result = await client.query(query1);
    return {
      ok: true,
      data: result.rows,
    };
  } catch (err) {
    return {
      ok: false,
      data: "Error BBDD: " + err,
    };
  } finally {
    client.release();
  }
};

const consultaUsuarios = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM usuarios");
    return {
      ok: true,
      data: result.rows,
    };
  } catch (err) {
    return {
      ok: false,
      data: "Error BBDD: " + err,
    };
  } finally {
    client.release();
  }
};

const editUsuario = async (datos) => {
  const client = await pool.connect();
  const query2 = {
    text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE nombre = $1 RETURNING *",
    values: datos,
  };

  try {
    const result = await client.query(query2);
    return {
      ok: true,
      data: result.rows,
    };
  } catch (err) {
    return {
      ok: false,
      data: "Error BBDD: " + err,
    };
  } finally {
    client.release();
  }
};

const eliminarUsuario = async (id) => {
  const client = await pool.connect();
  const query3 = {
    text: "DELETE FROM usuarios WHERE id = $1 RETURNING *",
    values: id,
  };

  try {
    const result = await client.query(query3);
    return {
      ok: true,
      data: result.rows,
    };
  } catch (err) {
    return {
      ok: false,
      data: "Error BBDD: " + err,
    };
  } finally {
    client.release();
  }
};

const transferencia = async (emisor, receptor, monto) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const descontarSaldo = {
      text: "UPDATE usuarios SET balance = (balance - $1) WHERE nombre=$2",
      values: [monto, emisor],
    };
    await client.query(descontarSaldo);

    const aumentarSaldo = {
      text: "UPDATE usuarios SET balance = (balance + $1) WHERE nombre=$2",
      values: [monto, receptor],
    };
    await client.query(aumentarSaldo);

    const IDEmisor = {
      text: "SELECT * FROM usuarios WHERE nombre=$1",
      values: [emisor],
    };
    const idEmisor = await client.query(IDEmisor);

    const IDReceptor = {
      text: "SELECT * FROM usuarios WHERE nombre=$1",
      values: [receptor],
    };
    const idReceptor = await client.query(IDReceptor);

    const registroTransferencia = {
      text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4)",
      values: [
        idEmisor.rows[0].id,
        idReceptor.rows[0].id,
        monto,
        moment().format("YYYY-MM-DD, HH:mm:ss"),
      ],
    };

    await client.query(registroTransferencia);

    await client.query("COMMIT");
    return {
      ok: true,
      data: "Transferencia realizada.",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    return {
      ok: false,
      data: "Error BBDD: " + err,
    };
  } finally {
    client.release();
  }
};

const consultaTransferencia = async () => {
  const client = await pool.connect();
  const query4 = {
    rowMode: "array",
    text: "Select t.id, ue.nombre AS emisor, ur.nombre AS receptor, t.monto, t.fecha FROM transferencias AS t JOIN usuarios AS ue ON ue.id = t.emisor JOIN usuarios AS ur ON ur.id = t.receptor ORDER BY t.fecha DESC;",
  };
  try {
    const result = await client.query(query4);
    return {
      ok: true,
      data: result.rows,
    };
  } catch (err) {
    return {
      ok: false,
      data: "Error BBDD: " + err,
    };
  } finally {
    client.release();
  }
};

module.exports = {
  crearUsuario,
  consultaUsuarios,
  editUsuario,
  eliminarUsuario,
  transferencia,
  consultaTransferencia,
};
