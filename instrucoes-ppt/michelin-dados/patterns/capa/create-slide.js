import { requiredText } from '../../../../engine/knowledge/content.js';
export function createSlide({ pptx, content }) {
  const title = requiredText(content, 'title');
  const date = requiredText(content, 'date');
  const slide = pptx.addTemplateSlide({ slideId: 256 });
  slide.setText({ shapeId: 1227 }, title);
  slide.setText({ shapeId: 2 }, date);
  return slide;
}
