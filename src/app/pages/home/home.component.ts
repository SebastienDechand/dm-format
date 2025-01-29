import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  programs = [
    {
      id: 1,
      image: '',
      title: 'Acteurs Sauveteur Secouriste du Travail',
      description: 'Formation pour devenir sauveteur secouriste.',
    },
    {
      id: 2,
      image: '',
      title: 'Formateurs Sauveteur Secouriste du Travail',
      description: 'Formation pour devenir formateur SST.',
    },
    {
      id: 3,
      image: '',
      title: 'Initiations aux premiers secours',
      description: 'Découvrez les bases des premiers secours.',
    },
    {
      id: 4,
      image: '',
      title: 'Aide pédagogique et administrative',
      description: 'Support pour formateurs SST.',
    },
  ];
}
