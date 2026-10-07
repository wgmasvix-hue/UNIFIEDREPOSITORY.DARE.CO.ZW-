import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  SecurityContext,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { timeout } from 'rxjs/operators';

interface LibrarianSource {
  title: string | null;
  type: string | null;
  handle: string | null;
  uri: string | null;
  uuid: string | null;
}

interface LibrarianResponse {
  question: string;
  answer: string;
  sources: LibrarianSource[];
}

interface LibrarianMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: LibrarianSource[];
  /**
   * Sanitized HTML rendering of `content`, for assistant messages only.
   * The backend answers in Markdown (tables, bold, lists); interpolating it
   * as text would show readers literal `**` and `|` characters. Rendered
   * once per message, on arrival, so no per-change-detection cost.
   */
  html?: string;
}

@Component({
  selector: 'dare-librarian',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './dare-librarian.component.html',
  styleUrls: ['./dare-librarian.component.scss'],
})
export class DareLibrarianComponent implements OnInit {

  open = false;
  question = '';
  loading = false;
  /**
   * True when the last exchange failed. Re-shows the suggestion chips so a
   * failed answer leaves the visitor with somewhere to go, not a dead end.
   */
  failed = false;

  @ViewChild('librarianBody') private body?: ElementRef<HTMLElement>;

  messages: LibrarianMessage[] = [
    {
      role: 'assistant',
      content:
        "Hello 👋 I'm the DARE Librarian. Ask me about research, publications, Zimbabwean knowledge, or resources in the UnifiedRepository.",
    },
  ];

  private readonly apiUrl =
    '/librarian/api/ask';

  /**
   * How long to wait for the research backend before giving up. RAG answers
   * typically arrive in well under a minute; beyond two minutes something is
   * wrong server-side and holding the spinner helps nobody.
   */
  private readonly requestTimeoutMs = 120000;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Render the greeting up front so the panel never opens onto raw markup.
    void this.renderAssistantMessage(this.messages[0]);
  }

  toggle(): void {
    this.open = !this.open;
  }

  ask(question?: string): void {
    const text = (question ?? this.question).trim();

    if (!text || this.loading) {
      return;
    }

    this.messages.push({
      role: 'user',
      content: text,
    });

    this.question = '';
    this.loading = true;
    this.failed = false;
    this.scrollToBottom();

    this.http.post<LibrarianResponse>(
      this.apiUrl,
      {
        question: text,
        search_size: 5,
      },
    ).pipe(
      timeout(this.requestTimeoutMs),
    ).subscribe({
      next: (response) => {
        const message: LibrarianMessage = {
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
        };
        this.messages.push(message);
        void this.renderAssistantMessage(message);

        this.loading = false;
        this.scrollToBottom();
      },

      error: (error) => {
        console.error('DARE Librarian error:', error);

        const timedOut = error?.name === 'TimeoutError';
        const message: LibrarianMessage = {
          role: 'assistant',
          content: timedOut
            ? 'That question took longer than two minutes to research, so I stopped waiting. Please try again with a shorter or more specific question.'
            : "I'm sorry, I couldn't connect to the DARE Librarian service. Please check your connection and try again — or pick a suggestion below.",
        };
        this.messages.push(message);
        void this.renderAssistantMessage(message);

        this.loading = false;
        this.failed = true;
        this.scrollToBottom();
      },
    });
  }

  /**
   * Render one assistant message's Markdown to sanitized HTML.
   *
   * `markdown-it` is lazy-imported so the parser (~50 KB) only loads for
   * visitors who actually open the panel. Raw HTML in answers is disabled
   * and the output is sanitized, because answer text is model-generated and
   * must never become an injection vector.
   */
  private async renderAssistantMessage(message: LibrarianMessage): Promise<void> {
    try {
      const MarkdownIt = (await import('markdown-it')).default;
      const md = new MarkdownIt({
        html: false,
        linkify: true,
      });
      const raw = md.render(message.content ?? '');
      // Answers link out to repository records; keep the chat open by
      // sending those links to a new tab.
      const withTargets = raw.replace(
        /<a href="/g,
        '<a target="_blank" rel="noopener noreferrer" href="',
      );
      message.html = this.sanitizer.sanitize(SecurityContext.HTML, withTargets) ?? '';
    } catch {
      // Parser failed to load (offline chunk, old browser): fall back to
      // plain text rather than leaving the message blank.
      message.html = undefined;
    }
    this.changeDetector.markForCheck();
  }

  /**
   * Repository route for a source that arrived without a usable URI.
   * `/items/:uuid` is a real DSpace route, so the record stays one click
   * away instead of being dropped from the list.
   */
  protected sourceRoute(source: LibrarianSource): string[] | null {
    return source.uuid ? ['/items', source.uuid] : null;
  }

  private scrollToBottom(): void {
    // The panel only exists client-side once opened; during SSR there is
    // nothing to scroll.
    globalThis.setTimeout(() => {
      const el = this.body?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.ask();
    }
  }
}
