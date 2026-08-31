import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { HtmlSanitizerService } from '../../services/html-sanitizer.service';
import {
  LucideDynamicIcon,
  LucideBold,
  LucideItalic,
  LucideList,
  LucideUnderline,
  LucideStrikethrough,
  LucideHeading3,
  LucideHeading4,
  LucideQuote,
  LucideLink,
  provideLucideIcons,
} from '@lucide/angular';

interface ToolbarColor {
  label: string;
  hex: string;
}

// The Tiptap/ProseMirror stack (~100KB gzipped) is loaded on demand, only
// once an admin actually opens edit mode - visitors reading the page never
// download it. Type-only import above so `Editor` still exists for typing
// without pulling `@tiptap/core` into this file's static bundle.
async function loadTiptap() {
  const [
    core,
    document,
    text,
    paragraph,
    bold,
    italic,
    bulletList,
    listItem,
    textStyle,
    color,
    history,
    underline,
    strike,
    heading,
    link,
    blockquote,
  ] = await Promise.all([
    import('@tiptap/core'),
    import('@tiptap/extension-document'),
    import('@tiptap/extension-text'),
    import('@tiptap/extension-paragraph'),
    import('@tiptap/extension-bold'),
    import('@tiptap/extension-italic'),
    import('@tiptap/extension-bullet-list'),
    import('@tiptap/extension-list-item'),
    import('@tiptap/extension-text-style'),
    import('@tiptap/extension-color'),
    import('@tiptap/extension-history'),
    import('@tiptap/extension-underline'),
    import('@tiptap/extension-strike'),
    import('@tiptap/extension-heading'),
    import('@tiptap/extension-link'),
    import('@tiptap/extension-blockquote'),
  ]);

  return {
    Editor: core.Editor,
    Document: document.default,
    Text: text.default,
    Paragraph: paragraph.default,
    Bold: bold.default,
    Italic: italic.default,
    BulletList: bulletList.default,
    ListItem: listItem.default,
    TextStyle: textStyle.TextStyle,
    Color: color.default,
    History: history.default,
    Underline: underline.default,
    Strike: strike.default,
    Heading: heading.default,
    Link: link.default,
    Blockquote: blockquote.default,
  };
}

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [EditButtonComponent, LucideDynamicIcon],
  providers: [
    provideLucideIcons(
      LucideBold,
      LucideItalic,
      LucideList,
      LucideUnderline,
      LucideStrikethrough,
      LucideHeading3,
      LucideHeading4,
      LucideQuote,
      LucideLink
    ),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
})
export class RichTextEditorComponent implements ControlValueAccessor {
  private platformId = inject(PLATFORM_ID);
  private sanitizerService = inject(HtmlSanitizerService);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly editable = input(false);
  readonly adminVisible = input(false);
  readonly toolbar = input<'inline' | 'full'>('full');
  readonly editToggled = output<void>();

  readonly colors: ToolbarColor[] = [
    { label: 'Bleu', hex: '#1d4e7a' },
    { label: 'Corail', hex: '#e8543a' },
    { label: 'Marine', hex: '#0b1f33' },
    { label: 'Vert', hex: '#1f9d6b' },
    { label: 'Ambre', hex: '#e0a13c' },
    { label: 'Rouge', hex: '#c9503f' },
  ];

  @ViewChild('editorHost') private editorHost?: ElementRef<HTMLElement>;
  @ViewChild('linkInput') private linkInputRef?: ElementRef<HTMLInputElement>;

  private rawValue = signal('');
  readonly displaySafeHtml = signal('');

  private editor?: TiptapEditor;
  private mounting = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const editing = this.editable();
      if (!this.isBrowser) return;

      if (editing) {
        queueMicrotask(() => void this.mountEditor());
      } else {
        this.destroyEditor();
      }
    });
  }

  writeValue(value: string): void {
    const next = value || '';
    this.rawValue.set(next);
    this.displaySafeHtml.set(this.sanitizerService.sanitize(next));
    if (this.editor && this.editor.getHTML() !== next) {
      this.editor.commands.setContent(next);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.editor?.setEditable(!isDisabled);
  }

  private async mountEditor(): Promise<void> {
    if (this.editor || this.mounting || !this.editorHost) return;
    this.mounting = true;

    try {
      const {
        Editor,
        Document,
        Text,
        Paragraph,
        Bold,
        Italic,
        BulletList,
        ListItem,
        TextStyle,
        Color,
        History,
        Underline,
        Strike,
        Heading,
        Link,
        Blockquote,
      } = await loadTiptap();

      // Re-check: edit mode may have been toggled off again while the
      // dynamic import was in flight.
      if (!this.editable() || !this.editorHost) {
        this.mounting = false;
        return;
      }

      const inline = this.toolbar() === 'inline';
      // A title is a single line: no paragraph wrapping, Enter does nothing.
      const documentExtension = inline
        ? Document.extend({ content: 'inline*' })
        : Document;

      this.editor = new Editor({
        element: this.editorHost.nativeElement,
        extensions: inline
          ? [documentExtension, Text, Bold, Italic, TextStyle, Color, History]
          : [
              documentExtension,
              Paragraph,
              Text,
              Bold,
              Italic,
              Underline,
              Strike,
              BulletList,
              ListItem,
              Blockquote,
              Heading.configure({ levels: [3, 4] }),
              Link.configure({
                openOnClick: false,
                autolink: false,
                protocols: ['http', 'https', 'mailto'],
              }),
              TextStyle,
              Color,
              History,
            ],
        content: this.rawValue(),
        onUpdate: ({ editor }) => {
          const clean = this.sanitizerService.sanitize(editor.getHTML());
          this.rawValue.set(clean);
          this.displaySafeHtml.set(clean);
          this.onChange(clean);
        },
      });
    } finally {
      this.mounting = false;
    }
  }

  private destroyEditor(): void {
    this.editor?.destroy();
    this.editor = undefined;
    this.linkInputOpen.set(false);
    this.linkUrlDraft.set('');
  }

  isActive(mark: string): boolean {
    return this.editor?.isActive(mark) ?? false;
  }

  isColorActive(hex: string): boolean {
    return this.editor?.isActive('textStyle', { color: hex }) ?? false;
  }

  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  setColor(hex: string): void {
    this.editor?.chain().focus().setColor(hex).run();
  }

  unsetColor(): void {
    this.editor?.chain().focus().unsetColor().run();
  }

  toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  toggleHeading(level: 3 | 4): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  isHeadingActive(level: 3 | 4): boolean {
    return this.editor?.isActive('heading', { level }) ?? false;
  }

  readonly linkInputOpen = signal(false);
  readonly linkUrlDraft = signal('');

  openLinkInput(): void {
    const currentHref = (this.editor?.getAttributes('link')?.['href'] as
      | string
      | undefined) ?? '';
    this.linkUrlDraft.set(currentHref);
    this.linkInputOpen.set(true);
    queueMicrotask(() => this.linkInputRef?.nativeElement.focus());
  }

  confirmLink(): void {
    const href = this.linkUrlDraft().trim();
    if (href) {
      this.editor
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href })
        .run();
    } else {
      this.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    this.linkInputOpen.set(false);
  }

  cancelLink(): void {
    this.linkInputOpen.set(false);
    this.linkUrlDraft.set('');
  }

  onWrapperFocusOut(event: FocusEvent): void {
    const wrapper = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (next && wrapper.contains(next)) {
      return;
    }
    this.onTouched();
    this.editToggled.emit();
  }
}
