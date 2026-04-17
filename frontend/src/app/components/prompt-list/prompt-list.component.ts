import { Component, OnInit } from '@angular/core';
import { PromptService, Prompt } from '../../services/prompt.service';

@Component({
  selector: 'app-prompt-list',
  templateUrl: './prompt-list.component.html',
  styleUrls: ['./prompt-list.component.css']
})
export class PromptListComponent implements OnInit {
  prompts: Prompt[] = [];
  allTags: string[] = [];
  activeTag: string = '';
  loading = true;
  error = '';

  constructor(private promptService: PromptService) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadPrompts();
  }

  loadTags(): void {
    this.promptService.getTags().subscribe({
      next: (tags) => this.allTags = tags,
      error: () => {}
    });
  }

  loadPrompts(tag?: string): void {
    this.loading = true;
    this.error = '';
    this.promptService.getPrompts(tag).subscribe({
      next: (data) => { this.prompts = data; this.loading = false; },
      error: () => { this.error = 'Failed to load prompts. Is the backend running?'; this.loading = false; }
    });
  }

  filterByTag(tag: string): void {
    if (this.activeTag === tag) {
      this.activeTag = '';
      this.loadPrompts();
    } else {
      this.activeTag = tag;
      this.loadPrompts(tag);
    }
  }

  clearFilter(): void {
    this.activeTag = '';
    this.loadPrompts();
  }

  getComplexityClass(c: number): string {
    if (c <= 3) return 'badge-low';
    if (c <= 6) return 'badge-mid';
    return 'badge-high';
  }

  getComplexityLabel(c: number): string {
    if (c <= 3) return 'Easy';
    if (c <= 6) return 'Medium';
    return 'Hard';
  }

  trackById(_: number, item: Prompt): number { return item.id; }
}
