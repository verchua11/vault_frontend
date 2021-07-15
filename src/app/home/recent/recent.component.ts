import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
})
export class RecentComponent implements OnInit {
  projects: Array<Project> = [];
  selectedProject: Project;

  subscriptions: Subscription[] = [];

  constructor(
    private ProjectService: ProjectService,
    private VaultStateService: VaultStateService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.ProjectService.getProjects().subscribe((response: any) => {
        this.projects = response.projects.filter(
          (p) => p.status === 'Approved'
        );
      })
    );

    this.subscriptions.push(
      this.VaultStateService.newSelectedProject.subscribe((project) => {
        if (project) {
          this.selectedProject = project;
        }
      })
    );
  }

  public openProject(project: Project) {
    if (this.selectedProject !== project)
      this.VaultStateService.updateSelectedProject(project);
  }
}
