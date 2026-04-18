/*
 @license Copyright 2021 akumidv (https://github.com/akumidv/)
 SPDX-License-Identifier: Apache-2.0
*/
'use strict';

let IONDV_LANG = 'vi';

function t(key, vars) {
  const dict = (IONDV_STRINGS[IONDV_LANG] || IONDV_STRINGS['vi'])
  let str = dict[key] !== undefined ? dict[key] : key
  if (vars) {
    Object.keys(vars).forEach(k => { str = str.replaceAll('{' + k + '}', vars[k]) })
  }
  return str
}

function iondvSetLang(lang) {
  IONDV_LANG = (lang === 'en') ? 'en' : 'vi'
}

chrome.storage.local.get('iondvLang', (res) => {
  if (res && res.iondvLang) {
    IONDV_LANG = res.iondvLang
  }
})
