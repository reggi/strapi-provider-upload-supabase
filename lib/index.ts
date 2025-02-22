import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { File } from './types'
import type { Config } from "./config";

const getKey = ({ directory, file }: { directory: string; file: File }) => {
  return `${directory}/${file.name}-${file.hash}${file.ext}`.replace(/^\//g,"")
}

const upload = (props: {supabase: SupabaseClient, config: Config}) => async (file: File) => {
  const { supabase, config } = props
  const key = getKey({ directory: config.directory, file })
  const cacheControl = "public, max-age=31536000, immutable"
  const upsert = true
  const contentType = file.mime
  if (!file.buffer) throw new Error('Missing file buffer')

  const { error: uploadError } = await supabase.storage
    .from(config.bucket)
    .upload(key, file.buffer, { cacheControl, upsert, contentType })
  if (uploadError) throw uploadError

  const { publicURL, error: getUrlError } = await supabase.storage
    .from(config.bucket)
    .getPublicUrl(key)
  if (getUrlError) throw getUrlError
  if (!publicURL) throw new Error("Missing publicURL")
  file.url = publicURL;
  return undefined
}

const uploadStream = (props: { supabase: SupabaseClient, config: Config }) => async (file: File) => {
  if (!file.stream) throw new Error('Missing file stream');

  const _buf: Buffer[] = [];
  for await (const chunk of file.stream) {
    _buf.push(chunk as Buffer);
  }
  file.buffer = Buffer.concat(_buf);

  await upload({ supabase: props.supabase, config: props.config })(file);
}

const remove = (props: {supabase: SupabaseClient, config: Config}) => async (file: File) => {
  const { supabase, config } = props
  const key = getKey({ directory: config.directory, file })
  const { error } = await supabase.storage.from(config.bucket).remove([key])
  if (error) throw error
  return undefined
}

export const init = (config: Config) => {
  config.bucket = config.bucket || "strapi-uploads";
  config.directory = (config.directory || "").replace(/(^\/)|(\/$)/g, "");
  config.options = config.options || undefined;
  const supabase = createClient(config.apiUrl, config.apiKey, config.options);
  return {
    upload: upload({ supabase, config }),
    uploadStream: uploadStream({ supabase, config }),
    delete: remove({ supabase, config })
  }
}