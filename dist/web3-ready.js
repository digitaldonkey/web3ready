/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 	};
/******/
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		9: 0
/******/ 	};
/******/
/******/
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "web3-ready." + ({"0":"vendors~ledger~walletConnect~web3","1":"vendors~ledger~walletConnect","2":"vendors~ledger~web3","3":"ledger","4":"vendors~ledger","5":"vendors~walletConnect","6":"vendors~web3","7":"walletConnect","8":"web3"}[chunkId]||chunkId) + ".js"
/******/ 	}
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/
/******/
/******/ 		// JSONP chunk loading for javascript
/******/
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 			// a Promise means "currently loading".
/******/ 			if(installedChunkData) {
/******/ 				promises.push(installedChunkData[2]);
/******/ 			} else {
/******/ 				// setup Promise in chunk cache
/******/ 				var promise = new Promise(function(resolve, reject) {
/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 				});
/******/ 				promises.push(installedChunkData[2] = promise);
/******/
/******/ 				// start chunk loading
/******/ 				var head = document.getElementsByTagName('head')[0];
/******/ 				var script = document.createElement('script');
/******/ 				var onScriptComplete;
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.src = jsonpScriptSrc(chunkId);
/******/
/******/ 				onScriptComplete = function (event) {
/******/ 					// avoid mem leaks in IE.
/******/ 					script.onerror = script.onload = null;
/******/ 					clearTimeout(timeout);
/******/ 					var chunk = installedChunks[chunkId];
/******/ 					if(chunk !== 0) {
/******/ 						if(chunk) {
/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 							var realSrc = event && event.target && event.target.src;
/******/ 							var error = new Error('Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')');
/******/ 							error.type = errorType;
/******/ 							error.request = realSrc;
/******/ 							chunk[1](error);
/******/ 						}
/******/ 						installedChunks[chunkId] = undefined;
/******/ 					}
/******/ 				};
/******/ 				var timeout = setTimeout(function(){
/******/ 					onScriptComplete({ type: 'timeout', target: script });
/******/ 				}, 120000);
/******/ 				script.onerror = script.onload = onScriptComplete;
/******/ 				head.appendChild(script);
/******/ 			}
/******/ 		}
/******/ 		return Promise.all(promises);
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	var jsonpArray = window["web3Ready_jsonp"] = window["web3Ready_jsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "5a74");
/******/ })
/************************************************************************/
/******/ ({

/***/ "0bfb":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 21.2.5.3 get RegExp.prototype.flags
var anObject = __webpack_require__("cb7c");
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),

/***/ "0e07":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.SelectProviderRow_provider_23yQ3{min-height:102px;max-height:100%;overflow:scroll;background:#f5f6fa;border-radius:14px 10px 10px 14px\n}\n.SelectProviderRow_buttonWrapper_87u_H>button{cursor:pointer;display:inline-block;min-height:1em;outline:0;border:1px solid transparent;vertical-align:baseline;margin:0 .25em 0 0;padding:.78571429em 1.5em .78571429em;text-transform:none;text-shadow:none;line-height:inherit;font-size:1rem;font-style:normal;text-align:center;text-decoration:none;border-radius:.28571429rem;will-change:transform;-webkit-transition:all .15s ease 0s;transition:all .15s ease 0s;white-space:nowrap;max-width:19.75em\n}\n.SelectProviderRow_buttonWrapper_87u_H>button:disabled{background:#d9d9d9!important;color:#858585!important;cursor:not-allowed\n}\n.SelectProviderRow_buttonWrapper_87u_H>button:hover{-webkit-box-shadow:none;box-shadow:none;opacity:.9\n}\n.SelectProviderRow_provider_23yQ3{position:relative\n}\n@media (min-width:470px){\n.SelectProviderRow_provider_23yQ3{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between\n}\n}\n.SelectProviderRow_logo_3_9VD{height:102px;min-width:180px;border-radius:14px 10px 10px 14px;max-width:220px\n}\n.SelectProviderRow_logo_3_9VD.SelectProviderRow_metamask_jchWJ{background:transparent url(" + escape(__webpack_require__("261a")) + ") 0 no-repeat;background-size:contain\n}\n.SelectProviderRow_logo_3_9VD.SelectProviderRow_walletConnect_19myI{background:transparent url(" + escape(__webpack_require__("fa77")) + ") 20px no-repeat;max-width:86px;min-width:86px;background-size:300%\n}\n@media (min-width:470px){\n.SelectProviderRow_logo_3_9VD.SelectProviderRow_walletConnect_19myI{background-size:calc(100% - 30px);min-width:200px\n}\n}\n@media (min-width:800px){\n.SelectProviderRow_logo_3_9VD.SelectProviderRow_walletConnect_19myI{min-width:250px\n}\n}\n.SelectProviderRow_logo_3_9VD.SelectProviderRow_ledger_2euyT{max-width:86px;min-width:86px;background:transparent url(" + escape(__webpack_require__("2eec")) + ") 20px no-repeat;background-size:300%\n}\n@media (min-width:470px){\n.SelectProviderRow_logo_3_9VD.SelectProviderRow_ledger_2euyT{background-size:calc(100% - 30px);min-width:200px\n}\n}\n@media (min-width:800px){\n.SelectProviderRow_logo_3_9VD.SelectProviderRow_ledger_2euyT{min-width:250px\n}\n}\n.SelectProviderRow_buttonWrapper_87u_H{-webkit-box-sizing:border-box;box-sizing:border-box;border:0;position:absolute;bottom:20px;right:0\n}\n.SelectProviderRow_buttonWrapper_87u_H>button{color:#fff;margin:0 20px\n}\n@media (min-width:470px){\n.SelectProviderRow_buttonWrapper_87u_H{position:relative;bottom:auto;right:auto\n}\n}\n.SelectProviderRow_buttonWrapper_87u_H.SelectProviderRow_metamask_jchWJ>button{background:#f6851b\n}\n.SelectProviderRow_buttonWrapper_87u_H.SelectProviderRow_walletConnect_19myI>button{background:#4099ff\n}\n.SelectProviderRow_buttonWrapper_87u_H.SelectProviderRow_ledger_2euyT>button{background:#41ccb4\n}\n.SelectProviderRow_text_3_yIu{display:none;color:#666;-webkit-box-flex:2;-ms-flex-positive:2;flex-grow:2;padding-left:10px\n}\n@media (min-width:679px){\n.SelectProviderRow_text_3_yIu{display:block\n}\n}\n.SelectProviderRow_text_3_yIu>a{color:#666\n}", ""]);

// exports
exports.locals = {
	"provider": "SelectProviderRow_provider_23yQ3",
	"buttonWrapper": "SelectProviderRow_buttonWrapper_87u_H",
	"logo": "SelectProviderRow_logo_3_9VD",
	"metamask": "SelectProviderRow_metamask_jchWJ",
	"walletConnect": "SelectProviderRow_walletConnect_19myI",
	"ledger": "SelectProviderRow_ledger_2euyT",
	"text": "SelectProviderRow_text_3_yIu"
};

/***/ }),

/***/ "1210":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountIndicator_vue_vue_type_style_index_0_id_708d6cf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("2362");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountIndicator_vue_vue_type_style_index_0_id_708d6cf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountIndicator_vue_vue_type_style_index_0_id_708d6cf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountIndicator_vue_vue_type_style_index_0_id_708d6cf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountIndicator_vue_vue_type_style_index_0_id_708d6cf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_AccountIndicator_vue_vue_type_style_index_0_id_708d6cf4_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "15b2":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Loading_vue_vue_type_style_index_0_id_5f3ee003_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("b5f1");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Loading_vue_vue_type_style_index_0_id_5f3ee003_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Loading_vue_vue_type_style_index_0_id_5f3ee003_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Loading_vue_vue_type_style_index_0_id_5f3ee003_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Loading_vue_vue_type_style_index_0_id_5f3ee003_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Loading_vue_vue_type_style_index_0_id_5f3ee003_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "1991":
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__("9b43");
var invoke = __webpack_require__("31f4");
var html = __webpack_require__("fab2");
var cel = __webpack_require__("230e");
var global = __webpack_require__("7726");
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__("2d95")(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),

/***/ "1fa8":
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__("cb7c");
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),

/***/ "20be":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.0//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3E %3Csvg version='1.0' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='100px' height='100px' viewBox='0 0 100 100' enable-background='new 0 0 100 100' xml:space='preserve'%3E %3Cg%3E %3Cimage overflow='visible' opacity='0.75' width='46' height='70' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAABHCAYAAACXgB6bAAAACXBIWXMAAAsSAAALEgHS3X78AAAA GXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABitJREFUeNrsm/tPHFUUx2f2BSyP dgHLw9qiqNRUayVR4yP+9VatSRtjbLQPai2tlccC5bWwu8x4J/kcerzdoTP3Dis/sMk30N0w8z3n fu+533NmGwbFvsKU35NXbP0s9GZFEC0bVA0qvBcqwkcGHYNuj0DifpEXUmVIVvl38vuQQcNglPdL EIsM9g22DLYJIrICivIGETqSHoTguMGYQQ0kxN8xmCaQEn+bENw0WDZYIZAOPzcMXhrsqaDiIslL Zgche8ngqsG8wYxBnUwnn00R1JC6fpeMr0D2wOCQgJ4Y/GnwnM8kiCNf8pLtJKsXIDpnsGDwocG7 BpMQFb3XCbKsrp9ks23QgrjIJQnomcGSwR8Gj1iddVbl6KRVCDNmO8nk+wY3DK7z+ywyqSuiIVIp WdePlfYjK6Adg1VW4IHBLwa/EdTuSQFU3kB8xOBtsrwI3jOYMBgm0+WMiQhVUBJQTUnxLe41wXsh q5AawEnkB7nYF+BjJNPgpuUCSm2oSutAD8kleJoWQDnlogNk4hOD7ww+Z3M2+MyXeNqq1Ng/IwTV YQMfqHKamnmRywV0vUjGr/BepUDSaVIdpdzqw63LCug905P8IFXlBuTnuOBpErfVIAEcUaE21eHW EfmUe0Q+TkX51uBT6vaAtdlO+1VSp3cE+VUVwGvkS2yYK2zQLzmIhlP2xmm/ZB+E6H7NoMlKRIFV j2W5rlAaZwsgHnuSr6GEeTCJCsLAkkKVGjvPydlQpisv4YhN1lFHfewon2ES+QGluy68K1aUCfnL eJe6Q9alOhyw1C3uMUwJrOXcO3IOXKSIyAF2TF4kMwLpKVVd8hJvY3v/wWg1udk0SZl0SIokVg6w 44RXlGQa6H2WQPIcREJ8XfmTB2yyQTb+TcrvZcsu5znE/uOZKqrej5Khcb00OaSyBeHvDW4bPMZ0 VbG8e2RPGhWX/fSat9G2d0h5izxySbT9goz/hCtssllLfD6CqbvKaV31raWVlKUJM2ZFsr6Dpb1H xqUex6pON5HRjuqYykWQ1w2ylLYoJQD7vS4d0BLE1+mSIuuwEftbVQnyzrwQ3ycza+iybum+12RA GoqXyEZ3QIFVyWao0xcJJCxKNh1u/DsX3+CGJZW5Op+NqZtHeO0tsG/1nmL0plTb2HA0eXFa5rto 8lc0eckqZ1U1GZhSqxJD+CHGqaW6/5I6+Obpe2cd6ry2xV3VUh5nXmTznAwOWXW+Yk0GBhV5qe9L rEKkiE9C+jMyP5GzRGpJiy1uSwD6FBXvfNijgZZS+jRlMnAI8RbvCfGPDL7Gpc45GL0Yq7HKWfGC yhX1akYiq0roV5sMnDQZEIkJ8W8gv8CK1Ryyvk3SHmI7DtLIn7RB4hMCiy2pCPEE12wrmzPryaDq PrLc1M1IxbFKxT2sa9HE2xSRxwyk/kYyR/qmRbRsp0F8nYzfxTM1ddaLIK/7gCKJr3Hm/GDwM9Zj z55fljyJy5gkKYNfsTmLIn4L8vdtrRdFXsYkN2nYiyR+C603La/kTV48yxj1+zqnaN5y6Ezcl7x4 lgWmaxMO8x1n4q7kixqTeBH3yXxFzVNcxiS6HDoR9yEvj3BmHCYCds/7I1UlF3Ef2RTZ8952Ie67 YYvseTfyEi/KHuR9dchyWs97Zslrw/UMn263jmeSvEhmF9IryKfr24D72GL9iDLMkPVE339ZFjfu J/lItY27dDtvsgURZJNuaJnDqeWidR/ysRp5LFMx1jJcSyYN8pR720cyPpnvoNu7/MxqDeRUfYTe nSXj2wa2yOCGGpqGGVbskAlb17cC5CUvpmyYwdSkGk5lPaQ62InQ9XDyyXwV4ou0fo0c15GJQDLK uIOMOv0kX4HwNfrVmSD7rD1mo9+jzj9BQn2TTYmmI7HE00x+s3ZPEVVGNrl+PhD3I/MSQDl49fWs PORrwauvumQ1dKdmD/IQ8CJ7FlxlcE7+nPw5+XPy5+T79vJ9MpK1BdQnrDzqjP8P8i4toP7bncDh G9tFkHdtAXu1gmt4eedVcMl8Gzt7h2Z6JMg3p+z10NnZVLls8gFIDwX5v0dgP3TuBn38bxcSQK+v mmfNfmxt3qCf5H2vUcj/2PlXgAEAoyox55XIPfkAAAAASUVORK5CYII=' transform='matrix(1 0 0 1 42.167 18.314)'%3E %3C/image%3E %3Cg%3E %3Cg%3E %3Cg%3E %3Cpath fill='%23FFDE00' d='M67.93,62.37H54.2v-1.59c0-2.71,0.27-4.91,0.79-6.6c0.53-1.69,1.32-3.23,2.37-4.63 c1.05-1.4,3.4-3.86,7.06-7.38c1.95-1.84,2.93-3.53,2.93-5.07c0-1.54-0.39-2.73-1.18-3.58c-0.78-0.85-1.97-1.28-3.56-1.28 c-1.71,0-3.13,0.66-4.25,1.97c-1.12,1.31-1.84,3.6-2.15,6.87L42.2,39.07c0.48-5.98,2.35-10.79,5.62-14.44 c3.26-3.65,8.27-5.47,15.01-5.47c5.25,0,9.49,1.27,12.72,3.81c4.38,3.44,6.58,8.02,6.58,13.75c0,2.38-0.57,4.67-1.7,6.87 c-1.13,2.21-3.45,4.9-6.94,8.09c-2.43,2.24-3.97,4.03-4.61,5.39S67.93,60.19,67.93,62.37z M53.73,66.61h14.71v15.05H53.73V66.61 z'/%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E\""

/***/ }),

/***/ "214f":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var hide = __webpack_require__("32e9");
var redefine = __webpack_require__("2aba");
var fails = __webpack_require__("79e5");
var defined = __webpack_require__("be13");
var wks = __webpack_require__("2b4c");

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);
  var fns = exec(defined, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};


/***/ }),

/***/ "230e":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
var document = __webpack_require__("7726").document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ "2350":
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "2362":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("9205");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("3ab1cea4", content, shadowRoot)
};

/***/ }),

/***/ "23c6":
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__("2d95");
var TAG = __webpack_require__("2b4c")('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),

/***/ "261a":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_3' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='466px' height='273px' viewBox='217.44 199.14 466 273' enable-background='new 217.44 199.14 466 273' xml:space='preserve'%3E%3Cg%3E%3Cpath fill='%23F5841B' d='M586.14,381.74c-20.53-0.54-40.99-2.22-61.43-4.11c0,0-44.43,12.18-57.85,13.41 c-0.34-0.03-0.69-0.06-1.03-0.09c-4.98-5.34-10.34-9.06-18.42-8.61c-12.25,0.69-24.59,0.79-36.85,0.19 c-8.72-0.42-16.24,1.31-22.77,7.09c-2.41-0.27-4.86-0.34-7.22-0.84c-17.31-3.67-34.6-7.42-51.89-11.15 c-20.44,1.8-40.88,3.73-61.42,4.13c-2.93-0.35-5.73,0.3-8.58,0.89c-13.73,2.84-27.49,5.55-41.23,8.31c0-34.88,0-69.75,0-104.62 c2.28,0.37,4.37-0.41,6.52-0.98c30.06-7.93,60.14-15.83,90.21-23.73c-0.72,4.08-3.97,6.09-6.75,8.6 c-7.29,6.61-15.24,12.63-20.3,21.37l-0.04,0.05c-0.52,0.36-1.36,0.64-1.48,1.11c-0.29,1.14,0.74,1.37,1.58,1.63l0.01,0.01 c-0.04,2.55,0.99,4.77,2.14,6.95c10.03,19.13,20.03,38.27,30.11,57.37c2.55,4.83,5.39,9.51,8.1,14.25 c0.44-0.08,0.89-0.16,1.33-0.23c0-12.8,0-25.59,0-38.39c6.27,1.27,12.51,2.71,18.81,3.78c12.37,2.09,24.3,6.47,36.96,7 c3.37,1.83,3.64,5.42,4.73,8.51c2.35,6.69,4.58,13.42,6.86,20.14c1.86-1.5,2.21-2.54,2.21-3.57c0.04-21.39,0.1-42.78-0.01-64.17 c-0.02-3.98-0.73-7.96-2.54-11.63c-0.03-1.33-0.09-4-0.09-4l-5.53-91.2c0,0,48.48-0.05,72.62-0.05 c-0.52,11.79-0.89,23.58-1.6,35.35c-1.12,18.64-2.48,37.27-3.73,55.9c-0.4,1.28-0.81,2.57-1.21,3.85 c-3.46,26.38-0.62,52.76-0.43,79.24c2.53-3.82,3.54-7.94,5.4-11.63c2.76-5.47,2.05-12.47,7.41-16.75c2.46,0.54,4.78-0.08,7.18-0.6 c16.18-3.46,32.39-6.8,48.58-10.18c0,12.8,0,25.6,0,39.52c1.5-1.43,2.09-1.76,2.36-2.27c12.42-23.41,24.8-46.82,37.19-70.24 c1.15-2.18,2.18-4.4,2.14-6.95c0.02-0.93,0.04-1.86,0.07-2.79c-5.06-8.74-13.01-14.76-20.31-21.37c-2.78-2.52-6.03-4.53-6.74-8.61 c17.88,4.67,35.8,9.19,53.62,14.07c16.08,4.41,32.43,7.86,48.21,13.33c0.77,2.32,1.49,4.66,2.31,6.96 c12.36,34.31,24.74,68.62,37.12,102.93c-2.66-0.16-5.37-0.04-7.96-0.54' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23763D16' d='M641.05,289.02c-15.79-5.47-32.13-8.92-48.21-13.33 c-17.82-4.89-35.75-9.4-53.62-14.07c-2.06-1.3-4.34-2.35-6.15-3.94c-19.74-17.39-39.44-34.83-59.05-52.36 c-1.85-1.66-4.78-2.82-4.39-6.18c63.49,0,126.98,0,190.47,0c-0.05,8.03-4.28,17.65,8,21.01c0.29,0.08,0.42,0.72,0.78,1.39 c-4.52,3.83-9.09,7.7-13.68,11.59c3.41,3.42,8.18,4.65,12.27,9.82c-5.18,4.14-10.21,8.17-15.15,12.12 c3.23,3.59,7.27,4.04,9.28,7.44C654.69,271.41,647.87,280.21,641.05,289.02z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23763D16' d='M319.23,261.36c-30.07,7.9-100.75,26.39-103.03,26.03l-0.5-89.75 l173.12,1.25' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M672.52,398.36c2.59,0.5,5.3,0.38,7.96,0.54 c0,0-1,10.18-1.58,12.68c-4.69,20.29-9.31,40.59-14.01,61.12c-43.97,0-87.42,0-130.87,0c0.51-0.9,25.39-43.23,37.16-63.6 c5.2-9,11.18-17.58,14.96-27.36' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M217.44,390.95c13.75-2.76,27.51-5.46,41.23-8.31 c2.85-0.59,5.65-1.25,8.58-0.89c0.16,0.64,33.82,59.48,50.49,88.25c0.54,0.89,1.08,1.79,1.62,2.68 c-33.97,0.03-67.95,0.06-101.92,0.09C217.44,445.5,217.44,418.22,217.44,390.95z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M287.13,291.59c5.06-8.74,13.01-14.76,20.3-21.37 c2.78-2.52,6.03-4.53,6.75-8.6c9.68-5.37,16.9-13.73,25.15-20.83c13.68-11.79,27.11-23.86,40.55-35.92 c1.7-1.52,4.36-2.63,3.89-5.73c2.24,0,4.47,0,6.71,0c1.29,28.21,5.59,91.69,5.63,93.92' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M469.61,199.14c-0.39,3.36,2.54,4.52,4.39,6.18 c19.62,17.53,39.31,34.97,59.05,52.36c1.81,1.59,4.09,2.64,6.15,3.94c0.71,4.08,3.96,6.09,6.74,8.6 c7.29,6.61,15.24,12.63,20.31,21.38c-36.24,1.18-72.44-1.51-108.68-1.2c1.26-18.63,2.61-37.26,3.73-55.9 c0.71-11.77,1.08-23.57,1.6-35.35C465.14,199.14,467.38,199.14,469.61,199.14z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23D6BFB1' d='M534.02,472.69c-54.39,0.07-108.78,0.15-163.17,0.19 c-17.16,0.01-34.32-0.13-51.48-0.2c-0.54-0.89-1.08-1.79-1.62-2.68c0.18-0.36,0.31-0.74,0.37-1.13 c12.46-12.39,23.26-26.26,35.05-39.24c11.17-12.3,21.32-25.53,33.3-37.11c0.49,14.66-3.34,28.98-3.26,44.45 c3.29-9.96,11.1-7.6,17.89-7.63c17.65-0.08,35.31,0.18,52.95-0.13c6.53-0.12,12.42-0.11,15.33,7.09c0.03,0.08,0.75-0.1,1.12-0.16 c-1.55-15.07-3.11-30.12-4.66-45.18c0.34,0.03,0.69,0.06,1.03,0.09c8.14,9.46,16.2,19.01,24.45,28.38 c14.58,16.56,29.83,33.69,44.48,50.2' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23171717' d='M465.83,390.95c1.55,15.05,3.11,30.11,4.66,45.18 c-0.38,0.06-1.09,0.25-1.12,0.16c-2.91-7.19-8.8-7.2-15.33-7.09c-17.65,0.31-35.3,0.05-52.95,0.13c-6.79,0.03-14.6-2.33-17.89,7.63 c-0.07-15.47,3.75-29.79,3.26-44.45c1.43-0.52,1.23-1.77,1.33-2.9c6.53-5.78,14.05-7.51,22.77-7.09 c12.26,0.59,24.59,0.5,36.85-0.19C455.49,381.88,460.85,385.61,465.83,390.95z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23CC6116' d='M457.58,290.39c36.23-0.31,72.43,2.38,108.68,1.2 c-0.02,0.93-0.04,1.85-0.07,2.78c-3.39,0.55-5.16,3.33-7.41,5.42c-11.57,10.75-23.11,21.53-34.66,32.31 c-12.93-5.73-25.87-11.45-39.13-17.32c-5.51,9.98-10.95,19.84-16.39,29.69c-3.07-14.67-6.12-29.35-9.25-44.02 c-0.48-2.27-0.14-5.04-2.99-6.21C456.77,292.96,457.17,291.68,457.58,290.39z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23CC6116' d='M287.13,291.59c25.36,0.02,50.74,0.55,76.08-0.18 c10.86-0.31,21.73-1,32.61-1.03c0.03,1.33,0.06,2.66,0.09,4c-0.52,1.44-1.2,2.85-1.52,4.33c-3.24,15.24-6.41,30.49-9.61,45.74 c-5.44-9.86-10.88-19.72-16.38-29.68c-13.25,5.87-26.19,11.6-39.13,17.33c-11.55-10.77-23.09-21.55-34.66-32.3 c-2.25-2.09-4.02-4.88-7.41-5.42l-0.01-0.01c-0.03-0.91-0.07-1.82-0.1-2.74L287.13,291.59z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23CC6116' d='M529.39,419.32c-1.56-13.9-4.25-27.67-4.68-41.69 c20.44,1.89,40.9,3.57,61.43,4.11c-3.78,9.78-9.76,18.36-14.96,27.36c-11.76,20.37-23.73,40.61-35.62,60.91' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23CC6116' d='M318.11,468.86c-0.06,0.4-0.18,0.78-0.37,1.13 c-16.67-28.77-33.34-57.54-49.98-86.32c-0.32-0.56-0.34-1.28-0.5-1.93c20.54-0.4,40.98-2.32,61.42-4.13 c-0.41,14.01-3.12,27.77-4.67,41.66C322.16,435.82,320.09,452.34,318.11,468.86z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M318.11,468.86c1.97-16.53,4.04-33.04,5.89-49.58 c1.55-13.89,4.26-27.65,4.67-41.66c17.29,3.73,34.58,7.48,51.89,11.15c2.36,0.5,4.81,0.57,7.22,0.84c-0.1,1.12,0.09,2.38-1.33,2.9 c-11.97,11.59-22.12,24.81-33.3,37.11C341.37,442.61,330.57,456.48,318.11,468.86z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M524.8,377.62c0.43,14.03,3.28,28.17,4.84,42.07 c1.85,16.55,3.9,33.08,5.86,49.62c-14.65-16.5-29.35-32.96-43.94-49.52c-8.25-9.37-16.31-18.91-24.45-28.38 c12.4-4.52,25.57-5.84,38.25-9.2C511.81,380.5,518.26,379.01,524.8,377.62z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M524.12,332.1c11.55-10.77,23.09-21.55,34.66-32.31 c2.25-2.09,4.02-4.87,7.41-5.42c0.04,2.55-0.99,4.77-2.14,6.95c-12.39,23.42-24.77,46.84-37.19,70.24 c-0.27,0.51-0.86,0.85-2.36,2.27c0-13.92,0-26.72,0-39.52C524.38,333.58,524.25,332.84,524.12,332.1z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M287.2,294.38c3.39,0.54,5.16,3.33,7.41,5.42 c11.57,10.75,23.11,21.53,34.66,32.3c-0.13,0.74-0.26,1.48-0.39,2.22c0,12.8,0,25.59,0,38.39c-0.44,0.08-0.89,0.16-1.33,0.23 c-2.71-4.75-5.55-9.42-8.1-14.25c-10.09-19.1-20.09-38.24-30.11-57.37C288.19,299.15,287.16,296.93,287.2,294.38z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23283646' d='M524.12,332.1c0.13,0.74,0.26,1.48,0.38,2.22 c-16.2,3.38-32.41,6.72-48.58,10.18c-2.4,0.51-4.72,1.14-7.18,0.6l-0.14-0.63c5.44-9.85,10.88-19.71,16.39-29.69 C498.25,320.65,511.19,326.38,524.12,332.1z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23283646' d='M328.88,334.32c0.13-0.74,0.26-1.48,0.39-2.22 c12.94-5.73,25.88-11.46,39.13-17.33c5.5,9.96,10.94,19.82,16.38,29.68c-0.15,0.2-0.19,0.41-0.12,0.65 c-12.66-0.53-24.59-4.91-36.96-7C341.39,337.03,335.15,335.59,328.88,334.32z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M468.6,344.47l0.14,0.63c-5.36,4.29-4.64,11.28-7.41,16.75 c-1.87,3.69-2.88,7.82-5.4,11.63c-0.18-26.49-3.03-52.86,0.43-79.24c2.85,1.17,2.51,3.94,2.99,6.21 C462.48,315.11,465.53,329.79,468.6,344.47z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M384.66,345.1c-0.06-0.24-0.02-0.45,0.12-0.65 c3.19-15.25,6.37-30.5,9.6-45.74c0.31-1.48,1-2.89,1.52-4.33c1.81,3.67,2.52,7.65,2.54,11.63c0.11,21.39,0.05,42.78,0.01,64.17 c0,1.04-0.35,2.07-2.21,3.57c-2.28-6.72-4.51-13.45-6.86-20.14C388.3,350.53,388.03,346.94,384.66,345.1z' /%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%23E3761B' d='M287.09,291.64c0.03,0.91,0.07,1.82,0.1,2.74 c-0.84-0.26-1.87-0.49-1.58-1.63C285.73,292.28,286.57,292,287.09,291.64z' /%3E%3C/g%3E%3C/svg%3E\""

/***/ }),

/***/ "27ee":
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__("23c6");
var ITERATOR = __webpack_require__("2b4c")('iterator');
var Iterators = __webpack_require__("84f2");
module.exports = __webpack_require__("8378").getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),

/***/ "28a5":
/***/ (function(module, exports, __webpack_require__) {

// @@split logic
__webpack_require__("214f")('split', 2, function (defined, SPLIT, $split) {
  'use strict';
  var isRegExp = __webpack_require__("aae3");
  var _split = $split;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX = 'lastIndex';
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it
    $split = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i;
      // Doesn't need flags gy, but they don't hurt
      if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
      while (match = separatorCopy.exec(string)) {
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          // eslint-disable-next-line no-loop-func
          if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
            for (i = 1; i < arguments[LENGTH] - 2; i++) if (arguments[i] === undefined) match[i] = undefined;
          });
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    $split = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  }
  // 21.1.3.17 String.prototype.split(separator, limit)
  return [function split(separator, limit) {
    var O = defined(this);
    var fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});


/***/ }),

/***/ "2aba":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var hide = __webpack_require__("32e9");
var has = __webpack_require__("69a8");
var SRC = __webpack_require__("ca5a")('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__("8378").inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),

/***/ "2b4c":
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__("5537")('wks');
var uid = __webpack_require__("ca5a");
var Symbol = __webpack_require__("7726").Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),

/***/ "2d00":
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ "2d95":
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "2eec":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E %3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='160.008px' height='58px' viewBox='0.5 64.5 160.008 58' enable-background='new 0.5 64.5 160.008 58' xml:space='preserve' %3E %3Ctitle%3ElogoLedger%3C/title%3E %3Cdesc%3ECreated with Sketch.%3C/desc%3E %3Cg id='Page-1'%3E %3Cg id='dashboard-copy-25' transform='translate(-256.000000, -219.000000)'%3E %3Cg id='Group' transform='translate(228.000000, 192.000000)'%3E %3Cpath id='logoLedger' fill='%232F3137' d='M75.873,133.859v-30.36h2.088v28.362h14.362v1.998H75.873z M102.704,134.294 c-3.24,0-5.781-1.062-7.656-3.061c-1.79-1.999-2.729-4.868-2.729-8.555c0-3.564,0.845-6.558,2.614-8.625 c1.791-2.246,4.099-3.309,7.147-3.309c2.616,0,4.73,0.994,6.29,2.75c1.559,1.932,2.302,4.434,2.302,7.618v1.689H94.423 c0,3.06,0.748,5.438,2.19,7.058c1.36,1.689,3.475,2.436,6.091,2.436c1.244,0,2.424-0.124,3.359-0.312 c0.934-0.248,2.183-0.559,3.674-1.186v1.999c-1.244,0.502-2.425,0.938-3.482,1.186 C105.117,134.176,103.911,134.3,102.704,134.294z M102.08,112.682c-2.234,0-3.866,0.751-5.239,2.124 c-1.284,1.439-2.108,3.439-2.304,6.189h13.833c0-2.626-0.557-4.626-1.683-6.121C105.631,113.428,104.071,112.682,102.08,112.682z M121.569,110.869c1.559,0,3.049,0.311,4.175,0.87c1.181,0.627,2.238,1.564,3.173,3.061h0.123 c-0.123-1.808-0.123-3.496-0.123-5.185V101.5h1.991v32.359h-1.367l-0.501-3.495c-1.682,2.558-4.23,3.93-7.348,3.93 c-3.173,0-5.474-0.994-7.156-2.992c-1.683-1.876-2.369-4.75-2.369-8.432c0-3.875,0.811-6.817,2.369-8.935 C116.15,111.812,118.52,110.869,121.569,110.869z M121.569,112.682c-2.426,0-4.293,0.813-5.543,2.627 c-1.243,1.688-1.867,4.19-1.867,7.562c0,6.433,2.492,9.617,7.41,9.617c2.492,0,4.416-0.751,5.541-2.191 c1.182-1.496,1.801-3.931,1.801-7.431v-0.311c0-3.44-0.625-5.998-1.801-7.438C126.053,113.428,124.186,112.682,121.569,112.682z M152.693,111.31v1.495l-4.607,0.311c1.243,1.565,1.867,3.254,1.867,5.062c0,2.19-0.747,3.874-2.183,5.252 c-1.491,1.373-3.358,1.999-5.788,1.999c-1.058,0-1.745,0-2.06-0.124c-0.867,0.436-1.491,0.938-1.925,1.496 c-0.377,0.628-0.624,1.131-0.624,1.876s0.31,1.248,0.866,1.62c0.501,0.311,1.435,0.503,2.685,0.503h3.915 c2.369,0,4.293,0.503,5.542,1.497c1.249,0.937,1.991,2.377,1.991,4.377c0,2.434-0.934,4.245-2.857,5.494 c-1.868,1.249-4.608,1.876-8.158,1.876c-2.803,0-5.041-0.503-6.6-1.689c-1.559-1.005-2.301-2.625-2.301-4.501 c0-1.564,0.501-2.868,1.49-3.874c0.934-1.062,2.302-1.688,3.86-2.123c-0.625-0.312-1.244-0.751-1.559-1.249 c-0.429-0.548-0.625-1.169-0.625-1.807c0-1.496,0.934-2.869,2.803-3.998c-1.244-0.56-2.302-1.373-3.05-2.559 c-0.748-1.13-1.058-2.502-1.058-3.998c0-2.192,0.748-4.123,2.115-5.44c1.491-1.372,3.358-2.054,5.789-2.054 c1.436,0,2.616,0.124,3.427,0.435h7.033v0.124H152.693z M134.453,137.671c0,3.061,2.302,4.626,6.909,4.626 c5.852,0,8.839-1.876,8.839-5.688c0-1.372-0.434-2.31-1.368-2.937c-0.934-0.684-2.424-0.994-4.539-0.994h-3.674 C136.568,132.798,134.453,134.362,134.453,137.671z M136.259,118.245c0,1.807,0.501,3.061,1.559,4.122 c1.058,0.938,2.425,1.495,4.175,1.495c1.924,0,3.359-0.558,4.293-1.495c1.058-0.938,1.49-2.311,1.49-4.122 c0-1.876-0.557-3.371-1.559-4.31c-1.058-0.938-2.424-1.497-4.293-1.497c-1.8,0-3.296,0.559-4.23,1.621 C136.636,114.992,136.259,116.488,136.259,118.245z M162.844,134.294c-3.241,0-5.733-1.062-7.658-3.061 c-1.744-1.999-2.684-4.868-2.684-8.555c0-3.564,0.811-6.558,2.616-8.625c1.744-2.246,4.052-3.309,7.101-3.309 c2.616,0,4.731,0.994,6.29,2.75c1.614,1.932,2.302,4.434,2.302,7.618v1.689h-16.126c0,3.06,0.749,5.438,2.184,7.058 c1.367,1.689,3.482,2.436,6.099,2.436c1.243,0,2.425-0.124,3.358-0.312c0.935-0.248,2.184-0.559,3.674-1.186v1.999 c-1.243,0.502-2.424,0.938-3.481,1.186C165.392,134.176,164.21,134.294,162.844,134.294z M162.343,112.682 c-2.184,0-3.86,0.751-5.232,2.124c-1.244,1.439-2.115,3.439-2.302,6.189h13.824c0-2.626-0.501-4.626-1.683-6.121 C165.893,113.428,164.334,112.682,162.343,112.682z M182.451,110.869c0.934,0,1.991,0.124,3.049,0.311l-0.433,2 c-0.95-0.192-1.91-0.316-2.927-0.312c-1.867,0-3.426,0.87-4.731,2.435c-1.243,1.688-1.867,3.688-1.867,6.189v12.367h-2.115 v-22.55h1.8l0.191,4.122h0.124c0.934-1.688,1.867-2.869,2.925-3.495C179.717,111.186,181.016,110.869,182.451,110.869z M55.86,102.562c2.83,0,5.137,2.434,5.131,5.247v14.994H40.855v-20.241H55.86z M36.253,102.562v7.811H28.5v-2.559 c0-2.941,2.43-5.252,5.232-5.252H36.253z M28.5,115.116h7.753v7.754H28.5V115.116z M53.244,135.356v-7.805h7.753v2.496 c0,2.941-2.43,5.309-5.26,5.309H53.244z M40.855,127.552h7.753v7.81h-7.753V127.552z M28.5,127.552h7.753v7.81h-2.521 c-2.931,0-5.232-2.439-5.232-5.309V127.552z'/%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E\""

/***/ }),

/***/ "31f4":
/***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),

/***/ "32e9":
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__("86cc");
var createDesc = __webpack_require__("4630");
module.exports = __webpack_require__("9e1e") ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "33a4":
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__("84f2");
var ITERATOR = __webpack_require__("2b4c")('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),

/***/ "33d7":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='UTF-8' standalone='no'?%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E %3Csvg xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' width='482' height='768' viewBox='-2.77410003 -2.77410003 98.01820106 156.13971006' id='svg3314'%3E %3Cdefs id='defs3316' /%3E %3Cpath d='M 46.22125,55.68413 0,76.69288 46.22125,104.01413 92.4425,76.69288 46.22125,55.68413 z' id='path3078' style='opacity:0.60000598;fill:%23010101;fill-opacity:1;fill-rule:nonzero;stroke:none' /%3E %3Cpath d='m 3.7e-4,76.6925 46.22125,27.32125 0,-48.33 L 46.22162,0 3.7e-4,76.6925 z' id='path3094' style='opacity:0.44999701;fill:%23010101;fill-opacity:1;fill-rule:nonzero;stroke:none' /%3E %3Cpath d='m 46.22125,0 0,55.68375 0,48.33 L 92.4425,76.6925 46.22125,0 z' id='path3110' style='opacity:0.80000299;fill:%23010101;fill-opacity:1;fill-rule:nonzero;stroke:none' /%3E %3Cpath d='m 3.7e-4,85.45725 46.22125,65.13375 0,-37.82625 L 3.7e-4,85.45725 z' id='path3126' style='opacity:0.44999701;fill:%23010101;fill-opacity:1;fill-rule:nonzero;stroke:none' /%3E %3Cpath d='m 46.22125,112.76525 0,37.82625 L 92.47,85.45775 46.22125,112.76525 z' id='path3142' style='opacity:0.80000299;fill:%23010101;fill-opacity:1;fill-rule:nonzero;stroke:none' /%3E %3C/svg%3E\""

/***/ }),

/***/ "34ce":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Ledger_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("ac03");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Ledger_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Ledger_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Ledger_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Ledger_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Ledger_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "35d6":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/addStylesShadow.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return addStylesToShadowDOM; });


function addStylesToShadowDOM (parentId, list, shadowRoot) {
  var styles = listToStyles(parentId, list)
  addStyles(styles, shadowRoot)
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

function addStyles (styles /* Array<StyleObject> */, shadowRoot) {
  const injectedStyles =
    shadowRoot._injectedStyles ||
    (shadowRoot._injectedStyles = {})
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var style = injectedStyles[item.id]
    if (!style) {
      for (var j = 0; j < item.parts.length; j++) {
        addStyle(item.parts[j], shadowRoot)
      }
      injectedStyles[item.id] = true
    }
  }
}

function createStyleElement (shadowRoot) {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  shadowRoot.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */, shadowRoot) {
  var styleElement = createStyleElement(shadowRoot)
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ "36c9":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.App_button_UXy_q{cursor:pointer;display:inline-block;min-height:1em;outline:0;border:1px solid transparent;vertical-align:baseline;margin:0 .25em 0 0;padding:.78571429em 1.5em .78571429em;text-transform:none;text-shadow:none;line-height:inherit;font-size:1rem;font-style:normal;text-align:center;text-decoration:none;border-radius:.28571429rem;will-change:transform;-webkit-transition:all .15s ease 0s;transition:all .15s ease 0s;white-space:nowrap;max-width:19.75em\n}\n.App_button_UXy_q:disabled{background:#d9d9d9!important;color:#858585!important;cursor:not-allowed\n}\n.App_button_UXy_q:hover{-webkit-box-shadow:none;box-shadow:none;opacity:.9\n}\n.App_wrapper_pE_0j{font-family:-apple-system,system-ui,BlinkMacSystemFont,SF Pro Text,Roboto,Helvetica,Arial,sans-serif;font-size:1rem;line-height:1.4\n}\n.App_wrapper_pE_0j *{-webkit-box-sizing:border-box;box-sizing:border-box\n}\n.App_buttonPrimary_1kSBW{color:hsla(0,0%,100%,.96);background:#4099ff;-webkit-box-shadow:rgba(50,50,93,.11) 0 4px 6px 0,rgba(0,0,0,.08) 0 1px 3px 0,rgba(0,0,0,.06) 0 0 1px 0 inset;box-shadow:0 4px 6px 0 rgba(50,50,93,.11),0 1px 3px 0 rgba(0,0,0,.08),inset 0 0 1px 0 rgba(0,0,0,.06)\n}\n.App_buttonTransparent_2g3CC{font-size:.78571429rem;text-decoration:underline;background:none\n}\n.App_buttonTransparent_2g3CC:hover{border:1px solid #d6d6d6;background:hsla(0,0%,52.2%,.22);-webkit-box-shadow:rgba(50,50,93,.11) 0 4px 6px 0,rgba(0,0,0,.08) 0 1px 3px 0,rgba(0,0,0,.06) 0 0 1px 0 inset;box-shadow:0 4px 6px 0 rgba(50,50,93,.11),0 1px 3px 0 rgba(0,0,0,.08),inset 0 0 1px 0 rgba(0,0,0,.06)\n}", ""]);

// exports
exports.locals = {
	"button": "App_button_UXy_q",
	"wrapper": "App_wrapper_pE_0j",
	"buttonPrimary": "App_buttonPrimary_1kSBW",
	"buttonTransparent": "App_buttonTransparent_2g3CC"
};

/***/ }),

/***/ "3846":
/***/ (function(module, exports, __webpack_require__) {

// 21.2.5.3 get RegExp.prototype.flags()
if (__webpack_require__("9e1e") && /./g.flags != 'g') __webpack_require__("86cc").f(RegExp.prototype, 'flags', {
  configurable: true,
  get: __webpack_require__("0bfb")
});


/***/ }),

/***/ "38a2":
/***/ (function(module, exports) {

/*!
Copyright (C) 2013-2017 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var
  // should be a not so common char
  // possibly one JSON does not encode
  // possibly one encodeURIComponent does not encode
  // right now this char is '~' but this might change in the future
  specialChar = '~',
  safeSpecialChar = '\\x' + (
    '0' + specialChar.charCodeAt(0).toString(16)
  ).slice(-2),
  escapedSafeSpecialChar = '\\' + safeSpecialChar,
  specialCharRG = new RegExp(safeSpecialChar, 'g'),
  safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),

  safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),

  indexOf = [].indexOf || function(v){
    for(var i=this.length;i--&&this[i]!==v;);
    return i;
  },
  $String = String  // there's no way to drop warnings in JSHint
                    // about new String ... well, I need that here!
                    // faked, and happy linter!
;

function generateReplacer(value, replacer, resolve) {
  var
    doNotIgnore = false,
    inspect = !!replacer,
    path = [],
    all  = [value],
    seen = [value],
    mapp = [resolve ? specialChar : '[Circular]'],
    last = value,
    lvl  = 1,
    i, fn
  ;
  if (inspect) {
    fn = typeof replacer === 'object' ?
      function (key, value) {
        return key !== '' && replacer.indexOf(key) < 0 ? void 0 : value;
      } :
      replacer;
  }
  return function(key, value) {
    // the replacer has rights to decide
    // if a new object should be returned
    // or if there's some key to drop
    // let's call it here rather than "too late"
    if (inspect) value = fn.call(this, key, value);

    // first pass should be ignored, since it's just the initial object
    if (doNotIgnore) {
      if (last !== this) {
        i = lvl - indexOf.call(all, this) - 1;
        lvl -= i;
        all.splice(lvl, all.length);
        path.splice(lvl - 1, path.length);
        last = this;
      }
      // console.log(lvl, key, path);
      if (typeof value === 'object' && value) {
    	// if object isn't referring to parent object, add to the
        // object path stack. Otherwise it is already there.
        if (indexOf.call(all, value) < 0) {
          all.push(last = value);
        }
        lvl = all.length;
        i = indexOf.call(seen, value);
        if (i < 0) {
          i = seen.push(value) - 1;
          if (resolve) {
            // key cannot contain specialChar but could be not a string
            path.push(('' + key).replace(specialCharRG, safeSpecialChar));
            mapp[i] = specialChar + path.join(specialChar);
          } else {
            mapp[i] = mapp[0];
          }
        } else {
          value = mapp[i];
        }
      } else {
        if (typeof value === 'string' && resolve) {
          // ensure no special char involved on deserialization
          // in this case only first char is important
          // no need to replace all value (better performance)
          value = value .replace(safeSpecialChar, escapedSafeSpecialChar)
                        .replace(specialChar, safeSpecialChar);
        }
      }
    } else {
      doNotIgnore = true;
    }
    return value;
  };
}

function retrieveFromPath(current, keys) {
  for(var i = 0, length = keys.length; i < length; current = current[
    // keys should be normalized back here
    keys[i++].replace(safeSpecialCharRG, specialChar)
  ]);
  return current;
}

function generateReviver(reviver) {
  return function(key, value) {
    var isString = typeof value === 'string';
    if (isString && value.charAt(0) === specialChar) {
      return new $String(value.slice(1));
    }
    if (key === '') value = regenerate(value, value, {});
    // again, only one needed, do not use the RegExp for this replacement
    // only keys need the RegExp
    if (isString) value = value .replace(safeStartWithSpecialCharRG, '$1' + specialChar)
                                .replace(escapedSafeSpecialChar, safeSpecialChar);
    return reviver ? reviver.call(this, key, value) : value;
  };
}

function regenerateArray(root, current, retrieve) {
  for (var i = 0, length = current.length; i < length; i++) {
    current[i] = regenerate(root, current[i], retrieve);
  }
  return current;
}

function regenerateObject(root, current, retrieve) {
  for (var key in current) {
    if (current.hasOwnProperty(key)) {
      current[key] = regenerate(root, current[key], retrieve);
    }
  }
  return current;
}

function regenerate(root, current, retrieve) {
  return current instanceof Array ?
    // fast Array reconstruction
    regenerateArray(root, current, retrieve) :
    (
      current instanceof $String ?
        (
          // root is an empty string
          current.length ?
            (
              retrieve.hasOwnProperty(current) ?
                retrieve[current] :
                retrieve[current] = retrieveFromPath(
                  root, current.split(specialChar)
                )
            ) :
            root
        ) :
        (
          current instanceof Object ?
            // dedicated Object parser
            regenerateObject(root, current, retrieve) :
            // value as it is
            current
        )
    )
  ;
}

var CircularJSON = {
  stringify: function stringify(value, replacer, space, doNotResolve) {
    return CircularJSON.parser.stringify(
      value,
      generateReplacer(value, replacer, !doNotResolve),
      space
    );
  },
  parse: function parse(text, reviver) {
    return CircularJSON.parser.parse(
      text,
      generateReviver(reviver)
    );
  },
  // A parser should be an API 1:1 compatible with JSON
  // it should expose stringify and parse methods.
  // The default parser is the native JSON.
  parser: JSON
};

module.exports = CircularJSON;


/***/ }),

/***/ "38d1":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E %3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='100px' height='100px' viewBox='0 0 100 100' enable-background='new 0 0 100 100' xml:space='preserve'%3E %3Cg%3E %3Cpath d='M16.84,96.82h68.04c4.2,0,7.25-4.2,5.78-8.19l-2.84-7.979c-3.041-5.67-8.19-9.871-14.28-11.76l-9.45-2.83 c-2.73-0.84-4.3-3.781-3.359-6.511c0.209-0.53,0.529-1.05,0.84-1.58l5.99-9.45c2.52-3.89,3.459-8.61,2.619-13.23l-0.63-3.67 c-0.84-4.83-3.569-9.24-7.56-12.08c-6.721-4.83-15.75-4.72-22.37,0.32l0,0c-3.46,2.62-5.99,6.51-6.93,10.82l-0.95,4.2 c-1.15,4.93-0.21,9.98,2.42,14.28l5.67,9.029c0.42,0.42,0.74,0.951,0.84,1.58c0.95,2.73-0.52,5.67-3.36,6.51l-9.45,2.841 c-6.19,1.89-11.34,6.09-14.28,11.76l-2.83,7.979C9.6,92.62,12.64,96.82,16.84,96.82z'/%3E %3C/g%3E %3C/svg%3E\""

/***/ }),

/***/ "3b0b":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.WalletConnect_signer_28IYw{min-height:102px;max-height:100%;overflow:scroll;background:#f5f6fa;border-radius:14px 10px 10px 14px\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_restartListening_1boUW .WalletConnect_restartListeningContent_2eKwI .WalletConnect_button_26ILl{cursor:pointer;display:inline-block;min-height:1em;outline:0;border:1px solid transparent;vertical-align:baseline;margin:0 .25em 0 0;padding:.78571429em 1.5em .78571429em;text-transform:none;text-shadow:none;line-height:inherit;font-size:1rem;font-style:normal;text-align:center;text-decoration:none;border-radius:.28571429rem;will-change:transform;-webkit-transition:all .15s ease 0s;transition:all .15s ease 0s;white-space:nowrap;max-width:19.75em\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_restartListening_1boUW .WalletConnect_restartListeningContent_2eKwI .WalletConnect_button_26ILl:disabled{background:#d9d9d9!important;color:#858585!important;cursor:not-allowed\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_restartListening_1boUW .WalletConnect_restartListeningContent_2eKwI .WalletConnect_button_26ILl:hover{-webkit-box-shadow:none;box-shadow:none;opacity:.9\n}\n@media (min-width:550px){\n.WalletConnect_signer_28IYw{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between\n}\n}\n.WalletConnect_signer_28IYw .WalletConnect_logo_EnDBg{width:100%;min-height:5em;margin:10px auto;display:block;max-width:250px;background:transparent url(" + escape(__webpack_require__("fa77")) + ") 50% no-repeat;background-size:contain\n}\n@media (min-width:379px){\n.WalletConnect_signer_28IYw .WalletConnect_logo_EnDBg{margin-top:1em\n}\n}\n@media (min-width:550px){\n.WalletConnect_signer_28IYw .WalletConnect_logo_EnDBg{height:auto;width:50%;margin-left:1em\n}\n}\n@media (min-width:700px){\n.WalletConnect_signer_28IYw .WalletConnect_logo_EnDBg{height:auto;margin-left:2em\n}\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9{padding:0 1em\n}\n@media (min-width:550px){\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9{padding:1em;-ms-flex-item-align:end;align-self:flex-end;width:50%\n}\n}\n@media (min-width:700px){\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9{padding:2em 1em\n}\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 img{display:block\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_restartListening_1boUW{padding-bottom:100%;width:100%;position:relative\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_restartListening_1boUW .WalletConnect_restartListeningContent_2eKwI{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_restartListening_1boUW .WalletConnect_restartListeningContent_2eKwI .WalletConnect_button_26ILl{font-size:.78571429rem;background:#4099ff;color:hsla(0,0%,100%,.96);display:block;margin:1em auto 0\n}\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_info_mCvNp{text-align:center;padding:.5em .5em 1em\n}\n@media (min-width:550px){\n.WalletConnect_signer_28IYw .WalletConnect_dialog_fLUl9 .WalletConnect_info_mCvNp{padding-bottom:0\n}\n}", ""]);

// exports
exports.locals = {
	"signer": "WalletConnect_signer_28IYw",
	"dialog": "WalletConnect_dialog_fLUl9",
	"restartListening": "WalletConnect_restartListening_1boUW",
	"restartListeningContent": "WalletConnect_restartListeningContent_2eKwI",
	"button": "WalletConnect_button_26ILl",
	"logo": "WalletConnect_logo_EnDBg",
	"info": "WalletConnect_info_mCvNp"
};

/***/ }),

/***/ "3cf8":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("6f05");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("0790c9a0", content, shadowRoot)
};

/***/ }),

/***/ "41ac":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("36c9");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("79bde2ab", content, shadowRoot)
};

/***/ }),

/***/ "42a4":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.0//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3E %3Csvg version='1.0' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='100px' height='100px' viewBox='0 0 100 100' enable-background='new 0 0 100 100' xml:space='preserve'%3E %3Cpolygon fill='%23FFDE00' points='46.28,16.03 91.28,93.97 1.28,93.97 '/%3E %3Cpath d='M40.17,41.43h11.59v9.97l-2.23,20.03h-7.17L40.17,51.4V41.43z M40.57,74.48h10.82v10.7H40.57V74.48z'/%3E %3C/svg%3E\""

/***/ }),

/***/ "44f7":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.Metamask_signer_2SZSz{min-height:102px;max-height:100%;overflow:scroll;background:#f5f6fa;border-radius:14px 10px 10px 14px\n}\n@media (min-width:600px){\n.Metamask_signer_2SZSz{display:-webkit-box;display:-ms-flexbox;display:flex\n}\n}\n.Metamask_signer_2SZSz .Metamask_logo_Tyr5W{width:100%;height:11em;margin:0 auto;display:block;max-width:13em;background:transparent url(" + escape(__webpack_require__("4879")) + ") 50% no-repeat\n}\n@media (min-width:600px){\n.Metamask_signer_2SZSz .Metamask_logo_Tyr5W{height:auto\n}\n}\n.Metamask_signer_2SZSz .Metamask_dialog_3i5IL{padding:20px;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1\n}\n@media (min-width:600px){\n.Metamask_signer_2SZSz .Metamask_dialog_3i5IL{padding:40px\n}\n}", ""]);

// exports
exports.locals = {
	"signer": "Metamask_signer_2SZSz",
	"logo": "Metamask_logo_Tyr5W",
	"dialog": "Metamask_dialog_3i5IL"
};

/***/ }),

/***/ "4588":
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),

/***/ "4630":
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "470b":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n#connect-web3 .icon-ok{background:transparent url(" + escape(__webpack_require__("5ee7")) + ") 0 no-repeat;background-size:contain\n}\n#connect-web3 .icon-error{background:transparent url(" + escape(__webpack_require__("42a4")) + ") 0 no-repeat;background-size:contain\n}\n#connect-web3 .icon-unknown{background:transparent url(" + escape(__webpack_require__("20be")) + ") 0 no-repeat;background-size:contain\n}\n.tooltip{font-family:-apple-system,system-ui,BlinkMacSystemFont,SF Pro Text,Roboto,Helvetica,Arial,sans-serif;font-size:1rem;line-height:1.4;display:block!important;z-index:10000\n}\n.tooltip .tooltip-inner{background:rgba(64,64,64,.93);color:#fff;border-radius:16px;padding:5px 10px 4px\n}\n.tooltip .tooltip-arrow{width:0;height:0;border-style:solid;position:absolute;margin:5px;border-color:rgba(64,64,64,.93);z-index:1\n}\n.tooltip[x-placement^=top]{margin-bottom:5px\n}\n.tooltip[x-placement^=top] .tooltip-arrow{border-width:5px 5px 0 5px;border-left-color:transparent!important;border-right-color:transparent!important;border-bottom-color:transparent!important;bottom:-5px;left:calc(50% - 5px);margin-top:0;margin-bottom:0\n}\n.tooltip[x-placement^=bottom]{margin-top:5px\n}\n.tooltip[x-placement^=bottom] .tooltip-arrow{border-width:0 5px 5px 5px;border-left-color:transparent!important;border-right-color:transparent!important;border-top-color:transparent!important;top:-5px;left:calc(50% - 5px);margin-top:0;margin-bottom:0\n}\n.tooltip[x-placement^=right]{margin-left:5px\n}\n.tooltip[x-placement^=right] .tooltip-arrow{border-width:5px 5px 5px 0;border-left-color:transparent!important;border-top-color:transparent!important;border-bottom-color:transparent!important;left:-5px;top:calc(50% - 5px);margin-left:0;margin-right:0\n}\n.tooltip[x-placement^=left]{margin-right:5px\n}\n.tooltip[x-placement^=left] .tooltip-arrow{border-width:5px 0 5px 5px;border-top-color:transparent!important;border-right-color:transparent!important;border-bottom-color:transparent!important;right:-5px;top:calc(50% - 5px);margin-left:0;margin-right:0\n}\n.tooltip.popover .popover-inner{background:#f9f9f9;color:rgba(64,64,64,.93);padding:24px;border-radius:5px;-webkit-box-shadow:0 5px 30px rgba(0,0,0,.1);box-shadow:0 5px 30px rgba(0,0,0,.1)\n}\n.tooltip.popover .popover-arrow{border-color:#f9f9f9\n}\n.tooltip[aria-hidden=true]{visibility:hidden;opacity:0;-webkit-transition:opacity .15s,visibility .15s;transition:opacity .15s,visibility .15s\n}\n.tooltip[aria-hidden=false]{visibility:visible;opacity:1;-webkit-transition:opacity .15s;transition:opacity .15s\n}", ""]);

// exports


/***/ }),

/***/ "4790":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("470b");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("31f00ceb", content, shadowRoot)
};

/***/ }),

/***/ "4879":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 734.3 588.3'%3E%3Cdefs%3E%3Cstyle%3E.cls-1,.cls-10%7Bfill:%23161616;%7D.cls-2%7Bfill:%23e17726;stroke:%23e17726;%7D.cls-10,.cls-11,.cls-2,.cls-3,.cls-4,.cls-5,.cls-6,.cls-7,.cls-8,.cls-9%7Bstroke-linecap:round;stroke-linejoin:round;%7D.cls-3%7Bfill:%23e27625;stroke:%23e27625;%7D.cls-4%7Bfill:%23d5bfb2;stroke:%23d5bfb2;%7D.cls-5%7Bfill:%23233447;stroke:%23233447;%7D.cls-6%7Bfill:%23cc6228;stroke:%23cc6228;%7D.cls-7%7Bfill:%23e27525;stroke:%23e27525;%7D.cls-8%7Bfill:%23f5841f;stroke:%23f5841f;%7D.cls-9%7Bfill:%23c0ac9d;stroke:%23c0ac9d;%7D.cls-10%7Bstroke:%23161616;%7D.cls-11%7Bfill:%23763e1a;stroke:%23763e1a;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3EArtboard 1%3C/title%3E%3Cpath class='cls-1' d='M518.24,454c-3.17-2.11-6.71-3.64-10.06-5.49a41.82,41.82,0,0,1-6.35-3.83c-3.19-2.63-2.55-7.81.82-10.07,4.78-3.21,12.73-1.39,13.55,5.14a.27.27,0,0,0,.27.25h7.22a.29.29,0,0,0,.29-.32c-.39-4.51-2.1-8.26-5.28-10.66a16.94,16.94,0,0,0-10.26-3.52c-19.13,0-20.87,20.25-10.58,26.64,1.2.74,11.29,5.81,14.86,8s4.69,6.25,3.14,9.46c-1.41,2.94-5.07,4.91-8.73,4.72-4-.21-7.1-2.39-8.19-5.78a10.59,10.59,0,0,1-.28-2.29.29.29,0,0,0-.29-.27h-7.86a.3.3,0,0,0-.29.3c0,5.68,1.42,8.82,5.24,11.69a18.89,18.89,0,0,0,11.65,3.84c10.69,0,16.27-6.06,17.37-12.34S523.77,457.66,518.24,454Z'/%3E%3Cpath class='cls-1' d='M177.76,426.47h-7.25a.27.27,0,0,0-.27.2l-6.46,21.21a.28.28,0,0,1-.54,0l-6.45-21.21a.29.29,0,0,0-.28-.2H144.58a.29.29,0,0,0-.29.28v54.19a.29.29,0,0,0,.29.29h7.86a.28.28,0,0,0,.28-.29V439.77a.29.29,0,0,1,.56-.08l6.5,21.35.45,1.49a.29.29,0,0,0,.28.2h6a.29.29,0,0,0,.28-.2l.45-1.49,6.5-21.35a.29.29,0,0,1,.56.08v41.17a.28.28,0,0,0,.28.29h7.86a.29.29,0,0,0,.29-.29V426.75a.29.29,0,0,0-.29-.28Z'/%3E%3Cpath class='cls-1' d='M398.15,426.47a.29.29,0,0,0-.27.2l-6.45,21.21a.29.29,0,0,1-.55,0l-6.45-21.21a.28.28,0,0,0-.27-.2H372.23a.29.29,0,0,0-.29.28v54.19a.29.29,0,0,0,.29.29h7.86a.29.29,0,0,0,.28-.29V439.77a.29.29,0,0,1,.56-.08l6.5,21.35.45,1.49a.29.29,0,0,0,.27.2h6a.27.27,0,0,0,.27-.2l.46-1.49,6.49-21.35a.29.29,0,0,1,.56.08v41.17a.29.29,0,0,0,.29.29h7.86a.29.29,0,0,0,.28-.29V426.75a.29.29,0,0,0-.28-.28Z'/%3E%3Cpath class='cls-1' d='M297,426.47H260a.29.29,0,0,0-.29.28v6.78a.29.29,0,0,0,.29.28h14.33v47.13a.29.29,0,0,0,.29.29h7.86a.29.29,0,0,0,.28-.29V433.81H297a.29.29,0,0,0,.29-.28v-6.78A.29.29,0,0,0,297,426.47Z'/%3E%3Cpath class='cls-1' d='M343.29,481.23h7.14a.28.28,0,0,0,.27-.36L336,426.5a.29.29,0,0,0-.28-.21H325.46a.29.29,0,0,0-.28.21l-14.75,54.37a.29.29,0,0,0,.28.36h7.14a.29.29,0,0,0,.27-.22l4.29-15.8a.28.28,0,0,1,.27-.21h15.78a.29.29,0,0,1,.27.21L343,481A.28.28,0,0,0,343.29,481.23ZM324.55,457.3l5.74-21.17a.29.29,0,0,1,.55,0l5.74,21.17a.28.28,0,0,1-.27.36H324.83A.29.29,0,0,1,324.55,457.3Z'/%3E%3Cpath class='cls-1' d='M465,481.23h7.13a.29.29,0,0,0,.28-.36L457.66,426.5a.28.28,0,0,0-.28-.21H447.16a.29.29,0,0,0-.28.21l-14.74,54.37a.29.29,0,0,0,.27.36h7.14a.28.28,0,0,0,.27-.22l4.29-15.8a.29.29,0,0,1,.28-.21h15.77a.28.28,0,0,1,.27.21l4.29,15.8A.29.29,0,0,0,465,481.23ZM446.26,457.3,452,436.13a.29.29,0,0,1,.55,0l5.74,21.17a.29.29,0,0,1-.28.36H446.53A.28.28,0,0,1,446.26,457.3Z'/%3E%3Cpath class='cls-1' d='M214.46,473.22V456.4a.27.27,0,0,1,.28-.28h20.88a.29.29,0,0,0,.28-.29v-6.77a.29.29,0,0,0-.28-.29H214.74a.28.28,0,0,1-.28-.28V434.1a.28.28,0,0,1,.28-.29H238.5a.29.29,0,0,0,.29-.28v-6.78a.29.29,0,0,0-.29-.28H206.31a.28.28,0,0,0-.28.28v54.19a.28.28,0,0,0,.28.29h33.21a.29.29,0,0,0,.29-.29v-7.15a.29.29,0,0,0-.29-.29H214.74A.27.27,0,0,1,214.46,473.22Z'/%3E%3Cpath class='cls-1' d='M589.92,480.74l-27.14-28.05a.28.28,0,0,1,0-.4L587.19,427a.28.28,0,0,0-.2-.48H577a.29.29,0,0,0-.21.09l-20.72,21.51a.29.29,0,0,1-.5-.2V426.75a.28.28,0,0,0-.28-.28h-7.86a.29.29,0,0,0-.29.28v54.19a.29.29,0,0,0,.29.29h7.86a.28.28,0,0,0,.28-.29V457.09a.29.29,0,0,1,.49-.2l23.47,24.25a.29.29,0,0,0,.2.09h10A.29.29,0,0,0,589.92,480.74Z'/%3E%3Cpolygon class='cls-2' points='483.75 116.55 382.63 191.57 401.41 147.31 483.75 116.55'/%3E%3Cpolygon class='cls-3' points='250.55 116.55 350.75 192.28 332.89 147.31 250.55 116.55'/%3E%3Cpolygon class='cls-3' points='447.4 290.46 420.5 331.68 478.06 347.51 494.51 291.37 447.4 290.46'/%3E%3Cpolygon class='cls-3' points='239.89 291.37 256.24 347.51 313.8 331.68 287 290.46 239.89 291.37'/%3E%3Cpolygon class='cls-3' points='310.65 220.81 294.61 245.08 351.67 247.62 349.74 186.19 310.65 220.81'/%3E%3Cpolygon class='cls-3' points='423.65 220.81 383.95 185.48 382.63 247.62 439.69 245.08 423.65 220.81'/%3E%3Cpolygon class='cls-3' points='313.8 331.68 348.22 314.92 318.57 291.78 313.8 331.68'/%3E%3Cpolygon class='cls-3' points='386.08 314.92 420.5 331.68 415.73 291.78 386.08 314.92'/%3E%3Cpolygon class='cls-4' points='420.5 331.68 386.08 314.92 388.82 337.36 388.52 346.8 420.5 331.68'/%3E%3Cpolygon class='cls-4' points='313.8 331.68 345.78 346.8 345.58 337.36 348.22 314.92 313.8 331.68'/%3E%3Cpolygon class='cls-5' points='346.39 276.95 317.76 268.53 337.96 259.29 346.39 276.95'/%3E%3Cpolygon class='cls-5' points='387.91 276.95 396.34 259.29 416.64 268.53 387.91 276.95'/%3E%3Cpolygon class='cls-6' points='313.8 331.68 318.77 290.46 287 291.37 313.8 331.68'/%3E%3Cpolygon class='cls-6' points='415.53 290.46 420.5 331.68 447.4 291.37 415.53 290.46'/%3E%3Cpolygon class='cls-6' points='439.69 245.08 382.63 247.62 387.91 276.95 396.34 259.29 416.64 268.53 439.69 245.08'/%3E%3Cpolygon class='cls-6' points='317.76 268.53 337.96 259.29 346.39 276.95 351.67 247.62 294.61 245.08 317.76 268.53'/%3E%3Cpolygon class='cls-7' points='294.61 245.08 318.57 291.78 317.76 268.53 294.61 245.08'/%3E%3Cpolygon class='cls-7' points='416.64 268.53 415.73 291.78 439.69 245.08 416.64 268.53'/%3E%3Cpolygon class='cls-7' points='351.67 247.62 346.39 276.95 353.09 311.57 354.51 265.99 351.67 247.62'/%3E%3Cpolygon class='cls-7' points='382.63 247.62 379.89 265.89 381.21 311.57 387.91 276.95 382.63 247.62'/%3E%3Cpolygon class='cls-8' points='387.91 276.95 381.21 311.57 386.08 314.92 415.73 291.78 416.64 268.53 387.91 276.95'/%3E%3Cpolygon class='cls-8' points='317.76 268.53 318.57 291.78 348.22 314.92 353.09 311.57 346.39 276.95 317.76 268.53'/%3E%3Cpolygon class='cls-9' points='388.52 346.8 388.82 337.36 386.29 335.13 348.01 335.13 345.58 337.36 345.78 346.8 313.8 331.68 324.97 340.81 347.71 356.55 386.59 356.55 409.33 340.81 420.5 331.68 388.52 346.8'/%3E%3Cpolygon class='cls-10' points='386.08 314.92 381.21 311.57 353.09 311.57 348.22 314.92 345.58 337.36 348.01 335.13 386.29 335.13 388.82 337.36 386.08 314.92'/%3E%3Cpolygon class='cls-11' points='488.01 196.45 496.54 155.03 483.75 116.55 386.08 189.04 423.65 220.81 476.74 236.35 488.42 222.64 483.34 218.99 491.46 211.57 485.27 206.7 493.39 200.51 488.01 196.45'/%3E%3Cpolygon class='cls-11' points='237.76 155.03 246.39 196.45 240.91 200.51 249.03 206.7 242.84 211.57 250.96 218.99 245.88 222.64 257.56 236.35 310.65 220.81 348.22 189.04 250.55 116.55 237.76 155.03'/%3E%3Cpolygon class='cls-8' points='476.74 236.35 423.65 220.81 439.69 245.08 415.73 291.78 447.4 291.37 494.51 291.37 476.74 236.35'/%3E%3Cpolygon class='cls-8' points='310.65 220.81 257.56 236.35 239.89 291.37 287 291.37 318.57 291.78 294.61 245.08 310.65 220.81'/%3E%3Cpolygon class='cls-8' points='382.63 247.62 386.08 189.04 401.41 147.31 332.89 147.31 348.22 189.04 351.67 247.62 352.99 266.09 353.09 311.57 381.21 311.57 381.31 266.09 382.63 247.62'/%3E%3C/svg%3E\""

/***/ }),

/***/ "4a59":
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__("9b43");
var call = __webpack_require__("1fa8");
var isArrayIter = __webpack_require__("33a4");
var anObject = __webpack_require__("cb7c");
var toLength = __webpack_require__("9def");
var getIterFn = __webpack_require__("27ee");
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),

/***/ "4d0b":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("44f7");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("1b43fdd5", content, shadowRoot)
};

/***/ }),

/***/ "5373":
/***/ (function(module, exports) {

// Polyfill for creating CustomEvents on IE9/10/11

// code pulled from:
// https://github.com/d4tocchini/customevent-polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill

(function() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    var ce = new window.CustomEvent('test', { cancelable: true });
    ce.preventDefault();
    if (ce.defaultPrevented !== true) {
      // IE has problems with .preventDefault() on custom events
      // http://stackoverflow.com/questions/23349191
      throw new Error('Could not prevent default');
    }
  } catch (e) {
    var CustomEvent = function(event, params) {
      var evt, origPrevent;
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };

      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail
      );
      origPrevent = evt.preventDefault;
      evt.preventDefault = function() {
        origPrevent.call(this);
        try {
          Object.defineProperty(this, 'defaultPrevented', {
            get: function() {
              return true;
            }
          });
        } catch (e) {
          this.defaultPrevented = true;
        }
      };
      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent; // expose definition to window
  }
})();


/***/ }),

/***/ "551c":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__("2d00");
var global = __webpack_require__("7726");
var ctx = __webpack_require__("9b43");
var classof = __webpack_require__("23c6");
var $export = __webpack_require__("5ca1");
var isObject = __webpack_require__("d3f4");
var aFunction = __webpack_require__("d8e8");
var anInstance = __webpack_require__("f605");
var forOf = __webpack_require__("4a59");
var speciesConstructor = __webpack_require__("ebd6");
var task = __webpack_require__("1991").set;
var microtask = __webpack_require__("8079")();
var newPromiseCapabilityModule = __webpack_require__("a5b8");
var perform = __webpack_require__("9c80");
var userAgent = __webpack_require__("a25f");
var promiseResolve = __webpack_require__("bcaa");
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__("2b4c")('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__("dcbc")($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__("7f20")($Promise, PROMISE);
__webpack_require__("7a56")(PROMISE);
Wrapper = __webpack_require__("8378")[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__("5cc5")(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),

/***/ "5537":
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__("8378");
var global = __webpack_require__("7726");
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__("2d00") ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ "5a74":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var setPublicPath_i
  if ((setPublicPath_i = window.document.currentScript) && (setPublicPath_i = setPublicPath_i.src.match(/(.+\/)[^/]+\.js(\?.*)?$/))) {
    __webpack_require__.p = setPublicPath_i[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

// EXTERNAL MODULE: external "Vue"
var external_Vue_ = __webpack_require__("8bbf");
var external_Vue_default = /*#__PURE__*/__webpack_require__.n(external_Vue_);

// CONCATENATED MODULE: ./node_modules/@vue/web-component-wrapper/dist/vue-wc-wrapper.js
const camelizeRE = /-(\w)/g;
const camelize = str => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
};

const hyphenateRE = /\B([A-Z])/g;
const hyphenate = str => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
};

function getInitialProps (propsList) {
  const res = {};
  propsList.forEach(key => {
    res[key] = undefined;
  });
  return res
}

function injectHook (options, key, hook) {
  options[key] = [].concat(options[key] || []);
  options[key].unshift(hook);
}

function callHooks (vm, hook) {
  if (vm) {
    const hooks = vm.$options[hook] || [];
    hooks.forEach(hook => {
      hook.call(vm);
    });
  }
}

function createCustomEvent (name, args) {
  return new CustomEvent(name, {
    bubbles: false,
    cancelable: false,
    detail: args
  })
}

const isBoolean = val => /function Boolean/.test(String(val));
const isNumber = val => /function Number/.test(String(val));

function convertAttributeValue (value, name, { type } = {}) {
  if (isBoolean(type)) {
    if (value === 'true' || value === 'false') {
      return value === 'true'
    }
    if (value === '' || value === name) {
      return true
    }
    return value != null
  } else if (isNumber(type)) {
    const parsed = parseFloat(value, 10);
    return isNaN(parsed) ? value : parsed
  } else {
    return value
  }
}

function toVNodes (h, children) {
  const res = [];
  for (let i = 0, l = children.length; i < l; i++) {
    res.push(toVNode(h, children[i]));
  }
  return res
}

function toVNode (h, node) {
  if (node.nodeType === 3) {
    return node.data.trim() ? node.data : null
  } else if (node.nodeType === 1) {
    const data = {
      attrs: getAttributes(node),
      domProps: {
        innerHTML: node.innerHTML
      }
    };
    if (data.attrs.slot) {
      data.slot = data.attrs.slot;
      delete data.attrs.slot;
    }
    return h(node.tagName, data)
  } else {
    return null
  }
}

function getAttributes (node) {
  const res = {};
  for (let i = 0, l = node.attributes.length; i < l; i++) {
    const attr = node.attributes[i];
    res[attr.nodeName] = attr.nodeValue;
  }
  return res
}

function wrap (Vue, Component) {
  const isAsync = typeof Component === 'function' && !Component.cid;
  let isInitialized = false;
  let hyphenatedPropsList;
  let camelizedPropsList;
  let camelizedPropsMap;

  function initialize (Component) {
    if (isInitialized) return

    const options = typeof Component === 'function'
      ? Component.options
      : Component;

    // extract props info
    const propsList = Array.isArray(options.props)
      ? options.props
      : Object.keys(options.props || {});
    hyphenatedPropsList = propsList.map(hyphenate);
    camelizedPropsList = propsList.map(camelize);
    const originalPropsAsObject = Array.isArray(options.props) ? {} : options.props || {};
    camelizedPropsMap = camelizedPropsList.reduce((map, key, i) => {
      map[key] = originalPropsAsObject[propsList[i]];
      return map
    }, {});

    // proxy $emit to native DOM events
    injectHook(options, 'beforeCreate', function () {
      const emit = this.$emit;
      this.$emit = (name, ...args) => {
        this.$root.$options.customElement.dispatchEvent(createCustomEvent(name, args));
        return emit.call(this, name, ...args)
      };
    });

    injectHook(options, 'created', function () {
      // sync default props values to wrapper on created
      camelizedPropsList.forEach(key => {
        this.$root.props[key] = this[key];
      });
    });

    // proxy props as Element properties
    camelizedPropsList.forEach(key => {
      Object.defineProperty(CustomElement.prototype, key, {
        get () {
          return this._wrapper.props[key]
        },
        set (newVal) {
          this._wrapper.props[key] = newVal;
        },
        enumerable: false,
        configurable: true
      });
    });

    isInitialized = true;
  }

  function syncAttribute (el, key) {
    const camelized = camelize(key);
    const value = el.hasAttribute(key) ? el.getAttribute(key) : undefined;
    el._wrapper.props[camelized] = convertAttributeValue(
      value,
      key,
      camelizedPropsMap[camelized]
    );
  }

  class CustomElement extends HTMLElement {
    constructor () {
      super();
      this.attachShadow({ mode: 'open' });

      const wrapper = this._wrapper = new Vue({
        name: 'shadow-root',
        customElement: this,
        shadowRoot: this.shadowRoot,
        data () {
          return {
            props: {},
            slotChildren: []
          }
        },
        render (h) {
          return h(Component, {
            ref: 'inner',
            props: this.props
          }, this.slotChildren)
        }
      });

      // Use MutationObserver to react to future attribute & slot content change
      const observer = new MutationObserver(mutations => {
        let hasChildrenChange = false;
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          if (isInitialized && m.type === 'attributes' && m.target === this) {
            syncAttribute(this, m.attributeName);
          } else {
            hasChildrenChange = true;
          }
        }
        if (hasChildrenChange) {
          wrapper.slotChildren = Object.freeze(toVNodes(
            wrapper.$createElement,
            this.childNodes
          ));
        }
      });
      observer.observe(this, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    }

    get vueComponent () {
      return this._wrapper.$refs.inner
    }

    connectedCallback () {
      const wrapper = this._wrapper;
      if (!wrapper._isMounted) {
        // initialize attributes
        const syncInitialAttributes = () => {
          wrapper.props = getInitialProps(camelizedPropsList);
          hyphenatedPropsList.forEach(key => {
            syncAttribute(this, key);
          });
        };

        if (isInitialized) {
          syncInitialAttributes();
        } else {
          // async & unresolved
          Component().then(resolved => {
            if (resolved.__esModule || resolved[Symbol.toStringTag] === 'Module') {
              resolved = resolved.default;
            }
            initialize(resolved);
            syncInitialAttributes();
          });
        }
        // initialize children
        wrapper.slotChildren = Object.freeze(toVNodes(
          wrapper.$createElement,
          this.childNodes
        ));
        wrapper.$mount();
        this.shadowRoot.appendChild(wrapper.$el);
      } else {
        callHooks(this.vueComponent, 'activated');
      }
    }

    disconnectedCallback () {
      callHooks(this.vueComponent, 'deactivated');
    }
  }

  if (!isAsync) {
    initialize(Component);
  }

  return CustomElement
}

/* harmony default export */ var vue_wc_wrapper = (wrap);

// EXTERNAL MODULE: ./node_modules/css-loader/lib/css-base.js
var css_base = __webpack_require__("2350");

// EXTERNAL MODULE: ./node_modules/vue-style-loader/lib/addStylesShadow.js + 1 modules
var addStylesShadow = __webpack_require__("35d6");

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=template&id=1dafb80b&shadow
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.wrapper,attrs:{"id":"connect-web3"}},[_c('span',{staticClass:"web3-ready-info"},[(_vm.showConnectAction)?_c('button',{class:[_vm.$style.button, _vm.$style.buttonPrimary],on:{"click":function($event){_vm.isDialogOpen = true}}},[_vm._v("\n      "+_vm._s(_vm.$t("app.main.connectButton"))+"\n    ")]):_vm._e(),(_vm.signerId !== null && !_vm.isValidated)?_c('Loading'):_vm._e(),(_vm.signerId !== null && _vm.isValidated)?_c('span',[_c('NetworkIndicator',{attrs:{"network_id":_vm.networkId,"required_network":_vm.requiredNetwork,"tiny":true}}),_c('AccountIndicator',{attrs:{"account":_vm.account,"tiny":true}}),_c('button',{class:[_vm.$style.button, _vm.$style.buttonTransparent],on:{"click":_vm.changeProvider}},[_vm._v(_vm._s(_vm.$t("app.main.changeButton")))])],1):_vm._e()],1),(_vm.isDialogOpen && !_vm.isValidated)?_c('Modal',{attrs:{"signerId":_vm.signerId,"clickHandler":_vm.dialogClick}},[(!_vm.signerId)?_c('SelectProvider',{staticClass:"modal-content",attrs:{"providers":_vm.enabledProviders,"selectProvider":_vm.selectProvider}}):_vm._e(),(_vm.signerId === 'metamask' && !_vm.isValidated)?_c('Metamask',{staticClass:"modal-content"}):_vm._e(),(_vm.signerId === 'walletConnect' && !_vm.isValidated)?_c('WalletConnect',{staticClass:"modal-content"}):_vm._e(),(_vm.signerId === 'ledger' && !_vm.isValidated)?_c('Ledger',{staticClass:"modal-content"}):_vm._e()],1):_vm._e()],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/App.vue?vue&type=template&id=1dafb80b&shadow

// EXTERNAL MODULE: ./node_modules/regenerator-runtime/runtime.js
var runtime = __webpack_require__("96cf");

// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}
// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}
// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/objectSpread.js

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}
// CONCATENATED MODULE: ./node_modules/vuex/dist/vuex.esm.js
/**
 * vuex v3.0.1
 * (c) 2017 Evan You
 * @license MIT
 */
var applyMixin = function (Vue) {
  var version = Number(Vue.version.split('.')[0]);

  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    var _init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    var options = this.$options;
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
};

var devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

function devtoolPlugin (store) {
  if (!devtoolHook) { return }

  store._devtoolHook = devtoolHook;

  devtoolHook.emit('vuex:init', store);

  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState);
  });

  store.subscribe(function (mutation, state) {
    devtoolHook.emit('vuex:mutation', mutation, state);
  });
}

/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */


/**
 * forEach for object
 */
function forEachValue (obj, fn) {
  Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isPromise (val) {
  return val && typeof val.then === 'function'
}

function assert (condition, msg) {
  if (!condition) { throw new Error(("[vuex] " + msg)) }
}

var Module = function Module (rawModule, runtime) {
  this.runtime = runtime;
  this._children = Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
};

var prototypeAccessors$1 = { namespaced: { configurable: true } };

prototypeAccessors$1.namespaced.get = function () {
  return !!this._rawModule.namespaced
};

Module.prototype.addChild = function addChild (key, module) {
  this._children[key] = module;
};

Module.prototype.removeChild = function removeChild (key) {
  delete this._children[key];
};

Module.prototype.getChild = function getChild (key) {
  return this._children[key]
};

Module.prototype.update = function update (rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};

Module.prototype.forEachChild = function forEachChild (fn) {
  forEachValue(this._children, fn);
};

Module.prototype.forEachGetter = function forEachGetter (fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};

Module.prototype.forEachAction = function forEachAction (fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};

Module.prototype.forEachMutation = function forEachMutation (fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};

Object.defineProperties( Module.prototype, prototypeAccessors$1 );

var ModuleCollection = function ModuleCollection (rawRootModule) {
  // register root module (Vuex.Store options)
  this.register([], rawRootModule, false);
};

ModuleCollection.prototype.get = function get (path) {
  return path.reduce(function (module, key) {
    return module.getChild(key)
  }, this.root)
};

ModuleCollection.prototype.getNamespace = function getNamespace (path) {
  var module = this.root;
  return path.reduce(function (namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
};

ModuleCollection.prototype.update = function update$1 (rawRootModule) {
  update([], this.root, rawRootModule);
};

ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
    var this$1 = this;
    if ( runtime === void 0 ) runtime = true;

  if (false) {}

  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }

  // register nested modules
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};

ModuleCollection.prototype.unregister = function unregister (path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (!parent.getChild(key).runtime) { return }

  parent.removeChild(key);
};

function update (path, targetModule, newModule) {
  if (false) {}

  // update target module
  targetModule.update(newModule);

  // update nested modules
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (false) {}
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}

var functionAssert = {
  assert: function (value) { return typeof value === 'function'; },
  expected: 'function'
};

var objectAssert = {
  assert: function (value) { return typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'); },
  expected: 'function or object with "handler" function'
};

var assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};

function assertRawModule (path, rawModule) {
  Object.keys(assertTypes).forEach(function (key) {
    if (!rawModule[key]) { return }

    var assertOptions = assertTypes[key];

    forEachValue(rawModule[key], function (value, type) {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      );
    });
  });
}

function makeAssertionMessage (path, key, type, value, expected) {
  var buf = key + " should be " + expected + " but \"" + key + "." + type + "\"";
  if (path.length > 0) {
    buf += " in module \"" + (path.join('.')) + "\"";
  }
  buf += " is " + (JSON.stringify(value)) + ".";
  return buf
}

var Vue; // bind on install

var Store = function Store (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #731
  if (!Vue && typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  if (false) {}

  var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
  var strict = options.strict; if ( strict === void 0 ) strict = false;

  var state = options.state; if ( state === void 0 ) state = {};
  if (typeof state === 'function') {
    state = state() || {};
  }

  // store internal state
  this._committing = false;
  this._actions = Object.create(null);
  this._actionSubscribers = [];
  this._mutations = Object.create(null);
  this._wrappedGetters = Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = Object.create(null);
  this._subscribers = [];
  this._watcherVM = new Vue();

  // bind commit and dispatch to self
  var store = this;
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
  };
  this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
  };

  // strict mode
  this.strict = strict;

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], this._modules.root);

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  resetStoreVM(this, state);

  // apply plugins
  plugins.forEach(function (plugin) { return plugin(this$1); });

  if (Vue.config.devtools) {
    devtoolPlugin(this);
  }
};

var prototypeAccessors = { state: { configurable: true } };

prototypeAccessors.state.get = function () {
  return this._vm._data.$$state
};

prototypeAccessors.state.set = function (v) {
  if (false) {}
};

Store.prototype.commit = function commit (_type, _payload, _options) {
    var this$1 = this;

  // check object-style commit
  var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;

  var mutation = { type: type, payload: payload };
  var entry = this._mutations[type];
  if (!entry) {
    if (false) {}
    return
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      handler(payload);
    });
  });
  this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); });

  if (
    false
  ) {}
};

Store.prototype.dispatch = function dispatch (_type, _payload) {
    var this$1 = this;

  // check object-style dispatch
  var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;

  var action = { type: type, payload: payload };
  var entry = this._actions[type];
  if (!entry) {
    if (false) {}
    return
  }

  this._actionSubscribers.forEach(function (sub) { return sub(action, this$1.state); });

  return entry.length > 1
    ? Promise.all(entry.map(function (handler) { return handler(payload); }))
    : entry[0](payload)
};

Store.prototype.subscribe = function subscribe (fn) {
  return genericSubscribe(fn, this._subscribers)
};

Store.prototype.subscribeAction = function subscribeAction (fn) {
  return genericSubscribe(fn, this._actionSubscribers)
};

Store.prototype.watch = function watch (getter, cb, options) {
    var this$1 = this;

  if (false) {}
  return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
};

Store.prototype.replaceState = function replaceState (state) {
    var this$1 = this;

  this._withCommit(function () {
    this$1._vm._data.$$state = state;
  });
};

Store.prototype.registerModule = function registerModule (path, rawModule, options) {
    if ( options === void 0 ) options = {};

  if (typeof path === 'string') { path = [path]; }

  if (false) {}

  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  // reset store to update getters...
  resetStoreVM(this, this.state);
};

Store.prototype.unregisterModule = function unregisterModule (path) {
    var this$1 = this;

  if (typeof path === 'string') { path = [path]; }

  if (false) {}

  this._modules.unregister(path);
  this._withCommit(function () {
    var parentState = getNestedState(this$1.state, path.slice(0, -1));
    Vue.delete(parentState, path[path.length - 1]);
  });
  resetStore(this);
};

Store.prototype.hotUpdate = function hotUpdate (newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};

Store.prototype._withCommit = function _withCommit (fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};

Object.defineProperties( Store.prototype, prototypeAccessors );

function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn);
  }
  return function () {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  }
}

function resetStore (store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  store._wrappedGetters = Object.create(null);
  store._modulesNamespaceMap = Object.create(null);
  var state = store.state;
  // init all modules
  installModule(store, state, [], store._modules.root, true);
  // reset vm
  resetStoreVM(store, state, hot);
}

function resetStoreVM (store, state, hot) {
  var oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = function () { return fn(store); };
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed: computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(function () {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function () { return oldVm.$destroy(); });
  }
}

function installModule (store, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module;
  }

  // set state
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function () {
      Vue.set(parentState, moduleName, module.state);
    });
  }

  var local = module.context = makeLocalContext(store, namespace, path);

  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  module.forEachAction(function (action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });

  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
function makeLocalContext (store, namespace, path) {
  var noNamespace = namespace === '';

  var local = {
    dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if (false) {}
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if (false) {}
      }

      store.commit(type, payload, options);
    }
  };

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? function () { return store.getters; }
        : function () { return makeLocalGetters(store, namespace); }
    },
    state: {
      get: function () { return getNestedState(store.state, path); }
    }
  });

  return local
}

function makeLocalGetters (store, namespace) {
  var gettersProxy = {};

  var splitPos = namespace.length;
  Object.keys(store.getters).forEach(function (type) {
    // skip if the target getter is not match this namespace
    if (type.slice(0, splitPos) !== namespace) { return }

    // extract local getter type
    var localType = type.slice(splitPos);

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    Object.defineProperty(gettersProxy, localType, {
      get: function () { return store.getters[type]; },
      enumerable: true
    });
  });

  return gettersProxy
}

function registerMutation (store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload);
  });
}

function registerAction (store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler (payload, cb) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err);
        throw err
      })
    } else {
      return res
    }
  });
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (false) {}
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  };
}

function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, function () {
    if (false) {}
  }, { deep: true, sync: true });
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce(function (state, key) { return state[key]; }, state)
    : state
}

function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  if (false) {}

  return { type: type, payload: payload, options: options }
}

function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (false) {}
    return
  }
  Vue = _Vue;
  applyMixin(Vue);
}

var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapMutations = normalizeNamespace(function (namespace, mutations) {
  var res = {};
  normalizeMap(mutations).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedMutation () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var commit = this.$store.commit;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapMutations', namespace);
        if (!module) {
          return
        }
        commit = module.context.commit;
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var mapGetters = normalizeNamespace(function (namespace, getters) {
  var res = {};
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val;
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if (false) {}
      return this.$store.getters[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapActions = normalizeNamespace(function (namespace, actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedAction () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var dispatch = this.$store.dispatch;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapActions', namespace);
        if (!module) {
          return
        }
        dispatch = module.context.dispatch;
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var createNamespacedHelpers = function (namespace) { return ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
}); };

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}

function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map)
  }
}

function getModuleByNamespace (store, helper, namespace) {
  var module = store._modulesNamespaceMap[namespace];
  if (false) {}
  return module
}

var index_esm = {
  Store: Store,
  install: install,
  version: '3.0.1',
  mapState: mapState,
  mapMutations: mapMutations,
  mapGetters: mapGetters,
  mapActions: mapActions,
  createNamespacedHelpers: createNamespacedHelpers
};


/* harmony default export */ var vuex_esm = (index_esm);

// EXTERNAL MODULE: ./node_modules/v-tooltip/dist/v-tooltip.esm.js
var v_tooltip_esm = __webpack_require__("e37d");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.split.js
var es6_regexp_split = __webpack_require__("28a5");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.to-string.js
var es6_regexp_to_string = __webpack_require__("6b54");

// EXTERNAL MODULE: ./node_modules/lodash.merge/index.js
var lodash_merge = __webpack_require__("da81");
var lodash_merge_default = /*#__PURE__*/__webpack_require__.n(lodash_merge);

// CONCATENATED MODULE: ./node_modules/vuex-persist/dist/esm/index.js


/**
 * Created by championswimmer on 22/07/17.
 */
let MockStorage;
// @ts-ignore
{
    MockStorage = class {
        get length() {
            return Object.keys(this).length;
        }
        key(index) {
            return Object.keys(this)[index];
        }
        setItem(key, data) {
            this[key] = data.toString();
        }
        getItem(key) {
            return this[key];
        }
        removeItem(key) {
            delete this[key];
        }
        clear() {
            for (const key of Object.keys(this)) {
                delete this[key];
            }
        }
    };
}

// tslint:disable: variable-name
class SimplePromiseQueue {
    constructor() {
        this._queue = [];
        this._flushing = false;
    }
    enqueue(promise) {
        this._queue.push(promise);
        if (!this._flushing) {
            return this.flushQueue();
        }
        return Promise.resolve();
    }
    flushQueue() {
        this._flushing = true;
        const chain = () => {
            const nextTask = this._queue.shift();
            if (nextTask) {
                return nextTask.then(chain);
            }
            else {
                this._flushing = false;
            }
        };
        return Promise.resolve(chain());
    }
}

function merge(into, from) {
    return lodash_merge_default()({}, into, from);
}

let CircularJSON = JSON;
/**
 * A class that implements the vuex persistence.
 * @type S type of the 'state' inside the store (default: any)
 */
class VuexPersistence {
    /**
     * Create a {@link VuexPersistence} object.
     * Use the <code>plugin</code> function of this class as a
     * Vuex plugin.
     * @param {PersistOptions} options
     */
    constructor(options) {
        // tslint:disable-next-line:variable-name
        this._mutex = new SimplePromiseQueue();
        /**
         * Creates a subscriber on the store. automatically is used
         * when this is used a vuex plugin. Not for manual usage.
         * @param store
         */
        this.subscriber = (store) => (handler) => store.subscribe(handler);
        if (typeof options === 'undefined')
            options = {};
        this.key = ((options.key != null) ? options.key : 'vuex');
        this.subscribed = false;
        this.supportCircular = options.supportCircular || false;
        if (this.supportCircular) {
            CircularJSON = __webpack_require__("38a2");
        }
        // @ts-ignore
        if (true) {
            this.storage = options.storage || window.localStorage;
        }
        else {}
        /**
         * How this works is -
         *  1. If there is options.reducer function, we use that, if not;
         *  2. We check options.modules;
         *    1. If there is no options.modules array, we use entire state in reducer
         *    2. Otherwise, we create a reducer that merges all those state modules that are
         *        defined in the options.modules[] array
         * @type {((state: S) => {}) | ((state: S) => S) | ((state: any) => {})}
         */
        this.reducer = ((options.reducer != null)
            ? options.reducer
            : ((options.modules == null)
                ? ((state) => state)
                : ((state) => options.modules.reduce((a, i) => merge(a, { [i]: state[i] }), { /* start empty accumulator*/}))));
        this.filter = options.filter || ((mutation) => true);
        this.strictMode = options.strictMode || false;
        this.RESTORE_MUTATION = function RESTORE_MUTATION(state, savedState) {
            const mergedState = merge(state, savedState || {});
            for (const propertyName of Object.keys(mergedState)) {
                this._vm.$set(state, propertyName, mergedState[propertyName]);
            }
        };
        this.asyncStorage = options.asyncStorage || false;
        const storageConfig = this.storage && (this.storage)._config;
        this.asyncStorage = this.asyncStorage || (storageConfig && storageConfig.name) === 'localforage';
        if (this.asyncStorage) {
            /**
             * Async {@link #VuexPersistence.restoreState} implementation
             * @type {((key: string, storage?: Storage) =>
             *      (Promise<S> | S)) | ((key: string, storage: AsyncStorage) => Promise<any>)}
             */
            this.restoreState = ((options.restoreState != null)
                ? options.restoreState
                : ((key, storage) => (storage).getItem(key)
                    .then((value) => typeof value === 'string' // If string, parse, or else, just return
                    ? (this.supportCircular
                        ? CircularJSON.parse(value || '{}')
                        : JSON.parse(value || '{}'))
                    : (value || {}))));
            /**
             * Async {@link #VuexPersistence.saveState} implementation
             * @type {((key: string, state: {}, storage?: Storage) =>
             *    (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage) => Promise<void>)}
             */
            this.saveState = ((options.saveState != null)
                ? options.saveState
                : ((key, state, storage) => (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                (((storage && storage._config && storage._config.name) === 'localforage')
                    ? merge({}, state || {})
                    : (this.supportCircular
                        ? CircularJSON.stringify(state)
                        : JSON.stringify(state))))));
            /**
             * Async version of plugin
             * @param {Store<S>} store
             */
            this.plugin = (store) => {
                (this.restoreState(this.key, this.storage)).then((savedState) => {
                    /**
                     * If in strict mode, do only via mutation
                     */
                    if (this.strictMode) {
                        store.commit('RESTORE_MUTATION', savedState);
                    }
                    else {
                        store.replaceState(merge(store.state, savedState || {}));
                    }
                    this.subscriber(store)((mutation, state) => {
                        if (this.filter(mutation)) {
                            this._mutex.enqueue(this.saveState(this.key, this.reducer(state), this.storage));
                        }
                    });
                    this.subscribed = true;
                });
            };
        }
        else {
            /**
             * Sync {@link #VuexPersistence.restoreState} implementation
             * @type {((key: string, storage?: Storage) =>
             *    (Promise<S> | S)) | ((key: string, storage: Storage) => (any | string | {}))}
             */
            this.restoreState = ((options.restoreState != null)
                ? options.restoreState
                : ((key, storage) => {
                    const value = (storage).getItem(key);
                    if (typeof value === 'string') { // If string, parse, or else, just return
                        return (this.supportCircular
                            ? CircularJSON.parse(value || '{}')
                            : JSON.parse(value || '{}'));
                    }
                    else {
                        return (value || {});
                    }
                }));
            /**
             * Sync {@link #VuexPersistence.saveState} implementation
             * @type {((key: string, state: {}, storage?: Storage) =>
             *     (Promise<void> | void)) | ((key: string, state: {}, storage?: Storage) => Promise<void>)}
             */
            this.saveState = ((options.saveState != null)
                ? options.saveState
                : ((key, state, storage) => (storage).setItem(key, // Second argument is state _object_ if localforage, stringified otherwise
                (this.supportCircular
                    ? CircularJSON.stringify(state)
                    : JSON.stringify(state)))));
            /**
             * Sync version of plugin
             * @param {Store<S>} store
             */
            this.plugin = (store) => {
                const savedState = this.restoreState(this.key, this.storage);
                if (this.strictMode) {
                    store.commit('RESTORE_MUTATION', savedState);
                }
                else {
                    store.replaceState(merge(store.state, savedState || {}));
                }
                this.subscriber(store)((mutation, state) => {
                    if (this.filter(mutation)) {
                        this.saveState(this.key, this.reducer(state), this.storage);
                    }
                });
                this.subscribed = true;
            };
        }
    }
}

/* harmony default export */ var esm = (VuexPersistence);

//# sourceMappingURL=index.js.map

// EXTERNAL MODULE: ./node_modules/custom-event-polyfill/polyfill.js
var polyfill = __webpack_require__("5373");

// CONCATENATED MODULE: ./src/conf/default.props.js
/* harmony default export */ var default_props = ({
  walletConnect: {
    // bridgeUrl: 'https://bridge.walletconnect.org',
    bridgeUrl: 'https://test-bridge.walletconnect.org'
  },
  enabledProviders: [{
    id: 'metamask'
  }, {
    id: 'walletConnect'
  }, {
    id: 'ledger'
  }]
});
// CONCATENATED MODULE: ./src/store.js









external_Vue_default.a.use(vuex_esm);

var Web3ReadyPlugin = store => {
  // signerId set
  store.subscribe(
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(mutation, state) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (mutation.type === 'signerId') {
                // console.log('signerId@plugin', state.signerId)
                if (state.signerId === null) {
                  if (state.provider) {
                    if (typeof store.getters.provider.destroy === 'function') {
                      store.getters.provider.destroy();
                    }

                    store.commit('provider', null);
                  }
                } else {
                  store.dispatch('provider');
                }
              }

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }()); // web3 initialized

  store.subscribe(
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(mutation, state) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (mutation.type === 'provider') {
                // console.log('web3@plugin', typeof state.provider === 'function' && state.provider().web3)
                if (state.provider === null) {
                  store.commit('networkId', null);
                  store.commit('account', null);
                }
              }

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }()); // networkId set

  store.subscribe(
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(mutation, state) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (mutation.type === 'networkId') {
                // console.log('networkId@plugin', state.networkId)
                if (state.networkId === null) {
                  store.commit('account', null);
                }
              }

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }());
};

var persist = new esm({
  storage: window.localStorage,
  reducer: state => ({
    signerId: state.signerId,
    // Persisting only data for selected provider.
    lastAccountData: state.lastAccountData
  })
});
var store_store = new vuex_esm.Store({
  plugins: [Web3ReadyPlugin, persist.plugin],
  state: {
    enabledProviders: null,
    dappName: null,
    rpcUrl: null,
    lastAccountData: null,
    walletConnect: null,
    // Final values
    signerId: null,
    provider: null,
    networkId: null,
    account: null
  },
  getters: {
    provider(state) {
      if (typeof state.provider === 'function') {
        return state.provider();
      }

      return null;
    },

    // eslint-disable-next-line
    isValidated: state => {
      return state.networkId && state.provider && state.account && state.networkId.toString() === state.requiredNetwork;
    },

    requiredNetwork(state) {
      return state.requiredNetwork.toString();
    },

    walletConnectConfig(state) {
      return {
        bridgeUrl: state.walletConnect.bridgeUrl,
        dappName: state.dappName,
        rpcUrl: state.rpcUrl
      };
    },

    ledgerConfig(state) {
      return {
        dappName: state.dappName,
        rpcUrl: state.rpcUrl,
        networkId: state.requiredNetwork
      };
    }

  },
  actions: {
    // Initially setup store and verify required properties.
    initStore(_ref4, propsData) {
      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        var commit, providers;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                commit = _ref4.commit;

                if (!propsData.dappName) {
                  _context4.next = 5;
                  break;
                }

                commit('dappName', propsData.dappName);
                _context4.next = 6;
                break;

              case 5:
                throw new Error('Property dappName missing.');

              case 6:
                if (!propsData.requiredNetwork) {
                  _context4.next = 10;
                  break;
                }

                commit('requiredNetwork', propsData.requiredNetwork);
                _context4.next = 11;
                break;

              case 10:
                throw new Error('Property requiredNetwork is missing');

              case 11:
                if (!propsData.rpcUrl) {
                  _context4.next = 15;
                  break;
                }

                commit('rpcUrl', propsData.rpcUrl);
                _context4.next = 16;
                break;

              case 15:
                throw new Error('Property rpcUrl is missing');

              case 16:
                if (!propsData.enableProviders) {
                  _context4.next = 25;
                  break;
                }

                providers = propsData.enableProviders.split(',');

                if (!providers.length) {
                  _context4.next = 22;
                  break;
                }

                // eslint-disable-next-line
                commit('enabledProviders', providers.map(provider => {
                  return {
                    id: provider
                  };
                }));
                _context4.next = 23;
                break;

              case 22:
                throw new Error('No provider is enabled. Require at least one. Remove property to use defaults.');

              case 23:
                _context4.next = 26;
                break;

              case 25:
                commit('enabledProviders', default_props.enabledProviders);

              case 26:
                // Verify optional WalletConnect settings.
                if (typeof propsData.walletConnect === 'object' && propsData.walletConnect.bridgeUrl) {
                  if (propsData.enableProviders.length) {
                    commit('walletConnect', propsData.walletConnect);
                  } else {// throw new Info('WalletConnect settings ore wrong. Using default.')
                  }
                } else {
                  commit('walletConnect', default_props.walletConnect);
                }

              case 27:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }))();
    },

    provider(_ref5) {
      var _this = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5() {
        var state, commit, Web3Module, provider;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                state = _ref5.state, commit = _ref5.commit;
                _context5.next = 3;
                return Promise.all(/* import() | web3 */[__webpack_require__.e(0), __webpack_require__.e(2), __webpack_require__.e(6), __webpack_require__.e(8)]).then(__webpack_require__.bind(null, "e20d"));

              case 3:
                Web3Module = _context5.sent;
                _context5.next = 6;
                return external_Vue_default.a.prototype.web3ProviderApi[state.signerId].createProvider(Web3Module.default, // Web3 Factory.
                account => {
                  _this.dispatch('account', account);
                }, networkId => {
                  _this.dispatch('networkId', networkId);
                }, () => {
                  _this.dispatch('resetProvider');
                });

              case 6:
                provider = _context5.sent;
                commit('provider', () => provider);

              case 8:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }))();
    },

    providerAutoValidate(_ref6) {
      var _this2 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6() {
        var state, commit, Web3Module, provider;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                state = _ref6.state, commit = _ref6.commit;
                _context6.next = 3;
                return Promise.all(/* import() | web3 */[__webpack_require__.e(0), __webpack_require__.e(2), __webpack_require__.e(6), __webpack_require__.e(8)]).then(__webpack_require__.bind(null, "e20d"));

              case 3:
                Web3Module = _context6.sent;
                _context6.next = 6;
                return external_Vue_default.a.prototype.web3ProviderApi[state.signerId].createAutovalidateProvider(Web3Module.default, // Web3 Factory.
                account => {
                  _this2.dispatch('account', account);
                }, networkId => {
                  _this2.dispatch('networkIdRequired', networkId);
                }, () => {
                  _this2.dispatch('resetProvider');
                }, true);

              case 6:
                provider = _context6.sent;

                if (provider) {
                  commit('provider', () => provider);
                } else {
                  commit('signerId', null);
                }

              case 8:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }))();
    },

    resetProvider(_ref7) {
      var _this3 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7() {
        var commit;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                commit = _ref7.commit;
                commit('signerId', null);
                commit('provider', null);
                commit('account', null);

                _this3.dispatch('callWeb3Ready');

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }))();
    },

    networkId(_ref8, networkId) {
      var _this4 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8() {
        var commit;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                commit = _ref8.commit;

                if (networkId) {
                  commit('networkId', networkId.toString());
                }

                _this4.dispatch('callWeb3Ready');

              case 3:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }))();
    },

    networkIdRequired(_ref9, networkId) {
      var _this5 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9() {
        var commit;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                commit = _ref9.commit;

                if (networkId && networkId === _this5.getters.requiredNetwork) {
                  commit('networkId', networkId);

                  _this5.dispatch('callWeb3Ready');
                } else {
                  _this5.dispatch('resetProvider');
                }

              case 2:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }))();
    },

    account(_ref10, account) {
      var _this6 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10() {
        var commit;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                commit = _ref10.commit;

                if (_this6.state.account !== account) {
                  commit('account', account);

                  _this6.dispatch('callWeb3Ready');
                }

              case 2:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }))();
    },

    callWeb3Ready(_ref11) {
      var getters = _ref11.getters;
      // console.log('callWeb3Ready', {
      //   web3: (getters.provider && getters.provider.web3) || null,
      //   account: this.state.account,
      // })
      var event = new CustomEvent('web3Ready', {
        detail: {
          web3: getters.provider && getters.provider.web3 || null,
          account: this.state.account
        }
      });
      window.dispatchEvent(event);
    }

  },
  mutations: {
    // Mutations MUST be synchronous.
    requiredNetwork(state, requiredNetwork) {
      state.requiredNetwork = requiredNetwork;
    },

    dappName(state, dappName) {
      state.dappName = dappName;
    },

    rpcUrl(state, rpcUrl) {
      state.rpcUrl = rpcUrl;
    },

    enabledProviders(state, enabledProviders) {
      state.enabledProviders = enabledProviders;
    },

    walletConnect(state, walletConnect) {
      state.walletConnect = walletConnect;
    },

    signerId(state, signerId) {
      state.signerId = signerId;
    },

    provider(state, provider) {
      state.provider = provider;
    },

    networkId(state, networkId) {
      state.networkId = networkId;
    },

    account(state, account) {
      state.account = account;
    },

    lastAccountData(state, lastAccountData) {
      state.lastAccountData = lastAccountData;
    }

  },
  strict: "production" !== 'production'
});
/* harmony default export */ var src_store = (store_store);
// CONCATENATED MODULE: ./node_modules/vue-i18n/dist/vue-i18n.esm.js
/*!
 * vue-i18n v8.3.1 
 * (c) 2018 kazuya kawaguchi
 * Released under the MIT License.
 */
/*  */

/**
 * utilites
 */

function warn (msg, err) {
  if (typeof console !== 'undefined') {
    console.warn('[vue-i18n] ' + msg);
    /* istanbul ignore if */
    if (err) {
      console.warn(err.stack);
    }
  }
}

function vue_i18n_esm_isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

var vue_i18n_esm_toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject (obj) {
  return vue_i18n_esm_toString.call(obj) === OBJECT_STRING
}

function isNull (val) {
  return val === null || val === undefined
}

function parseArgs () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var locale = null;
  var params = null;
  if (args.length === 1) {
    if (vue_i18n_esm_isObject(args[0]) || Array.isArray(args[0])) {
      params = args[0];
    } else if (typeof args[0] === 'string') {
      locale = args[0];
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      locale = args[0];
    }
    /* istanbul ignore if */
    if (vue_i18n_esm_isObject(args[1]) || Array.isArray(args[1])) {
      params = args[1];
    }
  }

  return { locale: locale, params: params }
}

function looseClone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

var vue_i18n_esm_hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return vue_i18n_esm_hasOwnProperty.call(obj, key)
}

function vue_i18n_esm_merge (target) {
  var arguments$1 = arguments;

  var output = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments$1[i];
    if (source !== undefined && source !== null) {
      var key = (void 0);
      for (key in source) {
        if (hasOwn(source, key)) {
          if (vue_i18n_esm_isObject(source[key])) {
            output[key] = vue_i18n_esm_merge(output[key], source[key]);
          } else {
            output[key] = source[key];
          }
        }
      }
    }
  }
  return output
}

function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = vue_i18n_esm_isObject(a);
  var isObjectB = vue_i18n_esm_isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

var canUseDateTimeFormat =
  typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined';

var canUseNumberFormat =
  typeof Intl !== 'undefined' && typeof Intl.NumberFormat !== 'undefined';

/*  */

function extend (Vue) {
  if (!Vue.prototype.hasOwnProperty('$i18n')) {
    // $FlowFixMe
    Object.defineProperty(Vue.prototype, '$i18n', {
      get: function get () { return this._i18n }
    });
  }

  Vue.prototype.$t = function (key) {
    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

    var i18n = this.$i18n;
    return i18n._t.apply(i18n, [ key, i18n.locale, i18n._getMessages(), this ].concat( values ))
  };

  Vue.prototype.$tc = function (key, choice) {
    var values = [], len = arguments.length - 2;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 2 ];

    var i18n = this.$i18n;
    return i18n._tc.apply(i18n, [ key, i18n.locale, i18n._getMessages(), this, choice ].concat( values ))
  };

  Vue.prototype.$te = function (key, locale) {
    var i18n = this.$i18n;
    return i18n._te(key, i18n.locale, i18n._getMessages(), locale)
  };

  Vue.prototype.$d = function (value) {
    var ref;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    return (ref = this.$i18n).d.apply(ref, [ value ].concat( args ))
  };

  Vue.prototype.$n = function (value) {
    var ref;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    return (ref = this.$i18n).n.apply(ref, [ value ].concat( args ))
  };
}

/*  */

var mixin = {
  beforeCreate: function beforeCreate () {
    var options = this.$options;
    options.i18n = options.i18n || (options.__i18n ? {} : null);

    if (options.i18n) {
      if (options.i18n instanceof VueI18n) {
        // init locale messages via custom blocks
        if (options.__i18n) {
          try {
            var localeMessages = {};
            options.__i18n.forEach(function (resource) {
              localeMessages = vue_i18n_esm_merge(localeMessages, JSON.parse(resource));
            });
            Object.keys(localeMessages).forEach(function (locale) {
              options.i18n.mergeLocaleMessage(locale, localeMessages[locale]);
            });
          } catch (e) {
            if (false) {}
          }
        }
        this._i18n = options.i18n;
        this._i18nWatcher = this._i18n.watchI18nData();
        this._i18n.subscribeDataChanging(this);
        this._subscribing = true;
      } else if (isPlainObject(options.i18n)) {
        // component local i18n
        if (this.$root && this.$root.$i18n && this.$root.$i18n instanceof VueI18n) {
          options.i18n.root = this.$root;
          options.i18n.formatter = this.$root.$i18n.formatter;
          options.i18n.fallbackLocale = this.$root.$i18n.fallbackLocale;
          options.i18n.silentTranslationWarn = this.$root.$i18n.silentTranslationWarn;
        }

        // init locale messages via custom blocks
        if (options.__i18n) {
          try {
            var localeMessages$1 = {};
            options.__i18n.forEach(function (resource) {
              localeMessages$1 = vue_i18n_esm_merge(localeMessages$1, JSON.parse(resource));
            });
            options.i18n.messages = localeMessages$1;
          } catch (e) {
            if (false) {}
          }
        }

        this._i18n = new VueI18n(options.i18n);
        this._i18nWatcher = this._i18n.watchI18nData();
        this._i18n.subscribeDataChanging(this);
        this._subscribing = true;

        if (options.i18n.sync === undefined || !!options.i18n.sync) {
          this._localeWatcher = this.$i18n.watchLocale();
        }
      } else {
        if (false) {}
      }
    } else if (this.$root && this.$root.$i18n && this.$root.$i18n instanceof VueI18n) {
      // root i18n
      this._i18n = this.$root.$i18n;
      this._i18n.subscribeDataChanging(this);
      this._subscribing = true;
    } else if (options.parent && options.parent.$i18n && options.parent.$i18n instanceof VueI18n) {
      // parent i18n
      this._i18n = options.parent.$i18n;
      this._i18n.subscribeDataChanging(this);
      this._subscribing = true;
    }
  },

  beforeDestroy: function beforeDestroy () {
    if (!this._i18n) { return }

    if (this._subscribing) {
      this._i18n.unsubscribeDataChanging(this);
      delete this._subscribing;
    }

    if (this._i18nWatcher) {
      this._i18nWatcher();
      delete this._i18nWatcher;
    }

    if (this._localeWatcher) {
      this._localeWatcher();
      delete this._localeWatcher;
    }

    this._i18n = null;
  }
};

/*  */

var component = {
  name: 'i18n',
  functional: true,
  props: {
    tag: {
      type: String,
      default: 'span'
    },
    path: {
      type: String,
      required: true
    },
    locale: {
      type: String
    },
    places: {
      type: [Array, Object]
    }
  },
  render: function render (h, ref) {
    var props = ref.props;
    var data = ref.data;
    var children = ref.children;
    var parent = ref.parent;

    var i18n = parent.$i18n;

    children = (children || []).filter(function (child) {
      return child.tag || (child.text = child.text.trim())
    });

    if (!i18n) {
      if (false) {}
      return children
    }

    var path = props.path;
    var locale = props.locale;

    var params = {};
    var places = props.places || {};

    var hasPlaces = Array.isArray(places)
      ? places.length > 0
      : Object.keys(places).length > 0;

    var everyPlace = children.every(function (child) {
      if (child.data && child.data.attrs) {
        var place = child.data.attrs.place;
        return (typeof place !== 'undefined') && place !== ''
      }
    });

    if (false) {}

    if (Array.isArray(places)) {
      places.forEach(function (el, i) {
        params[i] = el;
      });
    } else {
      Object.keys(places).forEach(function (key) {
        params[key] = places[key];
      });
    }

    children.forEach(function (child, i) {
      var key = everyPlace
        ? ("" + (child.data.attrs.place))
        : ("" + i);
      params[key] = child;
    });

    return h(props.tag, data, i18n.i(path, locale, params))
  }
};

/*  */

function bind (el, binding, vnode) {
  if (!vue_i18n_esm_assert(el, vnode)) { return }

  t(el, binding, vnode);
}

function vue_i18n_esm_update (el, binding, vnode, oldVNode) {
  if (!vue_i18n_esm_assert(el, vnode)) { return }

  var i18n = vnode.context.$i18n;
  if (localeEqual(el, vnode) &&
    (looseEqual(binding.value, binding.oldValue) &&
     looseEqual(el._localeMessage, i18n.getLocaleMessage(i18n.locale)))) { return }

  t(el, binding, vnode);
}

function unbind (el, binding, vnode, oldVNode) {
  var vm = vnode.context;
  if (!vm) {
    warn('Vue instance does not exists in VNode context');
    return
  }

  el.textContent = '';
  el._vt = undefined;
  delete el['_vt'];
  el._locale = undefined;
  delete el['_locale'];
  el._localeMessage = undefined;
  delete el['_localeMessage'];
}

function vue_i18n_esm_assert (el, vnode) {
  var vm = vnode.context;
  if (!vm) {
    warn('Vue instance doest not exists in VNode context');
    return false
  }

  if (!vm.$i18n) {
    warn('VueI18n instance does not exists in Vue instance');
    return false
  }

  return true
}

function localeEqual (el, vnode) {
  var vm = vnode.context;
  return el._locale === vm.$i18n.locale
}

function t (el, binding, vnode) {
  var ref$1, ref$2;

  var value = binding.value;

  var ref = parseValue(value);
  var path = ref.path;
  var locale = ref.locale;
  var args = ref.args;
  var choice = ref.choice;
  if (!path && !locale && !args) {
    warn('value type not supported');
    return
  }

  if (!path) {
    warn('`path` is required in v-t directive');
    return
  }

  var vm = vnode.context;
  if (choice) {
    el._vt = el.textContent = (ref$1 = vm.$i18n).tc.apply(ref$1, [ path, choice ].concat( makeParams(locale, args) ));
  } else {
    el._vt = el.textContent = (ref$2 = vm.$i18n).t.apply(ref$2, [ path ].concat( makeParams(locale, args) ));
  }
  el._locale = vm.$i18n.locale;
  el._localeMessage = vm.$i18n.getLocaleMessage(vm.$i18n.locale);
}

function parseValue (value) {
  var path;
  var locale;
  var args;
  var choice;

  if (typeof value === 'string') {
    path = value;
  } else if (isPlainObject(value)) {
    path = value.path;
    locale = value.locale;
    args = value.args;
    choice = value.choice;
  }

  return { path: path, locale: locale, args: args, choice: choice }
}

function makeParams (locale, args) {
  var params = [];

  locale && params.push(locale);
  if (args && (Array.isArray(args) || isPlainObject(args))) {
    params.push(args);
  }

  return params
}

var vue_i18n_esm_Vue;

function vue_i18n_esm_install (_Vue) {
  /* istanbul ignore if */
  if (false) {}
  vue_i18n_esm_install.installed = true;

  vue_i18n_esm_Vue = _Vue;

  var version = (vue_i18n_esm_Vue.version && Number(vue_i18n_esm_Vue.version.split('.')[0])) || -1;
  /* istanbul ignore if */
  if (false) {}

  extend(vue_i18n_esm_Vue);
  vue_i18n_esm_Vue.mixin(mixin);
  vue_i18n_esm_Vue.directive('t', { bind: bind, update: vue_i18n_esm_update, unbind: unbind });
  vue_i18n_esm_Vue.component(component.name, component);

  // use simple mergeStrategies to prevent i18n instance lose '__proto__'
  var strats = vue_i18n_esm_Vue.config.optionMergeStrategies;
  strats.i18n = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };
}

/*  */

var BaseFormatter = function BaseFormatter () {
  this._caches = Object.create(null);
};

BaseFormatter.prototype.interpolate = function interpolate (message, values) {
  if (!values) {
    return [message]
  }
  var tokens = this._caches[message];
  if (!tokens) {
    tokens = parse(message);
    this._caches[message] = tokens;
  }
  return compile(tokens, values)
};



var RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
var RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;

function parse (format) {
  var tokens = [];
  var position = 0;

  var text = '';
  while (position < format.length) {
    var char = format[position++];
    if (char === '{') {
      if (text) {
        tokens.push({ type: 'text', value: text });
      }

      text = '';
      var sub = '';
      char = format[position++];
      while (char !== undefined && char !== '}') {
        sub += char;
        char = format[position++];
      }
      var isClosed = char === '}';

      var type = RE_TOKEN_LIST_VALUE.test(sub)
        ? 'list'
        : isClosed && RE_TOKEN_NAMED_VALUE.test(sub)
          ? 'named'
          : 'unknown';
      tokens.push({ value: sub, type: type });
    } else if (char === '%') {
      // when found rails i18n syntax, skip text capture
      if (format[(position)] !== '{') {
        text += char;
      }
    } else {
      text += char;
    }
  }

  text && tokens.push({ type: 'text', value: text });

  return tokens
}

function compile (tokens, values) {
  var compiled = [];
  var index = 0;

  var mode = Array.isArray(values)
    ? 'list'
    : vue_i18n_esm_isObject(values)
      ? 'named'
      : 'unknown';
  if (mode === 'unknown') { return compiled }

  while (index < tokens.length) {
    var token = tokens[index];
    switch (token.type) {
      case 'text':
        compiled.push(token.value);
        break
      case 'list':
        compiled.push(values[parseInt(token.value, 10)]);
        break
      case 'named':
        if (mode === 'named') {
          compiled.push((values)[token.value]);
        } else {
          if (false) {}
        }
        break
      case 'unknown':
        if (false) {}
        break
    }
    index++;
  }

  return compiled
}

/*  */

/**
 *  Path paerser
 *  - Inspired:
 *    Vue.js Path parser
 */

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Check if an expression is a literal value.
 */

var literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function isLiteral (exp) {
  return literalValueRE.test(exp)
}

/**
 * Strip quotes from a string
 */

function stripQuotes (str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27)
    ? str.slice(1, -1)
    : str
}

/**
 * Determine the type of a character in a keypath.
 */

function getPathCharType (ch) {
  if (ch === undefined || ch === null) { return 'eof' }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
      return ch

    case 0x5F: // _
    case 0x24: // $
    case 0x2D: // -
      return 'ident'

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0:  // No-break space
    case 0xFEFF:  // Byte Order Mark
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return 'ws'
  }

  return 'ident'
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 */

function formatSubPath (path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) { return false }

  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed
}

/**
 * Parse a string path into an array of segments
 */

function parse$1 (path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c;
  var key;
  var newChar;
  var type;
  var transition;
  var action;
  var typeMap;
  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote () {
    var nextChar = path[index + 1];
    if ((mode === IN_SINGLE_QUOTE && nextChar === "'") ||
      (mode === IN_DOUBLE_QUOTE && nextChar === '"')) {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true
    }
  }

  while (mode !== null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined
        ? c
        : newChar;
      if (action() === false) {
        return
      }
    }

    if (mode === AFTER_PATH) {
      return keys
    }
  }
}





var I18nPath = function I18nPath () {
  this._cache = Object.create(null);
};

/**
 * External parse that check for a cache hit first
 */
I18nPath.prototype.parsePath = function parsePath (path) {
  var hit = this._cache[path];
  if (!hit) {
    hit = parse$1(path);
    if (hit) {
      this._cache[path] = hit;
    }
  }
  return hit || []
};

/**
 * Get path value from path string
 */
I18nPath.prototype.getPathValue = function getPathValue (obj, path) {
  if (!vue_i18n_esm_isObject(obj)) { return null }

  var paths = this.parsePath(path);
  if (paths.length === 0) {
    return null
  } else {
    var length = paths.length;
    var last = obj;
    var i = 0;
    while (i < length) {
      var value = last[paths[i]];
      if (value === undefined) {
        return null
      }
      last = value;
      i++;
    }

    return last
  }
};

/*  */



var numberFormatKeys = [
  'style',
  'currency',
  'currencyDisplay',
  'useGrouping',
  'minimumIntegerDigits',
  'minimumFractionDigits',
  'maximumFractionDigits',
  'minimumSignificantDigits',
  'maximumSignificantDigits',
  'localeMatcher',
  'formatMatcher'
];
var linkKeyMatcher = /(@:([\w\-_|.]+|\([\w\-_|.]+\)))/g;
var bracketsMatcher = /[()]/g;

var VueI18n = function VueI18n (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #290
  /* istanbul ignore if */
  if (!vue_i18n_esm_Vue && typeof window !== 'undefined' && window.Vue) {
    vue_i18n_esm_install(window.Vue);
  }

  var locale = options.locale || 'en-US';
  var fallbackLocale = options.fallbackLocale || 'en-US';
  var messages = options.messages || {};
  var dateTimeFormats = options.dateTimeFormats || {};
  var numberFormats = options.numberFormats || {};

  this._vm = null;
  this._formatter = options.formatter || new BaseFormatter();
  this._missing = options.missing || null;
  this._root = options.root || null;
  this._sync = options.sync === undefined ? true : !!options.sync;
  this._fallbackRoot = options.fallbackRoot === undefined
    ? true
    : !!options.fallbackRoot;
  this._silentTranslationWarn = options.silentTranslationWarn === undefined
    ? false
    : !!options.silentTranslationWarn;
  this._dateTimeFormatters = {};
  this._numberFormatters = {};
  this._path = new I18nPath();
  this._dataListeners = [];

  this._exist = function (message, key) {
    if (!message || !key) { return false }
    return !isNull(this$1._path.getPathValue(message, key))
  };

  this._initVM({
    locale: locale,
    fallbackLocale: fallbackLocale,
    messages: messages,
    dateTimeFormats: dateTimeFormats,
    numberFormats: numberFormats
  });
};

var vue_i18n_esm_prototypeAccessors = { vm: { configurable: true },messages: { configurable: true },dateTimeFormats: { configurable: true },numberFormats: { configurable: true },locale: { configurable: true },fallbackLocale: { configurable: true },missing: { configurable: true },formatter: { configurable: true },silentTranslationWarn: { configurable: true } };

VueI18n.prototype._initVM = function _initVM (data) {
  var silent = vue_i18n_esm_Vue.config.silent;
  vue_i18n_esm_Vue.config.silent = true;
  this._vm = new vue_i18n_esm_Vue({ data: data });
  vue_i18n_esm_Vue.config.silent = silent;
};

VueI18n.prototype.subscribeDataChanging = function subscribeDataChanging (vm) {
  this._dataListeners.push(vm);
};

VueI18n.prototype.unsubscribeDataChanging = function unsubscribeDataChanging (vm) {
  remove(this._dataListeners, vm);
};

VueI18n.prototype.watchI18nData = function watchI18nData () {
  var self = this;
  return this._vm.$watch('$data', function () {
    var i = self._dataListeners.length;
    while (i--) {
      vue_i18n_esm_Vue.nextTick(function () {
        self._dataListeners[i] && self._dataListeners[i].$forceUpdate();
      });
    }
  }, { deep: true })
};

VueI18n.prototype.watchLocale = function watchLocale () {
  /* istanbul ignore if */
  if (!this._sync || !this._root) { return null }
  var target = this._vm;
  return this._root.$i18n.vm.$watch('locale', function (val) {
    target.$set(target, 'locale', val);
    target.$forceUpdate();
  }, { immediate: true })
};

vue_i18n_esm_prototypeAccessors.vm.get = function () { return this._vm };

vue_i18n_esm_prototypeAccessors.messages.get = function () { return looseClone(this._getMessages()) };
vue_i18n_esm_prototypeAccessors.dateTimeFormats.get = function () { return looseClone(this._getDateTimeFormats()) };
vue_i18n_esm_prototypeAccessors.numberFormats.get = function () { return looseClone(this._getNumberFormats()) };

vue_i18n_esm_prototypeAccessors.locale.get = function () { return this._vm.locale };
vue_i18n_esm_prototypeAccessors.locale.set = function (locale) {
  this._vm.$set(this._vm, 'locale', locale);
};

vue_i18n_esm_prototypeAccessors.fallbackLocale.get = function () { return this._vm.fallbackLocale };
vue_i18n_esm_prototypeAccessors.fallbackLocale.set = function (locale) {
  this._vm.$set(this._vm, 'fallbackLocale', locale);
};

vue_i18n_esm_prototypeAccessors.missing.get = function () { return this._missing };
vue_i18n_esm_prototypeAccessors.missing.set = function (handler) { this._missing = handler; };

vue_i18n_esm_prototypeAccessors.formatter.get = function () { return this._formatter };
vue_i18n_esm_prototypeAccessors.formatter.set = function (formatter) { this._formatter = formatter; };

vue_i18n_esm_prototypeAccessors.silentTranslationWarn.get = function () { return this._silentTranslationWarn };
vue_i18n_esm_prototypeAccessors.silentTranslationWarn.set = function (silent) { this._silentTranslationWarn = silent; };

VueI18n.prototype._getMessages = function _getMessages () { return this._vm.messages };
VueI18n.prototype._getDateTimeFormats = function _getDateTimeFormats () { return this._vm.dateTimeFormats };
VueI18n.prototype._getNumberFormats = function _getNumberFormats () { return this._vm.numberFormats };

VueI18n.prototype._warnDefault = function _warnDefault (locale, key, result, vm, values) {
  if (!isNull(result)) { return result }
  if (this._missing) {
    var missingRet = this._missing.apply(null, [locale, key, vm, values]);
    if (typeof missingRet === 'string') {
      return missingRet
    }
  } else {
    if (false) {}
  }
  return key
};

VueI18n.prototype._isFallbackRoot = function _isFallbackRoot (val) {
  return !val && !isNull(this._root) && this._fallbackRoot
};

VueI18n.prototype._interpolate = function _interpolate (
  locale,
  message,
  key,
  host,
  interpolateMode,
  values,
  visitedLinkStack
) {
  if (!message) { return null }

  var pathRet = this._path.getPathValue(message, key);
  if (Array.isArray(pathRet) || isPlainObject(pathRet)) { return pathRet }

  var ret;
  if (isNull(pathRet)) {
    /* istanbul ignore else */
    if (isPlainObject(message)) {
      ret = message[key];
      if (typeof ret !== 'string') {
        if (false) {}
        return null
      }
    } else {
      return null
    }
  } else {
    /* istanbul ignore else */
    if (typeof pathRet === 'string') {
      ret = pathRet;
    } else {
      if (false) {}
      return null
    }
  }

  // Check for the existance of links within the translated string
  if (ret.indexOf('@:') >= 0) {
    ret = this._link(locale, message, ret, host, interpolateMode, values, visitedLinkStack);
  }

  return this._render(ret, interpolateMode, values)
};

VueI18n.prototype._link = function _link (
  locale,
  message,
  str,
  host,
  interpolateMode,
  values,
  visitedLinkStack
) {
    var this$1 = this;

  var ret = str;

  // Match all the links within the local
  // We are going to replace each of
  // them with its translation
  var matches = ret.match(linkKeyMatcher);
  for (var idx in matches) {
    // ie compatible: filter custom array
    // prototype method
    if (!matches.hasOwnProperty(idx)) {
      continue
    }
    var link = matches[idx];
    // Remove the leading @: and the brackets
    var linkPlaceholder = link.substr(2).replace(bracketsMatcher, '');

    if (visitedLinkStack.includes(linkPlaceholder)) {
      if (false) {}
      return ret
    }
    visitedLinkStack.push(linkPlaceholder);

    // Translate the link
    var translated = this$1._interpolate(
      locale, message, linkPlaceholder, host,
      interpolateMode === 'raw' ? 'string' : interpolateMode,
      interpolateMode === 'raw' ? undefined : values,
      visitedLinkStack
    );

    if (this$1._isFallbackRoot(translated)) {
      if (false) {}
      /* istanbul ignore if */
      if (!this$1._root) { throw Error('unexpected error') }
      var root = this$1._root.$i18n;
      translated = root._translate(
        root._getMessages(), root.locale, root.fallbackLocale,
        linkPlaceholder, host, interpolateMode, values
      );
    }
    translated = this$1._warnDefault(
      locale, linkPlaceholder, translated, host,
      Array.isArray(values) ? values : [values]
    );

    visitedLinkStack.pop();

    // Replace the link with the translated
    ret = !translated ? ret : ret.replace(link, translated);
  }

  return ret
};

VueI18n.prototype._render = function _render (message, interpolateMode, values) {
  var ret = this._formatter.interpolate(message, values);
  // if interpolateMode is **not** 'string' ('row'),
  // return the compiled data (e.g. ['foo', VNode, 'bar']) with formatter
  return interpolateMode === 'string' ? ret.join('') : ret
};

VueI18n.prototype._translate = function _translate (
  messages,
  locale,
  fallback,
  key,
  host,
  interpolateMode,
  args
) {
  var res =
    this._interpolate(locale, messages[locale], key, host, interpolateMode, args, [key]);
  if (!isNull(res)) { return res }

  res = this._interpolate(fallback, messages[fallback], key, host, interpolateMode, args, [key]);
  if (!isNull(res)) {
    if (false) {}
    return res
  } else {
    return null
  }
};

VueI18n.prototype._t = function _t (key, _locale, messages, host) {
    var ref;

    var values = [], len = arguments.length - 4;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 4 ];
  if (!key) { return '' }

  var parsedArgs = parseArgs.apply(void 0, values);
  var locale = parsedArgs.locale || _locale;

  var ret = this._translate(
    messages, locale, this.fallbackLocale, key,
    host, 'string', parsedArgs.params
  );
  if (this._isFallbackRoot(ret)) {
    if (false) {}
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return (ref = this._root).$t.apply(ref, [ key ].concat( values ))
  } else {
    return this._warnDefault(locale, key, ret, host, values)
  }
};

VueI18n.prototype.t = function t (key) {
    var ref;

    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];
  return (ref = this)._t.apply(ref, [ key, this.locale, this._getMessages(), null ].concat( values ))
};

VueI18n.prototype._i = function _i (key, locale, messages, host, values) {
  var ret =
    this._translate(messages, locale, this.fallbackLocale, key, host, 'raw', values);
  if (this._isFallbackRoot(ret)) {
    if (false) {}
    if (!this._root) { throw Error('unexpected error') }
    return this._root.$i18n.i(key, locale, values)
  } else {
    return this._warnDefault(locale, key, ret, host, [values])
  }
};

VueI18n.prototype.i = function i (key, locale, values) {
  /* istanbul ignore if */
  if (!key) { return '' }

  if (typeof locale !== 'string') {
    locale = this.locale;
  }

  return this._i(key, locale, this._getMessages(), null, values)
};

VueI18n.prototype._tc = function _tc (
  key,
  _locale,
  messages,
  host,
  choice
) {
    var ref;

    var values = [], len = arguments.length - 5;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 5 ];
  if (!key) { return '' }
  if (choice === undefined) {
    choice = 1;
  }

  var predefined = { 'count': choice, 'n': choice };
  var parsedArgs = parseArgs.apply(void 0, values);
  parsedArgs.params = Object.assign(predefined, parsedArgs.params);
  values = parsedArgs.locale === null ? [parsedArgs.params] : [parsedArgs.locale, parsedArgs.params];
  return this.fetchChoice((ref = this)._t.apply(ref, [ key, _locale, messages, host ].concat( values )), choice)
};

VueI18n.prototype.fetchChoice = function fetchChoice (message, choice) {
  /* istanbul ignore if */
  if (!message && typeof message !== 'string') { return null }
  var choices = message.split('|');

  choice = this.getChoiceIndex(choice, choices.length);
  if (!choices[choice]) { return message }
  return choices[choice].trim()
};

/**
 * @param choice {number} a choice index given by the input to $tc: `$tc('path.to.rule', choiceIndex)`
 * @param choiceLength {number} an overall amount of available choices
 * @returns a final choice index
*/
VueI18n.prototype.getChoiceIndex = function getChoiceIndex (choice, choicesLength) {
  choice = Math.abs(choice);

  if (choicesLength === 2) {
    return choice
      ? choice > 1
        ? 1
        : 0
      : 1
  }

  return choice ? Math.min(choice, 2) : 0
};

VueI18n.prototype.tc = function tc (key, choice) {
    var ref;

    var values = [], len = arguments.length - 2;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 2 ];
  return (ref = this)._tc.apply(ref, [ key, this.locale, this._getMessages(), null, choice ].concat( values ))
};

VueI18n.prototype._te = function _te (key, locale, messages) {
    var args = [], len = arguments.length - 3;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 3 ];

  var _locale = parseArgs.apply(void 0, args).locale || locale;
  return this._exist(messages[_locale], key)
};

VueI18n.prototype.te = function te (key, locale) {
  return this._te(key, this.locale, this._getMessages(), locale)
};

VueI18n.prototype.getLocaleMessage = function getLocaleMessage (locale) {
  return looseClone(this._vm.messages[locale] || {})
};

VueI18n.prototype.setLocaleMessage = function setLocaleMessage (locale, message) {
  this._vm.$set(this._vm.messages, locale, message);
};

VueI18n.prototype.mergeLocaleMessage = function mergeLocaleMessage (locale, message) {
  this._vm.$set(this._vm.messages, locale, vue_i18n_esm_merge(this._vm.messages[locale] || {}, message));
};

VueI18n.prototype.getDateTimeFormat = function getDateTimeFormat (locale) {
  return looseClone(this._vm.dateTimeFormats[locale] || {})
};

VueI18n.prototype.setDateTimeFormat = function setDateTimeFormat (locale, format) {
  this._vm.$set(this._vm.dateTimeFormats, locale, format);
};

VueI18n.prototype.mergeDateTimeFormat = function mergeDateTimeFormat (locale, format) {
  this._vm.$set(this._vm.dateTimeFormats, locale, vue_i18n_esm_merge(this._vm.dateTimeFormats[locale] || {}, format));
};

VueI18n.prototype._localizeDateTime = function _localizeDateTime (
  value,
  locale,
  fallback,
  dateTimeFormats,
  key
) {
  var _locale = locale;
  var formats = dateTimeFormats[_locale];

  // fallback locale
  if (isNull(formats) || isNull(formats[key])) {
    if (false) {}
    _locale = fallback;
    formats = dateTimeFormats[_locale];
  }

  if (isNull(formats) || isNull(formats[key])) {
    return null
  } else {
    var format = formats[key];
    var id = _locale + "__" + key;
    var formatter = this._dateTimeFormatters[id];
    if (!formatter) {
      formatter = this._dateTimeFormatters[id] = new Intl.DateTimeFormat(_locale, format);
    }
    return formatter.format(value)
  }
};

VueI18n.prototype._d = function _d (value, locale, key) {
  /* istanbul ignore if */
  if (false) {}

  if (!key) {
    return new Intl.DateTimeFormat(locale).format(value)
  }

  var ret =
    this._localizeDateTime(value, locale, this.fallbackLocale, this._getDateTimeFormats(), key);
  if (this._isFallbackRoot(ret)) {
    if (false) {}
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return this._root.$i18n.d(value, key, locale)
  } else {
    return ret || ''
  }
};

VueI18n.prototype.d = function d (value) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var locale = this.locale;
  var key = null;

  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      key = args[0];
    } else if (vue_i18n_esm_isObject(args[0])) {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      key = args[0];
    }
    if (typeof args[1] === 'string') {
      locale = args[1];
    }
  }

  return this._d(value, locale, key)
};

VueI18n.prototype.getNumberFormat = function getNumberFormat (locale) {
  return looseClone(this._vm.numberFormats[locale] || {})
};

VueI18n.prototype.setNumberFormat = function setNumberFormat (locale, format) {
  this._vm.$set(this._vm.numberFormats, locale, format);
};

VueI18n.prototype.mergeNumberFormat = function mergeNumberFormat (locale, format) {
  this._vm.$set(this._vm.numberFormats, locale, vue_i18n_esm_merge(this._vm.numberFormats[locale] || {}, format));
};

VueI18n.prototype._localizeNumber = function _localizeNumber (
  value,
  locale,
  fallback,
  numberFormats,
  key,
  options
) {
  var _locale = locale;
  var formats = numberFormats[_locale];

  // fallback locale
  if (isNull(formats) || isNull(formats[key])) {
    if (false) {}
    _locale = fallback;
    formats = numberFormats[_locale];
  }

  if (isNull(formats) || isNull(formats[key])) {
    return null
  } else {
    var format = formats[key];

    var formatter;
    if (options) {
      // If options specified - create one time number formatter
      formatter = new Intl.NumberFormat(_locale, Object.assign({}, format, options));
    } else {
      var id = _locale + "__" + key;
      formatter = this._numberFormatters[id];
      if (!formatter) {
        formatter = this._numberFormatters[id] = new Intl.NumberFormat(_locale, format);
      }
    }
    return formatter.format(value)
  }
};

VueI18n.prototype._n = function _n (value, locale, key, options) {
  /* istanbul ignore if */
  if (!VueI18n.availabilities.numberFormat) {
    if (false) {}
    return ''
  }

  if (!key) {
    var nf = !options ? new Intl.NumberFormat(locale) : new Intl.NumberFormat(locale, options);
    return nf.format(value)
  }

  var ret =
    this._localizeNumber(value, locale, this.fallbackLocale, this._getNumberFormats(), key, options);
  if (this._isFallbackRoot(ret)) {
    if (false) {}
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return this._root.$i18n.n(value, Object.assign({}, { key: key, locale: locale }, options))
  } else {
    return ret || ''
  }
};

VueI18n.prototype.n = function n (value) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var locale = this.locale;
  var key = null;
  var options = null;

  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      key = args[0];
    } else if (vue_i18n_esm_isObject(args[0])) {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }

      // Filter out number format options only
      options = Object.keys(args[0]).reduce(function (acc, key) {
          var obj;

        if (numberFormatKeys.includes(key)) {
          return Object.assign({}, acc, ( obj = {}, obj[key] = args[0][key], obj ))
        }
        return acc
      }, null);
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      key = args[0];
    }
    if (typeof args[1] === 'string') {
      locale = args[1];
    }
  }

  return this._n(value, locale, key, options)
};

Object.defineProperties( VueI18n.prototype, vue_i18n_esm_prototypeAccessors );

VueI18n.availabilities = {
  dateTimeFormat: canUseDateTimeFormat,
  numberFormat: canUseNumberFormat
};
VueI18n.install = vue_i18n_esm_install;
VueI18n.version = '8.3.1';

/* harmony default export */ var vue_i18n_esm = (VueI18n);

// CONCATENATED MODULE: ./src/translations/default.js
var messages = {
  en: {
    app: {
      main: {
        connectButton: 'Connect to Ethereum',
        changeButton: 'Change Wallet'
      },
      modal: {
        backLink: 'Select other',
        closeText: 'Close dialogue'
      },
      networkStatus: {
        connectedWithInfo: 'Connected using {signer} to Ethereum {network} Network',
        noRequiredInfo: `There is no specific Ethereum Network requirement set. 
        'If you know what you do that is ok. On a live site you should contract the sites Administrator.`,
        networkMismatchInfo: 'Ethereum Network does not match. Please switch your Ethereum Network to {networkLabel} ' + 'Network (Network ID {networkId}).'
      },
      accountStatus: {
        accountOkInfo: 'Account is unlocked.',
        accountLockedInfo: 'Account is locked. Please unlock your account by entering your password ' + 'or approve this application using your Wallet.'
      },
      walletConnect: {
        deviceStatus: {
          waitingQr: 'Scan QR code with a WalletConnect-compatible wallet',
          retry: {
            instructions: 'Session timed out.',
            buttonText: 'Try again'
          }
        }
      },
      ledger: {
        deviceStatus: {
          heading: 'Connect to Ledger hardware Wallet',
          introText: 'Please connect and unlock your device, select Ethereum app and make sure to enable Browser support in app settings.',
          waitingForDevice: 'Waiting for device',
          retry: {
            instructions: 'Failed to connect, please check your device',
            buttonText: 'Try again'
          }
        },
        selectAccount: {
          heading: 'Select account address',
          shouldRemember: 'Remember for this app?',
          selectAccount: 'Chose default Account'
        }
      }
    },
    globals: {
      networks: {
        '1': {
          label: 'Ethereum Main'
        },
        '3': {
          label: 'Ropsten'
        },
        '4': {
          label: 'Rinkeby'
        },
        '8': {
          label: 'Ubiq'
        },
        '42': {
          label: 'Kovan'
        },
        '77': {
          label: 'Sokol'
        },
        '99': {
          label: 'Public POA Network Main'
        }
      },
      providers: {
        metamask: {
          label: 'Metamask',
          buttonText: 'Connect with MetaMask',
          description: {
            pre: 'Connect to the ',
            link: 'MetaMask browser wallet',
            post: '.',
            url: 'https://metamask.io'
          }
        },
        walletConnect: {
          label: 'WalletConnect',
          buttonText: 'Use WalletConnect',
          description: {
            pre: 'Scan a QR code to link your mobile wallet',
            link: 'using WalletConnect',
            post: '.',
            url: 'https://walletconnect.org'
          }
        },
        ledger: {
          label: 'Ledger Wallet',
          buttonText: 'Use Ledger Wallet',
          description: {
            pre: 'Use',
            link: 'Ledger hardware wallet ',
            post: 'to connect.',
            url: 'https://www.ledger.com/'
          }
        }
      }
    }
  },
  ja: {
    app: {
      main: {
        connectButton: 'エテリアム 接続する'
      }
    }
  }
};
/* harmony default export */ var translations_default = (messages);
// CONCATENATED MODULE: ./src/conf/i18n.js



external_Vue_default.a.use(vue_i18n_esm);
/* harmony default export */ var i18n = (new vue_i18n_esm({
  locale: 'en',
  fallbackLocale: 'en',
  messages: translations_default
}));
// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.promise.js
var es6_promise = __webpack_require__("551c");

// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}
// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}
// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js



function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}
// CONCATENATED MODULE: ./src/web3ProviderApi/Metamask.js





class Metamask_Metamask {
  /**
   * createProvider()
   *
   * Required function to initialize provider and web3.
   *
   * @param Web3
   * @param accountChange
   *   Commit account change to App.
   * @param networkChange
   *  Commit network change to App.
   * @param resetProvider Function
   *   Resets the App state to default.
   * @return {*}
   */
  static createProvider(Web3, accountChange, networkChange, resetProvider) {
    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!Metamask_Metamask.isAvailable()) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", new Metamask_Metamask(Web3, accountChange, networkChange, resetProvider, false));

            case 2:
              return _context.abrupt("return", null);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }))();
  }
  /**
   * createAutovalidateProvider()
   *
   * Optionally provide a auto-initializing provider.
   * If the provider supports it provider can try to do "reconnect".
   * In case reconnect fails you must call resetProvider(). This limits states to
   * "connected" and "no provider selected".
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param resetProvider
   * @return {*}
   */


  static createAutovalidateProvider(Web3, accountChange, networkChange, resetProvider) {
    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!Metamask_Metamask.isAvailable()) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", new Metamask_Metamask(Web3, accountChange, networkChange, resetProvider, true));

            case 2:
              return _context2.abrupt("return", null);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }))();
  }
  /**
   * isAvailable()
   *
   *  Testing if the provider is available in the current environment.
   *  The result is used to disable buttons.
   *
   * @return {boolean}
   */


  static isAvailable() {
    return window.ethereum || typeof window.web3 !== 'undefined';
  }
  /**
   * Optionally destroy watchers, if you need.
   */


  destroy() {
    this.shouldWatch = false;
  }
  /* ****************** NON API METHODS ****************** */

  /**
   * Prefer Factory class
   * Metamask.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param resetProvider
   * @param shouldAutovalidate
   *
   */


  constructor(Web3, accountChange, networkChange, resetProvider, shouldAutovalidate) {
    this.web3 = this.constructor.createWeb3Instance(Web3);
    this.account = null;
    this.networkId = null;
    this.accountChange = accountChange; // Metamask requires only initial Network set.
    // Browser reloads at Metamask Network change.

    this.networkChange = networkChange; // Reset the provider if validation fails or lock status change.

    this.resetProvider = resetProvider; // Bugfix metamask inconsistency.
    // toChecksumAddress might be called before web3 is loaded. Helper to provide a consistently formatted address.

    this.toChecksumAddress = Web3.utils.toChecksumAddress; // Refresh every POLL_INTERVAL [ms].

    this.POLL_INTERVAL = 800;
    this.shouldWatch = true; // Ask unlock only if user requested it.
    // If auto validation fails we will silently unset the provider.

    if (shouldAutovalidate) {
      this.tryAutoConnect();
    } else {
      this.getDefaultAccount();
    }

    this.getNetwork();
  }
  /**
   * getNetwork()
   *
   * @return {Promise<String>}
   */


  getNetwork() {
    var _this = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var networkId;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (_this.networkId) {
                _context3.next = 6;
                break;
              }

              _context3.next = 3;
              return _this.web3.eth.net.getId();

            case 3:
              networkId = _context3.sent;
              _this.networkId = networkId.toString();

              _this.networkChange(_this.networkId);

            case 6:
              return _context3.abrupt("return", _this.networkId);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }))();
  }
  /**
   * getDefaultAccount()
   *
   * Ask user to unlock account.
   *
   * @return {Promise<String>}
   */


  getDefaultAccount() {
    var _this2 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4() {
      var accounts, _accounts, _accounts2;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              accounts = null;
              _context4.prev = 1;

              if (!window.ethereum) {
                _context4.next = 8;
                break;
              }

              _context4.next = 5;
              return ethereum.enable();

            case 5:
              accounts = _context4.sent;
              _context4.next = 11;
              break;

            case 8:
              _context4.next = 10;
              return _this2.web3.eth.getAccounts();

            case 10:
              accounts = _context4.sent;

            case 11:
              _context4.next = 16;
              break;

            case 13:
              _context4.prev = 13;
              _context4.t0 = _context4["catch"](1);
              // eslint-disable-next-line
              console.log(_context4.t0);

            case 16:
              if (accounts && accounts.length > 0) {
                _accounts = accounts;
                _accounts2 = _slicedToArray(_accounts, 1);
                _this2.account = _accounts2[0];

                // Working around "Address is returned inconsistently": https://github.com/MetaMask/metamask-extension/issues/5826
                _this2.accountChange(_this2.toChecksumAddress(_this2.account));

                _this2.watchAccountChange();
              }

            case 17:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this, [[1, 13]]);
    }))();
  }
  /**
   * tryAutoConnect()
   *
   * Get account if unlocked.
   * If locked we'll unset provider, so that the user will never get unlock
   * requests from MM without previous "Connect to Ethereum" click.
   *
   * @return {Promise<void>}
   */


  tryAutoConnect() {
    var _this3 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var account;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this3.getAccount();

            case 2:
              account = _context5.sent;

              if (account) {
                _this3.accountChange(account);

                _this3.watchAccountChange();
              } else {
                _this3.resetProvider();
              }

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }))();
  }
  /**
   * getAccount()
   *
   * Get account, Don't request unlock.
   *
   * @return {Promise<String|null>}
   *   If account available return account.
   */


  getAccount() {
    var _this4 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6() {
      var accounts;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _this4.web3.eth.getAccounts();

            case 2:
              accounts = _context6.sent;

              if (!(accounts.length > 0)) {
                _context6.next = 5;
                break;
              }

              return _context6.abrupt("return", accounts[0]);

            case 5:
              return _context6.abrupt("return", null);

            case 6:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }))();
  }
  /**
   * createWeb3Instance()
   *
   * @param Web3
   * @return {*}
   */


  static createWeb3Instance(Web3) {
    // window.ethereum is the new default.
    // window.web3.currentProvider is a legacy fallback.
    if (window.ethereum) {
      return new Web3(window.ethereum);
    }

    if (window.web3 && window.web3.currentProvider) {
      return new Web3(window.web3.currentProvider);
    }

    return null;
  }
  /**
   * checkAccount.
   *
   * This function polls for account changes.
   *
   * @see https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
   *
   * @returns {Promise<void>}
   */


  watchAccountChange() {
    var _this5 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7() {
      var account;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this5.getAccount();

            case 2:
              account = _context7.sent;

              // Changed account
              if (_this5.account !== account) {
                _this5.account = account;

                _this5.accountChange(_this5.account); // Changed to null/account is locked.


                if (!account) {
                  _this5.resetProvider();
                }
              }

              _context7.next = 6;
              return Metamask_Metamask.waitFor(_this5.POLL_INTERVAL);

            case 6:
              if (_this5.shouldWatch) {
                _this5.watchAccountChange();
              }

            case 7:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }))();
  }
  /**
   *
   * @param ms
   * @returns {*}
   */


  static waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
// CONCATENATED MODULE: ./src/web3ProviderApi/WalletConnect.js





class WalletConnect_WalletConnect {
  /**
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @return {*}
   */
  static createProvider(Web3, accountChange, networkChange) {
    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var libraries;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Promise.all(/* import() | walletConnect */[__webpack_require__.e(0), __webpack_require__.e(1), __webpack_require__.e(5), __webpack_require__.e(7)]).then(__webpack_require__.bind(null, "59ff"));

            case 2:
              libraries = _context.sent;
              return _context.abrupt("return", new WalletConnect_WalletConnect(Web3, accountChange, networkChange, libraries));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }))();
  }
  /**
   * isAvailable()
   *
   * @return {boolean}
   */


  static isAvailable() {
    return true;
  }

  destroy() {
    this.shouldWatch = false;
    this.web3.currentProvider.walletconnect.stopLastListener();
    this.web3.currentProvider.walletconnect.engine.stop();
  }
  /* ****************** NON API METHODS ****************** */

  /**
   * getNetwork()
   *
   * @return {Promise<string>}
   */


  getNetwork() {
    var _this = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (_this.networkId) {
                _context2.next = 5;
                break;
              }

              _context2.next = 3;
              return _this.web3.eth.net.getId();

            case 3:
              _this.networkId = _context2.sent;

              _this.networkChange(_this.networkId);

            case 5:
              return _context2.abrupt("return", _this.networkId);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }))();
  }
  /**
   * getDefaultAccount()
   *
   * @return {Promise<String>}
   */


  getDefaultAccount() {
    var _this2 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", _this2.account);

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }))();
  }
  /**
   * Prefer Factory class
   * WalletConnect.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param libraries
   */


  constructor(Web3, accountChange, networkChange, libraries) {
    this.qrImage = libraries.qrImage;
    var walletConnectProvider = new libraries.WalletConnectProvider(src_store.getters.walletConnectConfig);
    this.web3 = new Web3(walletConnectProvider);
    this.accountChange = accountChange;
    this.networkChange = networkChange; // Display QR Code URI

    this._uri = null;
    this._account = null;
    this.networkId = null;
    this.POLL_INTERVAL = 1000;
    this.shouldWatch = true;
    this.watchAccountChange();
    this.getNetwork();
  }

  get account() {
    return this._account;
  }

  set account(val) {
    this._account = val;
    this.accountChange(val);
  }

  get uri() {
    if (!this._uri) {
      return this.getUri();
    }

    return this._uri;
  }

  get image() {
    return this.getImage();
  }

  getUri() {
    var _this3 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4() {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", _this3.web3.currentProvider.walletconnect.uri);

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }))();
  }

  getImage() {
    var _this4 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var buffer;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this4.getUri();

            case 2:
              _this4._uri = _context5.sent;
              buffer = _this4.qrImage.imageSync(_this4.uri, {
                type: 'svg'
              });
              return _context5.abrupt("return", `data:image/svg+xml;charset=UTF-8,${buffer}`);

            case 5:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }))();
  }
  /**
   * checkAccount.
   *
   * This function polls for account changes.
   *
   * @see https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
   *
   * @returns {Promise<void>}
   */


  watchAccountChange() {
    var _this5 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6() {
      var _this5$web3$currentPr;

      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (!_this5.web3.currentProvider.walletconnect.accounts.length) {
                _context6.next = 5;
                break;
              }

              _this5$web3$currentPr = _slicedToArray(_this5.web3.currentProvider.walletconnect.accounts, 1);
              _this5.account = _this5$web3$currentPr[0];
              _context6.next = 9;
              break;

            case 5:
              if (!_this5.shouldWatch) {
                _context6.next = 9;
                break;
              }

              _context6.next = 8;
              return WalletConnect_WalletConnect.waitFor(_this5.POLL_INTERVAL);

            case 8:
              _this5.watchAccountChange();

            case 9:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }))();
  }
  /**
   *
   * @param ms
   * @returns {*}
   */


  static waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
// CONCATENATED MODULE: ./src/web3ProviderApi/Ledger.js




class Ledger_Ledger {
  /**
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @return {*}
   */
  static createProvider(Web3, accountChange, networkChange) {
    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var lib;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Promise.all(/* import() | ledger */[__webpack_require__.e(0), __webpack_require__.e(2), __webpack_require__.e(1), __webpack_require__.e(4), __webpack_require__.e(3)]).then(__webpack_require__.bind(null, "a1e2"));

            case 2:
              lib = _context.sent;
              return _context.abrupt("return", new Ledger_Ledger(Web3, accountChange, networkChange, lib));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }))();
  }
  /**
   * isAvailable()
   *
   *  Testing if the provider is available in the current environment.
   *  The result is used to disable buttons.
   *
   * @return {boolean}
   */


  static isAvailable() {
    // @todo We might test if rpcUrl is available and match network.
    return document.location.protocol === 'https:';
  }
  /* ****************** NON API METHODS ****************** */

  /**
   * Prefer Factory class
   * Ledger.createProvider(Web3, accountChange, networkChange)
   *
   * @param Web3
   * @param accountChange
   * @param networkChange
   * @param lib
   *    Async loaded lib.
   */


  constructor(Web3, accountChange, networkChange, lib) {
    this.cnf = _objectSpread({}, {
      dappName: 'Unknown Dapp Name',
      rpcUrl: 'http://localhost:7545',
      networkId: '1',
      timeout: 60 * 1000,
      // [ms]
      accountsLength: 8
    }, src_store.getters.ledgerConfig);
    this.accountChange = accountChange;
    this.networkChange = networkChange; // Web3 ProviderEngine

    var engine = new lib.ProviderEngine(); // TransportU2F factory

    this.TransportU2F = lib.TransportU2F; // Init Ledger web3Provider

    engine.addProvider(lib.createLedgerSubprovider(() => this.getTransport(), {
      networkId: this.cnf.networkId,
      path: "44'/60'/0'/0",
      // ledger default derivation path
      askConfirm: false,
      accountsLength: this.cnf.accountsLength,
      // DEFAULT 1
      accountsOffset: 0
    }));
    engine.addProvider(new lib.RpcSubprovider({
      rpcUrl: this.cnf.rpcUrl
    }));
    engine.start();
    this.web3 = new Web3(engine);
    this.getNetwork();
  }

  set defaultAccount(val) {
    if (!this.web3.utils.isAddress(val)) {
      throw new Error('Not a valid Ethereum address @ Ledger->SET defaultAccount');
    }

    this.accountChange(val);
  }

  get defaultAccount() {
    return this.defaultAccount ? this.defaultAccount : null;
  }
  /**
   * getNetwork()
   *
   * @return {Promise<String>}
   */


  getNetwork() {
    var _this = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (_this.networkId) {
                _context2.next = 5;
                break;
              }

              _context2.next = 3;
              return _this.web3.eth.net.getId();

            case 3:
              _this.networkId = _context2.sent;

              _this.networkChange(_this.networkId);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }))();
  }
  /**
   *
   * @return {Promise<TransportU2F instance>}
   */


  getTransport() {
    var _this2 = this;

    return _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var ledgerConnection;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this2.TransportU2F.create();

            case 2:
              ledgerConnection = _context3.sent;
              ledgerConnection.setExchangeTimeout(_this2.cnf.timeout);
              return _context3.abrupt("return", ledgerConnection);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }))();
  }

}
// CONCATENATED MODULE: ./src/conf/web3ProviderApi.js
// Web3 init interface.



/* harmony default export */ var web3ProviderApi = ({
  // Key must match signer.id
  metamask: Metamask_Metamask,
  walletConnect: WalletConnect_WalletConnect,
  ledger: Ledger_Ledger
});
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Loading.vue?vue&type=template&id=5f3ee003&scoped=true&
var Loadingvue_type_template_id_5f3ee003_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{class:_vm.className})}
var Loadingvue_type_template_id_5f3ee003_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Loading.vue?vue&type=template&id=5f3ee003&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Loading.vue?vue&type=script&lang=js&
//
//
//
//
/* harmony default export */ var Loadingvue_type_script_lang_js_ = ({
  name: 'Loading',
  props: {
    centered: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    className() {
      if (this.centered) {
        return 'loading-image loading-image--centered';
      }

      return 'loading-image';
    }

  }
});
// CONCATENATED MODULE: ./src/components/Loading.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Loadingvue_type_script_lang_js_ = (Loadingvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/Loading.vue



function injectStyles (context) {
  
  var style0 = __webpack_require__("15b2")
if (style0.__inject__) style0.__inject__(context)

}

/* normalize component */

var Loading_component = normalizeComponent(
  components_Loadingvue_type_script_lang_js_,
  Loadingvue_type_template_id_5f3ee003_scoped_true_render,
  Loadingvue_type_template_id_5f3ee003_scoped_true_staticRenderFns,
  false,
  injectStyles,
  "5f3ee003",
  null
  ,true
)

Loading_component.options.__file = "Loading.vue"
/* harmony default export */ var Loading = (Loading_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/SelectProvider.vue?vue&type=template&id=197297ab&
var SelectProvidervue_type_template_id_197297ab_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ul',{class:_vm.$style.list},_vm._l((_vm.providers),function(provider){return _c('li',{key:provider.id,class:_vm.$style.listItem},[_c('SelectProviderRow',{attrs:{"id":provider.id,"text":_vm.getTextData(provider.id),"isAvailable":_vm.getAvailableMethod(provider.id),"selectProvider":_vm.selectProvider}})],1)}))}
var SelectProvidervue_type_template_id_197297ab_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/SelectProvider.vue?vue&type=template&id=197297ab&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/SelectProviderRow.vue?vue&type=template&id=497b0bc4&
var SelectProviderRowvue_type_template_id_497b0bc4_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.provider},[_c('div',{class:_vm.logoClassName}),_c('p',{class:_vm.$style.text,domProps:{"innerHTML":_vm._s(_vm.descriptionText)}}),_c('div',{class:_vm.buttonClassName},[_c('button',{attrs:{"disabled":_vm.isDisabled},on:{"click":function($event){$event.stopPropagation();_vm.selectProvider(_vm.id)}}},[_vm._v("\n      "+_vm._s(_vm.text.buttonText)+"\n    ")])])])}
var SelectProviderRowvue_type_template_id_497b0bc4_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/SelectProviderRow.vue?vue&type=template&id=497b0bc4&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/SelectProviderRow.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ var SelectProviderRowvue_type_script_lang_js_ = ({
  props: {
    id: {
      type: String,
      required: true
    },
    text: {
      type: Object,
      required: true
    },
    isAvailable: {
      type: Function,
      required: true
    },
    selectProvider: {
      type: Function,
      required: true
    }
  },
  computed: {
    logoClassName() {
      return [this.$style.logo, this.$style[this.id]];
    },

    buttonClassName() {
      return [this.$style.buttonWrapper, this.$style[this.id]];
    },

    isDisabled() {
      return !this.isAvailable();
    },

    descriptionText() {
      var data = this.text.description;
      return `${data.pre} <a href="${data.url}">${data.link}</a>${data.post}`;
    }

  }
});
// CONCATENATED MODULE: ./src/components/SelectProviderRow.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_SelectProviderRowvue_type_script_lang_js_ = (SelectProviderRowvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/SelectProviderRow.vue



function SelectProviderRow_injectStyles (context) {
  
  var style0 = __webpack_require__("90d3")
if (style0.__inject__) style0.__inject__(context)
this["$style"] = (style0.locals || style0)

}

/* normalize component */

var SelectProviderRow_component = normalizeComponent(
  components_SelectProviderRowvue_type_script_lang_js_,
  SelectProviderRowvue_type_template_id_497b0bc4_render,
  SelectProviderRowvue_type_template_id_497b0bc4_staticRenderFns,
  false,
  SelectProviderRow_injectStyles,
  null,
  null
  ,true
)

SelectProviderRow_component.options.__file = "SelectProviderRow.vue"
/* harmony default export */ var SelectProviderRow = (SelectProviderRow_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/SelectProvider.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var SelectProvidervue_type_script_lang_js_ = ({
  name: 'SelectProvider',
  components: {
    SelectProviderRow: SelectProviderRow
  },
  props: {
    providers: {
      type: Array,
      required: true
    },
    selectProvider: {
      type: Function,
      required: true
    }
  },
  methods: {
    getTextData(id) {
      return this.$t(`globals.providers.${id}`);
    },

    getAvailableMethod(id) {
      return this.web3ProviderApi[id].isAvailable;
    }

  }
});
// CONCATENATED MODULE: ./src/components/SelectProvider.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_SelectProvidervue_type_script_lang_js_ = (SelectProvidervue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/SelectProvider.vue



function SelectProvider_injectStyles (context) {
  
  var style0 = __webpack_require__("d65b")
if (style0.__inject__) style0.__inject__(context)
this["$style"] = (style0.locals || style0)

}

/* normalize component */

var SelectProvider_component = normalizeComponent(
  components_SelectProvidervue_type_script_lang_js_,
  SelectProvidervue_type_template_id_197297ab_render,
  SelectProvidervue_type_template_id_197297ab_staticRenderFns,
  false,
  SelectProvider_injectStyles,
  null,
  null
  ,true
)

SelectProvider_component.options.__file = "SelectProvider.vue"
/* harmony default export */ var SelectProvider = (SelectProvider_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/NetworkIndicator.vue?vue&type=template&id=035eb1b2&scoped=true&
var NetworkIndicatorvue_type_template_id_035eb1b2_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.className},[_c('span',{directives:[{name:"tooltip",rawName:"v-tooltip",value:(_vm.tooltip),expression:"tooltip"}],staticClass:"network-indicator--icon"},[(_vm.isOk)?_c('span',{staticClass:"network-indicator--icon-status icon-ok"}):_vm._e(),(_vm.isUnknown)?_c('span',{staticClass:"network-indicator--icon-status icon-unknown"}):_vm._e(),(_vm.isError)?_c('span',{staticClass:"network-indicator--icon-status icon-error"}):_vm._e()]),(!_vm.tiny)?_c('span',{staticClass:"network-indicator--info"},[_vm._v("\n    "+_vm._s(_vm.getMessage)+"\n  ")]):_vm._e()])}
var NetworkIndicatorvue_type_template_id_035eb1b2_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/NetworkIndicator.vue?vue&type=template&id=035eb1b2&scoped=true&

// CONCATENATED MODULE: ./src/mixins/createTooltip.js
/* harmony default export */ var createTooltip = ({
  methods: {
    createTooltip(msg) {
      return {
        content: msg,
        placement: 'auto',
        classes: ['info'],
        targetClasses: ['has-tooltip'],
        trigger: 'hover focus click',
        delay: {
          show: 300,
          hide: 500
        }
      };
    }

  }
});
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/NetworkIndicator.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ var NetworkIndicatorvue_type_script_lang_js_ = ({
  mixins: [createTooltip],
  props: {
    network_id: {
      type: String,
      default: null
    },
    required_network: {
      type: String,
      required: true
    },
    tiny: {
      type: Boolean,
      default: false
    }
  },
  computed: _objectSpread({}, mapState(['signerId', 'networkId']), {
    getMessage() {
      if (this.isUnknown) {
        return this.noRequiredInfo;
      }

      if (this.isOk) {
        return this.connectedWithInfo;
      }

      return this.networkMismatchInfo;
    },

    tooltip() {
      return this.createTooltip(this.getMessage);
    },

    connectedWithInfo() {
      return this.$t('app.networkStatus.connectedWithInfo', {
        signer: this.$t(`globals.providers.${this.signerId}.label`),
        network: this.$t(`globals.networks.${this.networkId}.label`)
      });
    },

    noRequiredInfo() {
      return this.$t('app.networkStatus.noRequiredInfo');
    },

    networkMismatchInfo() {
      return this.$t('app.networkStatus.networkMismatchInfo', {
        networkLabel: this.$t(`globals.networks.${this.required_network}.label`),
        networkId: this.required_network
      });
    },

    isUnknown() {
      return this.required_network === '*';
    },

    isOk() {
      return !this.isUnknown && this.required_network === this.network_id;
    },

    isError() {
      return !this.isUnknown && this.required_network !== this.network_id;
    },

    className() {
      if (this.tiny) {
        return 'network-indicator network-indicator--tiny';
      }

      return 'network-indicator network-indicator--large';
    }

  })
});
// CONCATENATED MODULE: ./src/components/NetworkIndicator.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_NetworkIndicatorvue_type_script_lang_js_ = (NetworkIndicatorvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/NetworkIndicator.vue



function NetworkIndicator_injectStyles (context) {
  
  var style0 = __webpack_require__("de5d")
if (style0.__inject__) style0.__inject__(context)

}

/* normalize component */

var NetworkIndicator_component = normalizeComponent(
  components_NetworkIndicatorvue_type_script_lang_js_,
  NetworkIndicatorvue_type_template_id_035eb1b2_scoped_true_render,
  NetworkIndicatorvue_type_template_id_035eb1b2_scoped_true_staticRenderFns,
  false,
  NetworkIndicator_injectStyles,
  "035eb1b2",
  null
  ,true
)

NetworkIndicator_component.options.__file = "NetworkIndicator.vue"
/* harmony default export */ var NetworkIndicator = (NetworkIndicator_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AccountIndicator.vue?vue&type=template&id=708d6cf4&scoped=true&
var AccountIndicatorvue_type_template_id_708d6cf4_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.className},[_c('span',{directives:[{name:"tooltip",rawName:"v-tooltip",value:(_vm.tooltip),expression:"tooltip"}],staticClass:"account-indicator--icon"},[(_vm.account)?_c('span',{staticClass:"account-indicator--icon-status icon-ok"}):_vm._e(),(!_vm.account)?_c('span',{staticClass:"account-indicator--icon-status icon-error"}):_vm._e()]),(!_vm.tiny)?_c('div',{staticClass:"account-indicator--info"},[_c('div',[_vm._v(_vm._s(_vm.getMessage))]),(_vm.account)?_c('div',{staticClass:"account-indicator--address"},[_vm._v("\n      "+_vm._s(_vm.account)+"\n    ")]):_vm._e()]):_vm._e(),(_vm.account && _vm.tiny)?_c('div',{staticClass:"account-indicator--address account-indicator--address-tiny"},[_vm._v("\n    "+_vm._s(_vm.account)+"\n  ")]):_vm._e()])}
var AccountIndicatorvue_type_template_id_708d6cf4_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/AccountIndicator.vue?vue&type=template&id=708d6cf4&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AccountIndicator.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var AccountIndicatorvue_type_script_lang_js_ = ({
  name: 'AccountIndicator',
  mixins: [createTooltip],
  props: {
    account: {
      type: String,
      default: null
    },
    tiny: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getMessage() {
      if (this.account) {
        return this.accountOkInfo;
      }

      return this.accountLockedInfo;
    },

    tooltip() {
      return this.createTooltip(this.getMessage);
    },

    accountOkInfo() {
      return this.$t('app.accountStatus.accountOkInfo', {
        account: this.account
      });
    },

    accountLockedInfo() {
      return this.$t('app.accountStatus.accountLockedInfo');
    },

    className() {
      if (this.tiny) {
        return 'account-indicator account-indicator--tiny';
      }

      return 'account-indicator account-indicator--large';
    }

  }
});
// CONCATENATED MODULE: ./src/components/AccountIndicator.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_AccountIndicatorvue_type_script_lang_js_ = (AccountIndicatorvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/AccountIndicator.vue



function AccountIndicator_injectStyles (context) {
  
  var style0 = __webpack_require__("1210")
if (style0.__inject__) style0.__inject__(context)

}

/* normalize component */

var AccountIndicator_component = normalizeComponent(
  components_AccountIndicatorvue_type_script_lang_js_,
  AccountIndicatorvue_type_template_id_708d6cf4_scoped_true_render,
  AccountIndicatorvue_type_template_id_708d6cf4_scoped_true_staticRenderFns,
  false,
  AccountIndicator_injectStyles,
  "708d6cf4",
  null
  ,true
)

AccountIndicator_component.options.__file = "AccountIndicator.vue"
/* harmony default export */ var AccountIndicator = (AccountIndicator_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Modal.vue?vue&type=template&id=68186776&
var Modalvue_type_template_id_68186776_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.overlay,on:{"click":_vm.clickHandler}},[_c('div',{class:_vm.$style.modal},[_c('div',{class:_vm.$style.header},[(_vm.signerId)?_c('a',{class:_vm.$style.actionBack,attrs:{"href":"#back"}},[_c('span',[_vm._v("←")]),_vm._v(_vm._s(_vm.$t("app.modal.backLink"))+"\n      ")]):_vm._e(),_c('a',{class:_vm.$style.actionCloseX,attrs:{"href":"#"}},[_vm._v("×")])]),_c('div',{class:_vm.$style.modalContent},[_vm._t("default")],2),_c('a',{class:_vm.$style.actionCloseFooter,attrs:{"href":"#close"}},[_vm._v(_vm._s(_vm.$t("app.modal.closeText")))])])])}
var Modalvue_type_template_id_68186776_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Modal.vue?vue&type=template&id=68186776&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Modal.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ var Modalvue_type_script_lang_js_ = ({
  name: 'Modal',
  props: {
    signerId: {
      type: String,
      default: ''
    },
    clickHandler: {
      type: Function,
      required: true
    }
  }
});
// CONCATENATED MODULE: ./src/components/Modal.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Modalvue_type_script_lang_js_ = (Modalvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/Modal.vue



function Modal_injectStyles (context) {
  
  var style0 = __webpack_require__("b68b")
if (style0.__inject__) style0.__inject__(context)
this["$style"] = (style0.locals || style0)

}

/* normalize component */

var Modal_component = normalizeComponent(
  components_Modalvue_type_script_lang_js_,
  Modalvue_type_template_id_68186776_render,
  Modalvue_type_template_id_68186776_staticRenderFns,
  false,
  Modal_injectStyles,
  null,
  null
  ,true
)

Modal_component.options.__file = "Modal.vue"
/* harmony default export */ var Modal = (Modal_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/signerDialogs/Metamask.vue?vue&type=template&id=5820306e&
var Metamaskvue_type_template_id_5820306e_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.signer},[_c('div',{class:_vm.$style.logo}),_c('div',{class:_vm.$style.dialog},[(!_vm.provider)?_c('Loading',{attrs:{"centered":true}}):_vm._e(),(_vm.provider)?_c('NetworkIndicator',{attrs:{"network_id":_vm.networkId,"required_network":_vm.requiredNetwork}}):_vm._e(),(_vm.provider)?_c('AccountIndicator',{attrs:{"account":_vm.account}}):_vm._e()],1)])}
var Metamaskvue_type_template_id_5820306e_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/signerDialogs/Metamask.vue?vue&type=template&id=5820306e&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/signerDialogs/Metamask.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ var Metamaskvue_type_script_lang_js_ = ({
  name: 'Metamask',
  components: {
    NetworkIndicator: NetworkIndicator,
    AccountIndicator: AccountIndicator,
    Loading: Loading
  },
  computed: _objectSpread({}, mapGetters(['provider']), mapState(['networkId', 'account', 'requiredNetwork']))
});
// CONCATENATED MODULE: ./src/components/signerDialogs/Metamask.vue?vue&type=script&lang=js&
 /* harmony default export */ var signerDialogs_Metamaskvue_type_script_lang_js_ = (Metamaskvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/signerDialogs/Metamask.vue



function Metamask_injectStyles (context) {
  
  var style0 = __webpack_require__("c0da")
if (style0.__inject__) style0.__inject__(context)
this["$style"] = (style0.locals || style0)

}

/* normalize component */

var Metamask_component = normalizeComponent(
  signerDialogs_Metamaskvue_type_script_lang_js_,
  Metamaskvue_type_template_id_5820306e_render,
  Metamaskvue_type_template_id_5820306e_staticRenderFns,
  false,
  Metamask_injectStyles,
  null,
  null
  ,true
)

Metamask_component.options.__file = "Metamask.vue"
/* harmony default export */ var signerDialogs_Metamask = (Metamask_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/signerDialogs/WalletConnect.vue?vue&type=template&id=2f876d38&
var WalletConnectvue_type_template_id_2f876d38_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.signer},[_c('div',{class:_vm.$style.logo}),_c('div',{class:_vm.$style.dialog},[(!_vm.qrImage)?_c('Loading',{attrs:{"centered":true}}):_vm._e(),(_vm.isListening && _vm.qrImage)?_c('div',[_c('img',{attrs:{"src":_vm.qrImage}}),_c('a',{attrs:{"href":_vm.uri}},[_vm._v("Confirm on mobile")])]):_vm._e(),(_vm.isListening)?_c('div',{class:_vm.$style.info},[_vm._v("\n      "+_vm._s(_vm.$t("app.walletConnect.deviceStatus.waitingQr"))+"\n    ")]):_vm._e(),(_vm.qrImage && !_vm.isListening)?_c('div',{class:_vm.$style.restartListening},[_c('div',{class:_vm.$style.restartListeningContent},[_c('div',[_vm._v("\n          "+_vm._s(_vm.$t("app.walletConnect.deviceStatus.retry.instructions"))+"\n          "),_c('button',{class:_vm.$style.button,on:{"click":_vm.listenSessionStatus}},[_vm._v(_vm._s(_vm.$t("app.walletConnect.deviceStatus.retry.buttonText"))+"\n          ")])])])]):_vm._e()],1)])}
var WalletConnectvue_type_template_id_2f876d38_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/signerDialogs/WalletConnect.vue?vue&type=template&id=2f876d38&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/signerDialogs/WalletConnect.vue?vue&type=script&lang=js&



//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ var WalletConnectvue_type_script_lang_js_ = ({
  name: 'WalletConnect',

  data() {
    return {
      POLL_INTERVAL: 1000,
      // 1 sec
      TIMEOUT: 5 * 60 * 1000,
      // 5 min. 5 * 60 * 1000
      qrImage: null,
      isListening: null,
      wcSession: null
    };
  },

  components: {
    Loading: Loading
  },

  created() {
    if (this.provider) {
      // this.getQrImage()
      this.initSession();
    }
  },

  watch: {
    provider: {
      handler(provider) {
        if (provider) {
          // this.getQrImage()
          this.initSession();
        }
      }

    },
    qrImage: {
      handler(img) {
        if (img) {
          this.listenSessionStatus();
        }
      }

    },
    wcSession: {
      handler(session) {
        if (session) {
          this.provider.web3.eth.getAccounts();
        }
      }

    }
  },
  computed: _objectSpread({
    uri() {
      return this.provider.uri;
    },

    isValidNetwork() {
      return this.networkId === this.requiredNetwork;
    },

    isAccountUnLocked() {
      return !this.account;
    }

  }, mapGetters(['provider']), mapState(['networkId', 'account', 'requiredNetwork'])),
  methods: {
    initSession() {
      var _this = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.provider.web3.currentProvider.walletconnect.initSession();

              case 2:
                _context.next = 4;
                return _this.provider.image;

              case 4:
                _this.qrImage = _context.sent;

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }))();
    },

    listenSessionStatus() {
      var _this2 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!_this2.qrImage) {
                  _context2.next = 11;
                  break;
                }

                _this2.isListening = true;
                _context2.prev = 2;
                _context2.next = 5;
                return _this2.provider.web3.currentProvider.walletconnect.listenSessionStatus(_this2.POLL_INTERVAL, _this2.TIMEOUT);

              case 5:
                _this2.wcSession = _context2.sent;
                _context2.next = 10;
                break;

              case 8:
                _context2.prev = 8;
                _context2.t0 = _context2["catch"](2);

              case 10:
                _this2.isListening = false;

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[2, 8]]);
      }))();
    }

  }
});
// CONCATENATED MODULE: ./src/components/signerDialogs/WalletConnect.vue?vue&type=script&lang=js&
 /* harmony default export */ var signerDialogs_WalletConnectvue_type_script_lang_js_ = (WalletConnectvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/signerDialogs/WalletConnect.vue



function WalletConnect_injectStyles (context) {
  
  var style0 = __webpack_require__("5d4e")
if (style0.__inject__) style0.__inject__(context)
this["$style"] = (style0.locals || style0)

}

/* normalize component */

var WalletConnect_component = normalizeComponent(
  signerDialogs_WalletConnectvue_type_script_lang_js_,
  WalletConnectvue_type_template_id_2f876d38_render,
  WalletConnectvue_type_template_id_2f876d38_staticRenderFns,
  false,
  WalletConnect_injectStyles,
  null,
  null
  ,true
)

WalletConnect_component.options.__file = "WalletConnect.vue"
/* harmony default export */ var signerDialogs_WalletConnect = (WalletConnect_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"c688a51c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/signerDialogs/Ledger.vue?vue&type=template&id=38f58655&
var Ledgervue_type_template_id_38f58655_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.$style.signer},[_c('div',{class:_vm.$style.logo}),_c('div',{class:_vm.$style.dialog},[(!_vm.provider)?_c('Loading'):_vm._e(),(_vm.provider && !_vm.accountSelect)?_c('div',{class:_vm.$style.deviceStatus},[_c('div',[_c('h3',{class:_vm.$style.headline},[_vm._v(_vm._s(_vm.$t("app.ledger.deviceStatus.heading")))]),_c('p',{class:_vm.$style.text},[_vm._v(_vm._s(_vm.$t("app.ledger.deviceStatus.introText")))])]),_c('div',{class:_vm.$style.listening},[(_vm.isListeningForAccounts)?_c('div',[_c('div',{class:_vm.$style.status},[_vm._v(_vm._s(_vm.$t("app.ledger.deviceStatus.waitingForDevice")))]),_c('Loading',{attrs:{"centered":true}})],1):_vm._e(),(_vm.provider && !_vm.accountSelect && !_vm.isListeningForAccounts)?_c('div',[_c('p',{class:_vm.$style.text},[_vm._v(_vm._s(_vm.$t("app.ledger.deviceStatus.retry.instructions")))]),_c('button',{class:_vm.$style.button,on:{"click":_vm.listenForAccounts}},[_vm._v(_vm._s(_vm.$t("app.ledger.deviceStatus.retry.buttonText"))+"\n          ")])]):_vm._e()])]):_vm._e(),(_vm.provider && _vm.accountSelect)?_c('div',{class:_vm.$style.selectAccount},[_c('h3',{class:_vm.$style.headline},[_vm._v(_vm._s(_vm.$t("app.ledger.selectAccount.heading")))]),_c('div',{class:_vm.$style.options},[_vm._l((_vm.accountSelect),function(account,index){return _c('div',{key:index,class:_vm.$style.optionsItem,attrs:{"value":index}},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.accountSelected),expression:"accountSelected"}],staticClass:"input",attrs:{"label":account,"type":"radio","id":account},domProps:{"value":index,"checked":_vm._q(_vm.accountSelected,index)},on:{"change":function($event){_vm.accountSelected=index}}}),_c('label',{class:_vm.$style.labelAddress,attrs:{"for":account}},[_vm._v(_vm._s(account))])])}),_c('div',[_c('div',{class:_vm.$style.rememberAccount},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.rememberAccount),expression:"rememberAccount"}],staticClass:"input",attrs:{"type":"checkbox","id":"rememberAccount"},domProps:{"checked":Array.isArray(_vm.rememberAccount)?_vm._i(_vm.rememberAccount,null)>-1:(_vm.rememberAccount)},on:{"change":function($event){var $$a=_vm.rememberAccount,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.rememberAccount=$$a.concat([$$v]))}else{$$i>-1&&(_vm.rememberAccount=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}}else{_vm.rememberAccount=$$c}}}}),_c('label',{class:_vm.$style.labelRemember,attrs:{"for":"rememberAccount"}},[_vm._v(_vm._s(_vm.$t("app.ledger.selectAccount.shouldRemember")))])]),_c('button',{class:_vm.$style.button,on:{"click":_vm.selectedAccount}},[_vm._v("\n            "+_vm._s(_vm.$t("app.ledger.selectAccount.selectAccount"))+"\n          ")])])],2)]):_vm._e()],1)])}
var Ledgervue_type_template_id_38f58655_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/signerDialogs/Ledger.vue?vue&type=template&id=38f58655&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/signerDialogs/Ledger.vue?vue&type=script&lang=js&



//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ var Ledgervue_type_script_lang_js_ = ({
  name: 'Ledger',
  components: {
    Loading: Loading
  },

  data() {
    return {
      isListeningForAccounts: false,
      accountSelect: null,
      accountSelected: 0,
      rememberAccount: true
    };
  },

  watch: {
    accountSelect: {
      handler(accounts) {
        if (accounts && accounts.length) {
          accounts.every(address => {
            if (this.provider.web3.utils.sha3(address) === this.$store.state.lastAccountData) {
              this.provider.defaultAccount = address;
              this.selectedAccount();
            }

            return false;
          });
        }
      }

    },
    provider: {
      handler(provider) {
        if (provider.web3) {
          this.listenForAccounts();
        }
      }

    }
  },

  created() {
    if (this.provider && this.provider.web3) {
      this.listenForAccounts();
    }
  },

  methods: {
    selectedAccount() {
      var selectedAddress = this.accountSelect[this.accountSelected];

      if (this.rememberAccount) {
        var hash = this.provider.web3.utils.sha3(selectedAddress);
        this.$store.commit('lastAccountData', hash);
      }

      this.provider.defaultAccount = selectedAddress;
    },

    listenForAccounts() {
      var _this = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.isListeningForAccounts = true;
                _context.prev = 1;
                _context.next = 4;
                return _this.provider.web3.eth.getAccounts();

              case 4:
                _this.accountSelect = _context.sent;
                _context.next = 9;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](1);

              case 9:
                _this.isListeningForAccounts = false;

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 7]]);
      }))();
    }

  },
  computed: _objectSpread({
    isAccountUnLocked() {
      return !this.account;
    }

  }, mapGetters(['provider']), mapState(['networkId', 'account', 'requiredNetwork', 'lastAccountData']))
});
// CONCATENATED MODULE: ./src/components/signerDialogs/Ledger.vue?vue&type=script&lang=js&
 /* harmony default export */ var signerDialogs_Ledgervue_type_script_lang_js_ = (Ledgervue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/signerDialogs/Ledger.vue



function Ledger_injectStyles (context) {
  
  var style0 = __webpack_require__("34ce")
if (style0.__inject__) style0.__inject__(context)
this["$style"] = (style0.locals || style0)

}

/* normalize component */

var Ledger_component = normalizeComponent(
  signerDialogs_Ledgervue_type_script_lang_js_,
  Ledgervue_type_template_id_38f58655_render,
  Ledgervue_type_template_id_38f58655_staticRenderFns,
  false,
  Ledger_injectStyles,
  null,
  null
  ,true
)

Ledger_component.options.__file = "Ledger.vue"
/* harmony default export */ var signerDialogs_Ledger = (Ledger_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/App.vue?vue&type=script&lang=js&shadow



//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





 // Components





 // @todo Make following async to reduce initial size?



 // Vue globals.

external_Vue_default.a.use(v_tooltip_esm["a" /* default */]);
Object.defineProperty(external_Vue_default.a.prototype, 'web3ProviderApi', {
  value: web3ProviderApi
});
/* harmony default export */ var Appvue_type_script_lang_js_shadow = ({
  name: 'App',
  store: src_store,
  i18n: i18n,
  components: {
    Loading: Loading,
    SelectProvider: SelectProvider,
    Metamask: signerDialogs_Metamask,
    WalletConnect: signerDialogs_WalletConnect,
    Ledger: signerDialogs_Ledger,
    NetworkIndicator: NetworkIndicator,
    AccountIndicator: AccountIndicator,
    Modal: Modal
  },

  data() {
    return {
      isDialogOpen: false,
      isLoading: true
    };
  },

  props: {
    // These props are defined in the web-component.
    // In development mode they are taken from example-props.js
    dappName: {
      type: String,
      required: true
    },
    requiredNetwork: {
      type: String,
      required: true
    },
    rpcUrl: {
      type: String,
      required: true
    },
    providers: {
      type: String,
      default: null
    }
  },
  computed: _objectSpread({
    showConnectAction() {
      if (this.$store.state.signerId === null) {
        return true;
      }

      if (this.$store.state.signerId) {
        if (external_Vue_default.a.prototype.web3ProviderApi[this.$store.state.signerId].createAutovalidateProvider) {
          return false;
        }
      }

      return !this.$store.getters.isValidated;
    }

  }, mapState(['enabledProviders', 'signerId', 'account', 'resetProvider', 'networkId']), mapGetters(['isValidated'])),

  beforeCreate() {
    // Verify and save initial properties to store.
    this.$store.dispatch(_objectSpread({}, {
      type: 'initStore'
    }, this.$options.propsData)); // Validate based on last provider selected.

    if (this.$store.state.signerId) {
      if (external_Vue_default.a.prototype.web3ProviderApi[this.$store.state.signerId].createAutovalidateProvider) {
        this.$store.dispatch('providerAutoValidate');
      } else {
        this.$store.commit('signerId', null);
      }
    }
  },

  watch: {
    isValidated: {
      handler(isValidated) {
        if (isValidated) {
          this.isDialogOpen = false;
        }
      }

    }
  },
  methods: {
    selectProvider(id) {
      var _this = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.$store.commit('signerId', id);

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }))();
    },

    changeProvider() {
      var _this2 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this2.$store.dispatch('resetProvider');

                _this2.isDialogOpen = true;

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }))();
    },

    dialogClick(event) {
      if (event.target.hash === '#back') {
        this.$store.commit('signerId', null);
        this.$store.dispatch('resetProvider');
      } else if (!this.isDialogContent(event)) {
        this.isDialogOpen = false;

        if (!this.isValidated) {
          this.$store.commit('signerId', null);
        }
      }

      event.preventDefault();
    },

    isDialogContent(event) {
      // Clicks outside .modal-content will close dialogue.
      if (!event.path) {
        return false;
      }

      for (var i = 0, len = event.path.length; i < len; i += 1) {
        if (!event.path[i].classList) {
          return false;
        }

        if (event.path[i].classList.contains('modal-content')) {
          return true;
        }
      }

      return false;
    }

  }
});
// CONCATENATED MODULE: ./src/App.vue?vue&type=script&lang=js&shadow
 /* harmony default export */ var src_Appvue_type_script_lang_js_shadow = (Appvue_type_script_lang_js_shadow); 
// CONCATENATED MODULE: ./src/App.vue?shadow



function Appshadow_injectStyles (context) {
  
  var style0 = __webpack_require__("714f")
if (style0.__inject__) style0.__inject__(context)
var style1 = __webpack_require__("f0e1")
if (style1.__inject__) style1.__inject__(context)
this["$style"] = (style1.locals || style1)

}

/* normalize component */

var Appshadow_component = normalizeComponent(
  src_Appvue_type_script_lang_js_shadow,
  render,
  staticRenderFns,
  false,
  Appshadow_injectStyles,
  null,
  null
  ,true
)

Appshadow_component.options.__file = "App.vue"
/* harmony default export */ var Appshadow = (Appshadow_component.exports);
// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-wc.js




// runtime shared by every component chunk





window.customElements.define('web3-ready', vue_wc_wrapper(external_Vue_default.a, Appshadow))

/***/ }),

/***/ "5bf5":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.SelectProvider_list_21sUn{list-style-type:none;padding:0;margin:0\n}\n.SelectProvider_listItem_5AxA8{display:block;margin-bottom:1em\n}", ""]);

// exports
exports.locals = {
	"list": "SelectProvider_list_21sUn",
	"listItem": "SelectProvider_listItem_5AxA8"
};

/***/ }),

/***/ "5ca1":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var core = __webpack_require__("8378");
var hide = __webpack_require__("32e9");
var redefine = __webpack_require__("2aba");
var ctx = __webpack_require__("9b43");
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ "5cc5":
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__("2b4c")('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),

/***/ "5d4e":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_WalletConnect_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("f7a0");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_WalletConnect_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_WalletConnect_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_WalletConnect_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_WalletConnect_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_WalletConnect_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "5ee7":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.0//EN' 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'%3E %3Csvg version='1.0' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='100px' height='100px' viewBox='0 0 100 100' enable-background='new 0 0 100 100' xml:space='preserve'%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' fill='%233AAA35' fill-opacity='0.8' d='M80.49,38.43c3.78,3.21,7.38,6.28,10.93,9.28 c-13.69,16.2-27.43,32.41-41.11,48.56c-8.27-7-16.6-14.06-24.89-21.08c3-3.54,6.07-7.15,9.18-10.82c0.17,0.13,0.41,0.32,0.64,0.52 c4.21,3.56,8.4,7.13,12.61,10.67c0.78,0.67,0.78,0.67,1.43-0.1c10.25-12.09,20.49-24.19,30.73-36.3 C80.19,38.96,80.32,38.69,80.49,38.43z'/%3E %3C/svg%3E\""

/***/ }),

/***/ "62e4":
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "69a8":
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "6a99":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__("d3f4");
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "6b54":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__("3846");
var anObject = __webpack_require__("cb7c");
var $flags = __webpack_require__("0bfb");
var DESCRIPTORS = __webpack_require__("9e1e");
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  __webpack_require__("2aba")(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (__webpack_require__("79e5")(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}


/***/ }),

/***/ "6e70":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C!-- By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL --%3E %3Csvg width='120' height='30' viewBox='0 0 120 30' xmlns='http://www.w3.org/2000/svg' fill='%23000'%3E %3Ccircle cx='15' cy='15' r='15'%3E %3Canimate attributeName='r' from='15' to='15' begin='0s' dur='0.8s' values='15;9;15' calcMode='linear' repeatCount='indefinite' /%3E %3Canimate attributeName='fill-opacity' from='1' to='1' begin='0s' dur='0.8s' values='1;.5;1' calcMode='linear' repeatCount='indefinite' /%3E %3C/circle%3E %3Ccircle cx='60' cy='15' r='9' fill-opacity='0.3'%3E %3Canimate attributeName='r' from='9' to='9' begin='0s' dur='0.8s' values='9;15;9' calcMode='linear' repeatCount='indefinite' /%3E %3Canimate attributeName='fill-opacity' from='0.5' to='0.5' begin='0s' dur='0.8s' values='.5;1;.5' calcMode='linear' repeatCount='indefinite' /%3E %3C/circle%3E %3Ccircle cx='105' cy='15' r='15'%3E %3Canimate attributeName='r' from='15' to='15' begin='0s' dur='0.8s' values='15;9;15' calcMode='linear' repeatCount='indefinite' /%3E %3Canimate attributeName='fill-opacity' from='1' to='1' begin='0s' dur='0.8s' values='1;.5;1' calcMode='linear' repeatCount='indefinite' /%3E %3C/circle%3E %3C/svg%3E\""

/***/ }),

/***/ "6f05":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.network-indicator[data-v-035eb1b2]{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center\n}\n.network-indicator--large[data-v-035eb1b2]{padding-bottom:1em\n}\n@media (min-width:600px){\n.network-indicator--large[data-v-035eb1b2]{padding:1em 0\n}\n}\n.network-indicator--tiny[data-v-035eb1b2]{display:inline-block;vertical-align:middle\n}\n.network-indicator--icon[data-v-035eb1b2]{position:relative;background:transparent url(" + escape(__webpack_require__("33d7")) + ") 0 no-repeat;background-size:contain;vertical-align:top;margin:0 10px 0 5px;cursor:help;display:inline-block;height:30px;width:28px;-ms-flex-preferred-size:28px;flex-basis:28px;-webkit-box-flex:0;-ms-flex-positive:0;flex-grow:0;-ms-flex-negative:0;flex-shrink:0\n}\n.network-indicator--icon-status[data-v-035eb1b2]{position:absolute;width:100%;height:100%;bottom:0;right:-10px\n}\n.network-indicator--info[data-v-035eb1b2]{padding-left:1em\n}", ""]);

// exports


/***/ }),

/***/ "714f":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_global_scss_vue_type_style_index_0_lang_scss_shadow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("4790");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_global_scss_vue_type_style_index_0_lang_scss_shadow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_global_scss_vue_type_style_index_0_lang_scss_shadow__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_global_scss_vue_type_style_index_0_lang_scss_shadow__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_global_scss_vue_type_style_index_0_lang_scss_shadow__WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_global_scss_vue_type_style_index_0_lang_scss_shadow__WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "731a":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("5bf5");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("3814d160", content, shadowRoot)
};

/***/ }),

/***/ "7726":
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ "79e5":
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ "7a56":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__("7726");
var dP = __webpack_require__("86cc");
var DESCRIPTORS = __webpack_require__("9e1e");
var SPECIES = __webpack_require__("2b4c")('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),

/***/ "7f20":
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__("86cc").f;
var has = __webpack_require__("69a8");
var TAG = __webpack_require__("2b4c")('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),

/***/ "8079":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var macrotask = __webpack_require__("1991").set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__("2d95")(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),

/***/ "82c3":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.Ledger_signer_3-kui{min-height:102px;max-height:100%;overflow:scroll;background:#f5f6fa;border-radius:14px 10px 10px 14px\n}\n.Ledger_signer_3-kui .Ledger_button_2kXMp{cursor:pointer;min-height:1em;outline:0;border:1px solid transparent;vertical-align:baseline;margin:0 .25em 0 0;padding:.78571429em 1.5em .78571429em;text-transform:none;text-shadow:none;line-height:inherit;font-size:1rem;font-style:normal;text-align:center;text-decoration:none;border-radius:.28571429rem;will-change:transform;-webkit-transition:all .15s ease 0s;transition:all .15s ease 0s;white-space:nowrap;max-width:19.75em\n}\n.Ledger_signer_3-kui .Ledger_button_2kXMp:disabled{background:#d9d9d9!important;color:#858585!important;cursor:not-allowed\n}\n.Ledger_signer_3-kui .Ledger_button_2kXMp:hover{-webkit-box-shadow:none;box-shadow:none;opacity:.9\n}\n@media (min-width:600px){\n.Ledger_signer_3-kui{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:start;-ms-flex-pack:start;justify-content:flex-start\n}\n}\n.Ledger_signer_3-kui .Ledger_logo_QZEy4{width:100%;height:4em;margin:1em auto 0;display:block;max-width:13em;background:transparent url(" + escape(__webpack_require__("2eec")) + ") 1em no-repeat;background-size:83%\n}\n@media (min-width:600px){\n.Ledger_signer_3-kui .Ledger_logo_QZEy4{margin-top:0;height:6em;min-width:25%\n}\n}\n@media (min-width:751px){\n.Ledger_signer_3-kui .Ledger_logo_QZEy4{background-position:2em\n}\n}\n.Ledger_signer_3-kui .Ledger_dialog_3hQXT{padding:1em;width:100%;text-align:center\n}\n@media (min-width:600px){\n.Ledger_signer_3-kui .Ledger_dialog_3hQXT{padding:2em 2em 2em 0;max-width:75%\n}\n}\n.Ledger_signer_3-kui .Ledger_dialog_3hQXT .Ledger_headline_1r9R5{margin:1em 0;font-size:1.3em;font-weight:700;display:block;color:#4c4c4c\n}\n.Ledger_signer_3-kui .Ledger_dialog_3hQXT .Ledger_text_12z_U{padding:0 2em .5em;max-width:31.75em;display:inline-block\n}\n.Ledger_signer_3-kui .Ledger_deviceStatus_TLoN1 .Ledger_listening_2NcME{width:80%;display:inline-block;padding:1em;border:2px dashed #dedede;max-width:20em;margin-bottom:1em;min-height:160px\n}\n.Ledger_signer_3-kui .Ledger_deviceStatus_TLoN1 .Ledger_listening_2NcME .Ledger_status_QFt6K{color:#bdbdbd;display:inline-block;font-size:small;padding-top:1.5em\n}\n.Ledger_signer_3-kui .Ledger_deviceStatus_TLoN1 .Ledger_listening_2NcME .Ledger_text_12z_U{color:#7f7f7f\n}\n.Ledger_signer_3-kui .Ledger_selectAccount_1Xwxl .Ledger_options_2gEBt{text-align:left;margin:auto 0;padding:.5em;display:inline-block;max-width:100%;overflow:hidden;line-height:2\n}\n.Ledger_signer_3-kui .Ledger_selectAccount_1Xwxl .Ledger_options_2gEBt .Ledger_input_5y6Sk{vertical-align:middle\n}\n.Ledger_signer_3-kui .Ledger_selectAccount_1Xwxl .Ledger_options_2gEBt .Ledger_optionsItem_1dRFU{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\n}\n.Ledger_signer_3-kui .Ledger_selectAccount_1Xwxl .Ledger_options_2gEBt .Ledger_optionsItem_1dRFU .Ledger_labelAddress_28YVi{padding:.25em .25em .25em .5em;margin-bottom:.5em;width:100%\n}\n.Ledger_signer_3-kui .Ledger_selectAccount_1Xwxl .Ledger_rememberAccount_2w-T4{margin:.5em 0 1em\n}\n.Ledger_signer_3-kui .Ledger_selectAccount_1Xwxl .Ledger_rememberAccount_2w-T4 .Ledger_labelRemember_n7URn{padding-left:.5em\n}\n.Ledger_signer_3-kui .Ledger_button_2kXMp{font-size:.78571429rem;display:inline-block;color:#fff;background:#41ccb4\n}", ""]);

// exports
exports.locals = {
	"signer": "Ledger_signer_3-kui",
	"button": "Ledger_button_2kXMp",
	"logo": "Ledger_logo_QZEy4",
	"dialog": "Ledger_dialog_3hQXT",
	"headline": "Ledger_headline_1r9R5",
	"text": "Ledger_text_12z_U",
	"deviceStatus": "Ledger_deviceStatus_TLoN1",
	"listening": "Ledger_listening_2NcME",
	"status": "Ledger_status_QFt6K",
	"selectAccount": "Ledger_selectAccount_1Xwxl",
	"options": "Ledger_options_2gEBt",
	"input": "Ledger_input_5y6Sk",
	"optionsItem": "Ledger_optionsItem_1dRFU",
	"labelAddress": "Ledger_labelAddress_28YVi",
	"rememberAccount": "Ledger_rememberAccount_2w-T4",
	"labelRemember": "Ledger_labelRemember_n7URn"
};

/***/ }),

/***/ "8378":
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ "84f2":
/***/ (function(module, exports) {

module.exports = {};


/***/ }),

/***/ "86cc":
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__("cb7c");
var IE8_DOM_DEFINE = __webpack_require__("c69a");
var toPrimitive = __webpack_require__("6a99");
var dP = Object.defineProperty;

exports.f = __webpack_require__("9e1e") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "8bbf":
/***/ (function(module, exports) {

module.exports = Vue;

/***/ }),

/***/ "90d3":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProviderRow_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("994a");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProviderRow_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProviderRow_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProviderRow_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProviderRow_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProviderRow_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "9205":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.account-indicator[data-v-708d6cf4]{display:inline-block;vertical-align:middle\n}\n.account-indicator--large[data-v-708d6cf4]{padding-bottom:1em;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center\n}\n@media (min-width:600px){\n.account-indicator--large[data-v-708d6cf4]{padding:1em 0\n}\n}\n.account-indicator--icon[data-v-708d6cf4]{display:inline-block;position:relative;vertical-align:baseline;background:transparent url(" + escape(__webpack_require__("38d1")) + ") 0 no-repeat;background-size:contain;height:30px;width:28px;-ms-flex-preferred-size:28px;flex-basis:28px;-webkit-box-flex:0;-ms-flex-positive:0;flex-grow:0;-ms-flex-negative:0;flex-shrink:0;margin:0 10px 0 5px;cursor:help\n}\n.account-indicator--icon-status[data-v-708d6cf4]{position:absolute;width:100%;height:100%;bottom:0;right:-13px;background-size:contain\n}\n.account-indicator--address[data-v-708d6cf4]{height:30px;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;line-height:30px;font-size:small;display:inline-block;max-width:100%\n}\n.account-indicator--address-tiny[data-v-708d6cf4]{display:inline-block;max-width:6em;margin-left:.5em\n}\n.account-indicator--info[data-v-708d6cf4]{padding-left:1em\n}", ""]);

// exports


/***/ }),

/***/ "96cf":
/***/ (function(module, exports) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);


/***/ }),

/***/ "994a":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("0e07");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("10a147fe", content, shadowRoot)
};

/***/ }),

/***/ "9b43":
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__("d8e8");
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "9c80":
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),

/***/ "9def":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__("4588");
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),

/***/ "9e1e":
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__("79e5")(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "a25f":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),

/***/ "a3b5":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.Modal_overlay_LjK-V{background-color:rgba(0,0,0,.6);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;position:fixed;top:0;right:0;bottom:0;left:0;text-align:center;max-height:100%;overflow:scroll;z-index:10000\n}\n.Modal_modal_2DJAT{width:100%;max-width:880px;padding:20px;max-height:100%\n}\n.Modal_header_3MX3I{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-wrap:wrap-reverse;flex-wrap:wrap-reverse;line-height:26px;height:26px;margin-bottom:10px;color:#fff\n}\n.Modal_header_3MX3I>a{color:#fff;text-decoration:none\n}\n.Modal_actionBack_amPUj{font-size:120%;display:inline-block;font-weight:700;text-transform:uppercase\n}\n.Modal_actionBack_amPUj>span{font-size:20px;display:inline-block;padding-right:5px\n}\n.Modal_actionCloseX_3EUxm{display:inline-block;font-size:44px;text-align:right;-webkit-box-flex:1;-ms-flex-positive:1;flex-grow:1;line-height:18px\n}\n.Modal_modalContent_2VEdl{text-align:left;margin-bottom:1em\n}\n.Modal_actionCloseFooter_1h5--{color:#fff;text-decoration:none;font-size:small;padding-bottom:20px\n}", ""]);

// exports
exports.locals = {
	"overlay": "Modal_overlay_LjK-V",
	"modal": "Modal_modal_2DJAT",
	"header": "Modal_header_3MX3I",
	"actionBack": "Modal_actionBack_amPUj",
	"actionCloseX": "Modal_actionCloseX_3EUxm",
	"modalContent": "Modal_modalContent_2VEdl",
	"actionCloseFooter": "Modal_actionCloseFooter_1h5--"
};

/***/ }),

/***/ "a5b8":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__("d8e8");

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),

/***/ "aae3":
/***/ (function(module, exports, __webpack_require__) {

// 7.2.8 IsRegExp(argument)
var isObject = __webpack_require__("d3f4");
var cof = __webpack_require__("2d95");
var MATCH = __webpack_require__("2b4c")('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};


/***/ }),

/***/ "ac03":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("82c3");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("003301f6", content, shadowRoot)
};

/***/ }),

/***/ "b041":
/***/ (function(module, exports) {

module.exports = function escape(url) {
    if (typeof url !== 'string') {
        return url
    }
    // If url is already wrapped in quotes, remove them
    if (/^['"].*['"]$/.test(url)) {
        url = url.slice(1, -1);
    }
    // Should url be wrapped?
    // See https://drafts.csswg.org/css-values-3/#urls
    if (/["'() \t\n]/.test(url)) {
        return '"' + url.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"'
    }

    return url
}


/***/ }),

/***/ "b5f1":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("f124");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("116d5c89", content, shadowRoot)
};

/***/ }),

/***/ "b68b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Modal_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("f3cf");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Modal_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Modal_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Modal_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Modal_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Modal_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "bcaa":
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__("cb7c");
var isObject = __webpack_require__("d3f4");
var newPromiseCapability = __webpack_require__("a5b8");

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),

/***/ "be13":
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),

/***/ "c0da":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Metamask_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("4d0b");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Metamask_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Metamask_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Metamask_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Metamask_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Metamask_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "c69a":
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__("9e1e") && !__webpack_require__("79e5")(function () {
  return Object.defineProperty(__webpack_require__("230e")('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "c8ba":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "ca5a":
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),

/***/ "cb7c":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ "d3f4":
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "d65b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProvider_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("731a");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProvider_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProvider_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProvider_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProvider_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SelectProvider_vue_vue_type_style_index_0_lang_scss_module_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "d8e8":
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ "da81":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Gets the value at `key`, unless `key` is "__proto__".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  return key == '__proto__'
    ? undefined
    : object[key];
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeMax = Math.max,
    nativeNow = Date.now;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    if (isObject(srcValue)) {
      stack || (stack = new Stack);
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = merge;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("c8ba"), __webpack_require__("62e4")(module)))

/***/ }),

/***/ "dcbc":
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__("2aba");
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};


/***/ }),

/***/ "de5d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_NetworkIndicator_vue_vue_type_style_index_0_id_035eb1b2_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("3cf8");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_NetworkIndicator_vue_vue_type_style_index_0_id_035eb1b2_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_NetworkIndicator_vue_vue_type_style_index_0_id_035eb1b2_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_NetworkIndicator_vue_vue_type_style_index_0_id_035eb1b2_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_NetworkIndicator_vue_vue_type_style_index_0_id_035eb1b2_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_css_loader_index_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_NetworkIndicator_vue_vue_type_style_index_0_id_035eb1b2_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "e37d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* unused harmony export install */
/* unused harmony export VTooltip */
/* unused harmony export VClosePopover */
/* unused harmony export VPopover */
/* unused harmony export createTooltip */
/* unused harmony export destroyTooltip */
/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.14.3
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
var timeoutDuration = 0;
for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
    timeoutDuration = 1;
    break;
  }
}

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var css = getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? html['offset' + axis] + computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')] + computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')] : 0);
}

function getWindowSizes() {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes() : {};
  var width = sizes.width || element.clientWidth || result.right - result.left;
  var height = sizes.height || element.clientHeight || result.bottom - result.top;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && parent.nodeName === 'HTML') {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop, 10);
    var marginLeft = parseFloat(styles.marginLeft, 10);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  return isFixed(getParentNode(element));
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  boundaries.left += padding;
  boundaries.top += padding;
  boundaries.right -= padding;
  boundaries.bottom -= padding;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var styles = getComputedStyle(element);
  var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
  var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroy the popper
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicity asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger onUpdate callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  // Avoid blurry text by using full pixel integers.
  // For pixel-perfect positioning, top/bottom prefers rounded
  // values, while left/right prefers floored values.
  var offsets = {
    left: Math.floor(popper.left),
    top: Math.round(popper.top),
    bottom: Math.round(popper.bottom),
    right: Math.floor(popper.right)
  };

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    top = -offsetParentRect.height + offsets.bottom;
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    left = -offsetParentRect.width + offsets.right;
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjuction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-right` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unitless, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the height.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > More on this [reading this issue](https://github.com/FezVrasta/popper.js/issues/373)
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * An scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper this makes sure the popper has always a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier, can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near eachothers
   * without leaving any gap between the two. Expecially useful when the arrow is
   * enabled and you want to assure it to point to its reference element.
   * It cares only about the first axis, you can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjuction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations).
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position,
     * the popper will never be placed outside of the defined boundaries
     * (except if keepTogether is enabled)
     */
    boundariesElement: 'viewport'
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3d transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties.
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define you own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3d transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties.
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the informations used by Popper.js
 * this object get passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper.
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper, it expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow, it expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements.
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overriden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass as 3rd argument an object with the same
 * structure of this object, example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated, this callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Create a new Popper.js instance
   * @class Popper
   * @param {HTMLElement|referenceObject} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as popper.
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedule an update, it will run on the next UI update available
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

var SVGAnimatedString = function SVGAnimatedString() {};
if (typeof window !== 'undefined') {
	SVGAnimatedString = window.SVGAnimatedString;
}

function convertToArray(value) {
	if (typeof value === 'string') {
		value = value.split(' ');
	}
	return value;
}

/**
 * Add classes to an element.
 * This method checks to ensure that the classes don't already exist before adding them.
 * It uses el.className rather than classList in order to be IE friendly.
 * @param {object} el - The element to add the classes to.
 * @param {classes} string - List of space separated classes to be added to the element.
 */
function addClasses(el, classes) {
	var newClasses = convertToArray(classes);
	var classList = void 0;
	if (el.className instanceof SVGAnimatedString) {
		classList = convertToArray(el.className.baseVal);
	} else {
		classList = convertToArray(el.className);
	}
	newClasses.forEach(function (newClass) {
		if (classList.indexOf(newClass) === -1) {
			classList.push(newClass);
		}
	});
	if (el instanceof SVGElement) {
		el.setAttribute('class', classList.join(' '));
	} else {
		el.className = classList.join(' ');
	}
}

/**
 * Remove classes from an element.
 * It uses el.className rather than classList in order to be IE friendly.
 * @export
 * @param {any} el The element to remove the classes from.
 * @param {any} classes List of space separated classes to be removed from the element.
 */
function removeClasses(el, classes) {
	var newClasses = convertToArray(classes);
	var classList = void 0;
	if (el.className instanceof SVGAnimatedString) {
		classList = convertToArray(el.className.baseVal);
	} else {
		classList = convertToArray(el.className);
	}
	newClasses.forEach(function (newClass) {
		var index = classList.indexOf(newClass);
		if (index !== -1) {
			classList.splice(index, 1);
		}
	});
	if (el instanceof SVGElement) {
		el.setAttribute('class', classList.join(' '));
	} else {
		el.className = classList.join(' ');
	}
}

var supportsPassive = false;

if (typeof window !== 'undefined') {
	supportsPassive = false;
	try {
		var opts = Object.defineProperty({}, 'passive', {
			get: function get() {
				supportsPassive = true;
			}
		});
		window.addEventListener('test', null, opts);
	} catch (e) {}
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck$1 = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass$1 = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends$1 = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/* Forked from https://github.com/FezVrasta/popper.js/blob/master/packages/tooltip/src/index.js */

var DEFAULT_OPTIONS = {
	container: false,
	delay: 0,
	html: false,
	placement: 'top',
	title: '',
	template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
	trigger: 'hover focus',
	offset: 0
};

var openTooltips = [];

var Tooltip = function () {
	/**
  * Create a new Tooltip.js instance
  * @class Tooltip
  * @param {HTMLElement} reference - The DOM node used as reference of the tooltip (it can be a jQuery element).
  * @param {Object} options
  * @param {String} options.placement=bottom
  *			Placement of the popper accepted values: `top(-start, -end), right(-start, -end), bottom(-start, -end),
  *			left(-start, -end)`
  * @param {HTMLElement|String|false} options.container=false - Append the tooltip to a specific element.
  * @param {Number|Object} options.delay=0
  *			Delay showing and hiding the tooltip (ms) - does not apply to manual trigger type.
  *			If a number is supplied, delay is applied to both hide/show.
  *			Object structure is: `{ show: 500, hide: 100 }`
  * @param {Boolean} options.html=false - Insert HTML into the tooltip. If false, the content will inserted with `innerText`.
  * @param {String|PlacementFunction} options.placement='top' - One of the allowed placements, or a function returning one of them.
  * @param {String} [options.template='<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>']
  *			Base HTML to used when creating the tooltip.
  *			The tooltip's `title` will be injected into the `.tooltip-inner` or `.tooltip__inner`.
  *			`.tooltip-arrow` or `.tooltip__arrow` will become the tooltip's arrow.
  *			The outermost wrapper element should have the `.tooltip` class.
  * @param {String|HTMLElement|TitleFunction} options.title='' - Default title value if `title` attribute isn't present.
  * @param {String} [options.trigger='hover focus']
  *			How tooltip is triggered - click, hover, focus, manual.
  *			You may pass multiple triggers; separate them with a space. `manual` cannot be combined with any other trigger.
  * @param {HTMLElement} options.boundariesElement
  *			The element used as boundaries for the tooltip. For more information refer to Popper.js'
  *			[boundariesElement docs](https://popper.js.org/popper-documentation.html)
  * @param {Number|String} options.offset=0 - Offset of the tooltip relative to its reference. For more information refer to Popper.js'
  *			[offset docs](https://popper.js.org/popper-documentation.html)
  * @param {Object} options.popperOptions={} - Popper options, will be passed directly to popper instance. For more information refer to Popper.js'
  *			[options docs](https://popper.js.org/popper-documentation.html)
  * @return {Object} instance - The generated tooltip instance
  */
	function Tooltip(reference, options) {
		classCallCheck$1(this, Tooltip);

		_initialiseProps.call(this);

		// apply user options over default ones
		options = _extends$1({}, DEFAULT_OPTIONS, options);

		reference.jquery && (reference = reference[0]);

		// cache reference and options
		this.reference = reference;
		this.options = options;

		// set initial state
		this._isOpen = false;

		this._init();
	}

	//
	// Public methods
	//

	/**
  * Reveals an element's tooltip. This is considered a "manual" triggering of the tooltip.
  * Tooltips with zero-length titles are never displayed.
  * @method Tooltip#show
  * @memberof Tooltip
  */


	/**
  * Hides an element’s tooltip. This is considered a “manual” triggering of the tooltip.
  * @method Tooltip#hide
  * @memberof Tooltip
  */


	/**
  * Hides and destroys an element’s tooltip.
  * @method Tooltip#dispose
  * @memberof Tooltip
  */


	/**
  * Toggles an element’s tooltip. This is considered a “manual” triggering of the tooltip.
  * @method Tooltip#toggle
  * @memberof Tooltip
  */


	createClass$1(Tooltip, [{
		key: 'setClasses',
		value: function setClasses(classes) {
			this._classes = classes;
		}
	}, {
		key: 'setContent',
		value: function setContent(content) {
			this.options.title = content;
			if (this._tooltipNode) {
				this._setContent(content, this.options);
			}
		}
	}, {
		key: 'setOptions',
		value: function setOptions(options) {
			var classesUpdated = false;
			var classes = options && options.classes || directive.options.defaultClass;
			if (this._classes !== classes) {
				this.setClasses(classes);
				classesUpdated = true;
			}

			options = getOptions(options);

			var needPopperUpdate = false;
			var needRestart = false;

			if (this.options.offset !== options.offset || this.options.placement !== options.placement) {
				needPopperUpdate = true;
			}

			if (this.options.template !== options.template || this.options.trigger !== options.trigger || this.options.container !== options.container || classesUpdated) {
				needRestart = true;
			}

			for (var key in options) {
				this.options[key] = options[key];
			}

			if (this._tooltipNode) {
				if (needRestart) {
					var isOpen = this._isOpen;

					this.dispose();
					this._init();

					if (isOpen) {
						this.show();
					}
				} else if (needPopperUpdate) {
					this.popperInstance.update();
				}
			}
		}

		//
		// Private methods
		//

	}, {
		key: '_init',
		value: function _init() {
			// get events list
			var events = typeof this.options.trigger === 'string' ? this.options.trigger.split(' ').filter(function (trigger) {
				return ['click', 'hover', 'focus'].indexOf(trigger) !== -1;
			}) : [];
			this._isDisposed = false;
			this._enableDocumentTouch = events.indexOf('manual') === -1;

			// set event listeners
			this._setEventListeners(this.reference, events, this.options);
		}

		/**
   * Creates a new tooltip node
   * @memberof Tooltip
   * @private
   * @param {HTMLElement} reference
   * @param {String} template
   * @param {String|HTMLElement|TitleFunction} title
   * @param {Boolean} allowHtml
   * @return {HTMLelement} tooltipNode
   */

	}, {
		key: '_create',
		value: function _create(reference, template) {
			// create tooltip element
			var tooltipGenerator = window.document.createElement('div');
			tooltipGenerator.innerHTML = template.trim();
			var tooltipNode = tooltipGenerator.childNodes[0];

			// add unique ID to our tooltip (needed for accessibility reasons)
			tooltipNode.id = 'tooltip_' + Math.random().toString(36).substr(2, 10);

			// Initially hide the tooltip
			// The attribute will be switched in a next frame so
			// CSS transitions can play
			tooltipNode.setAttribute('aria-hidden', 'true');

			if (this.options.autoHide && this.options.trigger.indexOf('hover') !== -1) {
				tooltipNode.addEventListener('mouseenter', this.hide);
				tooltipNode.addEventListener('click', this.hide);
			}

			// return the generated tooltip node
			return tooltipNode;
		}
	}, {
		key: '_setContent',
		value: function _setContent(content, options) {
			var _this = this;

			this.asyncContent = false;
			this._applyContent(content, options).then(function () {
				_this.popperInstance.update();
			});
		}
	}, {
		key: '_applyContent',
		value: function _applyContent(title, options) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				var allowHtml = options.html;
				var rootNode = _this2._tooltipNode;
				if (!rootNode) return;
				var titleNode = rootNode.querySelector(_this2.options.innerSelector);
				if (title.nodeType === 1) {
					// if title is a node, append it only if allowHtml is true
					if (allowHtml) {
						while (titleNode.firstChild) {
							titleNode.removeChild(titleNode.firstChild);
						}
						titleNode.appendChild(title);
					}
				} else if (typeof title === 'function') {
					// if title is a function, call it and set innerText or innerHtml depending by `allowHtml` value
					var result = title();
					if (result && typeof result.then === 'function') {
						_this2.asyncContent = true;
						options.loadingClass && addClasses(rootNode, options.loadingClass);
						if (options.loadingContent) {
							_this2._applyContent(options.loadingContent, options);
						}
						result.then(function (asyncResult) {
							options.loadingClass && removeClasses(rootNode, options.loadingClass);
							return _this2._applyContent(asyncResult, options);
						}).then(resolve).catch(reject);
					} else {
						_this2._applyContent(result, options).then(resolve).catch(reject);
					}
					return;
				} else {
					// if it's just a simple text, set innerText or innerHtml depending by `allowHtml` value
					allowHtml ? titleNode.innerHTML = title : titleNode.innerText = title;
				}
				resolve();
			});
		}
	}, {
		key: '_show',
		value: function _show(reference, options) {
			if (options && typeof options.container === 'string') {
				var container = document.querySelector(options.container);
				if (!container) return;
			}

			clearTimeout(this._disposeTimer);

			options = Object.assign({}, options);
			delete options.offset;

			var updateClasses = true;
			if (this._tooltipNode) {
				addClasses(this._tooltipNode, this._classes);
				updateClasses = false;
			}

			var result = this._ensureShown(reference, options);

			if (updateClasses && this._tooltipNode) {
				addClasses(this._tooltipNode, this._classes);
			}

			addClasses(reference, ['v-tooltip-open']);

			return result;
		}
	}, {
		key: '_ensureShown',
		value: function _ensureShown(reference, options) {
			var _this3 = this;

			// don't show if it's already visible
			if (this._isOpen) {
				return this;
			}
			this._isOpen = true;

			openTooltips.push(this);

			// if the tooltipNode already exists, just show it
			if (this._tooltipNode) {
				this._tooltipNode.style.display = '';
				this._tooltipNode.setAttribute('aria-hidden', 'false');
				this.popperInstance.enableEventListeners();
				this.popperInstance.update();
				if (this.asyncContent) {
					this._setContent(options.title, options);
				}
				return this;
			}

			// get title
			var title = reference.getAttribute('title') || options.title;

			// don't show tooltip if no title is defined
			if (!title) {
				return this;
			}

			// create tooltip node
			var tooltipNode = this._create(reference, options.template);
			this._tooltipNode = tooltipNode;

			this._setContent(title, options);

			// Add `aria-describedby` to our reference element for accessibility reasons
			reference.setAttribute('aria-describedby', tooltipNode.id);

			// append tooltip to container
			var container = this._findContainer(options.container, reference);

			this._append(tooltipNode, container);

			var popperOptions = _extends$1({}, options.popperOptions, {
				placement: options.placement
			});

			popperOptions.modifiers = _extends$1({}, popperOptions.modifiers, {
				arrow: {
					element: this.options.arrowSelector
				}
			});

			if (options.boundariesElement) {
				popperOptions.modifiers.preventOverflow = {
					boundariesElement: options.boundariesElement
				};
			}

			this.popperInstance = new Popper(reference, tooltipNode, popperOptions);

			// Fix position
			requestAnimationFrame(function () {
				if (!_this3._isDisposed && _this3.popperInstance) {
					_this3.popperInstance.update();

					// Show the tooltip
					requestAnimationFrame(function () {
						if (!_this3._isDisposed) {
							_this3._isOpen && tooltipNode.setAttribute('aria-hidden', 'false');
						} else {
							_this3.dispose();
						}
					});
				} else {
					_this3.dispose();
				}
			});

			return this;
		}
	}, {
		key: '_noLongerOpen',
		value: function _noLongerOpen() {
			var index = openTooltips.indexOf(this);
			if (index !== -1) {
				openTooltips.splice(index, 1);
			}
		}
	}, {
		key: '_hide',
		value: function _hide() /* reference, options */{
			var _this4 = this;

			// don't hide if it's already hidden
			if (!this._isOpen) {
				return this;
			}

			this._isOpen = false;
			this._noLongerOpen();

			// hide tooltipNode
			this._tooltipNode.style.display = 'none';
			this._tooltipNode.setAttribute('aria-hidden', 'true');

			this.popperInstance.disableEventListeners();

			clearTimeout(this._disposeTimer);
			var disposeTime = directive.options.disposeTimeout;
			if (disposeTime !== null) {
				this._disposeTimer = setTimeout(function () {
					if (_this4._tooltipNode) {
						_this4._tooltipNode.removeEventListener('mouseenter', _this4.hide);
						_this4._tooltipNode.removeEventListener('click', _this4.hide);
						// Don't remove popper instance, just the HTML element
						_this4._tooltipNode.parentNode.removeChild(_this4._tooltipNode);
						_this4._tooltipNode = null;
					}
				}, disposeTime);
			}

			removeClasses(this.reference, ['v-tooltip-open']);

			return this;
		}
	}, {
		key: '_dispose',
		value: function _dispose() {
			var _this5 = this;

			this._isDisposed = true;

			// remove event listeners first to prevent any unexpected behaviour
			this._events.forEach(function (_ref) {
				var func = _ref.func,
				    event = _ref.event;

				_this5.reference.removeEventListener(event, func);
			});
			this._events = [];

			if (this._tooltipNode) {
				this._hide();

				this._tooltipNode.removeEventListener('mouseenter', this.hide);
				this._tooltipNode.removeEventListener('click', this.hide);

				// destroy instance
				this.popperInstance.destroy();

				// destroy tooltipNode if removeOnDestroy is not set, as popperInstance.destroy() already removes the element
				if (!this.popperInstance.options.removeOnDestroy) {
					this._tooltipNode.parentNode.removeChild(this._tooltipNode);
					this._tooltipNode = null;
				}
			} else {
				this._noLongerOpen();
			}
			return this;
		}
	}, {
		key: '_findContainer',
		value: function _findContainer(container, reference) {
			// if container is a query, get the relative element
			if (typeof container === 'string') {
				container = window.document.querySelector(container);
			} else if (container === false) {
				// if container is `false`, set it to reference parent
				container = reference.parentNode;
			}
			return container;
		}

		/**
   * Append tooltip to container
   * @memberof Tooltip
   * @private
   * @param {HTMLElement} tooltip
   * @param {HTMLElement|String|false} container
   */

	}, {
		key: '_append',
		value: function _append(tooltipNode, container) {
			container.appendChild(tooltipNode);
		}
	}, {
		key: '_setEventListeners',
		value: function _setEventListeners(reference, events, options) {
			var _this6 = this;

			var directEvents = [];
			var oppositeEvents = [];

			events.forEach(function (event) {
				switch (event) {
					case 'hover':
						directEvents.push('mouseenter');
						oppositeEvents.push('mouseleave');
						if (_this6.options.hideOnTargetClick) oppositeEvents.push('click');
						break;
					case 'focus':
						directEvents.push('focus');
						oppositeEvents.push('blur');
						if (_this6.options.hideOnTargetClick) oppositeEvents.push('click');
						break;
					case 'click':
						directEvents.push('click');
						oppositeEvents.push('click');
						break;
				}
			});

			// schedule show tooltip
			directEvents.forEach(function (event) {
				var func = function func(evt) {
					if (_this6._isOpen === true) {
						return;
					}
					evt.usedByTooltip = true;
					_this6._scheduleShow(reference, options.delay, options, evt);
				};
				_this6._events.push({ event: event, func: func });
				reference.addEventListener(event, func);
			});

			// schedule hide tooltip
			oppositeEvents.forEach(function (event) {
				var func = function func(evt) {
					if (evt.usedByTooltip === true) {
						return;
					}
					_this6._scheduleHide(reference, options.delay, options, evt);
				};
				_this6._events.push({ event: event, func: func });
				reference.addEventListener(event, func);
			});
		}
	}, {
		key: '_onDocumentTouch',
		value: function _onDocumentTouch(event) {
			if (this._enableDocumentTouch) {
				this._scheduleHide(this.reference, this.options.delay, this.options, event);
			}
		}
	}, {
		key: '_scheduleShow',
		value: function _scheduleShow(reference, delay, options /*, evt */) {
			var _this7 = this;

			// defaults to 0
			var computedDelay = delay && delay.show || delay || 0;
			clearTimeout(this._scheduleTimer);
			this._scheduleTimer = window.setTimeout(function () {
				return _this7._show(reference, options);
			}, computedDelay);
		}
	}, {
		key: '_scheduleHide',
		value: function _scheduleHide(reference, delay, options, evt) {
			var _this8 = this;

			// defaults to 0
			var computedDelay = delay && delay.hide || delay || 0;
			clearTimeout(this._scheduleTimer);
			this._scheduleTimer = window.setTimeout(function () {
				if (_this8._isOpen === false) {
					return;
				}
				if (!document.body.contains(_this8._tooltipNode)) {
					return;
				}

				// if we are hiding because of a mouseleave, we must check that the new
				// reference isn't the tooltip, because in this case we don't want to hide it
				if (evt.type === 'mouseleave') {
					var isSet = _this8._setTooltipNodeEvent(evt, reference, delay, options);

					// if we set the new event, don't hide the tooltip yet
					// the new event will take care to hide it if necessary
					if (isSet) {
						return;
					}
				}

				_this8._hide(reference, options);
			}, computedDelay);
		}
	}]);
	return Tooltip;
}();

// Hide tooltips on touch devices


var _initialiseProps = function _initialiseProps() {
	var _this9 = this;

	this.show = function () {
		_this9._show(_this9.reference, _this9.options);
	};

	this.hide = function () {
		_this9._hide();
	};

	this.dispose = function () {
		_this9._dispose();
	};

	this.toggle = function () {
		if (_this9._isOpen) {
			return _this9.hide();
		} else {
			return _this9.show();
		}
	};

	this._events = [];

	this._setTooltipNodeEvent = function (evt, reference, delay, options) {
		var relatedreference = evt.relatedreference || evt.toElement || evt.relatedTarget;

		var callback = function callback(evt2) {
			var relatedreference2 = evt2.relatedreference || evt2.toElement || evt2.relatedTarget;

			// Remove event listener after call
			_this9._tooltipNode.removeEventListener(evt.type, callback);

			// If the new reference is not the reference element
			if (!reference.contains(relatedreference2)) {
				// Schedule to hide tooltip
				_this9._scheduleHide(reference, options.delay, options, evt2);
			}
		};

		if (_this9._tooltipNode.contains(relatedreference)) {
			// listen to mouseleave on the tooltip element to be able to hide the tooltip
			_this9._tooltipNode.addEventListener(evt.type, callback);
			return true;
		}

		return false;
	};
};

if (typeof document !== 'undefined') {
	document.addEventListener('touchstart', function (event) {
		for (var i = 0; i < openTooltips.length; i++) {
			openTooltips[i]._onDocumentTouch(event);
		}
	}, supportsPassive ? {
		passive: true,
		capture: true
	} : true);
}

/**
 * Placement function, its context is the Tooltip instance.
 * @memberof Tooltip
 * @callback PlacementFunction
 * @param {HTMLElement} tooltip - tooltip DOM node.
 * @param {HTMLElement} reference - reference DOM node.
 * @return {String} placement - One of the allowed placement options.
 */

/**
 * Title function, its context is the Tooltip instance.
 * @memberof Tooltip
 * @callback TitleFunction
 * @return {String} placement - The desired title.
 */

var state = {
	enabled: true
};

var positions = ['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end'];

var defaultOptions = {
	// Default tooltip placement relative to target element
	defaultPlacement: 'top',
	// Default CSS classes applied to the tooltip element
	defaultClass: 'vue-tooltip-theme',
	// Default CSS classes applied to the target element of the tooltip
	defaultTargetClass: 'has-tooltip',
	// Is the content HTML by default?
	defaultHtml: true,
	// Default HTML template of the tooltip element
	// It must include `tooltip-arrow` & `tooltip-inner` CSS classes (can be configured, see below)
	// Change if the classes conflict with other libraries (for example bootstrap)
	defaultTemplate: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
	// Selector used to get the arrow element in the tooltip template
	defaultArrowSelector: '.tooltip-arrow, .tooltip__arrow',
	// Selector used to get the inner content element in the tooltip template
	defaultInnerSelector: '.tooltip-inner, .tooltip__inner',
	// Delay (ms)
	defaultDelay: 0,
	// Default events that trigger the tooltip
	defaultTrigger: 'hover focus',
	// Default position offset (px)
	defaultOffset: 0,
	// Default container where the tooltip will be appended
	defaultContainer: 'body',
	defaultBoundariesElement: undefined,
	defaultPopperOptions: {},
	// Class added when content is loading
	defaultLoadingClass: 'tooltip-loading',
	// Displayed when tooltip content is loading
	defaultLoadingContent: '...',
	// Hide on mouseover tooltip
	autoHide: true,
	// Close tooltip on click on tooltip target?
	defaultHideOnTargetClick: true,
	// Auto destroy tooltip DOM nodes (ms)
	disposeTimeout: 5000,
	// Options for popover
	popover: {
		defaultPlacement: 'bottom',
		// Use the `popoverClass` prop for theming
		defaultClass: 'vue-popover-theme',
		// Base class (change if conflicts with other libraries)
		defaultBaseClass: 'tooltip popover',
		// Wrapper class (contains arrow and inner)
		defaultWrapperClass: 'wrapper',
		// Inner content class
		defaultInnerClass: 'tooltip-inner popover-inner',
		// Arrow class
		defaultArrowClass: 'tooltip-arrow popover-arrow',
		defaultDelay: 0,
		defaultTrigger: 'click',
		defaultOffset: 0,
		defaultContainer: 'body',
		defaultBoundariesElement: undefined,
		defaultPopperOptions: {},
		// Hides if clicked outside of popover
		defaultAutoHide: true,
		// Update popper on content resize
		defaultHandleResize: true
	}
};

function getOptions(options) {
	var result = {
		placement: typeof options.placement !== 'undefined' ? options.placement : directive.options.defaultPlacement,
		delay: typeof options.delay !== 'undefined' ? options.delay : directive.options.defaultDelay,
		html: typeof options.html !== 'undefined' ? options.html : directive.options.defaultHtml,
		template: typeof options.template !== 'undefined' ? options.template : directive.options.defaultTemplate,
		arrowSelector: typeof options.arrowSelector !== 'undefined' ? options.arrowSelector : directive.options.defaultArrowSelector,
		innerSelector: typeof options.innerSelector !== 'undefined' ? options.innerSelector : directive.options.defaultInnerSelector,
		trigger: typeof options.trigger !== 'undefined' ? options.trigger : directive.options.defaultTrigger,
		offset: typeof options.offset !== 'undefined' ? options.offset : directive.options.defaultOffset,
		container: typeof options.container !== 'undefined' ? options.container : directive.options.defaultContainer,
		boundariesElement: typeof options.boundariesElement !== 'undefined' ? options.boundariesElement : directive.options.defaultBoundariesElement,
		autoHide: typeof options.autoHide !== 'undefined' ? options.autoHide : directive.options.autoHide,
		hideOnTargetClick: typeof options.hideOnTargetClick !== 'undefined' ? options.hideOnTargetClick : directive.options.defaultHideOnTargetClick,
		loadingClass: typeof options.loadingClass !== 'undefined' ? options.loadingClass : directive.options.defaultLoadingClass,
		loadingContent: typeof options.loadingContent !== 'undefined' ? options.loadingContent : directive.options.defaultLoadingContent,
		popperOptions: _extends$1({}, typeof options.popperOptions !== 'undefined' ? options.popperOptions : directive.options.defaultPopperOptions)
	};

	if (result.offset) {
		var typeofOffset = _typeof(result.offset);
		var offset = result.offset;

		// One value -> switch
		if (typeofOffset === 'number' || typeofOffset === 'string' && offset.indexOf(',') === -1) {
			offset = '0, ' + offset;
		}

		if (!result.popperOptions.modifiers) {
			result.popperOptions.modifiers = {};
		}
		result.popperOptions.modifiers.offset = {
			offset: offset
		};
	}

	if (result.trigger && result.trigger.indexOf('click') !== -1) {
		result.hideOnTargetClick = false;
	}

	return result;
}

function getPlacement(value, modifiers) {
	var placement = value.placement;
	for (var i = 0; i < positions.length; i++) {
		var pos = positions[i];
		if (modifiers[pos]) {
			placement = pos;
		}
	}
	return placement;
}

function getContent(value) {
	var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	if (type === 'string') {
		return value;
	} else if (value && type === 'object') {
		return value.content;
	} else {
		return false;
	}
}

function createTooltip(el, value) {
	var modifiers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var content = getContent(value);
	var classes = typeof value.classes !== 'undefined' ? value.classes : directive.options.defaultClass;
	var opts = _extends$1({
		title: content
	}, getOptions(_extends$1({}, value, {
		placement: getPlacement(value, modifiers)
	})));
	var tooltip = el._tooltip = new Tooltip(el, opts);
	tooltip.setClasses(classes);
	tooltip._vueEl = el;

	// Class on target
	var targetClasses = typeof value.targetClasses !== 'undefined' ? value.targetClasses : directive.options.defaultTargetClass;
	el._tooltipTargetClasses = targetClasses;
	addClasses(el, targetClasses);

	return tooltip;
}

function destroyTooltip(el) {
	if (el._tooltip) {
		el._tooltip.dispose();
		delete el._tooltip;
		delete el._tooltipOldShow;
	}

	if (el._tooltipTargetClasses) {
		removeClasses(el, el._tooltipTargetClasses);
		delete el._tooltipTargetClasses;
	}
}

function bind(el, _ref) {
	var value = _ref.value,
	    oldValue = _ref.oldValue,
	    modifiers = _ref.modifiers;

	var content = getContent(value);
	if (!content || !state.enabled) {
		destroyTooltip(el);
	} else {
		var tooltip = void 0;
		if (el._tooltip) {
			tooltip = el._tooltip;
			// Content
			tooltip.setContent(content);
			// Options
			tooltip.setOptions(_extends$1({}, value, {
				placement: getPlacement(value, modifiers)
			}));
		} else {
			tooltip = createTooltip(el, value, modifiers);
		}

		// Manual show
		if (typeof value.show !== 'undefined' && value.show !== el._tooltipOldShow) {
			el._tooltipOldShow = value.show;
			value.show ? tooltip.show() : tooltip.hide();
		}
	}
}

var directive = {
	options: defaultOptions,
	bind: bind,
	update: bind,
	unbind: function unbind(el) {
		destroyTooltip(el);
	}
};

function addListeners(el) {
	el.addEventListener('click', onClick);
	el.addEventListener('touchstart', onTouchStart, supportsPassive ? {
		passive: true
	} : false);
}

function removeListeners(el) {
	el.removeEventListener('click', onClick);
	el.removeEventListener('touchstart', onTouchStart);
	el.removeEventListener('touchend', onTouchEnd);
	el.removeEventListener('touchcancel', onTouchCancel);
}

function onClick(event) {
	var el = event.currentTarget;
	event.closePopover = !el.$_vclosepopover_touch;
	event.closeAllPopover = el.$_closePopoverModifiers && !!el.$_closePopoverModifiers.all;
}

function onTouchStart(event) {
	if (event.changedTouches.length === 1) {
		var el = event.currentTarget;
		el.$_vclosepopover_touch = true;
		var touch = event.changedTouches[0];
		el.$_vclosepopover_touchPoint = touch;
		el.addEventListener('touchend', onTouchEnd);
		el.addEventListener('touchcancel', onTouchCancel);
	}
}

function onTouchEnd(event) {
	var el = event.currentTarget;
	el.$_vclosepopover_touch = false;
	if (event.changedTouches.length === 1) {
		var touch = event.changedTouches[0];
		var firstTouch = el.$_vclosepopover_touchPoint;
		event.closePopover = Math.abs(touch.screenY - firstTouch.screenY) < 20 && Math.abs(touch.screenX - firstTouch.screenX) < 20;
		event.closeAllPopover = el.$_closePopoverModifiers && !!el.$_closePopoverModifiers.all;
	}
}

function onTouchCancel(event) {
	var el = event.currentTarget;
	el.$_vclosepopover_touch = false;
}

var vclosepopover = {
	bind: function bind(el, _ref) {
		var value = _ref.value,
		    modifiers = _ref.modifiers;

		el.$_closePopoverModifiers = modifiers;
		if (typeof value === 'undefined' || value) {
			addListeners(el);
		}
	},
	update: function update(el, _ref2) {
		var value = _ref2.value,
		    oldValue = _ref2.oldValue,
		    modifiers = _ref2.modifiers;

		el.$_closePopoverModifiers = modifiers;
		if (value !== oldValue) {
			if (typeof value === 'undefined' || value) {
				addListeners(el);
			} else {
				removeListeners(el);
			}
		}
	},
	unbind: function unbind(el) {
		removeListeners(el);
	}
};

function getInternetExplorerVersion() {
	var ua = window.navigator.userAgent;

	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
		// IE 10 or older => return version number
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	}

	var trident = ua.indexOf('Trident/');
	if (trident > 0) {
		// IE 11 => return version number
		var rv = ua.indexOf('rv:');
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	}

	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
		// Edge (IE 12+) => return version number
		return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	}

	// other browser
	return -1;
}

var isIE$1 = void 0;

function initCompat() {
	if (!initCompat.init) {
		initCompat.init = true;
		isIE$1 = getInternetExplorerVersion() !== -1;
	}
}

var ResizeObserver = { render: function render() {
		var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "resize-observer", attrs: { "tabindex": "-1" } });
	}, staticRenderFns: [], _scopeId: 'data-v-b329ee4c',
	name: 'resize-observer',

	methods: {
		notify: function notify() {
			this.$emit('notify');
		},
		addResizeHandlers: function addResizeHandlers() {
			this._resizeObject.contentDocument.defaultView.addEventListener('resize', this.notify);
			if (this._w !== this.$el.offsetWidth || this._h !== this.$el.offsetHeight) {
				this.notify();
			}
		},
		removeResizeHandlers: function removeResizeHandlers() {
			if (this._resizeObject && this._resizeObject.onload) {
				if (!isIE$1 && this._resizeObject.contentDocument) {
					this._resizeObject.contentDocument.defaultView.removeEventListener('resize', this.notify);
				}
				delete this._resizeObject.onload;
			}
		}
	},

	mounted: function mounted() {
		var _this = this;

		initCompat();
		this.$nextTick(function () {
			_this._w = _this.$el.offsetWidth;
			_this._h = _this.$el.offsetHeight;
		});
		var object = document.createElement('object');
		this._resizeObject = object;
		object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
		object.setAttribute('aria-hidden', 'true');
		object.setAttribute('tabindex', -1);
		object.onload = this.addResizeHandlers;
		object.type = 'text/html';
		if (isIE$1) {
			this.$el.appendChild(object);
		}
		object.data = 'about:blank';
		if (!isIE$1) {
			this.$el.appendChild(object);
		}
	},
	beforeDestroy: function beforeDestroy() {
		this.removeResizeHandlers();
	}
};

// Install the components
function install$1(Vue) {
	Vue.component('resize-observer', ResizeObserver);
	/* -- Add more components here -- */
}

/* -- Plugin definition & Auto-install -- */
/* You shouldn't have to modify the code below */

// Plugin
var plugin$2 = {
	// eslint-disable-next-line no-undef
	version: "0.4.4",
	install: install$1
};

// Auto-install
var GlobalVue$1 = null;
if (typeof window !== 'undefined') {
	GlobalVue$1 = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue$1 = global.Vue;
}
if (GlobalVue$1) {
	GlobalVue$1.use(plugin$2);
}

function getDefault(key) {
	var value = directive.options.popover[key];
	if (typeof value === 'undefined') {
		return directive.options[key];
	}
	return value;
}

var isIOS = false;
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
	isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

var openPopovers = [];

var Element = function Element() {};
if (typeof window !== 'undefined') {
	Element = window.Element;
}

var Popover = { render: function render() {
		var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "v-popover", class: _vm.cssClass }, [_c('span', { ref: "trigger", staticClass: "trigger", staticStyle: { "display": "inline-block" }, attrs: { "aria-describedby": _vm.popoverId, "tabindex": _vm.trigger.indexOf('focus') !== -1 ? 0 : -1 } }, [_vm._t("default")], 2), _vm._v(" "), _c('div', { ref: "popover", class: [_vm.popoverBaseClass, _vm.popoverClass, _vm.cssClass], style: {
				visibility: _vm.isOpen ? 'visible' : 'hidden'
			}, attrs: { "id": _vm.popoverId, "aria-hidden": _vm.isOpen ? 'false' : 'true' } }, [_c('div', { class: _vm.popoverWrapperClass }, [_c('div', { ref: "inner", class: _vm.popoverInnerClass, staticStyle: { "position": "relative" } }, [_c('div', [_vm._t("popover")], 2), _vm._v(" "), _vm.handleResize ? _c('ResizeObserver', { on: { "notify": _vm.$_handleResize } }) : _vm._e()], 1), _vm._v(" "), _c('div', { ref: "arrow", class: _vm.popoverArrowClass })])])]);
	}, staticRenderFns: [],
	name: 'VPopover',

	components: {
		ResizeObserver: ResizeObserver
	},

	props: {
		open: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		placement: {
			type: String,
			default: function _default() {
				return getDefault('defaultPlacement');
			}
		},
		delay: {
			type: [String, Number, Object],
			default: function _default() {
				return getDefault('defaultDelay');
			}
		},
		offset: {
			type: [String, Number],
			default: function _default() {
				return getDefault('defaultOffset');
			}
		},
		trigger: {
			type: String,
			default: function _default() {
				return getDefault('defaultTrigger');
			}
		},
		container: {
			type: [String, Object, Element, Boolean],
			default: function _default() {
				return getDefault('defaultContainer');
			}
		},
		boundariesElement: {
			type: [String, Element],
			default: function _default() {
				return getDefault('defaultBoundariesElement');
			}
		},
		popperOptions: {
			type: Object,
			default: function _default() {
				return getDefault('defaultPopperOptions');
			}
		},
		popoverClass: {
			type: [String, Array],
			default: function _default() {
				return getDefault('defaultClass');
			}
		},
		popoverBaseClass: {
			type: [String, Array],
			default: function _default() {
				return directive.options.popover.defaultBaseClass;
			}
		},
		popoverInnerClass: {
			type: [String, Array],
			default: function _default() {
				return directive.options.popover.defaultInnerClass;
			}
		},
		popoverWrapperClass: {
			type: [String, Array],
			default: function _default() {
				return directive.options.popover.defaultWrapperClass;
			}
		},
		popoverArrowClass: {
			type: [String, Array],
			default: function _default() {
				return directive.options.popover.defaultArrowClass;
			}
		},
		autoHide: {
			type: Boolean,
			default: function _default() {
				return directive.options.popover.defaultAutoHide;
			}
		},
		handleResize: {
			type: Boolean,
			default: function _default() {
				return directive.options.popover.defaultHandleResize;
			}
		},
		openGroup: {
			type: String,
			default: null
		}
	},

	data: function data() {
		return {
			isOpen: false,
			id: Math.random().toString(36).substr(2, 10)
		};
	},


	computed: {
		cssClass: function cssClass() {
			return {
				'open': this.isOpen
			};
		},
		popoverId: function popoverId() {
			return 'popover_' + this.id;
		}
	},

	watch: {
		open: function open(val) {
			if (val) {
				this.show();
			} else {
				this.hide();
			}
		},
		disabled: function disabled(val, oldVal) {
			if (val !== oldVal) {
				if (val) {
					this.hide();
				} else if (this.open) {
					this.show();
				}
			}
		},
		container: function container(val) {
			if (this.isOpen && this.popperInstance) {
				var popoverNode = this.$refs.popover;
				var reference = this.$refs.trigger;

				var container = this.$_findContainer(this.container, reference);
				if (!container) {
					console.warn('No container for popover', this);
					return;
				}

				container.appendChild(popoverNode);
				this.popperInstance.scheduleUpdate();
			}
		},
		trigger: function trigger(val) {
			this.$_removeEventListeners();
			this.$_addEventListeners();
		},
		placement: function placement(val) {
			var _this = this;

			this.$_updatePopper(function () {
				_this.popperInstance.options.placement = val;
			});
		},


		offset: '$_restartPopper',

		boundariesElement: '$_restartPopper',

		popperOptions: {
			handler: '$_restartPopper',
			deep: true
		}
	},

	created: function created() {
		this.$_isDisposed = false;
		this.$_mounted = false;
		this.$_events = [];
		this.$_preventOpen = false;
	},
	mounted: function mounted() {
		var popoverNode = this.$refs.popover;
		popoverNode.parentNode && popoverNode.parentNode.removeChild(popoverNode);

		this.$_init();

		if (this.open) {
			this.show();
		}
	},
	beforeDestroy: function beforeDestroy() {
		this.dispose();
	},


	methods: {
		show: function show() {
			var _this2 = this;

			var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    event = _ref.event,
			    _ref$skipDelay = _ref.skipDelay,
			    skipDelay = _ref$skipDelay === undefined ? false : _ref$skipDelay,
			    _ref$force = _ref.force,
			    force = _ref$force === undefined ? false : _ref$force;

			if (force || !this.disabled) {
				this.$_scheduleShow(event);
				this.$emit('show');
			}
			this.$emit('update:open', true);
			this.$_beingShowed = true;
			requestAnimationFrame(function () {
				_this2.$_beingShowed = false;
			});
		},
		hide: function hide() {
			var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    event = _ref2.event,
			    _ref2$skipDelay = _ref2.skipDelay;

			this.$_scheduleHide(event);

			this.$emit('hide');
			this.$emit('update:open', false);
		},
		dispose: function dispose() {
			this.$_isDisposed = true;
			this.$_removeEventListeners();
			this.hide({ skipDelay: true });
			if (this.popperInstance) {
				this.popperInstance.destroy();

				// destroy tooltipNode if removeOnDestroy is not set, as popperInstance.destroy() already removes the element
				if (!this.popperInstance.options.removeOnDestroy) {
					var popoverNode = this.$refs.popover;
					popoverNode.parentNode && popoverNode.parentNode.removeChild(popoverNode);
				}
			}
			this.$_mounted = false;
			this.popperInstance = null;
			this.isOpen = false;

			this.$emit('dispose');
		},
		$_init: function $_init() {
			if (this.trigger.indexOf('manual') === -1) {
				this.$_addEventListeners();
			}
		},
		$_show: function $_show() {
			var _this3 = this;

			var reference = this.$refs.trigger;
			var popoverNode = this.$refs.popover;

			clearTimeout(this.$_disposeTimer);

			// Already open
			if (this.isOpen) {
				return;
			}

			// Popper is already initialized
			if (this.popperInstance) {
				this.isOpen = true;
				this.popperInstance.enableEventListeners();
				this.popperInstance.scheduleUpdate();
			}

			if (!this.$_mounted) {
				var container = this.$_findContainer(this.container, reference);
				if (!container) {
					console.warn('No container for popover', this);
					return;
				}
				container.appendChild(popoverNode);
				this.$_mounted = true;
			}

			if (!this.popperInstance) {
				var popperOptions = _extends$1({}, this.popperOptions, {
					placement: this.placement
				});

				popperOptions.modifiers = _extends$1({}, popperOptions.modifiers, {
					arrow: _extends$1({}, popperOptions.modifiers && popperOptions.modifiers.arrow, {
						element: this.$refs.arrow
					})
				});

				if (this.offset) {
					var offset = this.$_getOffset();

					popperOptions.modifiers.offset = _extends$1({}, popperOptions.modifiers && popperOptions.modifiers.offset, {
						offset: offset
					});
				}

				if (this.boundariesElement) {
					popperOptions.modifiers.preventOverflow = _extends$1({}, popperOptions.modifiers && popperOptions.modifiers.preventOverflow, {
						boundariesElement: this.boundariesElement
					});
				}

				this.popperInstance = new Popper(reference, popoverNode, popperOptions);

				// Fix position
				requestAnimationFrame(function () {
					if (!_this3.$_isDisposed && _this3.popperInstance) {
						_this3.popperInstance.scheduleUpdate();

						// Show the tooltip
						requestAnimationFrame(function () {
							if (!_this3.$_isDisposed) {
								_this3.isOpen = true;
							} else {
								_this3.dispose();
							}
						});
					} else {
						_this3.dispose();
					}
				});
			}

			var openGroup = this.openGroup;
			if (openGroup) {
				var popover = void 0;
				for (var i = 0; i < openPopovers.length; i++) {
					popover = openPopovers[i];
					if (popover.openGroup !== openGroup) {
						popover.hide();
						popover.$emit('close-group');
					}
				}
			}

			openPopovers.push(this);

			this.$emit('apply-show');
		},
		$_hide: function $_hide() {
			var _this4 = this;

			// Already hidden
			if (!this.isOpen) {
				return;
			}

			var index = openPopovers.indexOf(this);
			if (index !== -1) {
				openPopovers.splice(index, 1);
			}

			this.isOpen = false;
			if (this.popperInstance) {
				this.popperInstance.disableEventListeners();
			}

			clearTimeout(this.$_disposeTimer);
			var disposeTime = directive.options.popover.disposeTimeout || directive.options.disposeTimeout;
			if (disposeTime !== null) {
				this.$_disposeTimer = setTimeout(function () {
					var popoverNode = _this4.$refs.popover;
					if (popoverNode) {
						// Don't remove popper instance, just the HTML element
						popoverNode.parentNode && popoverNode.parentNode.removeChild(popoverNode);
						_this4.$_mounted = false;
					}
				}, disposeTime);
			}

			this.$emit('apply-hide');
		},
		$_findContainer: function $_findContainer(container, reference) {
			// if container is a query, get the relative element
			if (typeof container === 'string') {
				container = window.document.querySelector(container);
			} else if (container === false) {
				// if container is `false`, set it to reference parent
				container = reference.parentNode;
			}
			return container;
		},
		$_getOffset: function $_getOffset() {
			var typeofOffset = _typeof(this.offset);
			var offset = this.offset;

			// One value -> switch
			if (typeofOffset === 'number' || typeofOffset === 'string' && offset.indexOf(',') === -1) {
				offset = '0, ' + offset;
			}

			return offset;
		},
		$_addEventListeners: function $_addEventListeners() {
			var _this5 = this;

			var reference = this.$refs.trigger;
			var directEvents = [];
			var oppositeEvents = [];

			var events = typeof this.trigger === 'string' ? this.trigger.split(' ').filter(function (trigger) {
				return ['click', 'hover', 'focus'].indexOf(trigger) !== -1;
			}) : [];

			events.forEach(function (event) {
				switch (event) {
					case 'hover':
						directEvents.push('mouseenter');
						oppositeEvents.push('mouseleave');
						break;
					case 'focus':
						directEvents.push('focus');
						oppositeEvents.push('blur');
						break;
					case 'click':
						directEvents.push('click');
						oppositeEvents.push('click');
						break;
				}
			});

			// schedule show tooltip
			directEvents.forEach(function (event) {
				var func = function func(event) {
					if (_this5.isOpen) {
						return;
					}
					event.usedByTooltip = true;
					!_this5.$_preventOpen && _this5.show({ event: event });
				};
				_this5.$_events.push({ event: event, func: func });
				reference.addEventListener(event, func);
			});

			// schedule hide tooltip
			oppositeEvents.forEach(function (event) {
				var func = function func(event) {
					if (event.usedByTooltip) {
						return;
					}
					_this5.hide({ event: event });
				};
				_this5.$_events.push({ event: event, func: func });
				reference.addEventListener(event, func);
			});
		},
		$_scheduleShow: function $_scheduleShow() {
			var skipDelay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			clearTimeout(this.$_scheduleTimer);
			if (skipDelay) {
				this.$_show();
			} else {
				// defaults to 0
				var computedDelay = parseInt(this.delay && this.delay.show || this.delay || 0);
				this.$_scheduleTimer = setTimeout(this.$_show.bind(this), computedDelay);
			}
		},
		$_scheduleHide: function $_scheduleHide() {
			var _this6 = this;

			var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			var skipDelay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			clearTimeout(this.$_scheduleTimer);
			if (skipDelay) {
				this.$_hide();
			} else {
				// defaults to 0
				var computedDelay = parseInt(this.delay && this.delay.hide || this.delay || 0);
				this.$_scheduleTimer = setTimeout(function () {
					if (!_this6.isOpen) {
						return;
					}

					// if we are hiding because of a mouseleave, we must check that the new
					// reference isn't the tooltip, because in this case we don't want to hide it
					if (event && event.type === 'mouseleave') {
						var isSet = _this6.$_setTooltipNodeEvent(event);

						// if we set the new event, don't hide the tooltip yet
						// the new event will take care to hide it if necessary
						if (isSet) {
							return;
						}
					}

					_this6.$_hide();
				}, computedDelay);
			}
		},
		$_setTooltipNodeEvent: function $_setTooltipNodeEvent(event) {
			var _this7 = this;

			var reference = this.$refs.trigger;
			var popoverNode = this.$refs.popover;

			var relatedreference = event.relatedreference || event.toElement || event.relatedTarget;

			var callback = function callback(event2) {
				var relatedreference2 = event2.relatedreference || event2.toElement || event2.relatedTarget;

				// Remove event listener after call
				popoverNode.removeEventListener(event.type, callback);

				// If the new reference is not the reference element
				if (!reference.contains(relatedreference2)) {
					// Schedule to hide tooltip
					_this7.hide({ event: event2 });
				}
			};

			if (popoverNode.contains(relatedreference)) {
				// listen to mouseleave on the tooltip element to be able to hide the tooltip
				popoverNode.addEventListener(event.type, callback);
				return true;
			}

			return false;
		},
		$_removeEventListeners: function $_removeEventListeners() {
			var reference = this.$refs.trigger;
			this.$_events.forEach(function (_ref3) {
				var func = _ref3.func,
				    event = _ref3.event;

				reference.removeEventListener(event, func);
			});
			this.$_events = [];
		},
		$_updatePopper: function $_updatePopper(cb) {
			if (this.popperInstance) {
				cb();
				if (this.isOpen) this.popperInstance.scheduleUpdate();
			}
		},
		$_restartPopper: function $_restartPopper() {
			if (this.popperInstance) {
				var isOpen = this.isOpen;
				this.dispose();
				this.$_isDisposed = false;
				this.$_init();
				if (isOpen) {
					this.show({ skipDelay: true, force: true });
				}
			}
		},
		$_handleGlobalClose: function $_handleGlobalClose(event) {
			var _this8 = this;

			var touch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			if (this.$_beingShowed) return;

			this.hide({ event: event });

			if (event.closePopover) {
				this.$emit('close-directive');
			} else {
				this.$emit('auto-hide');
			}

			if (touch) {
				this.$_preventOpen = true;
				setTimeout(function () {
					_this8.$_preventOpen = false;
				}, 300);
			}
		},
		$_handleResize: function $_handleResize() {
			if (this.isOpen && this.popperInstance) {
				this.popperInstance.scheduleUpdate();
				this.$emit('resize');
			}
		}
	}
};

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
	if (isIOS) {
		document.addEventListener('touchend', handleGlobalTouchend, supportsPassive ? {
			passive: true,
			capture: true
		} : true);
	} else {
		window.addEventListener('click', handleGlobalClick, true);
	}
}

function handleGlobalClick(event) {
	handleGlobalClose(event);
}

function handleGlobalTouchend(event) {
	handleGlobalClose(event, true);
}

function handleGlobalClose(event) {
	var touch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	// Delay so that close directive has time to set values
	requestAnimationFrame(function () {
		var popover = void 0;
		for (var i = 0; i < openPopovers.length; i++) {
			popover = openPopovers[i];
			if (popover.$refs.popover) {
				var contains = popover.$refs.popover.contains(event.target);
				if (event.closeAllPopover || event.closePopover && contains || popover.autoHide && !contains) {
					popover.$_handleGlobalClose(event, touch);
				}
			}
		}
	});
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var lodash_merge = createCommonjsModule(function (module, exports) {
/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Gets the value at `key`, unless `key` is "__proto__".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  return key == '__proto__'
    ? undefined
    : object[key];
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeMax = Math.max,
    nativeNow = Date.now;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    if (isObject(srcValue)) {
      stack || (stack = new Stack);
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = merge;
});

function install(Vue) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (install.installed) return;
	install.installed = true;

	var finalOptions = {};
	lodash_merge(finalOptions, defaultOptions, options);

	plugin.options = finalOptions;
	directive.options = finalOptions;

	Vue.directive('tooltip', directive);
	Vue.directive('close-popover', vclosepopover);
	Vue.component('v-popover', Popover);
}

var VTooltip = directive;
var VClosePopover = vclosepopover;
var VPopover = Popover;

var plugin = {
	install: install,

	get enabled() {
		return state.enabled;
	},

	set enabled(value) {
		state.enabled = value;
	}
};

// Auto-install
var GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}


/* harmony default export */ __webpack_exports__["a"] = (plugin);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("c8ba")))

/***/ }),

/***/ "ebd6":
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__("cb7c");
var aFunction = __webpack_require__("d8e8");
var SPECIES = __webpack_require__("2b4c")('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),

/***/ "f0e1":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_1_lang_scss_module_true_shadow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("41ac");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_1_lang_scss_module_true_shadow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_1_lang_scss_module_true_shadow__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_1_lang_scss_module_true_shadow__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_1_lang_scss_module_true_shadow__WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_node_modules_vue_style_loader_index_js_ref_8_oneOf_0_0_node_modules_css_loader_index_js_ref_8_oneOf_0_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_2_node_modules_postcss_loader_src_index_js_ref_8_oneOf_0_3_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_0_4_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_style_index_1_lang_scss_module_true_shadow__WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "f124":
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__("b041");
exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "\n.loading-image[data-v-5f3ee003]{display:inline-block;vertical-align:bottom;width:30px;height:28px;background:transparent url(" + escape(__webpack_require__("6e70")) + ") 50% no-repeat;background-size:contain;margin:0 auto\n}\n.loading-image.loading-image--centered[data-v-5f3ee003]{display:block;margin:1em auto\n}", ""]);

// exports


/***/ }),

/***/ "f3cf":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("a3b5");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("05f33704", content, shadowRoot)
};

/***/ }),

/***/ "f605":
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),

/***/ "f7a0":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("3b0b");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to Shadow Root
var add = __webpack_require__("35d6").default
module.exports.__inject__ = function (shadowRoot) {
  add("2f7e761f", content, shadowRoot)
};

/***/ }),

/***/ "fa77":
/***/ (function(module, exports) {

module.exports = "\"data:image/svg+xml,%3C?xml version='1.0' encoding='utf-8'?%3E %3C!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E %3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E %3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='1077px' height='175.5px' viewBox='0 0 1077 175.5' enable-background='new 0 0 1077 175.5' xml:space='preserve'%3E %3Cg id='Page-1'%3E %3Cg id='walletconnect'%3E %3Cpath id='walletconnect-logo' fill='%233B99FC' d='M54.63,32.38c43.28-43.17,113.46-43.17,156.74,0l7.16,7.14 c1.08,1.08,1.09,2.83,0.01,3.92c0,0,0,0-0.01,0l-19.78,19.72c-1.08,1.08-2.83,1.08-3.91,0l-7.17-7.15 c-30.19-30.12-79.15-30.12-109.35,0l-7.68,7.66c-1.08,1.08-2.83,1.08-3.91,0L46.96,43.95c-1.08-1.08-1.08-2.83,0-3.92 c0,0,0,0,0-0.01L54.63,32.38z M246.26,67.17l17.81,17.76c2.17,2.16,2.17,5.67,0.01,7.83l-0.01,0.01l-71.5,71.32 c-2.16,2.16-5.66,2.16-7.82,0l-50.76-50.63c-0.54-0.54-1.42-0.54-1.96,0L81.26,164.1c-2.16,2.16-5.66,2.16-7.82,0L1.93,92.78 c-2.17-2.16-2.17-5.67-0.01-7.83l0.01-0.01l17.81-17.76c1.08-1.08,2.83-1.08,3.91,0l52.72,52.58c0.54,0.54,1.42,0.54,1.96,0 l50.76-50.63c2.16-2.16,5.66-2.16,7.82,0l50.76,50.63c0.54,0.54,1.42,0.54,1.96,0l52.72-52.58 C243.43,66.1,245.18,66.1,246.26,67.17z'/%3E %3Cg id='WalletConnect'%3E %3Cg%3E %3Cpath id='path-1' d='M374.19,71.67L358.05,127h-11.08L326.65,51.61h12.17l13.84,57.73h0.729l15.73-57.73h10.87l15.83,57.73 h0.729l13.79-57.73h12.17L402.15,127H391.13l-16.2-55.33H374.19L374.19,71.67z M448.03,118.48c8.46,0,14.729-5.38,14.729-12.44 v-4.75l-13.899,0.89c-7.841,0.52-11.391,3.19-11.391,8.2C437.47,115.51,441.91,118.48,448.03,118.48z M445.15,127.94 c-10.971,0-18.96-6.64-18.96-17.03c0-10.24,7.63-16.15,21.159-16.98l15.41-0.89v-4.91c0-6.01-3.97-9.4-11.649-9.4 c-6.271,0-10.61,2.3-11.86,6.32h-10.87c1.15-9.77,10.34-16.04,23.25-16.04c14.26,0,22.311,7.1,22.311,19.12V127h-10.82v-7.99 h-0.89C458.84,124.7,452.62,127.94,445.15,127.94z M490.25,127V47.9h11.23V127H490.25z M518.63,127V47.9h11.23V127H518.63z M569.84,78.57c-8.31,0-14.109,5.85-14.729,14.73h28.729C583.58,84.37,578.15,78.57,569.84,78.57z M583.79,111.64h10.82 c-2.46,10.14-11.65,16.46-24.66,16.46c-16.3,0-26.28-11.18-26.28-29.36c0-18.18,10.19-29.73,26.23-29.73 c15.83,0,25.39,10.81,25.39,28.68v3.92h-40.18v0.63c0.359,9.98,6.17,16.3,15.149,16.3C577.05,118.54,581.7,116.08,583.79,111.64 z M612.53,55.94h11.229v14.42h12.33v9.46h-12.33v29.26c0,5.96,2.46,8.57,8.05,8.57c1.721,0,2.721-0.1,4.28-0.26v9.35 c-1.83,0.31-3.92,0.58-6.109,0.58c-12.49,0-17.45-4.39-17.45-15.36V79.82h-9.04v-9.46h9.04V55.94L612.53,55.94z M681.35,128.83 c-20.949,0-34.01-15.1-34.01-39.5c0-24.45,13.01-39.55,33.96-39.55c16.61,0,29.47,10.76,31.351,26.12H701 c-2.19-9.25-9.77-15.2-19.7-15.2c-13.53,0-22,11.02-22,28.63c0,17.55,8.46,28.58,22.05,28.58c9.98,0,17.561-5.38,19.65-13.9 h11.65C710.56,118.9,698.17,128.83,681.35,128.83z M750.53,128.1c-16.67,0-26.851-11.13-26.851-29.57 c0-18.34,10.24-29.52,26.851-29.52c16.56,0,26.8,11.18,26.8,29.521C777.33,116.97,767.15,128.1,750.53,128.1z M750.53,118.12 c9.72,0,15.26-7.21,15.26-19.59c0-12.33-5.54-19.54-15.26-19.54c-9.771,0-15.261,7.21-15.261,19.54 C735.28,110.96,740.76,118.12,750.53,118.12z M790.62,127V70.1h10.81v9.04h0.84C805.04,72.82,810.68,69,819.25,69 c12.7,0,19.7,7.63,19.7,21.16V127h-11.23V92.99c0-9.14-3.97-13.69-12.279-13.69c-8.311,0-13.58,5.54-13.58,14.42V127H790.62z M854.52,127V70.1h10.811v9.04h0.84C868.94,72.82,874.58,69,883.15,69c12.689,0,19.699,7.63,19.699,21.16V127H891.62V92.99 c0-9.14-3.97-13.69-12.28-13.69c-8.31,0-13.58,5.54-13.58,14.42V127H854.52z M941.78,78.57c-8.311,0-14.11,5.85-14.73,14.73 h28.74C955.52,84.37,950.09,78.57,941.78,78.57z M955.73,111.64h10.81c-2.46,10.14-11.65,16.46-24.66,16.46 c-16.3,0-26.28-11.18-26.28-29.36c0-18.18,10.19-29.73,26.23-29.73c15.83,0,25.39,10.81,25.39,28.68v3.92h-40.18v0.63 c0.37,9.98,6.17,16.3,15.15,16.3C948.99,118.54,953.64,116.08,955.73,111.64z M1028.67,88.7h-10.92 c-1.31-5.54-5.9-9.67-13.43-9.67c-9.4,0-15.15,7.21-15.15,19.33c0,12.33,5.8,19.7,15.15,19.7c7.1,0,11.96-3.24,13.43-9.35h10.92 c-1.46,11.44-10.24,19.38-24.29,19.38c-16.56,0-26.7-11.18-26.7-29.73c0-18.23,10.08-29.36,26.65-29.36 C1018.59,69.01,1027.21,77.31,1028.67,88.7z M1045.25,55.94h11.23v14.42h12.329v9.46h-12.329v29.26c0,5.96,2.449,8.57,8.05,8.57 c1.72,0,2.72-0.1,4.28-0.26v9.35c-1.83,0.31-3.921,0.58-6.11,0.58c-12.49,0-17.45-4.39-17.45-15.36V79.82h-9.04v-9.46h9.04 V55.94L1045.25,55.94z'/%3E %3C/g%3E %3Cg%3E %3Cpath id='path-1_1_' fill='%233B99FC' d='M374.19,71.67L358.05,127h-11.08L326.65,51.61h12.17l13.84,57.73h0.729l15.73-57.73 h10.87l15.83,57.73h0.729l13.79-57.73h12.17L402.15,127H391.13l-16.2-55.33H374.19L374.19,71.67z M448.03,118.48 c8.46,0,14.729-5.38,14.729-12.44v-4.75l-13.899,0.89c-7.841,0.52-11.391,3.19-11.391,8.2 C437.47,115.51,441.91,118.48,448.03,118.48z M445.15,127.94c-10.971,0-18.96-6.64-18.96-17.03c0-10.24,7.63-16.15,21.159-16.98 l15.41-0.89v-4.91c0-6.01-3.97-9.4-11.649-9.4c-6.271,0-10.61,2.3-11.86,6.32h-10.87c1.15-9.77,10.34-16.04,23.25-16.04 c14.26,0,22.311,7.1,22.311,19.12V127h-10.82v-7.99h-0.89C458.84,124.7,452.62,127.94,445.15,127.94z M490.25,127V47.9h11.23 V127H490.25z M518.63,127V47.9h11.23V127H518.63z M569.84,78.57c-8.31,0-14.109,5.85-14.729,14.73h28.729 C583.58,84.37,578.15,78.57,569.84,78.57z M583.79,111.64h10.82c-2.46,10.14-11.65,16.46-24.66,16.46 c-16.3,0-26.28-11.18-26.28-29.36c0-18.18,10.19-29.73,26.23-29.73c15.83,0,25.39,10.81,25.39,28.68v3.92h-40.18v0.63 c0.359,9.98,6.17,16.3,15.149,16.3C577.05,118.54,581.7,116.08,583.79,111.64z M612.53,55.94h11.229v14.42h12.33v9.46h-12.33 v29.26c0,5.96,2.46,8.57,8.05,8.57c1.721,0,2.721-0.1,4.28-0.26v9.35c-1.83,0.31-3.92,0.58-6.109,0.58 c-12.49,0-17.45-4.39-17.45-15.36V79.82h-9.04v-9.46h9.04V55.94L612.53,55.94z M681.35,128.83c-20.949,0-34.01-15.1-34.01-39.5 c0-24.45,13.01-39.55,33.96-39.55c16.61,0,29.47,10.76,31.351,26.12H701c-2.19-9.25-9.77-15.2-19.7-15.2 c-13.53,0-22,11.02-22,28.63c0,17.55,8.46,28.58,22.05,28.58c9.98,0,17.561-5.38,19.65-13.9h11.65 C710.56,118.9,698.17,128.83,681.35,128.83z M750.53,128.1c-16.67,0-26.851-11.13-26.851-29.57 c0-18.34,10.24-29.52,26.851-29.52c16.56,0,26.8,11.18,26.8,29.521C777.33,116.97,767.15,128.1,750.53,128.1z M750.53,118.12 c9.72,0,15.26-7.21,15.26-19.59c0-12.33-5.54-19.54-15.26-19.54c-9.771,0-15.261,7.21-15.261,19.54 C735.28,110.96,740.76,118.12,750.53,118.12z M790.62,127V70.1h10.81v9.04h0.84C805.04,72.82,810.68,69,819.25,69 c12.7,0,19.7,7.63,19.7,21.16V127h-11.23V92.99c0-9.14-3.97-13.69-12.279-13.69c-8.311,0-13.58,5.54-13.58,14.42V127H790.62z M854.52,127V70.1h10.811v9.04h0.84C868.94,72.82,874.58,69,883.15,69c12.689,0,19.699,7.63,19.699,21.16V127H891.62V92.99 c0-9.14-3.97-13.69-12.28-13.69c-8.31,0-13.58,5.54-13.58,14.42V127H854.52z M941.78,78.57c-8.311,0-14.11,5.85-14.73,14.73 h28.74C955.52,84.37,950.09,78.57,941.78,78.57z M955.73,111.64h10.81c-2.46,10.14-11.65,16.46-24.66,16.46 c-16.3,0-26.28-11.18-26.28-29.36c0-18.18,10.19-29.73,26.23-29.73c15.83,0,25.39,10.81,25.39,28.68v3.92h-40.18v0.63 c0.37,9.98,6.17,16.3,15.15,16.3C948.99,118.54,953.64,116.08,955.73,111.64z M1028.67,88.7h-10.92 c-1.31-5.54-5.9-9.67-13.43-9.67c-9.4,0-15.15,7.21-15.15,19.33c0,12.33,5.8,19.7,15.15,19.7c7.1,0,11.96-3.24,13.43-9.35h10.92 c-1.46,11.44-10.24,19.38-24.29,19.38c-16.56,0-26.7-11.18-26.7-29.73c0-18.23,10.08-29.36,26.65-29.36 C1018.59,69.01,1027.21,77.31,1028.67,88.7z M1045.25,55.94h11.23v14.42h12.329v9.46h-12.329v29.26c0,5.96,2.449,8.57,8.05,8.57 c1.72,0,2.72-0.1,4.28-0.26v9.35c-1.83,0.31-3.921,0.58-6.11,0.58c-12.49,0-17.45-4.39-17.45-15.36V79.82h-9.04v-9.46h9.04 V55.94L1045.25,55.94z'/%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/g%3E %3C/svg%3E\""

/***/ }),

/***/ "fab2":
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__("7726").document;
module.exports = document && document.documentElement;


/***/ })

/******/ });