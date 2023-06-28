import {Pool, QueryResult} from "pg";
import {HealthCheck} from "../models/HealthCheck";

export const fetchData = (pool: Pool, interval: number): Promise<QueryResult<HealthCheck>> => {
  return pool.query<HealthCheck>('SELECT * FROM "HealthCheck" where interval = $1', [interval])
}
export const updateData = (pool: Pool): Promise<any> => {
  return pool.query('UPDATE "HealthCheck" SET "inProgress" = true where EXTRACT(EPOCH FROM (now() - "lastChecked")) > "interval" AND "inProgress" = false')
}
export const rollback = (pool: Pool, idsToRollBack: string): Promise<any> => {
  return pool.query(`UPDATE "HealthCheck"  SET "inProgress" = false WHERE id IN (${idsToRollBack})`)
}
