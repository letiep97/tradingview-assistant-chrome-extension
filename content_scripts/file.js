const file = {}

file.saveAs = (text, filename) => {
  let aData = document.createElement('a');
  aData.setAttribute('href', 'data:text/plain;charset=urf-8,' + encodeURIComponent(text));
  aData.setAttribute('download', filename);
  aData.click();
  if (aData.parentNode)
    aData.parentNode.removeChild(aData);
}

file.upload = async (handler, endOfMsg, isMultiple = false) => {
  let fileUploadEl = document.createElement('input');
  fileUploadEl.type = 'file';
  if(isMultiple)
    fileUploadEl.multiple = 'multiple';
  fileUploadEl.addEventListener('change', async () => {
    let message = isMultiple ? t('msgFileUploadResults') : t('msgFileUploadResult')
    for(let file of fileUploadEl.files) {
      message += await handler(file)
    }
    message += endOfMsg ? '\n' + endOfMsg : ''
    await ui.showPopup(message)
    ui.isMsgShown = false
  });
  fileUploadEl.click();
}


file.parseCSV = async (fileData) => {
  return new Promise((resolve, reject) => {
    const CSV_FILENAME = fileData.name
    const isCSV = CSV_FILENAME.toLowerCase().endsWith('.csv')
    if(!isCSV) return reject(t('msgFileWrongFormat'))
    const reader = new FileReader();
    reader.addEventListener('load', async (event) => {
      if(!event.target.result) return reject(t('msgFileLoadError', {filename: CSV_FILENAME}))
      const CSV_VALUE = event.target.result
      try {
        const csvData = parseCSV2JSON(CSV_VALUE)
        if (csvData && csvData.length)
          return resolve(csvData)
      } catch (err) {
        console.error(err)
        return reject(t('msgFileCSVError', {error: err.message}))
      }
      return reject(t('msgFileNoData'))
    })
    return reader.readAsText(fileData);
  });
}


file.uploadHandler = async (fileData) => {
  const propVal = {}
  let strategyName = null
  const csvData = await file.parseCSV(fileData)
  const headers = Object.keys(csvData[0])
  const missColumns = ['Name','Value'].filter(columnName => !headers.includes(columnName.toLowerCase()))
  if(missColumns && missColumns.length)
    return t('msgFileNoCSVColumn', {filename: fileData.name, columns: missColumns.join(', ')})
  csvData.forEach(row => {
    if(row['name'] === '__indicatorName')
      strategyName = row['value']
    else
      propVal[row['name']] = row['value']
  })
  if(!strategyName)
    return t('msgFileIndicatorNameMissing')
  const res = await tv.setStrategyParams(strategyName, propVal, false, true)
  const lastSetResult = tv.lastSetStrategyResult || {}
  if (res) {
    return t('msgFileApplied')
  }
  return t('msgFileNameMismatch', {name: strategyName})
}

function parseCSV2JSON(s, sep= ',') {
  const csv = s.split(/\r\n|\r|\n/g).filter(item => item).map(line => parseCSVLine(line))
  if(!csv || csv.length <= 1) return []
  const headers = csv[0].map(item => item.toLowerCase())
  const JSONData = csv.slice(1).map((line) => {
    const lineObj = {}
    line.forEach((value, line_index) => lineObj[headers[line_index]] = value)
    return lineObj
  })
  return JSONData;
}


function parseCSVLine(text) {
  function replaceEscapedSymbols(textVal) {
    return textVal.replaceAll('\\"', '"')
  }

  return text.match( /\s*(".*?"|'.*?'|[^,]+|)\s*(,(?!\s*\\")|$)/g ).map(function (subText) { // \s*(\".*?\"|'.*?'|[^,]+|)\s*(,|$)
    let m;
    if (m = subText.match(/^\s*\"(.*?)\"\s*,?(?!\s*\\")$/))
      return replaceEscapedSymbols(m[1])//m[1] // Double Quoted Text // /^\s*\"(.*?)\"\s*,?$/
    if (m = subText.match(/^\s*'(.*?)'\s*,?$/))
      return replaceEscapedSymbols(m[1]); // Single Quoted Text
    if (m = subText.match(/^\s*(true|false)\s*,?$/i))
      return m[1].toLowerCase() === 'true'; // Boolean
    if (m = subText.match(/^\s*((?:\+|\-)?\d+)\s*,?$/))
      return parseInt(m[1]); // Integer Number
    if (m = subText.match(/^\s*((?:\+|\-)?\d*\.\d*)\s*,?$/))
      return parseFloat(m[1]); // Floating Number
    if (m = subText.match(/^\s*(.*?)\s*,?$/))
      return replaceEscapedSymbols(m[1]); // Unquoted Text
    return subText;
  } );
}



file.convertResultsToCSV = (testResults, outputConfig) => {
  function prepareValToCSV(value) {
    if (!value)
      return 0
    if (typeof value !== 'number')
      return JSON.stringify(value)
    return parseFloat(value) === parseInt(value) ? parseInt(value) : parseFloat(value)
  }

  if(!testResults || !testResults.perfomanceSummary || !testResults.perfomanceSummary.length)
    return t('msgFileNoConvData')
  let headers = Object.keys(testResults.perfomanceSummary[0]) // The first test table can be with error and can't have rows with previous values when parsedReport
  if(testResults.hasOwnProperty('paramsNames') && headers.length <= (Object.keys(testResults.paramsNames).length + 1)) { // Find the another header if only params names and 'comment' in headers
    const headersAll = testResults.perfomanceSummary.find(report => Object.keys(report).length > headers.length)
    if(headersAll)
      headers = Object.keys(headersAll)
  }

  if (outputConfig && outputConfig.columns && outputConfig.columns.length) {
    const visibleCols = outputConfig.columns.filter(c => c.visible).map(c => c.key)
    if (visibleCols.length) {
      headers = headers.filter(h => visibleCols.includes(h))
      headers.sort((a, b) => {
        const ia = visibleCols.indexOf(a)
        const ib = visibleCols.indexOf(b)
        return (ia < 0 ? 9999 : ia) - (ib < 0 ? 9999 : ib)
      })
    }
  }

  let csv = headers.map(header => JSON.stringify(header)).join(',')
  csv += '\n'
  testResults.perfomanceSummary.forEach(row => {
    const rowData = headers.map(key => typeof row[key] === 'undefined' ? '' : prepareValToCSV(row[key]))
    csv += rowData.join(',').replaceAll('\\"', '""')
    csv += '\n'
  })
  if(testResults.filteredSummary && testResults.filteredSummary.length) {
    csv += headers.map(key => key !== 'comment' ? '' : t('msgFileFilteredResults'))
    csv += '\n'
    testResults.filteredSummary.forEach(row => {
      const rowData = headers.map(key => typeof row[key] === 'undefined' ? '' : prepareValToCSV(row[key]))
      csv += rowData.join(',').replaceAll('\\"', '""')
      csv += '\n'
    })
  }
  return csv
}
