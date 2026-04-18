const ui = {
  isMsgShown: false
}

const scriptFonts = document.createElement('style')
scriptFonts.innerHTML = '@font-face {' +
  '    font-family: "Font Awesome 5 Free";' +
  '    font-style: normal;\n' +
  '    font-weight: 900;' +
  '    font-display: block;' +
  `    src: url(${chrome.runtime.getURL('fonts/fa-solid-900.woff2')}) format('woff2');` +
  '}\n' +
  '.iondv_icon::before {\n' +
  '    display: inline-block;\n' +
  '    font-style: normal;\n' +
  '    font-variant: normal;\n' +
  '    text-rendering: auto;\n' +
  '    -webkit-font-smoothing: antialiased;\n' +
  '  }\n' +
  '.iondv_download::before {\n' +
  '    font-family: "Font Awesome 5 Free"; font-weight: 900; font-size: 1.25em; content: "\\f56d";\n' +
  '  }\n' +
  '.iondv_upload::before {\n' +
  '    font-family: "Font Awesome 5 Free"; font-weight: 900; font-size: 1.25em; content: "\\f574";\n' +
  '  }\n' +
  '.iondv_copy::before {\n' +
  '    font-family: "Font Awesome 5 Free"; font-weight: 900; font-size: 1.25em; content: "\\f0c5";\n' +
  '  }\n'
document.documentElement.appendChild(scriptFonts)

ui.checkInjectedElements = () => {
  if (action && !action.workerStatus) { // If there is not running process
    const strategyDefaultEl = document.querySelector(SEL.strategyDefaultElement)
    if (!strategyDefaultEl)
      return
    if (document.querySelector(SEL.strategyImportExport))
      return
    const importExportEl = document.createElement('div')
    importExportEl.id = 'iondvImportExport'
    importExportEl.setAttribute('style', 'padding-left: 10px;padding-right: 10px; padding-top: 8px;')
    importExportEl.innerHTML = '<a id="iondvImport" style="cursor: pointer;padding-right: 5px"><i class="iondv_icon iondv_upload"></i></a>' +
      '<a id="iondvExport" style="cursor: pointer;padding-left: 5px;"><i class="iondv_icon iondv_download"></i></a>'
    strategyDefaultEl.after(importExportEl)
    const exportBtn = document.getElementById('iondvExport')
    const importBtn = document.getElementById('iondvImport')
    if (exportBtn) {
      exportBtn.onclick = async () => {
        await action.saveParameters()
      }
    }
    if (importBtn) {
      importBtn.onclick = async () => {
        await action.loadParameters()
      }
    }

  }
}

ui.stylePopup = `<style>
  .iondvpopup {
    display: table;
    position: relative;
    margin: 40px auto 0;
    width: 500px;
    background-color: #8acaff;
    color: #000000;
    transition: all 0.2s ease;
  }
  .iondvpopup-orange {
    background-color: #ffdeb1;
  }
  .iondvpopup-red {
    background-color: #fab5af;
  }
  .iondvpopup-green {
    background-color: #aefdd7;
  }
  .iondvpopup-icon {
    display: table-cell;
    vertical-align: middle;
    width: 40px;
    padding: 20px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.25);
  }
  .iondvpopup-header {
    display: table-caption;
    vertical-align: middle;
    width: 500px;
    padding: 5px 0;
    text-align: center;
    background-color: {headerBgColor};
  }
  .iondvpopup-body {
    display: table-cell;
    vertical-align: middle;
    padding: 20px 20px 20px 10px;
  }
  .iondvpopup-body > p {
      line-height: 1.2;
      margin-top: 6px;
    }
  .iondvpopup-button {
    position: relative;
    margin: 15px 5px -10px;
    background-color: rgba(0, 0, 0, 0.25);
    box-shadow: 0 3px rgba(0, 0, 0, 0.4);
    border:none;
    padding: 10px 15px;
    font-size: 16px;
    font-family: 'Source Sans Pro';
    color: #000000;
    outline: none;
    cursor: pointer;
  }
  .iondvpopup-button:hover {
      background: rgba(0, 0, 0, 0.3);
  }
  .iondvpopup-button:active {
      background: rgba(0, 0, 0, 0.3);
      box-shadow: 0 0 rgba(0, 0, 0, 0.4);
      top: 3px;
  }
  .iondvpopup-sub {
    font-style: italic;
  }
</style>`
ui.styleValWindowShadow = `background-color:rgba(0, 0, 0, 0.2);
position:absolute;
width:100%;
height:100%;
top:0px;
left:0px;
z-index:10000;`

ui.alertPopup =  async (msgText, isError = null, isConfirm = false) => {
  return new Promise(resolve => {
    function removeAlertPopup () {
      const iondvAlertPopupEl = document.getElementById('iondvAlertPopup')
      if (iondvAlertPopupEl)
        iondvAlertPopupEl.parentNode.removeChild(iondvAlertPopupEl)
      return resolve(true)
    }

    function cancelAlertPopup () {
      const iondvAlertPopupEl = document.getElementById('iondvAlertPopup')
      if (iondvAlertPopupEl)
        iondvAlertPopupEl.parentNode.removeChild(iondvAlertPopupEl)
      return resolve(false)
    }

    if (document.getElementById('iondvAlertPopup'))
      return resolve()

    const mObj = document.getElementsByTagName('body')[0].appendChild(document.createElement('div'))
    mObj.id = 'iondvAlertPopup'
    mObj.setAttribute('style', ui.styleValWindowShadow)
    mObj.style.height = document.documentElement.scrollHeight + 'px'
    const warnIcon = '<svg xmlns="http://www.w3.org/2000/svg"  width="40px" height="40px" viewBox="0 0 40 40" stroke-width="3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="20" cy="20" r="18"></circle><line x1="20" y1="12" x2="20" y2="22"></line><line x1="20" y1="27" x2="20" y2="28"></line></svg>'
    const errorIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 40 40" stroke-width="3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><rect x="4" y="4" width="34" height="34" rx="2"></rect><path d="M14 14l14 14m0 -14l-14 14"></path></svg>'
    const okIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 40 40" stroke-width="3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h40v40H0z" fill="none"></path><path d="M5 20l12 12l22 -20"></path></svg>'
    const icon = isError === null ? okIcon : isError ? errorIcon : warnIcon
    const headerText = isError === null ? t('popupInfo') : isError ? t('popupError') : t('popupWarning')
    const bgColorClass = isError === null ? 'iondvpopup-green' : isError ? 'iondvpopup-red' : 'iondvpopup-orange'
    const headerBgColor = isError === null ? '#80ffad' : isError ? '#ff9286' : '#fdc987'
    mObj.innerHTML = ui.stylePopup.replaceAll('{bgColorClass}', bgColorClass) + `
<div class="iondvpopup ${bgColorClass}">
    <div class="iondvpopup-header">${headerText}</div>
    <div class="display: table-row">
      <div class="iondvpopup-icon">
        ${icon}
      </div>
      <div class="iondvpopup-body">
        <p>${msgText}</p>
        <button class="iondvpopup-button" id="iondvPopupCloseBtn">${t('btnOK')}</button>
        ${isConfirm ? '<button class="iondvpopup-button" id="iondvPopupCancelBtn">' + t('btnCancel') + '</button>' : ''}
      </div>
    </div>
</div>`
    const btnOk = document.getElementById('iondvPopupCloseBtn')
    if (btnOk) {
      btnOk.focus()
      btnOk.onclick = removeAlertPopup
    }
    const btnCancel = document.getElementById('iondvPopupCancelBtn')
    if (btnCancel) {
      btnCancel.onclick = cancelAlertPopup
    }
  })
}

ui.showPopup = async (msgText) => {
  return await ui.alertPopup(msgText, null)
}

ui.showErrorPopup = async (msgText) => {
  return await ui.alertPopup(msgText, true)
}

ui.showWarningPopup = async (msgText) => {
  return await ui.alertPopup(msgText, false)
}

ui.statusMessageRemove = () => {
  const statusMessageEl = document.getElementById('iondvStatus')
  if (statusMessageEl)
    statusMessageEl.parentNode.removeChild(statusMessageEl)
}

ui.autoCloseAlert = (msg, duration = 3000) => {
  const altEl = document.createElement('div')
  altEl.setAttribute('style', 'background-color: #ffeaa7;color:black; width: 350px;height: 200px;position: absolute;top:0;bottom:0;left:0;right:0;margin:auto;border: 1px solid black;font-family:arial;font-size:15px;font-weight:bold;display: flex; align-items: center; justify-content: center; text-align: center;')
  altEl.setAttribute('id', 'iondvAlertAutoClose')
  altEl.innerHTML = msg
  setTimeout(function () {
    altEl.parentNode.removeChild(altEl)
  }, duration)
  document.body.appendChild(altEl)
}


ui.styleValStausMessage = `
@keyframes iondv-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.iondv-spinner {
  width: 18px; height: 18px;
  border: 3px solid #ddd;
  border-top: 3px solid #1a73e8;
  border-radius: 50%;
  animation: iondv-spin 0.8s linear infinite;
  flex-shrink: 0;
}
.button-close {
  background-color: #d93025;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: background-color 0.2s;
}
.button-close:hover {
  background-color: #b3261e;
}`


ui.styleValStatusMessage = `background-color: white; color: black;
      width: 800px; min-height: 130px; height: auto; position: fixed; top: 50px; right: 0; left: 0;
      margin: auto; border: 1px solid lightblue; box-shadow: 3px 3px 7px #777;
      display: flex; flex-direction: column; font-family: sans-serif;`


ui.statusMessage = (msgText, extraHeader = null) => {
  const isStatusPresent = document.getElementById('iondvStatus')
  const mObj = isStatusPresent ? document.getElementById('iondvStatus') : document.createElement('div')
  let msgEl
  if (!isStatusPresent) {
    mObj.id = 'iondvStatus'
    mObj.setAttribute('style', ui.styleValWindowShadow)
    mObj.style.height = document.documentElement.scrollHeight + 'px'
    const msgStyleEl = mObj.appendChild(document.createElement('style'))
    msgStyleEl.innerHTML = ui.styleValStausMessage
    msgEl = mObj.appendChild(document.createElement('div'))
    msgEl.setAttribute('style', ui.styleValStatusMessage)
  } else {
    msgEl = mObj.querySelector('div')
  }
  if (isStatusPresent && msgEl && document.getElementById('iondvMsg') && !extraHeader) {
    document.getElementById('iondvMsg').innerHTML = msgText
  } else {
    extraHeader = extraHeader !== null ? `<div style="font-size: 12px;margin-left: 5px;margin-right: 5px;text-align: left;">${extraHeader}</div>` : '' //;margin-bottom: 10px
    msgEl.innerHTML =
      `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #eee;">
        <div class="iondv-spinner"></div>
        <span style="color:#1a73e8;font-size:16px;font-weight:bold;flex:1;">${t('msgAttention')}</span>
        <button class="button-close" id="iondvBoxClose">${t('btnStop')}</button>
      </div>
      <div style="font-size:13px;color:#555;padding:6px 12px;">${t('msgPageControlled')}</div>
      ${extraHeader}
      <div id="iondvMsg" style="padding:4px 12px 10px;font-size:13px;">${msgText}</div>
      <div id="iondvPreview"></div>`
  }
  if (!isStatusPresent) {
    const tvDialog = document.getElementById('overlap-manager-root')
    if (tvDialog)
      document.body.insertBefore(mObj, tvDialog) // For avoid problem if msg overlap tv dialog window
    else
      document.body.appendChild(mObj)
  }
  const btnClose = document.getElementById('iondvBoxClose')
  if (btnClose) {
    btnClose.onclick = () => {
      console.log('Stop clicked')
      action.workerStatus = null
    }
  }
}

ui.styleParamWindow = `<style>
.iondv-button {
  background-color: white;
  border: 1px;
  color: black;
  padding: 10px 10px;
  text-align: center;
  text-decoration: none;
  font-size: 14px;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
  cursor: pointer;
  width: 75px;      
  border-radius: 3px;
  line-height: 0;
}
.iondv-button-close:hover {
  background-color: gray;
  color: white;
}
.iondv-button-close {
  background-color: white;
  color: black;
  border: 2px solid gray;
}
.iondv-button-run:hover {
  background-color: lightgreen;
}
.iondv-button-run {
  background-color: white;
  border: 2px solid lightgreen;
}
.iondv-button-def:hover {
  background-color: skyblue;
}
.iondv-button-def {
  background-color: white;
  border: 2px solid skyblue;
}
table.stratParamTable {
    width: 100%;
     border-collapse: collapse;
    border: 2px solid grey;
    empty-cells: show;
    table-layout: fixed;
}
.stratParamTable thead {
    caption-side: bottom;
   text-align: center;
   padding: 5px 0;
   font-size: 100%;
}
.stratParamTable td {
   border: 1px solid grey;
    font-size: 90%;
    padding: 2px 2px;
}
</style>`

ui.styleValParamWindow = `background-color: white; color: black;
width: 800px; height: 800px; position: fixed; top: 50px; right: 0; left: 0;
margin: auto; border: 1px solid lightblue; box-shadow: 3px 3px 7px #777;
align-items: center;  justify-content: left; text-align: left;`

ui.showAndUpdateStrategyParameters = async (testParams) => {
  return new Promise(resolve => {
    function updateParamsAndSpace() {
      const paramRange = {}
      let allFiltersRows = document.getElementById('stratParamData').getElementsByTagName('tr')
      let space = null
      if (allFiltersRows) {
        for(let row of allFiltersRows) {
          const cells = row.getElementsByTagName('td')
          if (!cells || (cells.length !== 7 && cells.length !== 6))
            continue
          const activeEl = cells[0].getElementsByTagName('input')
          if (!activeEl || !activeEl[0] || !activeEl[0].checked)
            continue
          const nameEl = cells[1]
          const isMerged = cells.length === 6
          const fromEl = cells[2].getElementsByTagName('input')
          const toEl = isMerged ? fromEl : cells[3].getElementsByTagName('input')
          const stepEl = (isMerged ? cells[3] : cells[4]).getElementsByTagName('input')
          const defEl = (isMerged ? cells[4] : cells[5]).getElementsByTagName('input')
          const priorityEl = (isMerged ? cells[5] : cells[6]).getElementsByTagName('input')
          if(!nameEl || !nameEl.innerText || !fromEl || !fromEl.length || !toEl || !toEl.length || !stepEl || !stepEl.length)
            continue
          try {
            const key = nameEl.innerText
            let paramSpace = 1
            const priority = parseInt(priorityEl[0].value)
            if(typeof testParams.paramRangeSrc[key][0] === 'boolean') {
              paramRange[key] = [true, false, 0, defEl[0].value.toLowerCase() === 'true', priority]
              paramSpace = 2
            } else if (typeof testParams.paramRangeSrc[key][0] === 'string' && testParams.paramRangeSrc[key][0].includes(';')) {
              paramRange[key] = [fromEl[0].value, '', 0, fromEl[0].value.split(';')[0], priority]
              paramSpace = fromEl[0].value.split(';').length
            } else {
              let isInteger = testParams.paramRangeSrc[key][0] === Math.round(testParams.paramRangeSrc[key][0]) &&
                testParams.paramRangeSrc[key][1] === Math.round(testParams.paramRangeSrc[key][1]) &&
                testParams.paramRangeSrc[key][2] === Math.round(testParams.paramRangeSrc[key][2])
              if (!Number.isNaN(Number(fromEl[0].value))) { // Not 0 or Nan
                if (parseInt(fromEl[0].value) !== Number(fromEl[0].value) ||
                   (Number(toEl[0].value) && parseInt(toEl[0].value) !== Number(toEl[0].value)) ||
                   (Number(stepEl[0].value) && parseInt(stepEl[0].value) !== Number(stepEl[0].value)))
                  isInteger = false
                paramRange[key] = [isInteger ? parseInt(fromEl[0].value) : Number(fromEl[0].value),
                  Number(toEl[0].value)]
                let step = isInteger ? parseInt(stepEl[0].value) : Number(stepEl[0].value)
                step = step !== 0 ? step : paramRange[key][1] < paramRange[key][0] ? -1 : 1
                paramRange[key].push(step)
                paramRange[key].push(isInteger ? parseInt(defEl[0].value) : Number(defEl[0].value))
                paramRange[key].push(priority)
                paramSpace = Math.floor(Math.abs(paramRange[key][0] - paramRange[key][1]) / paramRange[key][2]) + 1
              } else {
                paramRange[key] = [fromEl[0].value, '', 0, fromEl[0].value, priority]
                paramSpace = 1
              }
            }
            space = space == null ? paramSpace : space * paramSpace
          } catch {}
        }
      }
      document.getElementById('cyclesAll').innerHTML = String(space !== null ? space : 0)
      const spaceWarnEl = document.getElementById('iondvSpaceWarn')
      const saveBtn = document.getElementById('stratParamSaveRun')
      if (spaceWarnEl) spaceWarnEl.style.display = !space ? 'inline' : 'none'
      if (saveBtn) saveBtn.disabled = !space
      return paramRange
    }


    function prepareRow(name, param, status) {
      const isBoolean = typeof param[0] === 'boolean'
      const isString = !isBoolean && typeof param[0] === 'string' && param[0].includes(';')
      const badge = isBoolean
        ? '<span style="font-size:9px;background:#e8f0fe;color:#1a73e8;border-radius:2px;padding:1px 3px;margin-left:3px;">BOOL</span>'
        : isString
          ? '<span style="font-size:9px;background:#fce8e6;color:#d93025;border-radius:2px;padding:1px 3px;margin-left:3px;">STR</span>'
          : '<span style="font-size:9px;background:#e6f4ea;color:#137333;border-radius:2px;padding:1px 3px;margin-left:3px;">NUM</span>'
      const drag = '<span style="cursor:grab;color:#bbb;user-select:none;margin-right:3px;">&#9783;</span>'
      if (isString) {
        return `<td>${drag}<input type="checkbox" ${status ? 'checked' : ''} style="width:1em;background-color:#f1f1f1;" name="iondv-active-check-box"></td><td>${name}${badge}</td>
                <td colspan="2"><input type="text" value="${param[0]}" style="width:8em;background-color:#f1f1f1;"></td>
                <td><input type="number" step="any" value="${param[2]}" style="width:4em;background-color:#f1f1f1;" disabled></td>
                <td><input type="text" value="${param[3]}" style="width:4em;background-color:#f1f1f1;"></td>
                <td><input type="number" value="${param[4]}" style="width:4em;background-color:#f1f1f1;" data-priority></td>`
      }
      return `<td>${drag}<input type="checkbox" ${status ? 'checked' : ''} style="width:1em;background-color:#f1f1f1;" name="iondv-active-check-box"></td><td>${name}${badge}</td>
              <td><input type="text" value="${isBoolean ? 'true' : param[0]}" style="width:4em;${!isBoolean ? 'background-color:#f1f1f1;' : ''}" ${isBoolean ? 'disabled' : ''}></td>
              <td><input type="text" value="${isBoolean ? 'false' : param[1]}" style="width:4em;${!isBoolean ? 'background-color:#f1f1f1;' : ''}" ${isBoolean ? 'disabled' : ''}></td>
              <td><input type="number" step="any" value="${param[2]}" style="width:4em;${!isBoolean ? 'background-color:#f1f1f1;' : ''}" ${isBoolean ? 'disabled' : ''}></td>
              <td><input type="text" value="${param[3]}" style="width:4em;background-color:#f1f1f1;"></td>
              <td><input type="number" value="${param[4]}" style="width:4em;background-color:#f1f1f1;" data-priority></td>`
    }

    function removeParamWindow() {
      const stratParamWindowEl = document.getElementById('iondvStratParam')
      if (stratParamWindowEl)
        stratParamWindowEl.parentNode.removeChild(stratParamWindowEl)
    }

    function getCycles() {
      try {
        const cyclesEl = document.getElementById('stratParamCycles')
        return cyclesEl && cyclesEl.value ? parseInt(cyclesEl.value) : 100
      } catch {}
      return 100
    }

    try{
      const isStratParamElPresent = document.getElementById('iondvStratParam')
      let stratParamEl = isStratParamElPresent ? document.getElementById('iondvStratParam') : document.createElement('div')
      let popupEl
      if (!isStratParamElPresent) {
        stratParamEl.id = 'iondvStratParam'
        stratParamEl.setAttribute('style', ui.styleValWindowShadow)
        stratParamEl.style.height = document.documentElement.scrollHeight + 'px'
        const stratParamStyleEl = stratParamEl.appendChild(document.createElement('style'))
        stratParamStyleEl.innerHTML = ui.styleParamWindow
        popupEl = stratParamEl.appendChild(document.createElement('div'))
        popupEl.setAttribute('style', ui.styleValParamWindow )
      } else {
        popupEl = stratParamEl.querySelector('div')
      }
      popupEl.innerHTML = `<div style="display:flex;align-items:center;padding:8px 15px;border-bottom:1px solid #ddd;gap:10px;flex-wrap:wrap;">
  <h2 style="margin:0;font-size:15px;flex:0 0 auto;">${t('stratParamTitle')}</h2>
  <span style="flex:0 0 auto;font-size:13px;">
    ${t('stratParamCycles')} <input id="stratParamCycles" type="number" value="10" style="width:6em;background-color:#f1f1f1;">
    <a id="iondvCycleCopy" style="cursor:pointer;"><i class="iondv_icon iondv_copy"></i></a>
    ${t('stratParamFrom')}<span id="cyclesAll">100</span>
  </span>
  <span id="iondvSpaceWarn" style="color:red;font-size:12px;display:none;">${t('stratParamSpaceZero')}</span>
  <span style="flex:1"></span>
  <button id="stratParamSaveRun" class="iondv-button iondv-button-run">${t('btnSaveRun')}</button>
  <button id="stratParamDefRun" class="iondv-button iondv-button-def">${t('btnSkipRun')}</button>
  <button id="stratParamCancel" class="iondv-button iondv-button-close">${t('btnCancel')}</button>
</div>
<div style="height:750px;overflow-y:auto;vertical-align:top;">
<table class="stratParamTable">
 <thead><td style="width:10%"><input type="checkbox" id="iondvCheckAll" style="width:1em;background-color:#f1f1f1;">${t('colActive')}</td><td style="width:38%">${t('colParameter')}</td><td>${t('colFrom')}</td><td>${t('colTo')}</td><td>${t('colStep')}</td><td>${t('colDefault')}</td><td>${t('colPriority')}</td></thead>
 <tbody id="stratParamData"></tbody>
</table></div>`
      if (!isStratParamElPresent) {
        const tvDialog = document.getElementById('overlap-manager-root')
        if (tvDialog)
          document.body.insertBefore(stratParamEl, tvDialog) // For avoid problem if msg overlap tv dialog window
        else
          document.body.appendChild(stratParamEl)
      }
      const tbody = document.getElementById('stratParamData')

      let paramRows = ''
      const processedParams = []
      for(let name in testParams.paramRange) {
        if (testParams.paramRange[name][0] === null || (isNaN(testParams.paramRange[name][0]) &&
          (typeof testParams.paramRange[name][0] !== 'string' || !testParams.paramRange[name][0].includes(';'))))
          continue
        paramRows += `\n<tr draggable="true">${prepareRow(name, testParams.paramRange[name], true)}</tr>`
        processedParams.push(name)
      }
      for(let name in testParams.paramRangeSrc) {
        if(!processedParams.includes(name) && testParams.paramRangeSrc[name][0] !== null && (
          !isNaN(testParams.paramRangeSrc[name][0]) ||
          (typeof testParams.paramRangeSrc[name][0] === 'string') && testParams.paramRangeSrc[name][0].includes(';')))
          paramRows += `\n<tr draggable="true">${prepareRow(name, testParams.paramRangeSrc[name], false)}</tr>`
      }
      if (paramRows)
        tbody.innerHTML = paramRows

      function sortRowsByPriority() {
        const rows = Array.from(tbody.rows)
        rows.sort((a, b) => {
          const pa = parseInt(a.querySelector('[data-priority]')?.value) || 0
          const pb = parseInt(b.querySelector('[data-priority]')?.value) || 0
          return pa - pb
        })
        rows.forEach(r => tbody.appendChild(r))
      }

      updateParamsAndSpace()
      tbody.addEventListener('change', updateParamsAndSpace)
      tbody.addEventListener('blur', e => {
        if (e.target.hasAttribute('data-priority')) {
          sortRowsByPriority()
          updateParamsAndSpace()
        }
      }, true)

      let dragSrcIdx = -1
      tbody.addEventListener('dragstart', e => {
        const tr = e.target.closest('tr')
        if (tr) dragSrcIdx = Array.from(tbody.rows).indexOf(tr)
      })
      tbody.addEventListener('dragover', e => e.preventDefault())
      tbody.addEventListener('drop', e => {
        e.preventDefault()
        const toTr = e.target.closest('tr')
        if (!toTr || dragSrcIdx < 0) return
        const toIdx = Array.from(tbody.rows).indexOf(toTr)
        if (dragSrcIdx === toIdx) return
        const rows = Array.from(tbody.rows)
        const moved = rows.splice(dragSrcIdx, 1)[0]
        rows.splice(toIdx, 0, moved)
        rows.forEach(r => tbody.appendChild(r))
        Array.from(tbody.rows).forEach((r, i) => {
          const p = r.querySelector('[data-priority]')
          if (p) p.value = i + 1
        })
        dragSrcIdx = -1
        updateParamsAndSpace()
      })
      const copyCycleBtn = document.getElementById('iondvCycleCopy')
      if (copyCycleBtn) {
        copyCycleBtn.onclick = async () => {
          const cylceEl = document.getElementById('stratParamCycles')
          const cyclesAllEl = document.getElementById('cyclesAll')
          if(cylceEl)
            cylceEl.value = isNaN(parseInt(cyclesAllEl.innerText)) ? 10 : parseInt(cyclesAllEl.innerText)
        }
      }
      const checkAllEl = document.getElementById('iondvCheckAll')
      if (checkAllEl) {
        checkAllEl.onchange = () => {
          const allCheckbox = document.getElementById('iondvCheckAll')
          const checkAllEl = document.querySelectorAll('[name="iondv-active-check-box"]')
          if(checkAllEl && allCheckbox) {
            for(const el of checkAllEl) {
              el.checked = allCheckbox.checked
            }
            updateParamsAndSpace()
          }
        }
      }
      const btnClose = document.getElementById('stratParamCancel')
      if (btnClose) {
        btnClose.onclick = () => {
          console.log('Cancel')
          removeParamWindow()
          return resolve(null)
        }
      }
      const btnSaveRun = document.getElementById('stratParamSaveRun')
      if (btnSaveRun) {
        btnSaveRun.onclick = () => {
          const paramRange = updateParamsAndSpace()
          console.log('Save and run')
          const cycles = getCycles()
          removeParamWindow()
          return resolve({cycles: cycles, paramRange: paramRange })
        }
      }
      const btnDefRun = document.getElementById('stratParamDefRun')
      if (btnDefRun) {
        btnDefRun.onclick = () => {
          console.log('Run default')
          const cycles = getCycles()
          removeParamWindow()
          return resolve({cycles: cycles, paramRange: null })
        }
      }
    } catch (err) {
      removeParamWindow()
      throw err
    }
  })
}


ui.showOutputConfig = async (columns) => {
  return new Promise(async resolve => {
    let savedConfig = {}
    try { savedConfig = (await storage.getKey('output_config')) || {} } catch {}

    let colList = []
    if (savedConfig.columns && savedConfig.columns.length) {
      colList = savedConfig.columns.filter(c => !columns.length || columns.includes(c.key))
      columns.filter(c => !colList.find(x => x.key === c)).forEach(c => colList.push({key: c, visible: true}))
    } else {
      colList = columns.map(c => ({key: c, visible: true}))
    }

    const existing = document.getElementById('iondvOutputCfg')
    if (existing) existing.parentNode.removeChild(existing)
    const overlay = document.createElement('div')
    overlay.id = 'iondvOutputCfg'
    overlay.setAttribute('style', ui.styleValWindowShadow)
    overlay.style.height = document.documentElement.scrollHeight + 'px'
    const popup = overlay.appendChild(document.createElement('div'))
    popup.setAttribute('style', 'background:white;color:black;width:500px;max-height:80vh;overflow-y:auto;position:fixed;top:50px;left:0;right:0;margin:auto;border:1px solid lightblue;box-shadow:3px 3px 7px #777;padding:15px;font-family:sans-serif;')

    const visibleCount = colList.filter(c => c.visible).length

    const colsHtml = colList.map((c, i) =>
      `<li draggable="true" data-idx="${i}" style="display:flex;align-items:center;gap:6px;padding:4px;cursor:grab;border:1px solid #ddd;margin:2px 0;background:#fafafa;">
        <span style="font-size:10px;color:#999;user-select:none;">&#9776;</span>
        <input type="checkbox" ${c.visible ? 'checked' : ''}>
        <span>${c.key}</span>
      </li>`).join('')

    const btnStyle = 'background:white;padding:8px 14px;cursor:pointer;border-radius:3px;font-size:14px;'
    popup.innerHTML = `
      <h2 style="margin:0 0 12px;font-size:16px;">${t('outputConfigTitle')}</h2>
      ${colList.length ? `<fieldset style="padding:8px;border:1px solid #ccc;">
        <legend style="font-size:13px;">${t('outputColumnsTitle')} <span id="iondvColCount" style="font-weight:normal;color:#777;">(${visibleCount}/${colList.length})</span></legend>
        <div style="display:flex;gap:10px;margin-bottom:6px;">
          <a id="iondvSelectAll" style="font-size:11px;cursor:pointer;color:#0066cc;">${t('outputSelectAll')}</a>
          <a id="iondvDeselectAll" style="font-size:11px;cursor:pointer;color:#0066cc;">${t('outputDeselectAll')}</a>
        </div>
        <p style="font-size:11px;color:#666;margin:0 0 6px;">${t('outputColumnsHint')}</p>
        <ul id="iondvColList" style="list-style:none;padding:0;margin:0;max-height:280px;overflow-y:auto;">${colsHtml}</ul>
      </fieldset>` : ''}
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button id="iondvOutConfirm" style="${btnStyle}border:2px solid lightgreen;">${t('btnConfirmOutput')}</button>
        <button id="iondvOutCancel" style="${btnStyle}border:2px solid gray;">${t('btnSkipOutput')}</button>
      </div>`

    const tvDialog = document.getElementById('overlap-manager-root')
    if (tvDialog) document.body.insertBefore(overlay, tvDialog)
    else document.body.appendChild(overlay)

    const colListEl = document.getElementById('iondvColList')
    if (colListEl) {
      let dndIdx = -1
      colListEl.addEventListener('dragstart', e => {
        const li = e.target.closest('li')
        if (li) dndIdx = parseInt(li.dataset.idx)
      })
      colListEl.addEventListener('dragover', e => e.preventDefault())
      colListEl.addEventListener('drop', e => {
        e.preventDefault()
        const toLi = e.target.closest('li')
        if (!toLi || dndIdx < 0) return
        const toIdx = parseInt(toLi.dataset.idx)
        if (dndIdx === toIdx) return
        const items = Array.from(colListEl.children)
        const moved = items.splice(dndIdx, 1)[0]
        items.splice(toIdx, 0, moved)
        items.forEach((li, i) => { li.dataset.idx = i; colListEl.appendChild(li) })
        dndIdx = -1
      })
    }

    function updateColCount() {
      const countEl = document.getElementById('iondvColCount')
      if (!countEl || !colListEl) return
      const total = colListEl.children.length
      const visible = Array.from(colListEl.querySelectorAll('input[type="checkbox"]')).filter(cb => cb.checked).length
      countEl.textContent = `(${visible}/${total})`
    }
    const selectAllEl = document.getElementById('iondvSelectAll')
    const deselectAllEl = document.getElementById('iondvDeselectAll')
    if (selectAllEl) selectAllEl.onclick = () => { if (colListEl) Array.from(colListEl.querySelectorAll('input[type="checkbox"]')).forEach(cb => cb.checked = true); updateColCount() }
    if (deselectAllEl) deselectAllEl.onclick = () => { if (colListEl) Array.from(colListEl.querySelectorAll('input[type="checkbox"]')).forEach(cb => cb.checked = false); updateColCount() }
    if (colListEl) colListEl.addEventListener('change', updateColCount)

    function removeModal() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    }

    document.getElementById('iondvOutCancel').onclick = () => { removeModal(); resolve(null) }
    document.getElementById('iondvOutConfirm').onclick = () => {
      const cfg = { columns: [] }
      if (colListEl) {
        Array.from(colListEl.children).forEach(li => {
          const cb = li.querySelector('input[type="checkbox"]')
          const label = li.querySelector('span:last-child')
          if (label) cfg.columns.push({key: label.textContent, visible: cb ? cb.checked : true})
        })
      }
      removeModal()
      resolve(cfg)
    }
  })
}

ui.updatePreviewTable = (rows) => {
  const COLS = ['Total P&L', 'Total P&L %', 'Max equity drawdown', 'Max equity drawdown %', 'Total trades', 'Profit factor']
  const TOP_N = 10
  const container = document.getElementById('iondvPreview')
  if (!container || !rows || !rows.length) return

  const availCols = COLS.filter(c => rows.some(r => r[c] !== undefined))
  if (!availCols.length) return

  const sortCol = container.dataset.sortCol || (availCols.includes('Total P&L') ? 'Total P&L' : availCols[0])
  const sortDir = container.dataset.sortDir || 'desc'
  container.dataset.sortCol = sortCol
  container.dataset.sortDir = sortDir

  const sorted = [...rows].sort((a, b) => {
    const va = parseFloat(a[sortCol]) || 0
    const vb = parseFloat(b[sortCol]) || 0
    return sortDir === 'asc' ? va - vb : vb - va
  })
  const topRows = sorted.slice(0, TOP_N)

  const thStyle = 'cursor:pointer;padding:3px 6px;border-bottom:2px solid #ddd;background:#f5f5f5;font-size:11px;white-space:nowrap;'
  const headerCells = availCols.map(c => {
    const arrow = c === sortCol ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''
    return `<th data-col="${c}" style="${thStyle}">${c}${arrow}</th>`
  }).join('')

  const bodyRows = topRows.map((row, i) => {
    const cells = availCols.map(c => {
      const val = row[c]
      const num = parseFloat(val)
      const color = !isNaN(num) && num < 0 ? 'color:#d93025' : !isNaN(num) && num > 0 ? 'color:#137333' : ''
      return `<td style="padding:2px 6px;font-size:11px;${color}">${val !== undefined ? val : ''}</td>`
    }).join('')
    return `<tr style="background:${i % 2 ? '#fafafa' : 'white'}"><td style="padding:2px 6px;font-size:11px;color:#999;">${i + 1}</td>${cells}</tr>`
  }).join('')

  container.innerHTML = `
    <div style="border-top:1px solid #eee;padding:6px 12px 8px;">
      <div style="font-size:11px;color:#777;margin-bottom:4px;">Top ${TOP_N} / ${rows.length} kết quả</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr><th style="${thStyle}">#</th>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`

  container.querySelectorAll('th[data-col]').forEach(th => {
    th.onclick = () => {
      const col = th.dataset.col
      container.dataset.sortDir = container.dataset.sortCol === col
        ? (container.dataset.sortDir === 'asc' ? 'desc' : 'asc')
        : 'desc'
      container.dataset.sortCol = col
      ui.updatePreviewTable(rows)
    }
  })
}