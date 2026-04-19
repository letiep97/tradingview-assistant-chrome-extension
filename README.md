# Tradingview Assistant

> 🇬🇧 [English version](README.en.md)

Tiện ích mở rộng Chrome hỗ trợ **backtest chiến lược giao dịch** và kiểm tra (hiển thị) tín hiệu bên ngoài trên Tradingview.

Cài đặt từ [Chrome Web Store](https://chrome.google.com/webstore/detail/tradingview-assistant/pfbdfjaonemppanfnlmliafffahlohfg)

[Xem video hướng dẫn trên YouTube](https://youtu.be/xhnlSCIlEkw)

Video [cách cài đặt tiện ích](https://www.youtube.com/watch?v=FH7dI4K8w5k)

## Cảnh báo
**Chú ý!**

Sử dụng tiện ích nhiều có thể bị TradingView phát hiện là dùng bot để backtesting và dẫn đến **khóa tài khoản**.

Tiện ích không phải bot (không hoạt động độc lập trên cloud). Mục tiêu là hỗ trợ cộng đồng Tradingview có thêm công cụ mà TV chưa cung cấp. Tiện ích không gọi TV API, không can thiệp truyền dữ liệu, không lưu/gửi dữ liệu tài chính — chỉ tự động hóa thao tác UI.

Mọi rủi ro thuộc về người dùng.

> TradingView nghiêm cấm mọi phương pháp thu thập dữ liệu tự động bao gồm scripts, APIs, screen scraping, robots, v.v.

Hầu hết trường hợp bị khóa là do dùng tiện ích liên tục trên nhiều tab/trình duyệt với cùng một tài khoản và IP.

**Miễn trách nhiệm:** Nhà phát triển không chịu trách nhiệm về hậu quả phát sinh khi sử dụng tiện ích.

## Khuyến nghị

Nguyên tắc chung: chiến lược càng nhiều tham số và được chọn càng chính xác thì càng bị overfit vào điều kiện thị trường cụ thể — lúc đó nó không còn là chiến lược giao dịch nữa mà trở thành bộ lọc.

**Khuyến nghị chính:** Tập trung vào 2-3 tham số quan trọng nhất (có tương quan với lợi nhuận). Thay vì tìm tham số tốt nhất tuyệt đối, hãy tìm tham số cho kết quả chấp nhận được trên nhiều điều kiện thị trường khác nhau.

Nếu chiến lược tạo ra lợi nhuận vượt trội so với buy-and-hold (alpha) trên nhiều công cụ, khung thời gian, và giai đoạn khác nhau — đó có thể là chiến lược tốt. Nếu lợi nhuận gấp hơn 2 lần alpha, hãy tìm hiểu nguyên nhân: thường là do rủi ro cao hơn (beta) hoặc overfit lịch sử.

## Thay đổi phiên bản mới nhất
2.10.x > 2.11.x:
- Sửa lỗi tách Performance summary thành ba tab.

## Tính năng

### Backtest chiến lược giao dịch, tối ưu hóa tham số:

![](docs/Screenshot1.png)

* Tự động lấy danh sách tham số và kiểu dữ liệu (số, danh sách, checkbox)
* Tạo phạm vi kiểm thử: giá trị bắt đầu = ½ giá trị hiện tại, kết thúc = 2× giá trị hiện tại
* Lưu tham số kiểm thử ra file CSV để chỉnh sửa
* Tải phạm vi tham số đã chỉnh sửa từ file CSV
* Cấu hình mô hình tối ưu hóa:
    * Chọn kiểu tối ưu: tìm giá trị lớn nhất hoặc nhỏ nhất
    * Chọn chỉ số tối ưu từ danh sách kết quả Tradingview (Net Profit, Sharpe Ratio, v.v.)
    * Chọn phương pháp tìm kiếm (ngẫu nhiên, tuần tự, annealing)
* Lọc kết quả không phù hợp (ví dụ: số lệnh giao dịch quá ít) (Testing a strategy: Strategy optimization parameters)
* Thiết lập số chu kỳ tìm kiếm (Strategy parameters: Cycles)
* Tự động chọn tham số, lưu tất cả kết quả vào bộ nhớ trình duyệt, có thể xuất CSV (kể cả khi gặp lỗi hoặc tải lại trang) (Results: Download results)
* Hiển thị kết quả backtest trên biểu đồ 3D để phân tích ảnh hưởng của tham số
![](docs/Screenshot3.png) (Results: Show 3D Chart)

#### Phương pháp tối ưu hóa
Phương pháp **cải thiện tuần tự** thực hiện điều chỉnh giá trị tốt nhất đã tìm, không duyệt toàn bộ không gian tham số.
Logic hoạt động: lấy trạng thái tốt nhất hiện tại (tham số cho kết quả tối đa). Duyệt lần lượt từng tham số và kiểm tra toàn bộ giá trị trong phạm vi. Nếu tìm được kết quả tốt hơn, tiếp tục từ trạng thái đó. Sau đó chuyển sang tham số tiếp theo, v.v.

Phương pháp **brute force** kiểm thử tất cả các tổ hợp trong không gian tham số.

Phương pháp **annealing** tìm kiếm kết quả tốt nhất với [ít bước hơn](https://en.wikipedia.org/wiki/Simulated_annealing).
Cách hoạt động: xác định trạng thái tốt nhất và tham số tương ứng. Chọn ngẫu nhiên một tham số, sau đó chọn ngẫu nhiên giá trị trong phạm vi, kiểm tra kết quả — nếu tốt hơn thì ghi nhớ và tiếp tục thay đổi từ trạng thái đó.
Khi số lần kiểm thử tăng, phạm vi giá trị thu hẹp dần xung quanh giá trị đã tìm được. Ở giai đoạn đầu, phương pháp tìm kiếm toàn bộ không gian; về cuối, tập trung cải thiện trạng thái tốt nhất. Để tránh bị kẹt ở một vùng tham số (như phương pháp tuần tự), tất cả tham số đều thay đổi đồng thời theo chu kỳ.

Phương pháp **cải thiện ngẫu nhiên** là đơn giản nhất. Chọn ngẫu nhiên một tham số, gán giá trị ngẫu nhiên trong phạm vi, ghi nhớ nếu kết quả tốt hơn. Sau đó tiếp tục thay đổi tham số từ trạng thái đó.

Phương pháp **ngẫu nhiên** — luôn chọn ngẫu nhiên tất cả tham số cùng lúc (mặc định).

### Tải tín hiệu bên ngoài lên biểu đồ Tradingview

Tải tín hiệu mua/bán theo timestamp từ file CSV.

![](docs/Screenshot2.png)

Để hiển thị tín hiệu, cần tạo pine script tên `iondvSignals` từ đoạn script dưới đây và thêm vào biểu đồ:
```
//©akumidv
//@version=4
study("iondv Signals", shorttitle="iondvSignals", overlay=true)
strTSBuy = input("", "TSBuy")
strTSBuy = input("", "TSSell")
tickerName = input("", "Ticker")
var arrTSBuy = str.split(buy_series_time, ",")
var arrTSSell = str.split(sell_series_time, ",")
plotchar(tickerName == syminfo.ticker and array.includes(arrTSBuy, tostring(time)) ? low : na, location = location.belowbar, color=color.green, char='▲')
plotchar(tickerName == syminfo.ticker and array.includes(arrTSSell, tostring(time)) ? low : na, location = location.abovebar, color=color.red, char='▼')
```

Sau đó tải tín hiệu từ file theo mẫu:
```csv
timestamp,ticker,timeframe,signal
1625718600000,BTCUSDT,1m,BUY
2021-07-27T01:00:00Z,BABA,1H,SELL
```

Tín hiệu được lưu trong trình duyệt. Để kích hoạt, mở thuộc tính của chỉ báo `iondvSignals`.

> **Lưu ý:** Dấu phân cách trường trong file CSV là dấu phẩy.

## Cấu hình trình duyệt
Nếu tab Chrome đang chạy backtest bị ẩn hoặc không active, backtest sẽ tạm dừng.
Để tránh điều này:
* Menu chính > Công cụ khác > Hiệu suất > Luôn giữ các trang này hoạt động > Thêm domain TV
* Đóng tất cả tab khác > vào [chrome://discards/](chrome://discards/) > Tìm tab TV > Bỏ Auto Discardable

## Cài đặt

Cài từ [Chrome Web Store](https://chromewebstore.google.com/detail/tradingview-assistant/pfbdfjaonemppanfnlmliafffahlohfg)

Hoặc cài thủ công từ source code:
1. Tải source code: clone repo hoặc tải zip tại [đây](https://github.com/akumidv/tradingview-assistant-chrome-extension/archive/refs/heads/main.zip) rồi giải nén
2. Nhập `chrome://extensions` vào thanh địa chỉ, bật **Developer mode**
3. Nhấn **Load unpacked**, chọn **thư mục gốc** của repo (thư mục chứa file `manifest.json`)
4. Extension xuất hiện trong danh sách, icon hiện trên thanh công cụ Chrome

### Cập nhật
Giải nén phiên bản mới vào cùng thư mục (nên xóa file phiên bản cũ trước). Vào `chrome://extensions` và nhấn restart cho extension.

### Báo lỗi
Tạo issue tại [link này](https://github.com/akumidv/tradingview-assistant-chrome-extension/issues). Đính kèm screenshot toàn màn hình và log từ console (F12 > Console).

## Chuyển đổi sang Python

Nếu chiến lược cần lượng lớn kiểm thử, nên chuyển sang Python và thực hiện backtesting/hyperoptimization bằng Google Colab hoặc máy chủ riêng (nhanh hơn 5-10 lần/chu kỳ, lịch sử sâu hơn). Xem ví dụ tại [trade-strategies-backtesting-optimization](https://github.com/akumidv/trade-strategies-backtesting-optimization) — có thể chạy trực tiếp trên Google Colab miễn phí (upload file `*.ipynb` lên Google Drive rồi mở).

Khi chuyển đổi từ TradingView script, thường gặp các vấn đề:
* **Indicator khác công thức**: một số indicator (supertrend, `ta.RMA`, ...) cho kết quả khác `ta-lib` trong Python, cần implement lại.
* **Dữ liệu**: dữ liệu crypto phần lớn miễn phí, nhưng timeframe nhỏ thường tính phí (ví dụ: eodhistoricaldata). Cần implement interface và lưu trữ local/cloud.
* **Sai lệch dữ liệu**: dữ liệu cổ phiếu/forex/crypto trên TV có thể khác với sàn thực tế.
* **Tích hợp framework**: backtesting, backtrader, vectorbt, v.v.
* **Hyperoptimization**: wrap code vào framework tối ưu tham số.

Kinh nghiệm thực tế: ~2-3 phút developer/dòng script. Chiến lược 200 dòng ≈ 6 giờ chuyển đổi. Với các chiến lược phức tạp, thời gian có thể nhiều hơn đáng kể.

Một số repo hỗ trợ:
* [tradingview-ta-lib](https://github.com/akumidv/tradingview-ta-lib) — implement `ta` lib của TV trong Python (chỉ cho các indicator có kết quả tính toán khác `ta-lib` hoặc `python-ta` — đang phát triển)
* [catcher-bot](https://github.com/akumidv/catcher-bot) — bot screening tín hiệu trên nhiều sàn (đang phát triển)

## Liên hệ

akumidv `[at]` yahoo.com (Không gửi lỗi qua email — dùng [github issues](https://github.com/akumidv/tradingview-assistant-chrome-extension/issues))

https://linkedin.com/in/akuminov

Email là cách liên hệ ưu tiên, nhưng thường phản hồi chậm (trễ 2-3 ngày).
