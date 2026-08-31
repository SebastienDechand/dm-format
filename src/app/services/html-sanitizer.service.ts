import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';

// Backs the rich text editor: only the tags/attributes the toolbar can
// actually produce are allowed through. Any hex color is accepted (not just
// the toolbar's presets) so titles saved before this editor existed, or with
// a hand-picked color, don't lose their formatting on first render - a hex
// value can't carry an XSS payload, so this stays safe either way.
const COLOR_STYLE = /^color:\s*#(?:[0-9a-fA-F]{3}){1,2}\s*;?$/;

DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName === 'style') {
    data.attrValue = COLOR_STYLE.test(data.attrValue.trim())
      ? data.attrValue.trim()
      : '';
  }
});

// Every outgoing link gets a forced rel, regardless of what was submitted -
// closes the window.opener/referrer leak even if a link was crafted by hand
// through a direct API call rather than the toolbar.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('rel', 'noopener noreferrer');
    node.setAttribute('target', '_blank');
  }
});

@Injectable({ providedIn: 'root' })
export class HtmlSanitizerService {
  sanitize(value: string): string {
    if (!value) {
      return '';
    }

    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [
        'p',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'ul',
        'li',
        'span',
        'br',
        'h3',
        'h4',
        'a',
        'blockquote',
      ],
      ALLOWED_ATTR: ['style', 'href'],
      ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
    });
  }
}
