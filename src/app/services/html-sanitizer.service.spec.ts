import { HtmlSanitizerService } from './html-sanitizer.service';

describe('HtmlSanitizerService', () => {
  const service = new HtmlSanitizerService();

  it('returns an empty string for empty input', () => {
    expect(service.sanitize('')).toBe('');
  });

  it('keeps allowed tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(service.sanitize(input)).toBe(input);
  });

  it('strips script tags and their content', () => {
    const out = service.sanitize('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert');
  });

  it('strips tags that are not in the allowlist', () => {
    const out = service.sanitize('<div>text</div>');
    expect(out).not.toContain('<div');
    expect(out).toContain('text');
  });

  it('keeps a style attribute that is only a valid hex color', () => {
    const out = service.sanitize('<span style="color: #ff0000">x</span>');
    expect(out).toContain('color: #ff0000');
  });

  it('drops the whole style attribute when mixed with other properties', () => {
    const out = service.sanitize(
      '<span style="color: #ff0000; font-size: 40px">x</span>'
    );
    expect(out).not.toContain('font-size');
    expect(out).not.toContain('color: #ff0000');
  });

  it('drops a non-hex color style value', () => {
    const out = service.sanitize('<span style="color: red">x</span>');
    expect(out).not.toContain('color: red');
  });

  it('forces rel/target on links regardless of submitted values', () => {
    const out = service.sanitize('<a href="https://example.com">link</a>');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it('strips a javascript: URL scheme from links', () => {
    const out = service.sanitize('<a href="javascript:alert(1)">link</a>');
    expect(out).not.toContain('javascript:');
  });
});
