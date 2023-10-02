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
Object.defineProperty(exports, "__esModule", { value: true });
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
const uploadStream = (props) => (file) => new Promise((resolve, reject) => {
    const { supabase, config } = props;
    const _buf = [];
    if (!file.stream)
        throw new Error('Missing file stream');
    file.stream.on('data', (chunk) => _buf.push(chunk));
    file.stream.on('end', () => {
        file.buffer = Buffer.concat(_buf);
        upload({ supabase, config })(file).then(() => resolve(undefined));
    });
    file.stream.on('error', err => reject(err));
    return undefined;
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
        delete: remove({ supabase, config }),
    };
};
exports.default = {
    init
};
