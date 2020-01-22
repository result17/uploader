"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var multiparty = require("multiparty");
var path = require("path");
var fse = require("fs-extra");
var targetDir = 'target';
var UPLOAD_DIR = path.resolve(__dirname, '..', targetDir);
function extractExt(filename) {
    var reg = /.*\.(.*)$/;
    // 如果不存在后缀名则等于file，如foo.
    var ext = filename.replace(reg, '$1') || 'file';
    return ext;
}
// 合并切片
function mergeFileChunk(filePath, fileHash) {
    return __awaiter(this, void 0, void 0, function () {
        var chunkDir, chunkPathAry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chunkDir = UPLOAD_DIR + "/" + fileHash;
                    return [4 /*yield*/, fse.readdir(chunkDir)
                        // 创建文件
                    ];
                case 1:
                    chunkPathAry = _a.sent();
                    // 创建文件
                    return [4 /*yield*/, fse.writeFile(filePath, '')];
                case 2:
                    // 创建文件
                    _a.sent();
                    chunkPathAry.forEach(function (chunk) {
                        fse.appendFileSync(filePath, fse.readFileSync(chunkDir + "/" + chunk));
                        fse.unlinkSync(chunkDir + "/" + chunk);
                    });
                    fse.rmdirSync(chunkDir);
                    return [2 /*return*/];
            }
        });
    });
}
function createdUploadedList(fileHash) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!fse.existsSync(UPLOAD_DIR + "/" + fileHash)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fse.readdir(UPLOAD_DIR + "/" + fileHash)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = [];
                    _b.label = 3;
                case 3: return [2 /*return*/, _a];
            }
        });
    });
}
var Controller = /** @class */ (function () {
    function Controller() {
    }
    Controller.prototype.handleVerifyUpload = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, ext, filePath, _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        data = req.body;
                        ext = extractExt(data.filename);
                        filePath = UPLOAD_DIR + "\\" + data.fileHash + "." + ext;
                        if (!fse.existsSync(filePath)) return [3 /*break*/, 1];
                        res.end(JSON.stringify({
                            shouldUpload: false
                        }));
                        return [3 /*break*/, 3];
                    case 1:
                        _b = (_a = res).end;
                        _d = (_c = JSON).stringify;
                        _e = {
                            shouldUpload: true
                        };
                        return [4 /*yield*/, createdUploadedList(data.fileHash)];
                    case 2:
                        _b.apply(_a, [_d.apply(_c, [(_e.uploadedList = _f.sent(),
                                    _e)])]);
                        _f.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Controller.prototype.handleFromData = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var multipart;
            var _this = this;
            return __generator(this, function (_a) {
                multipart = new multiparty.Form();
                multipart.parse(req, function (err, fields, files) { return __awaiter(_this, void 0, void 0, function () {
                    var chunk, hash, fileHash, filename, filePath, chunkDir;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    console.error(err);
                                    res.status(500).end('process file chunk failed');
                                    return [2 /*return*/];
                                }
                                chunk = files.chunk[0];
                                hash = fields.hash[0];
                                fileHash = fields.fileHash[0];
                                filename = fields.filename[0];
                                filePath = UPLOAD_DIR + "/" + fileHash + extractExt(filename);
                                chunkDir = UPLOAD_DIR + "/" + fileHash;
                                // 文件存在直接返回
                                if (fse.existsSync(filePath)) {
                                    res.end('file exist');
                                    return [2 /*return*/];
                                }
                                if (!!fse.existsSync(chunkDir)) return [3 /*break*/, 2];
                                return [4 /*yield*/, fse.mkdirs(chunkDir)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: 
                            // fs-extra 专用方法，类似 fs.rename 并且跨平台
                            // fs-extra 的 rename 方法 windows 平台会有权限问题
                            // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
                            return [4 /*yield*/, fse.move(chunk.path, chunkDir + "/" + hash)];
                            case 3:
                                // fs-extra 专用方法，类似 fs.rename 并且跨平台
                                // fs-extra 的 rename 方法 windows 平台会有权限问题
                                // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
                                _a.sent();
                                res.end('received file chunk');
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    Controller.prototype.handleMerge = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, ext, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = req.body.data;
                        ext = extractExt(data.filename);
                        filePath = UPLOAD_DIR + "/" + data.fileHash + ext;
                        return [4 /*yield*/, mergeFileChunk(filePath, data.fileHash)];
                    case 1:
                        _a.sent();
                        res.end(JSON.stringify({
                            code: 0,
                            message: 'file merged success'
                        }));
                        return [2 /*return*/];
                }
            });
        });
    };
    return Controller;
}());
exports["default"] = Controller;
