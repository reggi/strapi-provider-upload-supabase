"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const getKey = ({ directory, file }) => {
    return `${directory}/${file.name}-${file.hash}${file.ext}`.replace(/^\//g, "");
};
const upload = (props) => (file) => __awaiter(void 0, void 0, void 0, function* () {
    const { supabase, config } = props;
    const key = getKey({ directory: config.directory, file });
    const cacheControl = "public, max-age=31536000, immutable";
    const upsert = true;
    const contentType = file.mime;
    if (!file.buffer)
        throw new Error('Missing file buffer');
    const { error: uploadError } = yield supabase.storage
        .from(config.bucket)
        .upload(key, file.buffer, { cacheControl, upsert, contentType });
    if (uploadError)
        throw uploadError;
    const { publicURL, error: getUrlError } = yield supabase.storage
        .from(config.bucket)
        .getPublicUrl(key);
    if (getUrlError)
        throw getUrlError;
    if (!publicURL)
        throw new Error("Missing publicURL");
    file.url = publicURL;
    return undefined;
});
const uploadStream = (props) => (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    if (!file.stream)
        throw new Error('Missing file stream');
    const _buf = [];
    try {
        for (var _d = true, _e = __asyncValues(file.stream), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
            _c = _f.value;
            _d = false;
            try {
                const chunk = _c;
                _buf.push(chunk);
            }
            finally {
                _d = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    file.buffer = Buffer.concat(_buf);
    yield upload({ supabase: props.supabase, config: props.config })(file);
});
const remove = (props) => (file) => __awaiter(void 0, void 0, void 0, function* () {
    const { supabase, config } = props;
    const key = getKey({ directory: config.directory, file });
    const { error } = yield supabase.storage.from(config.bucket).remove([key]);
    if (error)
        throw error;
    return undefined;
});
const init = (config) => {
    config.bucket = config.bucket || "strapi-uploads";
    config.directory = (config.directory || "").replace(/(^\/)|(\/$)/g, "");
    config.options = config.options || undefined;
    const supabase = (0, supabase_js_1.createClient)(config.apiUrl, config.apiKey, config.options);
    return {
        upload: upload({ supabase, config }),
        uploadStream: uploadStream({ supabase, config }),
        delete: remove({ supabase, config })
    };
};
exports.init = init;
