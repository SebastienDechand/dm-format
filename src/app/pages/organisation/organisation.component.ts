import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ConditionsData } from '../../models/organisation.models';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-organisation',
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './organisation.component.html',
  styleUrl: './organisation.component.scss',
})
export class OrganisationComponent implements OnInit {
  organisationData!: ConditionsData;

  constructor(private apiService: ApiService) {
    this.apiService.getOrganisation().subscribe((data) => {
      this.organisationData = data;
    });
  }

  ngOnInit(): void {
    this.apiService.getOrganisation().subscribe(
      (data) => {
        this.organisationData = data;
      },
      (error) => {
        console.error('Error fetching organisation page data', error);
      }
    );
  }
}
