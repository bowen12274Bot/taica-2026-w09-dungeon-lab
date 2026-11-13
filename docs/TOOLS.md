# 技術、Skills 與美術工具清單（交接版）

> 本檔原為交接工具清單。使用者後續授權工程初始化；下表已依實際安裝結果更新。版本以 `package.json`、`package-lock.json` 為準。

## 前端遊戲技術

| 項目 | 狀態 | 用途 | 參考 |
| --- | --- | --- | --- |
| TypeScript | 已安裝、鎖定 7.0.2 | 遊戲規則與專案型別 | https://www.typescriptlang.org/ |
| Phaser | 已安裝、鎖定 4.2.1 | 目前僅驗證空白引擎啟動 | https://docs.phaser.io/ |
| Vite | 已安裝、鎖定 8.3.8 | 開發伺服器、靜態建置 | https://vite.dev/ |
| GitHub Pages | 預計部署、未啟用 | 第九週公開網頁 | https://docs.github.com/en/pages |
| Playwright | 選用、未安裝 | 瀏覽器 QA 與可重現操作 | https://playwright.dev/ |

初始化版本取自 npm registry 的穩定標籤；Vite 的 Node.js 要求為 `^20.19.0 || >=22.12.0`，本機 `24.21.0` 符合。Phaser 已內含 TypeScript 型別，未另裝 `@types/phaser`。依據：[Vite 官方指南](https://vite.dev/guide/)、[Phaser 安裝文件](https://docs.phaser.io/phaser/getting-started/installation)。

本次瀏覽器驗證使用已提供的 Orca CLI 內嵌瀏覽器，未額外安裝 Playwright。實際驗證與限制見 [evidence/setup.md](evidence/setup.md)。

選用 Phaser 穩定版本時，先確認其現有 API、TypeScript 支援與套件相容性。不要混用不同大版本的 Skill/API。

## 專案內 Skills

- `.agents/skills/phaser-2d-game/SKILL.md`：本專案撰寫的精簡 Phaser 實作程序。
- `.agents/skills/game-playtest/SKILL.md`：本專案撰寫的精簡網頁遊戲驗收程序。

這兩份是針對 Dungeon Lab 的**本地原創輕量版本**；與 OpenAI Game Studio 同名、用途相近，但**沒有直接複製原版**，避免帶入原版尚未打包的交叉參考與多餘範圍。後續需要時可另外評估是否安裝原版及其依賴參考文件：

- https://github.com/openai/plugins/blob/main/plugins/game-studio/skills/phaser-2d-game/SKILL.md
- https://github.com/openai/plugins/blob/main/plugins/game-studio/skills/game-playtest/SKILL.md

## 基本美術（尚未下載）

建議素材：**Kenney Tiny Dungeon**，原始圖塊 16 × 16、CC0 授權，可研究地板、牆壁、角色 Sprite。

- 官方素材頁：https://kenney.nl/assets/tiny-dungeon
- 備用發行頁：https://kenney-assets.itch.io/tiny-dungeon

目前無任何素材圖片。第一輪需求定案後再依具體地圖樣式選用素材，第二輪再選擇人物 Sprite。保留來源與授權資訊；不要虛稱已包含美術。

## 選型的非目標

暫不導入後端、資料庫、多人同步、LLM API、特定 MCP 或複雜 CI/CD。若正式需求有必要，再由 ChatGPT 與使用者決定。
