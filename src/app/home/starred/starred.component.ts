import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';
import { VaultFolderService } from 'src/app/core/vault-folder.service';

declare var $;

@Component({
  selector: 'app-starred',
  templateUrl: './starred.component.html',
  styleUrls: ['./starred.component.scss'],
})
export class StarredComponent implements OnInit {
  projects: Array<Project> = [];
  selectedProject: Project;
  recentItems: any;

  isFolder = false;
  isFile = false;
  isDownloading = false;

  folderFile = [];
  fileList = [];
  folderList = [];
  files = [];
  selectedFile: any;

  subscriptions: Subscription[] = [];
  constructor(
    private ProjectService: ProjectService,
    private VaultStateService: VaultStateService,
    private VaultService: VaultService,
    private VaultFolderService: VaultFolderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.VaultService.getUserStarred().subscribe((response:any) => {
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
  }

  public prepareRecentItems(recentItems) {
    console.log('recentItems are:', recentItems);
    if(recentItems.starred) {
      recentItems.starred.forEach(item => {
        let segment = item.path.split('/');
        let fileInfo = {};
        let folderInfo = {};
  
        if (segment.length > 2) {
          //if folder
          if (segment[segment.length-1] == "") {
            folderInfo = {
              "name": segment[segment.length-2],
              "Key": item.path,
              "project_id": item.project_id,
              "starred_type": "folder",
            }
            this.folderList.push(folderInfo);
          } else { //else, file
            fileInfo = {
              "name": segment[segment.length-1],
              "Key": item.path,
              "project_id": item.project_id,
              "starred_type": "file"
            }
            this.fileList.push(fileInfo);
          }
        }
      });
      this.folderFile['folder'] = this.folderList;
      this.folderFile['file'] = this.fileList;
  
      if (this.folderFile['folder'].length > 0) {
        this.isFolder = true;
      }
  
      if (this.folderFile['file'].length > 0) {
        this.isFile = true;
      }
    }
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

  public generateRecentItems(section: any) {
    if (this.folderFile[section]) {
      return this.folderFile[section].reverse();
    }
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

  public removeFromStarred(folder: any) {
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, 'remove').subscribe(
        (response: any) => {
          console.log(folder.Key);
          this.VaultFolderService.refreshPage('starred');
        }
      )
    );
  }

  public deleteFile(item: any) {
    let project_id = item.project_id;
    let path = item.path;
    this.subscriptions.push(
      this.VaultService.deleteFile(project_id, path).subscribe(
        (response: any) => {
          console.log(response);
          // this.VaultFolderService.refreshPage('starred');
        }
      )
    );
    this.viewDeletedFile();
  }

  public viewDeletedFile() {
    this.subscriptions.push(
      this.VaultService.viewDeletedFile().subscribe(
        (response: any) => {
          console.log(response);
          // this.VaultFolderService.refreshPage('starred');
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
