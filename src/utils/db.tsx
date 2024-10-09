import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export async function query<T>(sql: string, params: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}