import { requiredText } from '../../../../engine/knowledge/content.js';
export function createSlide({ pptx, content }) {
  const title = requiredText(content, 'title');
  const subtitle = requiredText(content, 'subtitle');
  const slide = pptx.addTemplateSlide({ slideId: 320 });
  slide.setText({ placeholderType: 1 }, title);
  slide.setText({ placeholderType: 4 }, subtitle);
  return slide;
}
