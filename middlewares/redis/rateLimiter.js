import redis from "../../infrastructure/redis/RedisClient.js";

export const rateLimiter = async (req, res, next) => {

    try {

        const { email } = req.body;

        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress ||
            req.ip;


        const key = `login-rate-limiter:${email}:${ip}`;

        const bucket = await redis.hGetAll(key);

        if (Object.keys(bucket).length === 0) {

            console.log("No bucket found, creating new bucket");

            const currentTime = new Date().toUTCString();

            await redis.hSet(key, {
                tokens: 4,
                lastRefill: Date.now(),
                logins: JSON.stringify([currentTime])
            });

            await redis.expire(key, 60);

            req.body.lastLogin = [currentTime];
            req.body.tokensLeft = 4;

            return next();
        }

        let timeToRetry = await redis.ttl(key);

        let tokens = Number(bucket.tokens);

        let lastRefill = Number(bucket.lastRefill);

        let logins = bucket.logins
            ? JSON.parse(bucket.logins)
            : [];

        console.log("Current Tokens:", tokens);

        if (tokens < 1) {

            return res.status(429).json({
                success: false,
                message: "Too Many Requests",
                timeToRetry,
                loginAttempts: logins
            });
        }

        const currentTime = new Date().toUTCString();

        tokens--;

        logins.push(currentTime);

        await redis.hSet(key, {
            tokens,
            lastRefill,
            logins: JSON.stringify(logins)
        });

        req.body.lastLogin = logins;
        req.body.tokensLeft = tokens;

        console.log("Token consumed");

        next();

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};