| Step            | Command                                   |
| --------------- | ----------------------------------------- |
| Compile TS → JS | `npx tsc`                                 |
| Start PM2 on JS | `pm2 start build/server.js --name server` |
| Save PM2 state  | `pm2 save`                                |
| Logs            | `pm2 logs server`                         |