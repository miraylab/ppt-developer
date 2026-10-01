export function requiredText(content, key) {
  const value = content?.[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`O campo "${key}" deve conter texto.`);
  return value;
}
