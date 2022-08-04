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
exports.init = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
//
//--- Helpers
//
const getKey = ({ directory, file }) => {
    return `${directory}/${file.name}-${file.hash}${file.ext}`.replace(/^\//g, "");
};
const config = {
    provider: "supabase",
    name: "Supabase Storage",
    auth: {
        apiUrl: {
            label: "Supabase API Url (e.g. 'https://zokyprbhquvvrleedkkk.supabase.co')",
            type: "text",
        },
        apiKey: {
            label: "Supabase API Key (e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpBNWJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6NOYyNjk1NzgzOCwiZXhwIjoxOTQUNTMzODM4fQ.tfr1M8tg6-ynD-qXkODRXX-do1qWNwQQUt1zQp8sFIc')",
            type: "text",
        },
        bucket: {
            label: "Supabase storage bucket (e.g. 'my-bucket')",
            type: "text",
        },
        directory: {
            label: "Directory inside Supabase storage bucket (e.g. '')",
            type: "text",
        },
        options: {
            label: "Supabase client additional options",
            type: "object",
        },
    },
};
const init = (config) => {
    const apiUrl = config.apiUrl;
    const apiKey = config.apiKey;
    const bucket = config.bucket || "strapi-uploads";
    const directory = (config.directory || "").replace(/(^\/)|(\/$)/g, "");
    const options = config.options || undefined;
    const supabase = (0, supabase_js_1.createClient)(apiUrl, apiKey, options);
    return {
        upload: (file, customParams = {}) => __awaiter(void 0, void 0, void 0, function* () {
            //--- Upload the file into storage
            const { data, error: error1 } = yield supabase.storage
                .from(bucket)
                .upload(getKey({ directory, file }), 
            // file, // or Buffer.from(file.buffer, "binary"),
            Buffer.from(file.buffer, "binary"), // or file
            {
                cacheControl: "public, max-age=31536000, immutable",
                upsert: true,
                contentType: file.mime,
            });
            if (error1)
                throw error1;
            const { publicURL, error: error2 } = yield supabase.storage
                .from(bucket)
                .getPublicUrl(getKey({ directory, file }));
            if (error2)
                throw error2;
            file.url = publicURL;
        }),
        delete: (file, customParams = {}) => new Promise((resolve, reject) => {
            //--- Delete the file fromstorage the space
            supabase.storage
                .from(bucket)
                .remove([getKey({ directory, file })])
                .then(({ data, error }) => {
                if (error)
                    return reject(error);
                resolve(undefined);
            });
        }),
    };
};
exports.init = init;
