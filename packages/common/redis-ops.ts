import redisClient from "./redis-broker.js";

async function enqueueJob(id: string) {
  await redisClient.lPush("queue:deployapp",  id)
}

export default enqueueJob