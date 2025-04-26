import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-expandable-row',
  template: `
    <div class="container">
      <!-- Row with Date and Button -->
      <div class="d-flex align-items-center">
        <span matTooltip="Click to expand" matTooltipPosition='after'  class="fw-bold" (click)="togglePanel()">{{!isExpanded ? formattedDate : fullTimestamp }}</span>

</div>
  `,
  styles: [`
    .container {
      padding: 3px 0;
      cursor : pointer;
    }
    .card {
      background-color: #f8f9fa;
    }
  `]
})
export class ExpandableRowComponent {
    @Input() rowData: any;
    isExpanded = false;
  
    get formattedDate(): string {
      if (!this.rowData?.createdAt) return 'N/A';
      const date = this.rowData.createdAt.toDate();
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  
    get fullTimestamp(): string {
      return this.rowData?.createdAt ? this.rowData.createdAt.toDate().toString() : 'N/A';
    }
  
    togglePanel() {
      this.isExpanded = !this.isExpanded;
    }
}
