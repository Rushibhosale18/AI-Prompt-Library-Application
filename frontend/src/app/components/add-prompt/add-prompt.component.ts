import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PromptService } from '../../services/prompt.service';

@Component({
  selector: 'app-add-prompt',
  templateUrl: './add-prompt.component.html',
  styleUrls: ['./add-prompt.component.css']
})
export class AddPromptComponent {
  promptForm: FormGroup;
  submitting = false;
  submitError = '';
  tagInput = '';
  selectedTags: string[] = [];

  constructor(
    private fb: FormBuilder,
    private promptService: PromptService,
    private router: Router
  ) {
    this.promptForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      complexity: [5, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  get title()      { return this.promptForm.get('title')!; }
  get content()    { return this.promptForm.get('content')!; }
  get complexity() { return this.promptForm.get('complexity')!; }

  get contentLength(): number { return (this.content.value || '').length; }
  get complexityValue(): number { return Number(this.complexity.value) || 1; }

  addTag(): void {
    const tag = this.tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !this.selectedTags.includes(tag) && this.selectedTags.length < 5) {
      this.selectedTags.push(tag);
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
  }

  onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    }
  }

  getComplexityLabel(c: number): string {
    if (c <= 3) return '🟢 Easy';
    if (c <= 6) return '🟡 Medium';
    return '🔴 Hard';
  }

  onSubmit(): void {
    if (this.promptForm.invalid) {
      this.promptForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.submitError = '';

    this.promptService.createPrompt({
      title: this.title.value.trim(),
      content: this.content.value.trim(),
      complexity: Number(this.complexityValue),
      tags: this.selectedTags
    }).subscribe({
      next: (prompt) => {
        this.submitting = false;
        this.router.navigate(['/prompts', prompt.id]);
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else if (err.error?.errors) {
          const msgs = Object.values(err.error.errors).join(' ');
          this.submitError = msgs;
        } else {
          this.submitError = 'Failed to create prompt. Please try again.';
        }
      }
    });
  }
}
