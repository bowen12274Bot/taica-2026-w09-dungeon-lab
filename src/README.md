# 程式碼入口

`main.ts` 啟動 Phaser 與自適應顯示縮放；`style.css` 提供第一輪的深色版面。

- `map/room.ts`：固定地圖、地形語意、通行查詢、預留起點與座標換算，無 Phaser 依賴。
- `rendering/room-art.ts`：地形對應圖塊 frame 與著色；`S` 沿用一般地板樣式。
- `rendering/fit-room.ts`：以可用寬高計算顯示倍率，不改世界尺寸。
- `scenes/RoomScene.ts`：載入指定素材、逐格繪製與固定相機，不建立物理、人物或輸入控制。

世界範圍為 `[-160, 160) × [-96, 96)`；Phaser 繪製範圍為 `[0, 320) × [0, 192)`。`gridToWorld` 回傳格子中心，`worldToGrid` 對越界或非有限數值回傳 `undefined`。`isWalkable` 對越界格子回傳 `false`。第二輪可沿用這些函式，無須變更布局。
