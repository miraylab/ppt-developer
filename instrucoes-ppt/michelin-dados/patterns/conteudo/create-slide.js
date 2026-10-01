import { requiredText } from '../../../../engine/knowledge/content.js';
export function createSlide({ pptx, theme, content }) {
  const keys = ['title', 'intro', 'leftTitle', 'leftBody', 'rightTitle', 'rightBody'];
  keys.forEach(key => requiredText(content, key));
  const slide = pptx.addTemplateSlide({ slideId: 2147483619 });
  slide.setText({ placeholderType: 1 }, content.title);
  for (const key of keys.slice(1)) {
    const heading = key.endsWith('Title');
    slide.addText(content[key], { ...theme.layouts[key], fontFace: heading ? theme.typography.heading : theme.typography.body, fontSize: heading ? theme.typography.sizes.heading : theme.typography.sizes.body, color: theme.colors.ink, bold: heading });
  }
  return slide;
}
