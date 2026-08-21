// Ambient declaration for openai package.
// The installed version does not ship discoverable .d.ts files with
// this project's moduleResolution setting, so we declare it as any.
declare module "openai" {
  const OpenAI: any;
  export default OpenAI;
  export const toFile: any;
  export type ChatCompletionMessageParam = any;
  export type ChatCompletionChunk = any;
  export type ChatCompletion = any;
}
