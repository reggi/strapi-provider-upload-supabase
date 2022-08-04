"use strict";
import { createClient, SupabaseClientOptions } from "@supabase/supabase-js";
import crypto from "node:crypto";

//
//--- Types
//
type TFile = {
  mime: string;
  ext: string;
  buffer: string;
  hash: string;
  name: string;
  url: string | null;
};

type Config = {
  apiUrl: string;
  apiKey: string;
  bucket: string;
  directory: string;
  options: SupabaseClientOptions;
};

//
//--- Helpers
//
const getKey = ({ directory, file }: { directory: string; file: TFile }) => {
  return `${directory}/${file.name}-${file.hash}${file.ext}`.replace(
    /^\//g,
    ""
  );
};

const config = {
  provider: "supabase",
  name: "Supabase Storage",
  auth: {
    apiUrl: {
      label:
        "Supabase API Url (e.g. 'https://zokyprbhquvvrleedkkk.supabase.co')",
      type: "text",
    },
    apiKey: {
      label:
        "Supabase API Key (e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpBNWJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6NOYyNjk1NzgzOCwiZXhwIjoxOTQUNTMzODM4fQ.tfr1M8tg6-ynD-qXkODRXX-do1qWNwQQUt1zQp8sFIc')",
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

export const init = (config: Config) => {
  const apiUrl = config.apiUrl;
  const apiKey = config.apiKey;

  const bucket = config.bucket || "strapi-uploads";
  const directory = (config.directory || "").replace(/(^\/)|(\/$)/g, "");
  const options = config.options || undefined;

  const supabase = createClient(apiUrl, apiKey, options);

  return {
    upload: async (file: TFile, customParams = {}) => {
      //--- Upload the file into storage
      const { data, error: error1 } = await supabase.storage
        .from(bucket)
        .upload(
          getKey({ directory, file }),
          // file, // or Buffer.from(file.buffer, "binary"),
          Buffer.from(file.buffer, "binary"), // or file
          {
            cacheControl: "public, max-age=31536000, immutable",
            upsert: true,
            contentType: file.mime,
          }
        );

      if (error1) throw error1;

      const { publicURL, error: error2 } = await supabase.storage
        .from(bucket)
        .getPublicUrl(getKey({ directory, file }));

      if (error2) throw error2;
      file.url = publicURL;
    },

    delete: (file: TFile, customParams = {}) =>
      new Promise((resolve, reject) => {
        //--- Delete the file fromstorage the space
        supabase.storage
          .from(bucket)
          .remove([getKey({ directory, file })])
          .then(({ data, error }) => {
            if (error) return reject(error);
            resolve(undefined);
          });
      }),
  };
};
