# Codex 交接說明 — 讀我開始

## 交接目的

接收 Dungeon Lab 的初始工程規範與兩個輕量 Skill。**這個 ZIP 目前不是遊戲實作任務**：不要因為文件提到地圖/移動，就自行寫出功能。

## 目前已提供

- `AGENTS.md` — 項目邊界、忠實實作、工具、驗證與 Git 規範。
- `.agents/skills/` — `phaser-2d-game`、`game-playtest` 本地輕量 Skill。
- `docs/TOOLS.md` — 技術決策、官方參考、美術素材來源。
- `docs/requirements/round-01-map.md` 和 `round-02-movement.md` — **刻意保持 0 bytes 的空檔**。

## 接收後的第一步

1. 閱讀 `README.md`、`AGENTS.md`、`docs/TOOLS.md` 及兩個 Skill。
2. 確認兩份 `round-XX-*.md` 都是空白，**不要填寫**。
3. 簡短回報：目前工程規範、尚未開始的功能、工具/依賴是否已安裝；沒有實際檢測就不要宣稱已安裝。
4. **停止**，等待使用者後續提供第一輪定案需求；如果使用者另外授權工程初始化，僅執行被授權的初始化內容。

## 兩輪未來任務（尚未授權實作）

- Round 1：房間式地下城地圖（需求細節待定）。
- Round 2：在第一輪成果上加入角色自由移動（需求細節待定）。

每輪都由使用者與 ChatGPT 在外部討論產生正式需求，再交給 Codex 執行。Codex 不主導功能設計，不擅自擴寫需求。

## 交接用首條指令（可直接複製到 Codex）

> 請先閱讀 `HANDOFF_TO_CODEX.md`、`AGENTS.md`、`docs/TOOLS.md` 和 `.agents/skills/` 下的兩份 SKILL.md，檢查本次交接內容是否一致。兩份需求檔故意留白，請不要寫入，也不要開始地圖、移動、素材或網站功能的實作。先回報你理解的規範、可用工具與仍待決定的事項；等我提供第一輪正式需求後再實作。
