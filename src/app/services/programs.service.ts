import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private programs = [
    {
      id: 1,
      title: 'Acteurs Sauveteur Secouriste du Travail',
      description: 'Description complète pour le programme 1.',
    },
    {
      id: 2,
      title: 'Formateurs Sauveteur Secouriste du Travail',
      description: 'Description complète pour le programme 2.',
    },
    {
      id: 3,
      title: 'Initiations aux premiers secours',
      description: 'Description complète pour le programme 3.',
    },
    {
      id: 4,
      title: 'Aide pédagogique et administrative',
      description: 'Description complète pour le programme 4.',
    },
  ];

  getProgramById(id: number) {
    return this.programs.find((program) => program.id === id);
  }
}
