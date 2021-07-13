import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from './models/project.model';

@Injectable({
  providedIn: 'root',
})
export class VaultStateService {
  private selectedProject = new BehaviorSubject(null);
  public newSelectedProject = this.selectedProject.asObservable();

  private selectedNav = new BehaviorSubject(null);
  public newSelectedNav = this.selectedNav.asObservable();

  constructor() {}

  updateSelectedProject(project: Project) {
    this.selectedProject.next(project);
  }

  updateSelectedNav(nav: string) {
    this.selectedNav.next(nav);
  }
}
