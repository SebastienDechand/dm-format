import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Training } from '../models/calendar.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) {}

  getTrainings(): Observable<Training[]> {
    return this.http.get<Training[]>(this.apiUrl).pipe(
      map((trainings: any[]) => {
        return trainings.map((training) => {
          const startDate = training.startDate
            ? new Date(training.startDate)
            : null;
          const endDate = training.endDate ? new Date(training.endDate) : null;

          if (startDate && endDate && endDate < startDate) {
            console.warn(
              'Formation avec dates inversées détectée, correction automatique',
              training
            );
            return {
              ...training,
              startDate: endDate,
              endDate: startDate,
            };
          }

          return {
            ...training,
            startDate,
            endDate,
          };
        });
      })
    );
  }

  getTrainingById(id: string): Observable<Training> {
    return this.http.get<Training>(`${this.apiUrl}/${id}`);
  }

  createTraining(training: Training): Observable<Training> {
    return this.http.post<Training>(this.apiUrl, training);
  }

  updateTraining(id: string, training: Training): Observable<Training> {
    return this.http.put<Training>(`${this.apiUrl}/${id}`, training);
  }

  deleteTraining(id: string | undefined): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
