/* 0. Initial */
// 0.1. Install dependencies
// 0.2. Rename .env.sample to .env
// 0.3. Fill out values in .env file

import Elysia, { t } from "elysia";
import { cors } from "@elysiajs/cors";
import line from "./utils/line";

/* 3. Set request headers */
/* 4. Issue a service notification token */
/* 5. Send a service message */

const app = new Elysia().use(cors()).post(
    "/",
    async ({ body, status }) => {
        /* 1. Get and verify LIFF access token */
        // 1.1. Get LIFF access token
        const liffAccessToken = body.liffAccessToken;
        // 1.2. Verify LIFF access token
        const channelId = await line.verifyLiffAccessToken(liffAccessToken);
        // 1.3. Ensure LIFF access token
        if (channelId !== process.env.CHANNEL_ID) {
            return status(401);
        }

        /* 2. Issue a channel access token */
        const channelAccessToken = await line.issueChannelAccessToken(
            channelId,
            process.env.CHANNEL_SECRET || "",
        );
    },
    {
        body: t.Object({
            liffAccessToken: t.String(),
        }),
    },
);

app.listen(3000);
console.log("server is listen on port 3000");
