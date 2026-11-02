# 泥研製所：你是哪一隻胖胖貓？（招財貓選色測驗）

10 題測驗找出你的守護色，測完留下 Email 領 95 折優惠碼，並引導加入會員。
官網首頁招財貓區塊的「開始測驗」會用彈出視窗打開這個網站。

## 檔案

| 路徑 | 用途 |
|---|---|
| `public/index.html` | 測驗本體（題目、顏色結果文字、商品連結都在檔案裡的設定區） |
| `functions/api/claim.js` | 收 Email、存進 D1、回傳優惠碼 |
| `wrangler.toml` | Pages 設定：D1 綁定（DB → game）、優惠碼 `COUPON_CODE` |

## 部署

推到 GitHub `main` 分支，Cloudflare Pages 會自動部署。

- 換優惠碼：改 `wrangler.toml` 的 `COUPON_CODE`，推上去
- 名單和其他小遊戲共用 D1 的 `game_leads`、`game_plays`，在出貨小幫手的「遊戲名單」看，遊戲顯示「選色測驗」
