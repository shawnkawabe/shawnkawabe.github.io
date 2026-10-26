import { createCn } from 'cn/engine';
import tables from './cn-tables';

// Class merger for shadcn components. The tables are compiled by the cn Vite plugin
// (astro.config.mjs) from the classes in src/ and the token scales in global.css, so
// `text-3` is known as a size and never removes `text-on-accent`.
export const cn = createCn(tables);
