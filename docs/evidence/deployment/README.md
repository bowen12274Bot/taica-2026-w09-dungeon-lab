# 第九週最終公開交付與部署

日期：2026-11-15。此紀錄屬於兩輪完成後的部署及文件收尾，不是第三輪遊戲實驗。

- [公開 Repository](https://github.com/bowen12274Bot/taica-2026-w09-dungeon-lab)
- [GitHub Pages 遊戲](https://bowen12274bot.github.io/taica-2026-w09-dungeon-lab/)
- [首次成功部署 Run 43729057172](https://github.com/bowen12274Bot/taica-2026-w09-dungeon-lab/actions/runs/43729057172)
- [部署 Workflow 與最新執行結果](https://github.com/bowen12274Bot/taica-2026-w09-dungeon-lab/actions/workflows/pages.yml)

## Git 與原始證據保留

開始時工作目錄乾淨，`main` 與 `origin/main` 均為第二輪 `709cf59`，且包含第一輪 `6ad3029`。`origin` 指向指定公開 repo。

| 分支 | 保留提交 | 處理結果 |
| --- | --- | --- |
| `experiment/map` | `6ad3029` | 本地存在，原樣推送遠端並設定 upstream |
| `experiment/movement` | `709cf59` | 先前改名為 main，從原 commit 恢復分支並推送遠端 |
| `main` | 包含上述兩輪，另加部署與文件提交 | 保留穩定遊戲，自動發布 Pages |

沒有刪除分支、force push、rebase 或改寫歷史。Workflow 提交為 `8f717b9096200290dc8abcdbd6a263089dd7410c`。最後文件提交可由 `git log -1 --format="%H %s" -- docs/evidence/deployment/README.md` 查得；此文件不填入無法自我引用的 commit SHA。

[preservation-checks.json](preservation-checks.json) 保存比對結果：AGENTS.md、HANDOFF_TO_CODEX.md、兩份專案 Skills、兩輪需求與原工程證據皆不變；遊戲 TS/CSS/HTML、素材、Vite 設定、套件與 lockfile 也未修改。僅補正 `src/README.md` 的過時架構說明。AGENTS.md 的 pre-spec 描述仍保留為初始化當時的歷史內容。

GitHub 的 `docs/requirements/`、`docs/evidence/round-01/`、`docs/evidence/round-02/`、`.agents/skills/` 均以公開 API 讀取成功，目錄清單見 [remote-checks.json](remote-checks.json)。

## 發布流程

新增 `.github/workflows/pages.yml`：

1. `main` push 自動觸發，也支援 `workflow_dispatch` 手動觸發。
2. Ubuntu runner 使用 Node.js 24 與 `npm ci` 安裝 lockfile 指定版本。
3. 執行 `npm test`、`npm run build`；建置包含 TypeScript 型別檢查。
4. 上傳 `dist/` 的 Pages artifact，透過 `github-pages` environment 部署。
5. 建置工作只取得 contents/pages 讀取權限；發布工作取得 pages 與 OIDC token 寫入權限，且只允許 main。
6. 同一時間只允許一個 Pages 部署，保留執行中的發布。

GitHub Pages 原先未啟用。本次使用既有授權，透過 GitHub 官方 REST API 設為 `build_type: workflow`，回傳 HTTP 201。未新增個人 token、repo secret 或外部服務。官方 Actions 使用已核對存在的版本：checkout 7.0.1、setup-node 7.1.0、configure-pages 6.0.0、upload-pages-artifact 5.0.0、deploy-pages 5.0.1。

首次遠端執行的 `build`、`deploy` 及所有必要步驟均為 **success**；run 與 job 結果已保留在 [remote-checks.json](remote-checks.json)。之後推送文件也會按同一 Workflow 重新驗證及發布。

## 資源路徑與公開回應

保留原本 `base: './'`。此專案只有單頁入口，HTML 的 JS/CSS 路徑為 `./assets/...`，Phaser 圖集透過 `import.meta.env.BASE_URL` 使用 `./assets/dungeon/tilemap_packed.png`；都相對於 Pages 的 repository 路徑解析。

Phaser 已打包於 JavaScript。角色的 12 個原創影格由 JS 像素資料建立 Canvas 紋理，因此沒有額外角色圖片請求或 CDN 依賴。

公開網址的 HTML、打包 JS、CSS 及 Kenney PNG 均為 **HTTP 200**，下載內容 SHA-256 與本機正式 `dist/` 逐位元相符。驗證的是實際公開網址，沒有用 localhost 代替。完整 URL、大小、content-type 與 Hash 見 [remote-checks.json](remote-checks.json)。

## 測試結果

本機全新安裝成功，12／12 單元測試通過，型別檢查與建置 exit 0：

- [npm ci](install.txt)
- [單元測試](tests.txt)
- [正式建置](build.txt)

公開網站完整操作驗收於 **HeadlessChrome 157 / Windows** 執行，共 **18 項通過**，JSON 記錄於 `2026-11-15T15:27:33Z` 產生。使用已安裝 Chrome 與 Node 原生 WebSocket 連接 DevTools Protocol，沒有安裝 Playwright 或新增 npm 依賴。

| 公開站驗收 | 實際結果 |
| --- | --- |
| 網站與房間 | 公開網址正常載入，完整房間與騎士可見；已人工檢視截圖中的地板、石牆、兩組障礙與封閉雙門 |
| WASD | 實際以 D、W、S、A 執行移動及靠近障礙；D 測得約 62.96 世界像素／秒 |
| 方向鍵 | 上、下、左、右均產生對應方向位移；上鍵測得約 63.20 世界像素／秒 |
| 斜向等速 | W+D 約 62.03 世界像素／秒，與直線接近；相等分量時顯示朝上動畫 |
| 相反輸入 | W+S 位置保持不變 |
| 外牆 | 持續向下推至 Y=76 停住，最後十次畫面取樣位置及待機影格不變 |
| 石塊 | 右側障礙阻擋於 Y=36；左側障礙阻擋於 Y=-12 |
| 封閉門 | 從起點向上，阻擋於 X=8、Y=-76 |
| 沿牆滑動 | 門下方 W+D 時 Y 保持 -76，X 增加且動畫切為右向 |
| 四方向動畫 | 上、下、左、右均觀察到三個不同姿態，停止後回待機 |
| 頁面縮放 | 1440×1000、390×844、320×640 都完整容納地圖、比例不變、無水平溢出，角色位置不變 |
| JavaScript／請求 | 沒有 Runtime/console error 或未取消的載入失敗；沒有 HTTP 4xx/5xx 素材回應 |

速度量測來自可見像素位移及實際時間，受到整數像素取樣、影格邊界與排程影響，因此以 64±6 像素／秒驗收，不宣稱畫面取樣能讀出精確物理浮點座標。第二輪內部 30／60／120 FPS 的精確物理驗證仍保留在原紀錄。

測試注入工具只送出 DOM KeyboardEvent、讀取 Canvas 像素並與原角色影格比對；不替換輸入／物理、不中途改角色位置、不手動步進遊戲、不匯入本機開發版。所有碰撞路徑都從重新載入後的起點，以按鍵走到目標。Helper 不被正式遊戲 import，沒有增加 UI 或產品功能。

完整每次取樣、動畫姿態、資源與錯誤紀錄：[public-browser-checks.json](public-browser-checks.json)。

代表截圖：

- [公開站初始房間](public-spawn.png)、[桌面畫面](public-desktop.png)
- [外牆阻擋](public-wall.png)、[石塊阻擋](public-obstacle.png)、[封閉門阻擋](public-door.png)
- [390 px 視窗](public-narrow.png)、[320 px 視窗](public-small.png)

## 執行中處理的環境問題

- 初次 `npm ci` 被先前 Vite 伺服器占用的 Windows 原生建置檔案阻擋。關閉確認屬於本專案的舊終端後重試成功；保留 [初次檔案占用輸出](install-locked-file.txt)。沒有刪除使用者檔案或終止其他專案。
- 首先使用 `game-playtest` 與 `orca-cli` 檢查公開站；Orca 視窗失焦時 RAF 約每秒一次。以 `orca-computer-use` 恢復前景後可通過部分操作，但視窗切換仍會再次節流。保留 [Orca 部分驗證](orca-partial-checks.json)，不將當時受節流影響的數值列為通過。完整驗收改為獨立 Chrome 無頭視窗，關閉背景節流，避免占用使用者焦點；不是修改遊戲速度或時間。
- Vite 仍有完整 Phaser bundle 超過 500 kB 的提示，建置成功；本次未為此擴張架構。

## 重跑公開驗收

```powershell
# 需要 Node.js 24 與已安裝的 Chrome；路徑請依作業系統調整。
node scripts/verify-pages.mjs "C:/Program Files/Google/Chrome/Application/chrome.exe"
```

腳本固定連到本專案正式 Pages 網址，建立獨立暫存 Chrome profile，完成後關閉該測試瀏覽器。會更新本目錄的公開測試 JSON 與截圖，不觸碰兩輪原證據。

未在 Firefox、Safari 或實體手機驗證，未進行長時間壓力測試；目前需鍵盤操作。所列 GitHub、Pages 與公開操作驗收要求已完成，沒有尚待使用者手動設定的 Pages 權限阻礙。

參考：[GitHub Pages 自訂 Workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite 相對 base](https://vite.dev/guide/build.html#relative-base)、[Chrome Headless](https://developer.chrome.com/docs/chromium/headless)。
