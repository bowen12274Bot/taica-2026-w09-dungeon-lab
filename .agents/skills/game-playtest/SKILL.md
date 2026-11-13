---
name: game-playtest
description: Lightweight browser-game acceptance and evidence workflow for Dungeon Lab. Use after an approved implementation or when asked to verify gameplay, UI, movement, collision, browser behavior, screenshots, or tests. Do not claim tests ran without evidence.
---

# Game Playtest — Dungeon Lab 輕量版

> 本檔是針對 Dungeon Lab 自行編寫的**精簡專案 Skill**，並非 OpenAI Game Studio 原始 Skill 的逐字副本。原始參考連結見 `docs/TOOLS.md`。

## 目標

將當輪定案需求中的驗收條件轉換為可檢查的結果，為第九週的兩輪工程留下真實證據。

## 測試步驟

1. 確認遊戲能建置、在本機瀏覽器載入（實際指令以該輪建立的專案為準）。
2. 逐條執行**當輪需求**規定的操作，不自行加上沒有要求的玩法檢查。
3. 檢查 Phaser 畫布中的圖塊與 Sprite 是否正常呈現；DOM 檢查不足以驗證 Canvas 畫面。
4. 需要時使用專案中已可用的 Playwright 或等效工具；若沒有工具，使用可行的人工測試與截圖方式並明確標明限制。
5. 記錄測試環境、測試動作、預期行為、實際結果與通過/失敗/未驗證。
6. 如果能產生截圖，保存關鍵畫面於 `docs/evidence/round-XX/`；不製造虛假截圖或缺少的操作紀錄。
7. 回報阻礙與重現步驟；若未能完成瀏覽器測試，不得只憑 build 成功就宣稱全部驗收通過。

## 兩輪建議檢查方向（仍以正式規格為準）

- Round 1：頁面能開啟、地板與牆壁讀取正確、格子邊界清楚、沒有不預期的遮擋。
- Round 2：角色位置連續變化、輸入操作有效、不能穿越牆壁或離開允許區域、既有地圖未退化。

## 證據規則

- 每項結果應可追溯到實際執行或真實截圖。
- 沒有 Git Commit 時不得創造 SHA；沒有部署時不得宣稱公開網址可用。

## 參考

Playwright： https://playwright.dev/
原始 Game Studio 對應 Skill： https://github.com/openai/plugins/blob/main/plugins/game-studio/skills/game-playtest/SKILL.md
