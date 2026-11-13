# Dungeon Lab — 地下城技術實驗室

> 狀態：第九週作業的 **空白工程已初始化**。可啟動 Phaser 空白畫布；兩輪需求仍未定案，尚無遊戲功能，也尚未部署。

## 本機開發

已鎖定 TypeScript `7.0.2`、Phaser `4.2.1`、Vite `8.3.8`，並提交 `package-lock.json`。本次驗證環境為 Windows、Node.js `24.21.0`、npm `11.7.0`；Node.js 需求見 `package.json`。

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm run preview
```

開發伺服器預設為 `http://127.0.0.1:5173`，建置預覽預設為 `http://127.0.0.1:4173`；實際位址以終端輸出為準。若 PowerShell 阻擋 `npm.ps1`，請將指令中的 `npm` 改成 `npm.cmd`。

目前頁面只有初始化狀態文字及空白 Phaser 畫布。畫布尺寸 `640 × 360` 僅供工程啟動檢查，不是正式遊戲規格。`npm run build` 先執行型別檢查，再輸出靜態檔案至 `dist/`；相對資產路徑已設定，尚未建立任何部署流程。

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
- 美術方向為基本像素風格（牆壁、地板、人物），預定研究 Kenney Tiny Dungeon；目前未附素材。

## 交接內容

- `AGENTS.md` — 專案層級 AI 開發規則。
- `.agents/skills/phaser-2d-game/SKILL.md` — 專案輕量自製的 Phaser 開發 Skill。
- `.agents/skills/game-playtest/SKILL.md` — 專案輕量自製的遊戲驗收 Skill。
- `docs/TOOLS.md` — 技術與素材來源及其待定事項。
- `docs/requirements/round-01-map.md` — **0 bytes、空白，待 ChatGPT 與使用者討論後填入**。
- `docs/requirements/round-02-movement.md` — **0 bytes、空白，待 ChatGPT 與使用者討論後填入**。
- `docs/evidence/README.md` — 未來保存兩輪工程證據的方法。
- `HANDOFF_TO_CODEX.md` — Codex 接收時應做與不應做的事。

## 初始交接與目前範圍

原始 ZIP 僅包含工程文件與兩份空白需求。接收後，使用者另外授權建立本機 Git、初始化 TypeScript + Phaser + Vite、測試並提交。本次準備已加入套件設定、lockfile、空白入口及驗證記錄；沒有地圖、角色、美術資產或其他遊戲功能，也未建立 GitHub 遠端儲存庫。

`AGENTS.md` 與 `HANDOFF_TO_CODEX.md` 保留原始交接規範；其中「尚未初始化」描述原始交接時點，後續工具狀態以本 README 與 `docs/TOOLS.md` 為準。功能開發仍須等待核准的非空需求文件。

## 後續流程

1. 由 ChatGPT 與使用者討論並定案第一輪需求文件。
2. 將定案文件交給 Codex，按照既有 AGENTS.md 在已初始化的工程上實作第一輪。
3. 保留第一輪實驗證據和 Git Commit。
4. 第二輪需求定案後，使用新的 Codex 工作階段執行，保留第二輪證據。
5. 完成網站部署與作業說明。

請先閱讀 `HANDOFF_TO_CODEX.md` 與 `AGENTS.md`。
