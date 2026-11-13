---
name: phaser-2d-game
description: Lightweight project Phaser/TypeScript/Vite implementation workflow for an approved 2D dungeon experiment. Use when Codex is implementing or changing approved dungeon map, sprite, movement, or collision features. Do not invoke to invent game features before a requirements document is approved.
---

# Phaser 2D Game — Dungeon Lab 輕量版

> 本檔是針對 Dungeon Lab 自行編寫的**精簡專案 Skill**，並非 OpenAI Game Studio 原始 Skill 的逐字副本。原始參考連結見 `docs/TOOLS.md`。

## 啟用條件

只在已取得使用者核准的**非空實驗規格**、且涉及 Phaser 遊戲實作時使用。沒有規格時只可核對工具準備情況，不得開始實作。

## 工作程序

1. 從本輪規格提取可觀察的輸入、輸出、畫面、控制、碰撞以及禁止功能。
2. 檢查現有專案 Phaser/Vite/TypeScript 版本與程式結構；以現有環境為主，不自動升級或重構。
3. 使用 Phaser scene 呈現地圖及 Sprite；規則資料與視覺物件儘量分離，但避免過度抽象。
4. 如果本輪需要 tile map，將地形的格子資料與像素座標轉換明確區分；人物自由移動應以連續位置表示，不強迫逐格。
5. 地板、牆壁、人物美術使用規格允許的素材；確認大小、縮放、載入路徑、像素銳利度與碰撞區一致。
6. 只實作規格要求的功能。遇到與規格衝突的 API/素材限制，回報具體阻礙，不擅自代換遊戲行為。
7. 完成後執行 build/typecheck（若專案已配置）與適當的運行檢查，再交給 `game-playtest` 驗證操作。

## 一般工程限制

- 不新增未經授權的戰鬥、敵人、房間切換、迷霧、隨機生成或事件系統。
- 不把遊戲狀態只藏在畫面 Sprite，除非是純視覺狀態。
- 不複製整份遊戲框架來解決一個小功能。
- 版本差異以本專案安裝的 Phaser 文件與型別為準。
- 不假裝外部素材、測試工具或程式碼已經存在。

## 參考

Phaser： https://docs.phaser.io/
原始 Game Studio 對應 Skill： https://github.com/openai/plugins/blob/main/plugins/game-studio/skills/phaser-2d-game/SKILL.md
