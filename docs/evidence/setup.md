# 工程初始化驗證

日期：2026-11-13。範圍：使用者授權初始化 TypeScript + Phaser + Vite，完成測試後建立本機 Git commit。本記錄不是 Round 1 或 Round 2 的遊戲驗收。

## 環境與版本

- Windows，Node.js `24.21.0`，npm `11.7.0`。
- TypeScript `7.0.2`、Phaser `4.2.1`、Vite `8.3.8`；直接依賴使用精確版本，間接依賴由 `package-lock.json` 鎖定。
- Orca CLI 內嵌瀏覽器，User Agent 回報 Chrome `150.0.7871.250`；實際檢查視窗為 `1002 × 718`。
- 沿用原始 `AGENTS.md` 與兩份本地 Skill，未修改工程規範或需求文件。

## 已執行的檢查

| 檢查 | 實際結果 |
| --- | --- |
| `npm.cmd install` | 成功新增 19 個套件；audit 檢查 20 個套件，回報 0 vulnerabilities。這是當次 registry 回報，非完整安全保證。 |
| `npm.cmd ls --depth=0` | 三個直接依賴版本與 `package.json` 一致。 |
| `npm.cmd run build` | 成功；其中 `npm run typecheck` 執行 `tsc --noEmit` 通過，Vite 產出 HTML、CSS 與 JavaScript。 |
| 開發伺服器 `npm.cmd run dev -- --port 5173 --strictPort` | 瀏覽器開啟及重新載入後，顯示「工程環境已就緒。等待第一輪正式需求。」；DOM 確認只有一個 `640 × 360` canvas。 |
| 開發模式 console / network | 擷取重新載入後的紀錄，console 僅有 Vite 連線 debug 訊息，沒有 error；頁面及模組回應為 200 / 304。 |
| 正式預覽 `npm.cmd run preview -- --port 4173 --strictPort` | 顯示相同就緒文字與空白畫布；HTML、JS、CSS 皆回應 200，console 未新增錯誤。 |
| 實際畫面 | 已開啟並人工視覺檢查兩張截圖：標題及文字可讀、空白畫布正常，沒有遊戲內容。 |
| 需求檔案 | `round-01-map.md` 與 `round-02-movement.md` 都維持 0 bytes。 |
| Git 忽略規則 | `git check-ignore` 確認 `node_modules/`、`dist/`、`.env` 被忽略。 |

截圖：[開發模式](setup/dev.png)、[正式建置預覽](setup/preview.png)。

## 提示與驗證範圍

- Vite 提示完整 Phaser bundle 超過 500 kB：本次 JS 約 1,368 kB，gzip 約 358 kB。建置成功，保留提示；尚無正式效能需求，不為此增加拆分架構。
- 第一次 Orca snapshot 呼叫遇到工具 EOF；後續 reload 成功回傳頁面樹，並以 DOM、console、network 與截圖完成驗證。這不是頁面執行錯誤。
- 未加入地圖、人物、移動、碰撞、美術或玩法測試；兩輪功能尚未開始。
- 未驗證其他瀏覽器、行動裝置、正式遊戲效能或 GitHub Pages 部署；未安裝 Playwright。
- 本次未執行獨立單元測試；空白工程以型別、建置及實際瀏覽器啟動驗證為準。

本記錄與工程一起提交。取得本次記錄的 commit：`git log -1 --format=%H -- docs/evidence/setup.md`。
