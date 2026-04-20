# Checklist implement — Dành cho developer

> Làm theo thứ tự. Mỗi bước là 1 unit có thể test riêng.
> Tham chiếu plan đầy đủ: `/Users/tieple/.windsurf/plans/multi-tab-isolation-and-history-13b8ef.md`

---

## Phase 1 — Multi-tab isolation (Chrome Storage namespace)

- [ ] **`storage.js`** — thêm method `storage.setTabId(tabId)` đổi prefix key theo tabId
- [ ] **`popup/assistant.js`** — truyền `tabs[0].id` (Chrome tab ID thực) vào tất cả messages gửi đi
- [ ] **`controller.js`** — nhận `request.tabId`, gọi `storage.setTabId()` trước guard

---

## Phase 2 — IndexedDB wrapper

- [ ] **`content_scripts/db.js`** — tạo file mới, thuần IndexedDB API (không dùng lib ngoài):
  - [ ] `db.open()` — init DB `iondv_history`, objectStore `runs`
  - [ ] `db.createRun(meta)` → `Promise<runId>`
  - [ ] `db.appendIteration(runId, iterData, bestValue)` → `Promise<void>`
  - [ ] `db.completeRun(runId, status, bestValue)` → `Promise<void>`
  - [ ] `db.getRuns(limit)` → `Promise<Array>`
  - [ ] `db.getRunData(runId)` → `Promise<run>`
  - [ ] `db.deleteRun(runId)` → `Promise<void>`
  - [ ] `db.exportRunAsCSV(runId)` → `string` (tái sử dụng `file.convertResultsToCSV`)
- [ ] **`manifest.json`** — đăng ký `content_scripts/db.js` vào mảng `js` (trước `action.js`)

---

## Phase 3 — Tích hợp optimization flow

- [ ] **`backtest.js`** dòng ~276 — sau `storage.setKeys(...)`, thêm:
  ```js
  if (testResults.runId)
    await db.appendIteration(testResults.runId, res.data, res.bestValue)
  ```
- [ ] **`action.js`** — single-run path (dòng ~141):
  - [ ] Thêm `db.createRun()` trước `backtest.testStrategy()`
  - [ ] Thêm `db.completeRun('completed')` sau khi thành công
  - [ ] Wrap `backtest.testStrategy` trong inner try-catch: `db.completeRun('error')` + `_saveTestResults` trước khi re-throw
- [ ] **`action.js`** — multi-TF path (dòng ~112–132):
  - [ ] Thêm `db.createRun()` đầu mỗi iteration TF trong vòng lặp
  - [ ] Thêm `db.completeRun()` sau mỗi TF (thành công / lỗi)
- [ ] **`action.js`** — `_saveTestResults()` dòng ~278: fix `&&` → `||`

---

## Phase 4 — Controller actions + UI

### 4.1 `controller.js`
- [ ] Thêm `BYPASS_WORKER_GUARD` list: `['stopRun','getHistory','previewRunResult','downloadRunCSV','show3DChartForRun','deleteRun']`
- [ ] Xử lý các action này TRƯỚC guard `workerStatus`
- [ ] Implement handler `getHistory` → `db.getRuns()`
- [ ] Implement handler `previewRunResult` → `db.getRunData()` → `ui.showPopup()`
- [ ] Implement handler `downloadRunCSV` → `db.exportRunAsCSV()` → `file.saveAs()`
- [ ] Implement handler `show3DChartForRun` → `db.getRunData()` → plotly chart
- [ ] Implement handler `deleteRun` → `db.deleteRun()` (guard: status !== 'running')
- [ ] Implement handler `stopRun` → `action.workerStatus = null`

### 4.2 `popup/assistant.js`
- [ ] Xóa listeners của 3 nút cũ (`previewStrategyTestResults`, `downloadStrategyTestResults`, `show3DChart`)
- [ ] Thêm `loadHistory()` — gửi `getHistory` message, nhận runs array
- [ ] Thêm `renderHistoryPanel(runs, currentTabId)`:
  - [ ] Sort: RUNNING trước, sau đó theo `startTime` desc
  - [ ] Highlight run có `tabId === currentTabId` bằng badge `▶ THIS TAB`
  - [ ] Render actions per row theo điều kiện (xem bảng trong plan)
- [ ] Confirm dialog cho **Stop**: hiện tên run + cycles, text rõ ràng
- [ ] Confirm dialog cho **Delete**: hiện tên run + ngày, cảnh báo không hoàn tác
- [ ] Auto-load history khi click tab Results
- [ ] `stopRun` gửi message trực tiếp đến `run.tabId` (không phải active tab)

### 4.3 `popup/assistant.html`
- [ ] Xóa 3 nút cũ trong `content-2`
- [ ] Thêm container `#history-list` + header `[🔄 Refresh]` + `[🗑 Clear all]`
- [ ] Thêm confirm dialog overlay (reusable cho Stop và Delete)

### 4.4 `popup/style.css`
- [ ] Style `.history-card` (border, spacing)
- [ ] Style badge status: `.badge-running`, `.badge-completed`, `.badge-error`
- [ ] Style badge `.badge-this-tab` (highlight tab hiện tại)
- [ ] Style action buttons per row (nhỏ, compact)

---

## Verify cuối

- [ ] 2 tab cùng chạy → 2 record riêng biệt trong History
- [ ] Stop từ tab 3 → tab đang chạy dừng lại
- [ ] Download CSV từ run RUNNING → file có đúng data tại thời điểm đó
- [ ] Reload extension → History vẫn còn (IndexedDB persistent)
