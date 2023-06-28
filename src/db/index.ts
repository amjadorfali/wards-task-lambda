import PG from "pg";

const Pool = PG.Pool;

const getPool = () => {
  return new Pool({
    user: "appHealth",
    host: "localhost",
    database: "master",
    password: "metric123",
    port: 5432
  });
}

export default getPool
