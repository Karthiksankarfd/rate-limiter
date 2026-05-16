import { createClient } from "redis";

const redis = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST ,
        port: process.env.REDIS_PORT
    }
})

export async function connectToRedis(){
    try{
        let res = await redis.connect();
        await redis.set('connectedon', Date.now().toLocaleString());
        console.log("REDIS CONNECTION ESTABLISHED")
    }catch(e){
        next(e);
    }
}

export default redis ;
