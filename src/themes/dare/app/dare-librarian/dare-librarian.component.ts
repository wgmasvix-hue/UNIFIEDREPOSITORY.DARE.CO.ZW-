import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
}

@Component({
  selector: 'dare-librarian',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './dare-librarian.component.html',
  styleUrls: ['./dare-librarian.component.scss'],
})
export class DareLibrarianComponent {

  open = false;
  question = '';
  loading = false;

  messages: LibrarianMessage[] = [
    {
      role: 'assistant',
      content:
        "Hello 👋 I'm the DARE Librarian. Ask me about research, publications, Zimbabwean knowledge, or resources in the UnifiedRepository.",
    },
  ];

  private readonly apiUrl =
    '/librarian/api/ask';

  constructor(private http: HttpClient) {}

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

    this.http.post<LibrarianResponse>(
      this.apiUrl,
      {
        question: text,
        search_size: 5,
      },
    ).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
        });

        this.loading = false;
      },

      error: (error) => {
        console.error('DARE Librarian error:', error);

        this.messages.push({
          role: 'assistant',
          content:
            "I'm sorry, I couldn't connect to the DARE Librarian service. Please try again.",
        });

        this.loading = false;
      },
    });
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.ask();
    }
  }
}
