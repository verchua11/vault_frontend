import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Project } from './models/project.model';
import * as moment from 'moment';

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

  addToRecent(key: string, project_id: string) {
    let recent = JSON.parse(localStorage.getItem('recent'));

    if (recent) {
      recent = recent.filter((item) => {
        const a = moment(item.date);
        const b = moment().format('YYYY-MM-DD');
        return a.diff(b, 'days') > -8;
      });
    } else {
      localStorage.setItem('recent', JSON.stringify([]));
      recent = [];
    }

    const oldRecord = recent.find(
      (item) => item.key === key && item.project_id === project_id
    );

    if (oldRecord !== undefined) recent.splice(recent.indexOf(oldRecord), 1);

    recent.push({
      key: key,
      project_id: project_id,
      date: moment().format('YYYY-MM-DD'),
    });

    localStorage.setItem('recent', JSON.stringify(recent));
  }
  
  getSelectedProject() {
    return this.selectedProject;
  }
}
