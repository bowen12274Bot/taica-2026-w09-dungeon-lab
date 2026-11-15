# Dungeon Lab — 地下城技術實驗室

Dungeon Lab 是第九週作業使用的獨立地下城技術實驗室，以兩輪開發展示如何透過同一份 **AGENTS.md**，讓 AI 在明確規格與工程邊界內持續實作、測試並保存證據。

目前完成固定房間、像素騎士、自由移動、碰撞及四方向行走動畫。這是可展示的技術實驗，並非期末正式遊戲的完整架構。

- [公開遊玩 GitHub Pages](https://bowen12274bot.github.io/taica-2026-w09-dungeon-lab/)
- [GitHub 原始碼](https://github.com/bowen12274Bot/taica-2026-w09-dungeon-lab)
- [自動建置與部署](https://github.com/bowen12274Bot/taica-2026-w09-dungeon-lab/actions/workflows/pages.yml)

使用 **WASD 或方向鍵**移動。地圖固定顯示，牆壁、石塊及封閉門會阻擋角色；沒有戰鬥、開門或其他冒險系統。

## 第九週作業：規範、需求與工程分工

- **使用者與 ChatGPT**：規劃畫面、操作、行為、限制與驗收標準，交付定案的單輪需求。
- **AGENTS.md**：保存長期工程原則、技術邊界與交付紀律，不取代各輪功能需求。
- **Codex**：依定案需求與 AGENTS.md 實作、測試、記錄結果，不擅自新增玩法或改寫需求。
- **專案 Skills**：按需要讀取 [phaser-2d-game](.agents/skills/phaser-2d-game/SKILL.md) 的實作流程及 [game-playtest](.agents/skills/game-playtest/SKILL.md) 的驗證流程。

兩輪使用相同的 AGENTS.md 與上述兩份專案 Skills。原始規範、需求、素材及測試證據以 Git 與 SHA-256 保留，第二輪沿用第一輪成果。規範是否有效，透過實際修改與驗證記錄檢查，不以 AI 的完成宣告代替證據。

## 兩輪成果

| 實驗 | 成果 | 保留版本 |
| --- | --- | --- |
| Round 01 | 20 × 12 固定房間、16 px 圖塊、石牆／地板／兩組障礙／封閉雙門、中心世界座標與等比例縮放 | [`experiment/map`](https://github.com/bowen12274Bot/taica-2026-w09-dungeon-lab/tree/experiment/map)，`6ad3029` |
| Round 02 | 八方向連續移動、斜向等速、地形碰撞、沿牆滑動、四方向逐格行走與待機 | [`experiment/movement`](https://github.com/bowen12274Bot/taica-2026-w09-dungeon-lab/tree/experiment/movement)，`709cf59` |

第一輪 8 項單元測試通過；第二輪累計 12 項單元測試、58 項瀏覽器整合檢查通過，另驗證五種視窗尺寸及正式建置。兩輪完整紀錄分別保留於 [Round 01 證據](docs/evidence/round-01/README.md)與 [Round 02 證據](docs/evidence/round-02/README.md)。公開站點的驗收另外記錄於 [部署證據](docs/evidence/deployment/README.md)，不覆蓋原實驗紀錄。

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

目前頁面顯示灰藍石牆、暖灰棕石板、兩組 2 × 2 石製障礙與上方中央封閉雙門。格子邏輯尺寸為 16 × 16，房間共 320 × 192 世界像素，優先以 3×、2×、1× 顯示；小於原生尺寸時才等比例縮小。相機固定，使用 **WASD／方向鍵**以每秒 64 世界像素自由移動，斜向等速，牆壁、石塊及關門會阻擋角色，可沿牆滑動。

地圖資料位於 `src/map/room.ts`：格子索引從左上角起算，世界原點位於房間中心，提供通行查詢與格子／世界／繪製座標轉換。角色起點為格子 `(10, 9)`、世界座標 `(8, 56)`，支援浮點數與負座標。角色為原創 16 × 16 像素騎士，四方向各 3 個姿態，8 FPS 行走循環；10 × 8 腳部碰撞體中心對齊角色世界位置。動畫依碰撞後實際位移切換。

`npm run build` 先執行型別檢查，再輸出靜態檔案至 `dist/`。提交至 `main` 後，[Pages Workflow](.github/workflows/pages.yml) 使用 Node.js 24、`npm ci`、`npm test`、`npm run build`，通過後發布 `dist/`；亦可在 Actions 手動觸發。部署僅允許 `main`，實驗分支保留歷史快照。

保留 Vite `base: './'`：此單頁遊戲的 JS、CSS 與圖集皆使用相對路徑，適用 Pages 的 repository 子路徑；Phaser 包含於 JS，角色影格由程式產生紋理，不需要外部角色檔案。部署驗證包含公開資源回應及建置雜湊比對。

初始化驗證記錄見 [docs/evidence/setup.md](docs/evidence/setup.md)。完整 Phaser 引擎造成 Vite 的 500 kB chunk 大小提示；目前保留原提示，待實際功能與效能需求確定後再評估拆分。

## 範圍與素材

- 房間式地下城為主要探索形式。
- 俯視角格子（tile）構成地圖，格子不限制角色移動方式。
- 角色採自由、連續移動；第二輪已實作角色與地形碰撞。
- 未來事件可由玩家操作主動觸發，或依條件被動觸發；**本次兩輪尚未要求事件**。
- 純前端網頁遊戲，已透過 GitHub Pages 發布，無後端、資料庫或雲端 API。
- 地形使用 Kenney Tiny Dungeon，來源與原始授權見 [素材說明](public/assets/dungeon/README.md)；角色影格為[本專案原創](docs/art/knight.md)。

## 交接內容

- [AGENTS.md](AGENTS.md) — 專案層級 AI 開發規則。
- [phaser-2d-game Skill](.agents/skills/phaser-2d-game/SKILL.md) — 專案輕量自製的 Phaser 開發流程。
- [game-playtest Skill](.agents/skills/game-playtest/SKILL.md) — 專案輕量自製的遊戲驗收流程。
- [技術與素材工具清單](docs/TOOLS.md) — 版本、來源及驗證工具。
- [Round 01 需求](docs/requirements/round-01-map.md) — 使用者提供的第一輪正式規格。
- [Round 02 需求](docs/requirements/round-02-movement.md) — 使用者提供的第二輪正式規格。
- [工程證據索引](docs/evidence/README.md) — 初始化、兩輪實驗及公開部署紀錄。
- [HANDOFF_TO_CODEX.md](HANDOFF_TO_CODEX.md) — 原始交接時應做與不應做的事。

## 初始交接與目前範圍

原始 ZIP 僅包含工程文件與兩份空白需求。初始化成果保存於 commit `76d8a5f`。兩輪穩定成果與部署文件位於 `main`，兩個實驗分支已同步至公開 GitHub Repository。本次收尾未改寫原提交，也未更動遊戲功能。

`AGENTS.md` 與 `HANDOFF_TO_CODEX.md` 保留原始交接規範；其中「尚未初始化／需求空白」描述原始交接時點。目前工程狀態以本 README 與 `docs/TOOLS.md` 為準，各輪行為以使用者提供的正式需求為準。

## 後續流程

1. 使用者與 ChatGPT 規劃新一輪需求，明確列出包含／不包含範圍及驗收條件。
2. 提供非空、定案的需求文件並授權實作；需求未定案前只做明確授權的工程準備。
3. Codex 讀取 AGENTS.md、需求與相關 Skill，建立獨立實驗分支，以最小改動延伸既有成果。
4. 執行型別檢查、建置、單元與實際瀏覽器驗收，保存需求快照、輸出、截圖及 commit。
5. 經授權整合到 `main` 並推送，讓 Workflow 重新部署；再驗證公開網址。不得將本機成功視為遠端驗收完成。

成功實驗未來可以參考、移植至期末專案，但不保證沿用目前程式碼或架構。Firefox、Safari、實體手機仍未驗證；目前操作需要鍵盤。

請先閱讀 `HANDOFF_TO_CODEX.md` 與 `AGENTS.md`。
