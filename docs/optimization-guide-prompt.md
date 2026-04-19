# Optimization Guide — Example Prompts

> Copy one of these prompts, paste `optimization-guide.md` as context first, then send.
> Format: `[context: optimization-guide.md] + [your prompt below]`

---

## Short Prompts *(for when you write fast)*

### Short 1 — After a random run, what next?
```
chạy random 150 cycles, 4 params, kết quả CSV 147 rows (3 lỗi).
total combinations ~2400. top result Net Profit 18.3%.
làm gì tiếp?
```

---

### Short 2 — Pick a method
```
6 params. params có phụ thuộc nhau — ví dụ: best take profit thay đổi
tùy theo stop loss đang là bao nhiêu. dùng method nào? bao nhiêu cycles?
```

> **Giải thích "params phụ thuộc nhau":**
> Về lý thuyết, tất cả params đều "phụ thuộc" vì đều ảnh hưởng cùng một objective.
> Điều quan trọng thực tế là **mức độ coupling mạnh hay yếu**:
>
> - **Coupling mạnh** → dùng `annealing`: logic chiến lược ràng buộc trực tiếp giữa 2 params.
>   Ví dụ: `ema_fast` phải < `ema_slow` (gap mới quan trọng, không phải giá trị tuyệt đối);
>   `stop_loss` & `take_profit` (thay đổi SL → ratio tối ưu của TP thay đổi theo).
>
> - **Coupling yếu** → `sequential` ổn: cùng ảnh hưởng profit nhưng không ràng buộc nhau về logic.
>   Ví dụ: `rsi_period` & `bb_deviation` — fix RSI ở bất kỳ giá trị nào, BB deviation tối ưu vẫn gần như không đổi.
>
> Câu hỏi thực tế: *"Nếu fix param A ở mức trung bình, optimal của B có bị lệch nhiều không?"*
> Nếu có → coupling mạnh → `annealing`. Nếu không → `sequential` đủ.

---

### Short 3 — Analyze and recommend *(paste your top rows inline)*
```
phân tích giúp tôi, đề xuất round 2.

metric tối ưu: Net Profit (maximize)
total tested: 200 / tổng ~3000 combinations
filter: Total Trades >= 20

top 10 rows (Net Profit, param_fast, param_slow, param_atr, param_mult):
18.3,  8, 21, 14, 2.5
17.9,  9, 21, 14, 2.0
17.1,  8, 20, 14, 2.5
16.8, 10, 22, 13, 2.5
16.2,  8, 21, 13, 2.0
15.9,  7, 21, 14, 3.0
15.5,  9, 20, 14, 2.5
15.1,  8, 22, 15, 2.0
14.8,  8, 21, 12, 2.5
14.3, 10, 20, 14, 2.0

range gốc: fast 5–15 step 1, slow 15–30 step 1, atr 10–20 step 1, mult 1.0–4.0 step 0.5
```

---

## Long Prompts *(more context = more precise recommendation)*

### Long 1 — First run, no data yet
```
tôi đang optimize chiến lược EMA crossover + ATR trailing stop trên BTCUSDT 4H.

params cần optimize:
- ema_fast: hiện tại 9, range 5–20, step 1 → 16 giá trị
- ema_slow: hiện tại 21, range 15–40, step 1 → 26 giá trị
- atr_period: hiện tại 14, range 10–20, step 1 → 11 giá trị
- atr_mult: hiện tại 2.0, range 1.0–4.0, step 0.5 → 7 giá trị

total combinations: 16×26×11×7 = 32,032

metric: Net Profit (maximize)
filter: Total Closed Trades >= 30

chưa chạy lần nào. thời gian mỗi cycle khoảng 3 giây.
budget: khoảng 30 phút.

đề xuất method, cycles, và có cần điều chỉnh range không?
```

---

### Long 2 — Have partial data, want analysis + round 2
```
tôi đã chạy random improvement 300 cycles trên chiến lược RSI + Bollinger Band.

thông tin:
- metric: Sharpe Ratio (maximize)
- filter: Total Trades >= 25, bị filter 41 rows
- total tested: 259 rows hợp lệ
- total combinations: ~1800

params và range gốc:
- rsi_period: 10–20, step 1 (11 giá trị)
- rsi_ob: 65–80, step 5 (4 giá trị)
- rsi_os: 20–35, step 5 (4 giá trị)
- bb_period: 15–25, step 1 (11 giá trị)
- bb_dev: 1.5–3.0, step 0.5 (4 giá trị)

top 15 rows (Sharpe, rsi_period, rsi_ob, rsi_os, bb_period, bb_dev):
1.82, 14, 70, 30, 20, 2.0
1.79, 13, 70, 25, 20, 2.0
1.75, 14, 70, 30, 21, 2.0
1.71, 15, 70, 30, 20, 2.5
1.68, 14, 75, 30, 20, 2.0
1.65, 13, 70, 30, 20, 2.5
1.61, 14, 70, 25, 19, 2.0
1.59, 14, 70, 30, 20, 1.5
1.55, 15, 75, 30, 21, 2.0
1.52, 12, 70, 30, 20, 2.0
1.48, 14, 70, 35, 20, 2.0
1.44, 16, 70, 30, 20, 2.0
1.41, 14, 65, 30, 20, 2.0
1.38, 13, 75, 25, 22, 2.5
1.35, 14, 70, 30, 18, 2.0

phân tích hot zones, đánh giá coverage, và đề xuất round 2 cụ thể:
method, range mới từng param, cycles, paramPriority.
```

---

### Long 3 — Multi-round history, want final plan
```
context: chiến lược MACD + supertrend, ETHUSDT 1H, đã qua 2 vòng test.

round 1 (random, 200 cycles):
- xác định hot zone: macd_fast 10–14, macd_slow 24–28, signal 8–10, st_period 8–12, st_mult 2.5–3.5

round 2 (sequential trong hot zone, 180 cycles):
- best: Net Profit 24.7%, params = {fast:12, slow:26, signal:9, st_period:10, st_mult:3.0}
- total combinations trong hot zone: 5×5×3×5×3 = 1125, đã duyệt hết

vấn đề hiện tại:
- backtest tốt nhưng forward test (1 tháng gần nhất) chỉ đạt 8%
- nghi overfitting vì số lệnh backtest chỉ 47 lệnh / 3 năm dữ liệu

câu hỏi:
1. filter tối thiểu trades nên đặt bao nhiêu để giảm overfit?
2. nên mở rộng range lại và chạy thêm hay thay đổi approach?
3. có nên bỏ bớt param nào không?
```
