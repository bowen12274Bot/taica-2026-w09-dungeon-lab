# Kenney Tiny Dungeon

來源為 Kenney 的 **Tiny Dungeon 1.0**，CC0 授權；原始授權全文保留於 [License.txt](License.txt)。

- 官方素材頁：https://kenney.nl/assets/tiny-dungeon
- 實際下載頁：https://kenney-assets.itch.io/tiny-dungeon
- 下載日期：2026-11-15；原始 ZIP：`kenney_tinyDungeon.zip`。
- 主站 ZIP 連結重導後回傳 403，因此使用同一作者的官方 itch.io 免費發行頁；未改用其他素材包。
- `tilemap_packed.png` 原樣取自 ZIP 的 `Tilemap/tilemap_packed.png`，尺寸 192 × 176，每格 16 × 16，共 12 欄、11 列，無間距。

本輪圖塊索引皆為零起始，定義於 `src/rendering/room-art.ts`：

| 用途 | Frame | 處理方式 |
| --- | --- | --- |
| 石板地面 | 48、49 | 原始地面圖塊以 Phaser tint 調成暖灰棕，少量固定位置使用風化紋理；1 px 接縫由場景繪製。 |
| 灰藍石牆 | 14 | 保持原色，邊緣加上格內高光與暗邊。 |
| 石製障礙 | 40 | 四個相連圖塊組成每組 2 × 2 石塊，外緣加上格內高光與暗邊。 |
| 封閉雙門 | 46、47 | 使用原始左右閉門圖塊，無動畫或互動。 |

PNG 本身未修改、未生成新素材。所有著色及邊緣只影響外觀，不決定通行性。圖集中雖包含人物與物品，本輪未使用這些 frame。
