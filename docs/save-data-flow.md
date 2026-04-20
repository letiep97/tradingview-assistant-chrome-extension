# Save Data Flow

> Mô tả cơ chế lưu dữ liệu kết quả tối ưu hóa — gồm 2 layer: Chrome Storage và file CSV.

---

## Hai layer lưu dữ liệu

| Layer | Cơ chế | Khi nào ghi | Persistent? |
|---|---|---|---|
| **Chrome Storage** | `storage.setKeys()` | Sau **mỗi iteration** thành công | ✅ Tồn tại sau khi đóng popup |
| **File CSV** | `file.saveAs()` | Khi test kết thúc hoặc thủ công | ❌ Chỉ khi được trigger |

---

## Storage keys

Định nghĩa tại `content_scripts/storage.js`:

```js
storage.KEY_PREFIX        = 'iondv'
storage.STRATEGY_KEY_PARAM   = 'strategy_param'    // tham số tối ưu hóa
storage.STRATEGY_KEY_RESULTS = 'strategy_result'   // kết quả từng iteration
```

Dữ liệu lưu dưới dạng `iondv_strategy_result`, `iondv_strategy_param`, ... trong `chrome.storage.local`.

---

## Ghi vào Chrome Storage — per iteration

**Trong vòng lặp tối ưu hóa**, mỗi iteration thành công gọi `getResWithBestValue()`:

```
backtest.js — getResWithBestValue()
  ├── testResults.perfomanceSummary.push(res.data)   // hoặc filteredSummary
  └── storage.setKeys(storage.STRATEGY_KEY_RESULTS, testResults)  ← GHI STORAGE
```

Điều này đảm bảo: **nếu test bị ngắt giữa chừng** (đóng tab, crash, Stop button), data đã thu thập vẫn còn trong storage và có thể download thủ công.

---

## Ghi file CSV — `action._saveTestResults()`

**File:** `content_scripts/action.js`

```js
action._saveTestResults = async (testResults, testParams, isFinalTest = true)
```

### Logic bên trong

```
1. Đọc outputConfig từ storage ('output_config')
2. file.convertResultsToCSV(testResults, outputConfig)  → CSVResults
3. model.getBestResult(testResults)                     → bestResult
4. if (isFinalTest) tv.setStrategyParams(bestParams)    → apply best params lên chart
5. Ghi file CSV:
   - Nếu shouldSkipWaitingForDownload || !isFinalTest   → file.saveAs() ngay
   - Nếu isFinalTest                                    → showPopup rồi mới file.saveAs()
```

### Tên file CSV

```
{ticker}:{timeFrame}[ deep backtesting] {strategyName} - {cycles}_{max|min}_{optParamName}_{method}.csv
```

### Khi nào được gọi

```
action.testStrategy()
  ├── (shouldTestTF = true) for each TF:
  │   └── action._saveTestResults(testResults, testParams, false)  ← isFinalTest=false
  │
  └── (normal) sau backtest.testStrategy():
      └── action._saveTestResults(testResults, testParams, true)   ← isFinalTest=true
```

**`isFinalTest = false`** (multi-TF): không apply best params lên chart, không showPopup, ghi file ngay.
**`isFinalTest = true`** (normal): apply best params lên chart, showPopup xác nhận, rồi mới ghi file.

---

## Download thủ công sau khi test

Nếu `_saveTestResults()` không được gọi (ví dụ test bị lỗi exception), user vẫn có thể download từ storage:

```
action.downloadStrategyTestResults()
  ├── storage.getKey(storage.STRATEGY_KEY_RESULTS)
  ├── file.convertResultsToCSV(testResults)
  ├── tv.setStrategyParams(bestParams)          ← apply best params
  └── file.saveAs(CSVResults, filename)
```

Trigger: nút "Download results" trong popup extension.

---

## Các gap khiến file không được ghi (hoặc ghi sai)

### Gap 1: `forceStop` exception — file bị bỏ qua

Khi `backtest.testStrategy()` throw exception (do `optRes.forceStop = true`):

```
action.testStrategy()
└── try {
    ├── testResults = await backtest.testStrategy(...)  ← THROW
    └── action._saveTestResults(...)                    ← BỊ BỎ QUA
    }
    catch(err) → showErrorPopup(err)
```

Data vẫn trong Chrome Storage → user có thể dùng "Download results" để lấy thủ công.

**Fix đề xuất** (`action.js` — trong khối `if (allRangeParams !== null)`):

```js
let testResults = {}
try {
  testResults = await backtest.testStrategy(testParams, strategyData, allRangeParams)
} catch (err) {
  if (testResults?.perfomanceSummary?.length)
    await action._saveTestResults(testResults, testParams, true)
  throw err
}
await action._saveTestResults(testResults, testParams, true)
```

---

### Gap 2: Multi-TF — exception 1 TF bỏ qua tất cả TF còn lại

Toàn bộ vòng lặp TF nằm trong cùng `try` ngoài. Nếu `backtest.testStrategy()` throw ở TF thứ N:

```
for (const tf of listOfTF) {
  testResults = await backtest.testStrategy(...)   ← THROW ở TF thứ N
  await action._saveTestResults(..., false)         ← BỊ BỎ QUA
  // TF thứ N+1, N+2... không chạy
}
```

TF trước đó (1..N-1) đã được ghi file. TF thứ N: data có trong Chrome Storage nhưng không có CSV.

---

### Gap 3: Bug guard condition trong `_saveTestResults`

```js
// action.js dòng ~278 — BUG: dùng && thay vì ||
if (!testResults.perfomanceSummary && !testResults.perfomanceSummary.length) {
```

Khi `perfomanceSummary = []` (mảng rỗng): `![] = false` → condition = `false` → **không return sớm** → tiếp tục chạy.

`file.convertResultsToCSV` khi nhận mảng rỗng trả về chuỗi `"No data"` (string thông báo) thay vì CSV thật → **file được tạo nhưng nội dung sai**, không có error.

**Fix:** đổi `&&` thành `||`.

---

### Gap 4: `file.saveAs` là fire-and-forget — không detect được lỗi

```js
// file.js
file.saveAs = (text, filename) => {
  let aData = document.createElement('a')
  aData.setAttribute('download', filename)
  aData.click()   // ← không await, không return, không callback
}
```

Nếu browser block download (popup blocker, thiếu user gesture context) → **file không được tạo, không có exception, không có thông báo lỗi nào**.

---

## Tóm tắt tất cả các gap

| # | Trường hợp | File CSV | Phát hiện được? | Fix |
|---|---|---|---|---|
| 1 | `forceStop` exception | ❌ bỏ qua | ✅ error popup | Inner try/catch + re-throw |
| 2 | Exception trong TF loop | ❌ TF đó + sau | ✅ error popup | Tương tự gap 1 per-TF |
| 3 | Guard `&&` bug, data rỗng | ⚠️ nội dung sai | ❌ silent | Đổi `&&` → `\|\|` |
| 4 | Browser block download | ❌ | ❌ silent | Khó fix, cần UX workaround |

---

## Files liên quan

| File | Hàm chính |
|---|---|
| `content_scripts/storage.js` | `storage.setKeys`, `storage.getKey`, `storage.clearAll` |
| `content_scripts/action.js` | `_saveTestResults`, `downloadStrategyTestResults` |
| `content_scripts/backtest.js` | `getResWithBestValue` — ghi storage per iteration |
| `content_scripts/file.js` | `file.saveAs`, `file.convertResultsToCSV` |
| `content_scripts/model.js` | `model.getBestResult`, `model.saveStrategyParameters` |
