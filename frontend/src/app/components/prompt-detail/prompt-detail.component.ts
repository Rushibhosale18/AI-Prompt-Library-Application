import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PromptService, PromptDetail } from '../../services/prompt.service';

@Component({
  selector: 'app-prompt-detail',
  templateUrl: './prompt-detail.component.html',
  styleUrls: ['./prompt-detail.component.css']
})
export class PromptDetailComponent implements OnInit {
  prompt: PromptDetail | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promptService: PromptService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.promptService.getPrompt(id).subscribe({
      next: (data) => { this.prompt = data; this.loading = false; },
      error: (err) => {
        this.error = err.status === 404 ? 'Prompt not found.' : 'Failed to load prompt.';
        this.loading = false;
      }
    });
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

  copyContent(): void {
    if (this.prompt) {
      navigator.clipboard.writeText(this.prompt.content).then(() => {
        this.copied = true;
        setTimeout(() => this.copied = false, 2000);
      });
    }
  }
  copied = false;

  goBack(): void { this.router.navigate(['/prompts']); }
}
