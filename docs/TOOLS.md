# 技術、Skills 與美術工具清單（交接版）

> 本檔原為交接工具清單。使用者後續授權工程初始化；下表已依實際安裝結果更新。版本以 `package.json`、`package-lock.json` 為準。

## 前端遊戲技術

| 項目 | 狀態 | 用途 | 參考 |
| --- | --- | --- | --- |
| TypeScript | 已安裝、鎖定 7.0.2 | 遊戲規則與專案型別 | https://www.typescriptlang.org/ |
| Phaser | 已安裝、鎖定 4.2.1 | 固定房間、Arcade Physics、鍵盤控制及逐格動畫 | https://docs.phaser.io/ |
| Vite | 已安裝、鎖定 8.3.8 | 開發伺服器、靜態建置 | https://vite.dev/ |
| GitHub Pages | 已啟用 GitHub Actions 部署 | 第九週公開遊戲網站 | https://docs.github.com/en/pages |
| Playwright | 選用、未安裝 | 瀏覽器 QA 與可重現操作 | https://playwright.dev/ |

初始化版本取自 npm registry 的穩定標籤；Vite 的 Node.js 要求為 `^20.19.0 || >=22.12.0`，本機 `24.21.0` 符合。Phaser 已內含 TypeScript 型別，未另裝 `@types/phaser`。依據：[Vite 官方指南](https://vite.dev/guide/)、[Phaser 安裝文件](https://docs.phaser.io/phaser/getting-started/installation)。

本次瀏覽器驗證使用已提供的 Orca CLI 內嵌瀏覽器，未額外安裝 Playwright。實際驗證與限制見 [evidence/setup.md](evidence/setup.md)。

第一輪新增 Node.js 內建測試，直接載入純資料 `.ts` 模組，Node.js 支援範圍調整為 `^22.18.0 || >=24.0.0`，依據 [Node.js TypeScript 文件](https://nodejs.org/api/typescript.html)。本機版本及既有三個套件版本未變，未新增依賴。第一輪驗證見 [evidence/round-01/README.md](evidence/round-01/README.md)。

選用 Phaser 穩定版本時，先確認其現有 API、TypeScript 支援與套件相容性。不要混用不同大版本的 Skill/API。

## 專案內 Skills

- `.agents/skills/phaser-2d-game/SKILL.md`：本專案撰寫的精簡 Phaser 實作程序。
- `.agents/skills/game-playtest/SKILL.md`：本專案撰寫的精簡網頁遊戲驗收程序。

這兩份是針對 Dungeon Lab 的**本地原創輕量版本**；與 OpenAI Game Studio 同名、用途相近，但**沒有直接複製原版**，避免帶入原版尚未打包的交叉參考與多餘範圍。後續需要時可另外評估是否安裝原版及其依賴參考文件：

- https://github.com/openai/plugins/blob/main/plugins/game-studio/skills/phaser-2d-game/SKILL.md
- https://github.com/openai/plugins/blob/main/plugins/game-studio/skills/game-playtest/SKILL.md

## 基本美術（第一輪已取得）

建議素材：**Kenney Tiny Dungeon**，原始圖塊 16 × 16、CC0 授權，可研究地板、牆壁、角色 Sprite。

- 官方素材頁：https://kenney.nl/assets/tiny-dungeon
- 備用發行頁：https://kenney-assets.itch.io/tiny-dungeon

已從 Kenney 官方 itch.io 發行頁下載 Tiny Dungeon 1.0，保留原始 packed 圖集與 License.txt。使用地形及閉門圖塊。第二輪確認圖集缺少同一角色完整四方向行走序列，依規格採用原創像素影格，詳見[角色美術紀錄](art/knight.md)。來源、圖塊索引及美術處理見 [素材說明](../public/assets/dungeon/README.md)。

第二輪沿用所有套件版本，未新增依賴。以 Node 內建測試驗證純邏輯，以 Orca CLI 在實際 Phaser 瀏覽器實例執行按鍵、物理步進、即時移動、縮放及畫面檢查；測試腳本為 `scripts/verify-browser.mjs` 與 `tests/browser-round02.js`。證據及執行方式見 [第二輪記錄](evidence/round-02/README.md)。

公開交付使用 `.github/workflows/pages.yml`，在 Node.js 24 上執行 `npm ci`、測試及建置後發布 `dist/`。公開網站先以 Orca 檢查；為避免原生視窗失焦造成節流，完整操作驗收改用已安裝 Chrome 的無頭模式與原生 DevTools Protocol，未新增 npm 依賴。`scripts/verify-pages.mjs` 直接讀取公開網站畫布像素，驗證鍵盤、動畫、位移、碰撞與縮放，詳見[部署記錄](evidence/deployment/README.md)。

## 選型的非目標

暫不導入後端、資料庫、多人同步、LLM API、特定 MCP 或複雜 CI/CD。若正式需求有必要，再由 ChatGPT 與使用者決定。
