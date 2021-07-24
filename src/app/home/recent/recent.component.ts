import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';
import { VaultFolderService } from 'src/app/core/vault-folder.service';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
})
export class RecentComponent implements OnInit {
  projects: Array<Project> = [];
  selectedProject: Project;
  recentItems: any;
  folderFile = [];
  files = [];
  selectedFile: any;
  isDownloading = false;

  subscriptions: Subscription[] = [];

  constructor(
    private ProjectService: ProjectService,
    private VaultStateService: VaultStateService,
    private VaultService: VaultService,
    private VaultFolderService: VaultFolderService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.VaultService.getUserViewed().subscribe((response:any) => {
        this.prepareRecentItems(response);
        // if (this.folderFile != null) {
        //   console.log('enter here');
        //   // this.VaultFolderService.getConvertedFolder(response);
        // }
      })
    );
    this.subscriptions.push(
      this.VaultStateService.newSelectedProject.subscribe(
        (project) => {
          // console.log('vault state service is:', this.VaultStateService);
          console.log('The project is:',project);
          if (project) {
            this.selectedProject = project;
          }
        }
      )
    );

    this.subscriptions.push(
      this.VaultService.getFiles().subscribe((response:any) => {
        console.log(response);
      })
    );
   
  }

  public prepareRecentItems(recentItems) {
    console.log('recentItems are:', recentItems);
    recentItems.viewed.forEach(item => {
      let segment = item.path.split('/');
      let fileInfo = {};
      if (segment[segment.length-1] != '') {
        fileInfo = {
          "name": segment[segment.length-1],
          "Key": item.path,
          "project_id": item.project_id
        }
        this.folderFile.push(fileInfo);
      }
    });
  }

  public selectFile(folder: any) {
    this.subscriptions.push(
      this.VaultService.updateUserViewed(folder.Key).subscribe((response:any) => {
        // console.log('recent response:', response);
      })
    );
    this.subscriptions.push(
      this.VaultService.getUserViewed().subscribe((response:any) => {
        // console.log('recent response:', response);
      })
    );
  }

  public generateRecentItems() {
    return this.folderFile.reverse();
  }
  
  public openProject(project: Project) {
    if (this.selectedProject !== project)
      this.VaultStateService.updateSelectedProject(project);
  }

  public downloadFile(file: any) {
    this.isDownloading = true;
    this.subscriptions.push(
      this.VaultService.downloadFile(
        file.Key.split('/')
          .slice(0, file.Key.split('/').length - 1)
          .join('/') + '/',
        file.name
      ).subscribe(async (response: any) => {
        this.VaultService.download(response.results.effectiveUri).subscribe(
          (blob) => {
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(objectUrl);

            this.VaultStateService.addToRecent(
              file.Key,
              file.project_id
            );
          }
        );

        this.isDownloading = false;
      })
    );
  }

  public addToStarred(folder: any) {
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, 'add').subscribe(
        (response: any) => {
          console.log(response);
          this.VaultFolderService.refreshPage('recent');
        }
      )
    );
  }

  public removeFromStarred(folder: any) {
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, 'remove').subscribe(
        (response: any) => {
          console.log(response);
          this.VaultFolderService.refreshPage('recent');
        }
      )
    );
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
