# Checklist nghiệp vụ — Dành cho bạn theo dõi

> Đánh dấu ✅ khi tính năng đã hoạt động thực tế trên extension.

---

## 🔒 Đảm bảo ghi file khi có lỗi

- [ ] CSV được tự động tải xuống ngay cả khi optimization dừng giữa chừng do lỗi (`forceStop`)
- [ ] CSV được tải xuống ngay cả khi chạy multi-timeframe và 1 TF bị lỗi
- [ ] Tab Results không còn hiện "No data" sai khi đã có kết quả (bug `&&` → `||`)

---

## 🗂️ Mỗi tab chạy độc lập

- [ ] Mở tab 1 và tab 2 cùng chạy optimization → data 2 tab không ghi đè nhau
- [ ] Sau khi chạy xong, download CSV từ mỗi tab → 2 file khác nhau đúng nội dung

---

## 📋 History tự động lưu mỗi lần chạy

- [ ] Mỗi lần bấm Start optimization → tự động tạo 1 record trong History
- [ ] Trong lúc chạy → History cập nhật live (Best value, Cycles done)
- [ ] Khi kết thúc (hoàn thành hoặc lỗi) → status cập nhật đúng

---

## 👁️ Tab Results — xem History

- [ ] Tab Results hiển thị danh sách tất cả runs (kể cả từ tab khác)
- [ ] Mỗi run hiển thị đủ: **Ticker · Tên chiến lược · Start/End · Method · Cycles · Best value**
- [ ] Run của tab hiện tại được đánh dấu rõ `▶ THIS TAB`
- [ ] Tab 3 chưa chạy gì → mở History vẫn thấy run của tab 1, tab 2

---

## 📥 Download CSV từ History

- [ ] Click ⬇ CSV trên run COMPLETED → tải xuống đúng file
- [ ] Click ⬇ CSV trên run đang RUNNING → tải snapshot tại thời điểm đó
- [ ] Click ⬇ CSV trên run ERROR (có partial data) → tải được file

---

## 👁️ Preview kết quả

- [ ] Click 👁 Preview trên bất kỳ run nào → hiện bảng kết quả trong popup
- [ ] Preview run RUNNING → hiện data hiện có (snapshot)

---

## 📊 3D Chart

- [ ] Click 📊 3D Chart khi run có >= 2 iterations → mở được biểu đồ
- [ ] Hoạt động với RUNNING, COMPLETED, ERROR (miễn đủ data)

---

## ⏹ Stop run

- [ ] Click ⏹ Stop → hiện confirm popup có tên run + số cycles đã chạy
- [ ] Bấm "Stop run" → optimization dừng lại
- [ ] Data đã thu thập vẫn còn trong History sau khi stop
- [ ] Stop hoạt động với run của tab khác (cross-tab)

---

## 🗑 Xóa run

- [ ] Click 🗑 Delete → hiện confirm popup cảnh báo không thể hoàn tác
- [ ] Bấm "Delete" → run bị xóa khỏi History
- [ ] Không thể Delete run đang RUNNING (nút ẩn)
