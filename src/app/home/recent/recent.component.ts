import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
})
export class RecentComponent implements OnInit {
  projects: Array<Project> = [];
  selectedProject: Project;

  files = [];
  selectedFile: any;

  subscriptions: Subscription[] = [];

  constructor(
    private ProjectService: ProjectService,
    private VaultStateService: VaultStateService,
    private VaultService: VaultService
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

          this.subscriptions.push(
            this.VaultService.getFiles().subscribe((response: any) => {
              const recent = JSON.parse(localStorage.getItem('recent'));

              response.results.forEach((dir) => {
                if (recent.find((r) => r.key === dir.Key)) {
                  dir['name'] =
                    dir.Key.split('/')[dir.Key.split('/').length - 1];
                  this.files.push(dir);
                }
              });

              console.log(this.files);
            })
          );
        }
      })
    );
  }

  public openProject(project: Project) {
    if (this.selectedProject !== project)
      this.VaultStateService.updateSelectedProject(project);
  }

  public getFileIcon(fileName: string) {
    switch (fileName.split('.')[1].toLowerCase()) {
      case 'csv':
      case 'xls':
      case 'xlsx':
        return 'file-excel';
      case 'pdf':
        return 'file-pdf';
      case 'doc':
      case 'docx':
        return 'file-word';
      case 'ppt':
      case 'pptx':
        return 'file-ppt';
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'gif':
        return 'file-image';
      case 'txt':
        return 'file-text';
      case 'zip':
      case 'rar':
        return 'file-zip';
      default:
        return 'file';
    }
  }
}
