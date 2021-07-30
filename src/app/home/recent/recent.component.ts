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
  starredList: any;
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
      })
    );
    
    this.subscriptions.push(
      this.VaultStateService.newSelectedProject.subscribe(
        (project) => {
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
    const arr = [];
    recentItems.viewed.forEach(item => {
      let segment = item.path.split('/');
      let fileInfo = {};
      if (segment[segment.length-1] != '') {
        fileInfo = {
          "name": segment[segment.length-1],
          "Key": item.path,
          "project_id": item.project_id,
        }
        this.checkStarred(item, fileInfo);
      }
    });
  }

  public checkStarred(dir, fileInfo) {
    var found = 0;
    this.subscriptions.push(
      this.VaultService.getUserStarred().subscribe((response:any) => {
        this.starredList = response.starred;
        this.starredList.forEach(item => {
          if (dir.path == item.path) {
            if (dir.is_starred) {
              if (dir.is_starred == item.is_starred) {
                fileInfo['finalStarred'] = item.is_starred;
                found = 1;
              } else {
                fileInfo['finalStarred'] = (item.is_starred) ? item.is_starred : 0;
                found = 1;
              }
            } else {
              fileInfo['finalStarred'] = item.is_starred;
              found = 1;
            }
          }
        });
        if ( found == 0 ) {
          fileInfo['finalStarred'] = 0;
        }
        this.folderFile.push(fileInfo);
      })
    );
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

            // this.VaultStateService.addToRecent(
            //   file.Key,
            //   file.project_id
            // );
          }
        );

        this.isDownloading = false;
      })
    );
  }

  public addToStarred(folder: any) {
    var objectTarget = '';
    console.log(folder);
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, objectTarget, 'add').subscribe(
        (response: any) => {
          folder.finalStarred = 1;
        }
      )
    );
  }

  public removeFromStarred(folder: any) {
    var objectTarget = '';
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, objectTarget, 'remove').subscribe(
        (response: any) => {
          folder.finalStarred = 0;
        }
      )
    );
  }

  public getFileIcon(fileName: string) {
    if (fileName.indexOf('.') !== -1) {
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
    
}
