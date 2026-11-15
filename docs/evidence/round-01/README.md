# Round 01 — 固定地下城房間實作與驗證

日期：2026-11-15。分支：`experiment/map`。初始化基準：`76d8a5f`。

本輪依使用者提供的 [round-01-map.md](../../requirements/round-01-map.md) 實作。開始工作時兩份需求都已有內容；Codex 未編輯需求原文。第一輪需求與本輪程式一併提交；第二輪需求保留使用者原本的工作目錄修改，未納入本次功能 commit。

## 規範與使用工具

- 沿用原始 `AGENTS.md`，沒有更改其內容。
- 使用專案 `phaser-2d-game` 與 `game-playtest` Skills，以及已提供的 `orca-cli` Skill 進行本機瀏覽器檢查。
- TypeScript `7.0.2`、Phaser `4.2.1`、Vite `8.3.8` 版本未變；Node.js `24.21.0`、npm `11.7.0`、Windows。
- 瀏覽器為 Orca 內嵌 Chromium，User Agent 與實際尺寸記錄於 [browser-checks.json](browser-checks.json)。未安裝 Playwright 或其他新依賴。
- [input-hashes.json](input-hashes.json) 記錄使用的需求、AGENTS、Skills 與原始素材的 SHA-256；文字同時提供 LF 正規化雜湊，以便 Git checkout 後比對。

## 實作摘要

| 檔案 | 責任 |
| --- | --- |
| `src/map/room.ts` | 保存規格的 20 × 12 配置、通行資料、起點與座標轉換。 |
| `src/rendering/room-art.ts` | 對應地形與原始圖塊、固定地板紋理及著色。 |
| `src/rendering/fit-room.ts` | 依容器寬高選擇 3×、2×、1× 或小於 1 的等比例顯示。 |
| `src/scenes/RoomScene.ts` | 載入 Kenney 圖集、逐格繪製；固定相機，不建立物理或角色。 |
| `src/main.ts`、`src/style.css`、`index.html` | 簡潔實驗頁面、載入失敗提示、可縮小的容器與 ResizeObserver。 |
| `tests/room.test.mjs` | 使用 Node.js 內建 runner 驗證地圖及座標契約。 |

格子原點位於左上角，世界原點位於房間中心。世界範圍 `[-160, 160) × [-96, 96)`；預留起點格子 `(10, 9)` 對應世界 `(8, 56)`，繪製中心 `(168, 152)`。顯示倍率不參與座標換算。`S` 與普通地板使用同樣樣式，沒有起點標記。

素材來自 [Kenney 官方 itch.io](https://kenney-assets.itch.io/tiny-dungeon) 的 Tiny Dungeon 1.0，原始 CC0 授權隨附。主站直接下載遇到 403，官方備用發行頁成功。圖集保持原樣；地面使用原圖的地板 frame 加上暖灰棕 tint 與 1 px 石板接縫，石牆與石障礙使用原始砌石 frame。詳見 [素材來源與索引](../../../public/assets/dungeon/README.md)。

## 已驗證結果

| 項目 | 實際結果 |
| --- | --- |
| `npm.cmd test` | 8 / 8 通過，見 [tests.txt](tests.txt)。 |
| 完整地圖 | 測試直接從核准需求讀取 ASCII 地圖，與實作逐行比對一致。 |
| 地形通行性 | 172 格可通行、58 格牆、8 格障礙、2 格封閉門；所有可通行地板都與起點連通。 |
| 座標 | 240 個格子中心全部往返正確；負數、浮點數、四側邊界及非有限數值均已測試。 |
| 起點與素材 | 起點正確且無特殊樣式；所有引用的 frame 位於 192 × 176 原始圖集內。 |
| `npm.cmd run build` | 型別檢查與 Vite 正式建置成功，exit code 0；見 [build.txt](build.txt)。 |
| 桌面 1440 × 1000 | 畫布顯示 960 × 576（3×），原生邏輯畫布仍為 320 × 192。 |
| 較小桌面 1024 × 768 | 顯示 640 × 384（2×），房間完整。 |
| 窄視窗 390 × 844 | 顯示 320 × 192（1×），房間完整。 |
| 小視窗 320 × 640 | 顯示約 262 × 157.2，等比例縮小，無水平捲動。 |
| 橫向矮視窗 844 × 390 | 顯示約 236.66 × 142，房間完整；頁面因最低 400 px 高度有少量垂直捲動。 |
| 五種尺寸共同檢查 | 只有一個 canvas、載入提示隱藏、最近鄰 CSS 取樣、20:12 比例、水平及垂直置中，均通過容器邊界檢查。 |
| 瀏覽器訊息 | 開發與正式預覽沒有觀察到 console error。開發請求無 HTTP 4xx/5xx。 |
| 正式預覽 | HTML、JS、CSS、PNG 全部 HTTP 200，見 [preview-network.json](preview-network.json)；已視覺確認正式產物畫面。 |
| 範圍檢查 | 沒有角色、移動、碰撞運動、互動門、敵人、隨機生成或其他禁止功能。 |

已開啟檢視截圖，確認完整外牆、封閉雙門、兩組障礙與像素地板，無缺圖或明顯錯位。程式保持固定相機，停用鍵盤、滑鼠、觸控與 gamepad 遊戲輸入。

代表畫面：[桌面](desktop.png)、[較小桌面](compact.png)、[窄視窗](narrow.png)、[小視窗](small.png)、[橫向矮視窗](landscape.png)、[正式建置](preview.png)。

## 測試中修正與限制

- 實測發現 CSS Grid 的預設最小寬度會保留大畫布的固有寬度，造成窄視窗水平溢出。已改為 `minmax(0, 1fr)` 欄寬及 `min-width: 0`；上表是修正後結果。
- Orca 首次讀取官方下載頁時發生工具 EOF，重新載入後成功。縮放測試切到前景分頁並等待兩個 animation frame，確保 ResizeObserver 已更新。
- Vite 仍有既有的 500 kB chunk 提示：本輪 JS 約 1,371 kB、gzip 約 359 kB；沒有因提示而更動套件或擴張架構。PowerShell 將該 stderr 提示附上 `NativeCommandError` 包裝，`build.txt` 保留原始輸出，實際建置退出碼為 0。
- 尚未測試 Firefox、Safari、實體行動裝置或 GitHub Pages 遠端部署；窄視窗檢查為 Chromium 的 viewport 模擬。
- 第二輪尚未執行；目前只準備好可沿用的地圖、通行查詢、素材與連續世界座標接口，沒有宣稱角色或碰撞驗收通過。

## 重現與 Git

在支援的 Node.js 環境執行 `npm ci`、`npm test`、`npm run build`，再用 `npm run dev` 或 `npm run preview` 載入頁面。以表列視窗尺寸檢查 canvas 邊界與比例；實際數值及 console/network 記錄見 JSON 證據。

本輪完成 commit 可用 `git log -1 --format=%H -- docs/evidence/round-01/README.md` 查得。不合併至 `main`、不推送或部署。
