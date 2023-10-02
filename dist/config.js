"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
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
