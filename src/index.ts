/* 0. Initial */
// 0.1. Install dependencies
// 0.2. Rename .env.sample to .env
// 0.3. Fill out values in .env file

import Elysia, { t } from "elysia";
import { cors } from "@elysiajs/cors";
import line from "./utils/line";

const app = new Elysia()
    .use(cors())
    .get("/", () => "Line Msg Svc Ok")
    .post(
        "/",
        async ({ body, status }) => {
            console.log("called", body);
            /* 1. Get and verify LIFF access token */
            // 1.1. Get LIFF access token
            const liffAccessToken = body.liffAccessToken;
            // 1.2. Verify LIFF access token
            const channelId = await line.verifyLiffAccessToken(liffAccessToken);
            console.log("channel ID", channelId);
            // 1.3. Ensure LIFF access token
            if (channelId !== process.env.CHANNEL_ID) {
                return status(401);
            }

            /* 2. Issue a channel access token */
            const channelAccessToken = await line.issueChannelAccessToken(
                channelId,
                process.env.CHANNEL_SECRET || "",
            );

            /* 3. Set request headers */
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${channelAccessToken}`,
            };

            /* 4. Issue a service notification token */
            const notificationToken = await line.issueServiceNotiToken(
                headers,
                liffAccessToken,
            );
            console.log("noti token", notificationToken);

            /* 5. Send a service message */
            const response = await line.sendServiceMessage(
                headers,
                notificationToken,
            );
            console.log("response", response);
            return response;
        },
        {
            body: t.Object({
                liffAccessToken: t.String(),
            }),
        },
    );

const port = Bun.env.PORT || 3000;
console.log("env", Bun.env);
app.listen(port);
console.log(`server is listen on port ${port}`);
