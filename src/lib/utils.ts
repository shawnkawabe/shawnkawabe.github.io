import { createCn } from 'cn/config';

// Teach the class merger our token scales; otherwise `text-3` (a size) is read as a colour
// and silently removes `text-on-accent` when both are passed.
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] }],
      rounded: [{ rounded: ['sm', 'md', 'lg', 'pill'] }],
      shadow: [{ shadow: ['1', '2', 'glow'] }],
      tracking: [{ tracking: ['display', 'label'] }],
    },
  },
});
