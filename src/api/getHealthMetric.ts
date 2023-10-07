import axios from "axios";
import {HealthCheck} from "../models/HealthCheck";

export const getTasks = async (interval: number) => {
    const response = await axios.get<{
        status: string,
        data: HealthCheck[]
    }>(`${process.env.TASK_SERVICE_URL}/api/task/health/interval/${interval}`);

    return response.data.data
};