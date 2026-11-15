# Dungeon Lab — 地下城技術實驗室

> 狀態：**Experiment 01 — 地下城房間測試**。依第一輪規格呈現固定 20 × 12 房間；第二輪角色移動尚未實作，尚未部署。

## 本機開發

已鎖定 TypeScript `7.0.2`、Phaser `4.2.1`、Vite `8.3.8`，並提交 `package-lock.json`。驗證環境為 Windows、Node.js `24.21.0`、npm `11.7.0`。請使用 Node.js 22 系列的 `22.18.0` 以上版本，或 Node.js `24` 以上，讓內建測試執行器可直接載入純 TypeScript 資料模組；沒有新增測試套件。

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

開發伺服器預設為 `http://127.0.0.1:5173`，建置預覽預設為 `http://127.0.0.1:4173`；實際位址以終端輸出為準。若 PowerShell 阻擋 `npm.ps1`，請將指令中的 `npm` 改成 `npm.cmd`。

目前頁面顯示灰藍石牆、暖灰棕石板、兩組 2 × 2 石製障礙與上方中央封閉雙門。格子邏輯尺寸為 16 × 16，房間共 320 × 192 世界像素，優先以 3×、2×、1× 顯示；小於原生尺寸時才等比例縮小。相機固定，沒有角色、控制鍵、碰撞運動或互動。

地圖資料位於 `src/map/room.ts`：格子索引從左上角起算，世界原點位於房間中心，提供通行查詢與格子／世界／繪製座標轉換。預留起點為格子 `(10, 9)`、世界座標 `(8, 56)`，畫面顯示一般地板。

`npm run build` 先執行型別檢查，再輸出靜態檔案至 `dist/`；素材透過 Vite 的 base 路徑載入，尚未建立部署流程。測試與截圖見 [第一輪驗證記錄](docs/evidence/round-01/README.md)。

初始化驗證記錄見 [docs/evidence/setup.md](docs/evidence/setup.md)。完整 Phaser 引擎造成 Vite 的 500 kB chunk 大小提示；目前保留原提示，待實際功能與效能需求確定後再評估拆分。

## 目的

Dungeon Lab 是獨立於期末《無限地下城冒險》正式專案的實驗環境。使用者先在 ChatGPT 完整規劃單次實驗，再將已核准的需求交給 Codex；Codex 必須依 `AGENTS.md`、專案 Skills 與該輪需求忠實實現，不以自主創作取代需求。

實驗成功後可以參考、移植至期末專案，但 **不保證沿用程式碼或原本架構**。

## 已確認的遊戲方向（不是首輪具體需求）

- 房間式地下城為主要探索形式。
- 俯視角格子（tile）構成地圖，格子不限制角色移動方式。
- 角色採自由、連續移動；第二輪預計驗證角色與牆壁的碰撞。
- 未來事件可由玩家操作主動觸發，或依條件被動觸發；**本次兩輪尚未要求事件**。
- 現階段為純前端網頁遊戲，目標可部署在 GitHub Pages。
- 美術使用 Kenney Tiny Dungeon，來源與原始授權見 [素材說明](public/assets/dungeon/README.md)。

## 交接內容

- `AGENTS.md` — 專案層級 AI 開發規則。
- `.agents/skills/phaser-2d-game/SKILL.md` — 專案輕量自製的 Phaser 開發 Skill。
- `.agents/skills/game-playtest/SKILL.md` — 專案輕量自製的遊戲驗收 Skill。
- `docs/TOOLS.md` — 技術與素材來源及其待定事項。
- `docs/requirements/round-01-map.md` — 使用者提供的第一輪正式規格，本輪實作依據。
- `docs/requirements/round-02-movement.md` — 使用者提供的第二輪規格，尚未開始實作。
- `docs/evidence/README.md` — 未來保存兩輪工程證據的方法。
- `HANDOFF_TO_CODEX.md` — Codex 接收時應做與不應做的事。

## 初始交接與目前範圍

原始 ZIP 僅包含工程文件與兩份空白需求。初始化成果保存於 commit `76d8a5f`。使用者後續提供兩輪需求，並授權先做第一輪；本輪於 `experiment/map` 實作固定房間，不包含第二輪角色功能，也未建立 GitHub 遠端儲存庫。

`AGENTS.md` 與 `HANDOFF_TO_CODEX.md` 保留原始交接規範；其中「尚未初始化／需求空白」描述原始交接時點。目前工程狀態以本 README 與 `docs/TOOLS.md` 為準，各輪行為以使用者提供的正式需求為準。

## 後續流程

1. 檢視第一輪成果與驗證記錄。
2. 第二輪獲授權後，沿用房間資料、素材及座標轉換加入角色移動。
3. 另行授權分支合併、遠端推送與網站部署。

請先閱讀 `HANDOFF_TO_CODEX.md` 與 `AGENTS.md`。
