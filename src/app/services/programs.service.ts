import { Injectable } from '@angular/core';
import { Program } from '../models/programs.models';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private programs: Program[] = [
    {
      id: 1,
      title: 'Acteurs Sauveteur Secouriste du Travail',
      description:
        "Formation essentielle pour intervenir rapidement en cas d'urgence.",
      duration: '2 jours',
      audience:
        'Tous salariés et professionnels souhaitant acquérir des compétences en secourisme.',
      prerequisite: 'Aucun',
      banner: 'assets/images/formateur-pls.jpg',
      summary:
        'Le Sauveteur Secouriste du Travail (SST) est un acteur clé de la prévention des risques en entreprise. Cette formation permet d’acquérir des réflexes essentiels pour porter secours à une victime en attendant l’arrivée des secours.',
      content: 'Les participants apprendront notamment à :',
      details: [
        'Évaluer une situation d’urgence et alerter les secours compétents.',
        'Réaliser des gestes de premiers secours : position latérale de sécurité (PLS), massage cardiaque, utilisation d’un défibrillateur.',
        'Identifier les principaux risques professionnels et les prévenir dans leur environnement de travail.',
      ],
      methodology: [
        '✔ Formation 100% pratique, avec exercices de mise en situation sur mannequins.',
        '✔ Jeux de rôles et études de cas concrets pour réagir efficacement en cas d’accident.',
        '✔ Livret pédagogique remis à chaque participant.',
      ],
      images: [
        'assets/images/Designer.jpeg',
        'assets/images/Designer (1).jpeg',
        'assets/images/Designer (2).jpeg',
      ],
      testimonials: [
        {
          name: 'Alice Dupont',
          role: 'RH',
          feedback:
            "Formation très complète, je me sens prête à agir en cas d'urgence !",
        },
        {
          name: 'Jean Lemoine',
          role: 'Manager',
          feedback: 'Les mises en situation étaient très réalistes.',
        },
      ],
    },
    {
      id: 2,
      title: 'Formateurs Sauveteur Secouriste du Travail',
      description:
        'Devenez un formateur SST certifié et transmettez vos compétences.',
      duration: '5 jours',
      audience:
        'Professionnels souhaitant former des Sauveteurs Secouristes du Travail.',
      prerequisite: 'Être titulaire du SST valide.',
      banner: 'assets/images/formation.jpg',
      summary:
        'Le rôle du formateur SST est crucial : il doit enseigner aux futurs secouristes les gestes qui sauvent des vies en entreprise. Cette formation approfondie aborde :',
      content: 'Cette formation approfondie aborde :',
      details: [
        'Les méthodes pédagogiques adaptées à la formation en secourisme.',
        '        La gestion des groupes et l’animation des sessions pratiques.',
        'L’évaluation des stagiaires et la validation des compétences.',
      ],
      methodology: [
        '✔ Simulations et mises en situation réelle.',
        '✔ Apprentissage des techniques pédagogiques pour capter l’attention d’un groupe.',
        '        ✔ Accompagnement par un expert SST avec retours personnalisés.',
      ],
      images: [
        'assets/images/Designer (3).jpeg',
        'assets/images/Designer (4).jpeg',
        'assets/images/Designer (5).jpeg',
      ],
      testimonials: [
        {
          name: 'Marie Curie',
          role: 'Formatrice SST',
          feedback: 'Un apprentissage concret et structuré !',
        },
      ],
    },
    {
      id: 3,
      title: 'Initiations aux premiers secours',
      description:
        'Apprenez les gestes de premiers secours pour sauver des vies.',
      duration: '1 jour',
      audience: 'Grand public, écoles, associations, entreprises.',
      prerequisite: 'Aucun',
      banner: 'assets/images/mannequin1.jpg',
      summary:
        'Face à une situation d’urgence, chaque minute compte ! Cette initiation permet d’acquérir les premiers réflexes pour protéger une victime et appeler les secours.',
      content: 'Les participants apprendront :',
      details: [
        'Les gestes essentiels : compression des plaies, massage cardiaque, gestion des étouffements.',
        'L’alerte aux services de secours : comment donner des informations claires et précises au SAMU ou aux pompiers.',
        'La prévention des accidents domestiques et professionnels.',
      ],
      methodology: [
        '✔ Formation interactive avec démonstrations et exercices pratiques.',
        '✔ Apprentissage ludique pour une mémorisation efficace.',
        '✔ Remise d’un guide des premiers secours pour réviser après la formation.',
      ],
      images: [
        'assets/images/Designer (6).jpeg',
        'assets/images/Designer (7).jpeg',
        'assets/images/Designer (8).jpg',
      ],
      testimonials: [
        {
          name: 'Thomas Martin',
          role: 'Étudiant',
          feedback: 'C’est indispensable, je recommande !',
        },
      ],
    },
    {
      id: 4,
      title: 'Aide pédagogique et administrative',
      description:
        'Support continu pour formateurs SST sur les aspects pédagogiques et administratifs.',
      duration: 'Flexible',
      audience: 'Formateurs en secourisme.',
      prerequisite: 'Aucun',
      banner: 'assets/images/aide-document.jpg',
      summary:
        'Devenir formateur, c’est aussi gérer toute la partie administrative et pédagogique.',
      content:
        'Ce service vise à faciliter leur quotidien en leur fournissant :',
      details: [
        'Une assistance pédagogique : conseils sur la préparation des contenus et techniques d’animation.',
        'Une aide administrative : gestion des dossiers, conformité aux certifications (INRS, QUALIOPI).',
        'Un accompagnement numérique : modèles de documents, guides et support en ligne.',
      ],
      methodology: [
        '✔ Un coaching personnalisé pour optimiser vos sessions de formation.',
        '✔ Un accès à une bibliothèque de ressources pédagogiques clé en main.',
        '✔ Un support sur les exigences réglementaires et les certifications.',
      ],
      images: [
        'assets/images/Designer (9).jpeg',
        'assets/images/Designer (10).jpeg',
        'assets/images/Designer (11).jpeg',
      ],
      testimonials: [],
    },
  ];

  getProgramById(id: number) {
    return this.programs.find((program) => program.id === id);
  }
}
