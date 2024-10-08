import {Client, QueryResult} from "pg";
import {HealthCheck} from "../models/HealthCheck";

export const fetchData = (pool: Client, interval: number): Promise<QueryResult<HealthCheck>> => {
    return pool.query<HealthCheck>(` 
                            SELECT * ,hc.id AS id, array_to_json(locations) as locations
                                FROM health_check hc
                                         JOIN health_task_metadata m ON hc."metadataId" = m.id
                                where hc.enabled = true AND hc.interval = $1;`, [interval])
}
export const updateData = (pool: Client): Promise<any> => {
    return pool.query('UPDATE health_check SET "inProgress" = true where EXTRACT(EPOCH FROM (now() - "lastChecked")) > "interval" AND "inProgress" = false')
}
export const rollback = (pool: Client, idsToRollBack: string): Promise<any> => {
    return pool.query(`UPDATE health_check  SET "inProgress" = false WHERE id IN (${idsToRollBack})`)
}
