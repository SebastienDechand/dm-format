import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { About } from '../../models/about.models';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  aboutData!: About;

  constructor(private apiService: ApiService) {
    this.apiService.getAbout().subscribe((data) => {
      this.aboutData = data;
    });
  }

  ngOnInit(): void {
    this.apiService.getAbout().subscribe(
      (data) => {
        this.aboutData = data;
      },
      (error) => {
        console.error('Error fetching about page data', error);
      }
    );
  }
}
