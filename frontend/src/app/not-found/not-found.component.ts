import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
  // Random bunny color for variety
  private bunnyColors = ['black', 'brown', 'cream', 'gray', 'pink', 'white'];
  bunnyColor: string;

  constructor() {
    // Pick a random bunny color
    const randomIndex = Math.floor(Math.random() * this.bunnyColors.length);
    this.bunnyColor = this.bunnyColors[randomIndex];
  }

  getBunnyIcon(): string {
    // Use sad bunny since it's a 404 error
    return `assets/icons/bunny_sad_${this.bunnyColor}.svg`;
  }
}

