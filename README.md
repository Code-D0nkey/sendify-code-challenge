# Sendify Code Challenge: DB Schenker Shipment Tracker

## The Task

Build a tool that provides tracking information for a DB Schenker shipment.

### Instructions

1. **Install dependencies:** Run `npm install` in both directories /tracker and /web
2. **Run the servers** to run the servers to the following:
    - Run `npm run server` from the /tracker directory
    - In a seperate terminal, run `npm run dev` from the /web directory
3. **Query away!**

### Troubleshooting

In case the tool fails for whatever reason, it might be because the DBSchenker website is rate-limiting the connection.
One potential fix is to re-run the server with the headless parameter as false.

So in server.js, change this:

```
const promise = getTracking(ref, { headless: true }).then((data) => {
        cache.set(ref, { data, expiresAt: Date.now() + TTL_MS });
        return data;
    });

```

to this:

```
const promise = getTracking(ref, { headless: false }).then((data) => {
        cache.set(ref, { data, expiresAt: Date.now() + TTL_MS });
        return data;
    });

```

If you're still being rate limited, grab a coffee and chill for a sec ;D

### Example Reference Numbers

Use these reference numbers for testing:

| Reference Number |
| ---------------- |
| 1806203236       |
| 1806290829       |
| 1806273700       |
| 1806272330       |
| 1806271886       |
| 1806270433       |
| 1806268072       |
| 1806267579       |
| 1806264568       |
| 1806258974       |
| 1806256390       |

```

```
