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
* Lọc kết quả không phù hợp (ví dụ: số lệnh giao dịch quá ít)
* Thiết lập số chu kỳ tìm kiếm
* Tự động chọn tham số, lưu tất cả kết quả vào bộ nhớ trình duyệt, có thể xuất CSV (kể cả khi gặp lỗi hoặc tải lại trang)
* Hiển thị kết quả backtest trên biểu đồ 3D để phân tích ảnh hưởng của tham số
![](docs/Screenshot3.png)

#### Phương pháp tối ưu hóa
- **Cải thiện tuần tự**: điều chỉnh giá trị tốt nhất đã tìm, không duyệt toàn bộ không gian.
- **Brute force**: kiểm thử tất cả các tổ hợp tham số.
- **Annealing**: tìm kiếm kết quả tốt nhất với [ít bước hơn](https://en.wikipedia.org/wiki/Simulated_annealing), thu hẹp phạm vi dần xung quanh giá trị tìm được.
- **Cải thiện ngẫu nhiên**: chọn ngẫu nhiên một tham số, gán giá trị ngẫu nhiên, ghi nhớ nếu tốt hơn.
- **Ngẫu nhiên**: luôn chọn ngẫu nhiên tất cả tham số cùng lúc (mặc định).

### Tải tín hiệu bên ngoài lên biểu đồ Tradingview

Tải tín hiệu mua/bán theo timestamp từ file CSV.

![](docs/Screenshot2.png)

Tạo pine script `iondvSignals` từ file trong popup và thêm vào biểu đồ. Sau đó tải tín hiệu từ file CSV theo mẫu:
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

Hoặc cài thủ công:
1. Nhập `chrome://extensions` vào thanh địa chỉ, bật **Developer mode**
2. Nhấn **Load unpacked**, chọn thư mục chứa repository (tải zip tại [đây](https://github.com/akumidv/tradingview-assistant-chrome-extension/archive/refs/heads/main.zip))
3. File `manifest.json` nằm ở thư mục gốc của extension

### Cập nhật
Giải nén phiên bản mới vào cùng thư mục (nên xóa file phiên bản cũ trước). Vào `chrome://extensions` và nhấn restart cho extension.

### Báo lỗi
Tạo issue tại [link này](https://github.com/akumidv/tradingview-assistant-chrome-extension/issues). Đính kèm screenshot toàn màn hình và log từ console (F12 > Console).

## Chuyển đổi sang Python

Nếu chiến lược cần lượng lớn kiểm thử, nên chuyển sang Python và dùng Google Colab hoặc máy chủ riêng (nhanh hơn 5-100 lần). Xem ví dụ tại [trade-strategies-backtesting-optimization](https://github.com/akumidv/trade-strategies-backtesting-optimization).

## Liên hệ

akumidv `[at]` yahoo.com (Không gửi lỗi qua email — dùng [github issues](https://github.com/akumidv/tradingview-assistant-chrome-extension/issues))

https://linkedin.com/in/akuminov
