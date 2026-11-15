# Round 02 — 角色自由移動與碰撞驗證

驗證日期：2026-11-15。使用者提供非空第二輪需求並明確授權「好，來做第二輪」；沿用先前「測試沒問題就 commit」的交付授權。

## 版本與規範

- 基礎：第一輪 `6ad3029`，保留於 `experiment/map`。
- 本輪分支：`experiment/movement`。本輪提交可用 `git log -1 --format="%H %s" -- docs/evidence/round-02/README.md` 取得，避免在 commit 內填入無法自我引用的 SHA。
- 第二輪需求為使用者原文，本輪未編輯產品規格；此前尚未提交的需求納入本輪規格快照。
- `AGENTS.md`、兩份專案 Skill、兩輪需求均與第一輪證據的 Hash 相符，沒有改寫工程規範。詳見 [input-hashes.json](input-hashes.json)。
- `src/map/room.ts`、地圖美術設定、縮放函式、CSS、原始 Kenney 圖集與授權、套件及 lockfile 皆保持原版本。
- 技術：TypeScript 7.0.2、Phaser 4.2.1、Vite 8.3.8；Windows、Node 24.21.0、npm 11.7.0。未新增依賴。
- 流程：`phaser-2d-game`、`game-playtest` 專案 Skill，及 `orca-cli` 的本機瀏覽器驗證流程。API 以已安裝 Phaser 原始碼及型別核對。

## 實作與主要檔案

| 檔案 | 用途 |
| --- | --- |
| `src/player/input.ts` | WASD／方向鍵，可混用、相反方向抵銷，捕捉移動鍵避免捲動 |
| `src/player/movement.ts` | 每秒 64 像素正規化向量；由實際位移決定面向及待機 |
| `src/player/Player.ts` | 角色狀態、Arcade 物理與動畫連接；失焦清除輸入 |
| `src/map/collision.ts` | 依既有可通行資料合併連續阻擋矩形，消除碰撞接縫 |
| `src/rendering/knight-art.ts` | 原創 16 × 16 四方向各三姿態像素資料 |
| `src/rendering/player-view.ts` | Canvas 紋理、8 FPS 逐格動畫、方向待機 |
| `src/scenes/RoomScene.ts` | 原場景局部增加碰撞體與玩家，原地圖繪製保持不變 |
| `src/main.ts` | 啟用鍵盤及 60 Hz 固定步長 Arcade Physics；匯出既有遊戲供開發驗證 |
| `index.html` | 實驗編號更新及新增一行操作說明，保留既有樣式與標題 |
| `tests/player.test.mjs` | 純邏輯、素材影格與碰撞覆蓋測試 |
| `tests/browser-round02.js`、`scripts/verify-browser.mjs` | 可重跑的實際瀏覽器整合驗證 |

沿用既有 `gridToWorld`、`worldToRender`、`renderToWorld`；角色狀態使用中心原點的浮點數世界座標，初始 `(8,56)`。Phaser 在左上角正座標空間模擬，再將碰撞體中心轉回世界座標。`10 × 8` 碰撞體與 Sprite 的 `(0.5,0.75)` 原點、`(3,8)` 偏移對齊，CSS 縮放不參與物理。

輸入在 `PRE_UPDATE` 設定速度，Arcade 分離碰撞後由 `WORLD_STEP` 實際位置更新狀態及動畫。完全推牆會待機；滑動時依仍在移動的方向播放。斜向相等位移優先垂直，使用微小浮點容差避免切換閃爍。

Tiny Dungeon 沒有完整四方向角色序列，因此使用需求允許的原創像素影格。不是將單張人物上下平移冒充動畫。詳細來源與畫法見 [角色美術紀錄](../../art/knight.md)，實際紋理見 [knight-sheet.png](knight-sheet.png)。

## 實際驗證結果

`npm.cmd test`：**12／12 通過**，包含第一輪原有 8 項及本輪新增 4 項。[原始測試輸出](tests.txt)。

`npm.cmd run build`：**型別檢查及正式建置通過**，exit 0。[原始建置輸出](build.txt)。仍有完整 Phaser 約 1.38 MB（gzip 約 361 kB）的既有 chunk 大小提示，無新增依賴或打包失敗。

瀏覽器使用 Orca 內嵌 Chromium；完整 userAgent 與每項實際數值保留於 JSON。鍵盤操作為派發 DOM KeyboardEvent，經實際 Phaser KeyboardPlugin、Arcade Physics、Sprite 動畫執行，沒有替換物理或輸入實作。定時測試暫停 RAF，透過 `game.step(time, delta)` 比較明確時間；另以正常 RAF 執行即時操作，避免只驗證人工步進。

| 驗收 | 已執行的結果 |
| --- | --- |
| T01–T04 | WASD 各方向 0.2 秒位移 12.8 世界像素，方向及動畫正確 |
| T05 | W+D 一秒總位移 64，斜向同速，面向上 |
| T06 | W+S、A+D 抵銷；另一軸輸入仍能移動 |
| T07 | 放開後位置不變，動畫停止；即時 RAF 亦通過 |
| T08 | 四面外牆阻擋，持續推牆三秒無穿越，最後待機 |
| T09 | 兩組石塊的四面皆阻擋；每一步檢查碰撞體不重疊 |
| T10 | 垂直及水平沿牆滑動；動畫依實際滑動軸切換 |
| T11 | 兩扇封閉門分別阻擋 |
| T12–T13 | 連續移動跨過世界原點，產生負 X、負 Y |
| T14 | 上下左右各實際播放三個不同影格，8 FPS 無限循環 |
| T15 | 各方向停止後保留面向並顯示待機格 |
| T16 | 1440×1000、1024×768、390×844、320×640、844×390，世界座標及碰撞尺寸不變；每種尺寸重跑右牆碰撞 |
| T17 | 重新載入回到 `(8,56)`、朝下、待機，只有一張遊戲 Canvas |

額外檢查包括方向鍵及混合輸入、四個斜向、30／60／120 FPS 同時間位移皆為 64、四個房間角落持續推三秒後可離開、兩組石塊所有角落斜向靠近、失焦停止。定時整合測試共 **58 項通過**，每一步驗證身體尺寸、Sprite／世界座標一致與不穿入阻擋矩形。詳見 [gameplay-checks.json](gameplay-checks.json)。

正常 RAF 測試按 D 約 505.7 ms：X 由 8 到 41.0667；放開後再等 160 ms 位置相同。期間實際出現右向影格 9、10、11，停止後無播放。縮放、重新載入、console 與請求記錄見 [browser-checks.json](browser-checks.json)。

正式建置在本機 `vite preview` 載入成功，實際按 D 前後截圖確認角色向右移動並改為右向姿態，沒有 console error 或失敗請求。[preview-checks.json](preview-checks.json)。此項為打包後載入與移動煙霧測試，完整 T01–T17 在開發頁執行。

### 測試找到並修正的問題

首次滑牆測試發現每個牆格獨立建立 Arcade body 會在接縫將玩家擋住（預期滑到 Y≈2.745，實際 Y=52）。修正為合併連續阻擋格的矩形；新增單元測試證明仍精確覆蓋原有 68 個阻擋格且不覆蓋地板。修正後全部整合測試通過。

### 真實畫面

- [初始玩家與完整房間](spawn.png)
- [桌面移動後](desktop.png)、[中型視窗](compact.png)
- [390 px 視窗](narrow.png)、[320 px 視窗](small.png)、[低高度橫向視窗](landscape.png)
- [正式建置初始狀態](preview-spawn.png)、[正式建置移動後](preview-moved.png)

截圖直接取自 Orca，未重繪。已視覺檢查房間、角色、像素銳利度與窄視窗布局；角色紋理為實際 Phaser Canvas texture 匯出。

## 重跑方式

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run dev
# 在 Orca 開啟開發網址，使用該分頁 ID；最後一個參數為本機 Orca 執行檔。
node scripts/verify-browser.mjs PAGE_ID ORCA_EXECUTABLE
```

瀏覽器腳本會重新載入該開發分頁、重寫本輪瀏覽器測試 JSON 與截圖，結束恢復初始角色。它只匯入頁面實際 `<script>` 的 Vite URL，包含 HMR 時間戳，避免重複建立遊戲。正式建置煙霧測試與紋理匯出為另外實際執行並記錄的操作。

## 未驗證與範圍限制

未在 Firefox、Safari、實體手機或實體鍵盤人工遊玩；小尺寸測試使用桌面瀏覽器 viewport，沒有加入觸控控制。低於原生地圖尺寸時依第一輪規則縮小，角色會較小；844×390 保留既有頁面最小高度所需的少量垂直捲動。未進行長時間壓力測試或遠端部署。

本輪要求的功能與列出的測試已完成；沒有加入戰鬥、互動、開門、多房間或存檔。只做本機提交，沒有合併、推送或發布。
