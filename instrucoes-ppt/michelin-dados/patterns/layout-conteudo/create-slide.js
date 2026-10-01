import { requiredText } from '../../../../engine/knowledge/content.js';
export function createSlide({ pptx, theme, content }) {
  const title = requiredText(content, 'title');
  const body = requiredText(content, 'body');
  const slide = pptx.addTemplateSlide({ layout: { master: 'Slides Internos (Conteúdo)', name: 'Custom Layout 1 1 1 2 1 1 1 1 1 2' } });
  slide.setText({ placeholderType: 1 }, title);
  slide.addText(body, { ...theme.layouts.body, fontFace: theme.typography.body, fontSize: theme.typography.sizes.body, color: theme.colors.ink });
  return slide;
}
