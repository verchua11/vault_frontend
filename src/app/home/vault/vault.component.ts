import {
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjectService } from 'src/app/core/project.service';
import { VaultService } from 'src/app/core/vault.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { VaultStateService } from 'src/app/core/vault-state.service';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Project } from 'src/app/core/models/project.model';
import { VaultFolderService } from 'src/app/core/vault-folder.service';

declare var $;
@Component({
  selector: 'app-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss'],
})
export class VaultComponent implements OnInit, OnDestroy {
  selectedProject: Project;
  projects: Array<Project> = [];

  vaultDirectory = [];
  selectedStage: any;

  selectedNode = null;

  starredList: any;
  folders = [];
  metadata = [];
  directoryLevel = null;
  deletedFiles = [];

  openedFolder: any;
  selectedFile: any;

  isStarred = false;
  isVisible = false;
  isLoadingVault = true;
  isDownloading = false;
  isDeleting = false;
  isSubmitting = false;
  prevent = false;
  timer: any;

  uploadForm = new FormGroup({
    uploadType: new FormControl('1'),
    path: new FormControl(''),
    uploadedFile: new FormControl(''),
    folderName: new FormControl(''),
  });

  subscriptions: Subscription[] = [];

  fileList: NzUploadFile[] = [];

  stagesDnB = [
    {
      active: false,
      name: '1.0 Initiation',
      vaultDir: 'Initiation/',
      currDirLevel: 3,
      breadcrumbs: ['Initiation'],
    },
    {
      active: false,
      name: '2.0 Design',
      vaultDir: 'Design/',
      currDirLevel: 3,
      breadcrumbs: ['Design'],
    },
    {
      active: false,
      name: '3.0 Procurement',
      vaultDir: 'Procurement/',
      currDirLevel: 3,
      breadcrumbs: ['Procurement'],
    },
    {
      active: false,
      name: '4.0 Construction',
      vaultDir: 'Construction/',
      currDirLevel: 3,
      breadcrumbs: ['Construction'],
    },
    {
      active: false,
      name: '5.0 Close-out',
      vaultDir: 'Close-out/',
      currDirLevel: 3,
      breadcrumbs: ['Close-out'],
    },
  ];

  stagesTraditional = [
    {
      active: false,
      name: '1.0 Initiation',
      vaultDir: 'Initiation/',
      currDirLevel: 3,
      breadcrumbs: ['Initiation'],
    },
    {
      active: false,
      name: '2.0 Design',
      vaultDir: 'Design/',
      currDirLevel: 3,
      breadcrumbs: ['Design'],
    },
    {
      active: false,
      name: '3.0 Procurement',
      vaultDir: 'Procurement/',
      currDirLevel: 3,
      breadcrumbs: ['Procurement'],
    },
    {
      active: false,
      name: '4.0 Construction',
      vaultDir: 'Construction/',
      currDirLevel: 3,
      breadcrumbs: ['Construction'],
    },
    {
      active: false,
      name: '5.0 Close-out',
      vaultDir: 'Close-out/',
      currDirLevel: 3,
      breadcrumbs: ['Close-out'],
    },
  ];

  constructor(
    private ProjectService: ProjectService,
    private VaultService: VaultService,
    private VaultStateService: VaultStateService,
    private message: NzMessageService,
    private VaultFolderService: VaultFolderService
  ) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    this.uploadForm.patchValue({
      uploadedFile: this.fileList,
    });
    return false;
  };

  ngOnInit(): void {
    this.isLoadingVault = true;
    this.subscriptions.push(
      this.VaultService.getUserStarred().subscribe((response:any) => {
        this.starredList = response.starred;
        console.log(this.starredList);
      })
    );
    
    this.subscriptions.push(
      this.ProjectService.getProjects().subscribe((response: any) => {
        this.projects = response.projects.filter(
          (p) => p.status === 'Approved'
        );
        // console.log('projects are: ', this.projects);
        const projectVaultPaths = [];
        this.projects.forEach((p) => {
          if (p.vault_path) projectVaultPaths.push(p.vault_path);
        });
        // console.log('projects paths are: ', projectVaultPaths);

        this.subscriptions.push(
          this.VaultService.getDeletedFiles().subscribe((response: any) => {
            this.deletedFiles = response.items;
            // console.log('deleted files are:', this.deletedFiles);
            this.subscriptions.push(
              this.VaultService.getFiles().subscribe((response: any) => {
                this.vaultDirectory = response.results.filter(
                  (dir) =>
                    projectVaultPaths.indexOf(dir.Key.split('/')[1] + '/') !==
                      -1 && this.deletedFiles.indexOf(dir.Key) === -1
                );

                this.subscriptions.push(
                  this.VaultStateService.newSelectedProject.subscribe(
                    (project) => {
                      if (project) {
                        this.selectedProject = project;
                      // console.log('selected project is:', this.selectedProject);
                      }
                    }
                  )
                );
                this.isLoadingVault = false;
              },
              (error) => {
                console.log('no files detected');
                this.isLoadingVault = false;
              }),
            );
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public openProject(project: Project) {
    if (this.selectedProject !== project) {
      this.VaultStateService.updateSelectedProject(project);
    }
  }
    
  public getSubdirectory(stage: any, isFolder: boolean) {
    const arr = [];
    this.vaultDirectory
      .filter(
        (dir) =>
          dir.Key.indexOf(
            'projects/' + this.selectedProject.vault_path + stage.vaultDir
          ) !== -1
      )
      .forEach((dir) => {
        if (stage.currDirLevel == 3) {
          const tmpDir = dir.Key.split('/')[stage.currDirLevel];
          if (
            tmpDir &&
            arr.find((a) => a.name === tmpDir) === undefined &&
            (isFolder ? tmpDir.indexOf('.') === -1 : tmpDir.indexOf('.') !== -1)
          ) {
            const finalDir = dir;
            finalDir['name'] = tmpDir;

            this.starredList.forEach(item => {
              if (item.path == dir.Key) {
                if (item.is_starred == dir.isStarred) {
                  finalDir['finalStarred'] = (dir.isStarred)?dir.isStarred:0;
                } else {
                  finalDir['finalStarred'] = item.is_starred;
                }
              } else {
                finalDir['finalStarred'] = (dir.isStarred)?dir.isStarred:0;
              }
            });
            if (dir.isDeleted == "0" || !dir.isDeleted) {
              arr.push(finalDir);
            }
          }
        } else {
          const tmpDir = dir.Key.split('/')[stage.currDirLevel - 1];
          const content = dir.Key.split('/')[stage.currDirLevel];
          if (
            content &&
            tmpDir === this.openedFolder.name &&
            arr.find((a) => a.name === content) === undefined &&
            (isFolder
              ? content.indexOf('.') === -1
              : content.indexOf('.') !== -1)
          ) {
            const finalDir = dir;
            finalDir['name'] = content;

            this.starredList.forEach(item => {
              if (item.path == dir.Key) {
                if (item.is_starred == dir.isStarred) {
                  finalDir['finalStarred'] = (dir.isStarred)?dir.isStarred:0;
                } else {
                  finalDir['finalStarred'] = item.is_starred;
                }
              } else {
                finalDir['finalStarred'] = (dir.isStarred)?dir.isStarred:0;
              }
            });
            if (dir.isDeleted == 0) {
              arr.push(finalDir);
            }
          }
        }
      });
    return arr;
  }
  
  public capitalizeFirstLetter(dir: any) {
    return dir.charAt(0).toUpperCase() + dir.slice(1);
  }

  public openDirectory(stage: any, folder: any) {
    // console.log('stage is:', stage);
    // console.log('folder is:',folder);
    clearTimeout(this.timer);
    this.prevent = true;
    if (folder.name.indexOf('.') === -1) {
      this.openedFolder = folder;
      stage.currDirLevel += 1;
      stage.breadcrumbs.push(folder.name);
    }
  }

  public selectDirectory(folder: any) {
    // console.log('Directory is:',folder);
    const _this = this;
    this.timer = setTimeout(function () {
      if (!_this.prevent) {
        _this.selectedFile = _this.vaultDirectory.find(
          (dir) => dir.Key === folder.Key
        );
      }
      _this.prevent = false;
    }, 200);
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

  public navigateBreadcrumb(stage: any, index: number) {
    index += 3;
    stage.currDirLevel = index;
    this.openedFolder = this.vaultDirectory.find(
      (dir) =>
        dir.Key ===
        this.openedFolder.Key.split('/')
          .slice(0, this.openedFolder.Key.split('/').length - 2)
          .join('/') +
          '/'
    );
    const newBreadcrumbs = [];
    for (let i = 0; i < index - 2; i++) {
      newBreadcrumbs.push(stage.breadcrumbs[i]);
    }
    stage.breadcrumbs = newBreadcrumbs;
  }

  public getFormattedDate(date: string) {
    return moment(date).format('MMM DD, YYYY');
  }

  public openFolderUploadModal(stage: any) {
    this.selectedStage = stage;
    this.resetForm();
    this.uploadForm.patchValue({
      uploadType: '2',
    });
    this.isVisible = true;
  }

  public closeUploadModal() {
    this.isVisible = false;
  }

  public submitUpload() {
    this.isSubmitting = true;
    if (this.uploadForm.value.uploadType === '1') {
      this.subscriptions.push(
        this.VaultService.uploadFile(
          this.uploadForm.value.uploadedFile,
          'projects/' +
            this.selectedProject.vault_path +
            this.selectedStage.vaultDir +
            this.selectedStage.breadcrumbs.slice(1).join('/') +
            '/'
        ).subscribe((response: any) => {
          response.results.forEach((file) => {
            this.vaultDirectory.push({
              Key: file,
            });
            // this.VaultStateService.addToRecent(
            //   file,
            //   this.selectedProject.project_id
            // );
          });
          this.isSubmitting = false;
          this.selectedStage = null;
          this.closeUploadModal();
          this.displayMessage('Uploading file complete.');
        })
      );
    } else {
      this.subscriptions.push(
        this.VaultService.uploadFolder(
          this.uploadForm.value.folderName,
          'projects/' +
            this.selectedProject.vault_path +
            this.selectedStage.vaultDir +
            this.selectedStage.breadcrumbs.slice(1).join('/') +
            '/'
        ).subscribe((response: any) => {
          this.vaultDirectory.push({
            Key: response.results.substring(0, response.results.length - 1),
          });
          this.isSubmitting = false;
          this.selectedStage = null;
          this.closeUploadModal();
          this.displayMessage('Creating new folder complete.');
        })
      );
    }
  }

  private resetForm() {
    this.uploadForm.reset();
    this.fileList = [];
  }

  private displayMessage(msg: string): void {
    this.message.info(msg);
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

  public openFileUploadModal(stage: any) {
    this.selectedStage = stage;
    this.resetForm();
    this.uploadForm.patchValue({
      uploadType: '1',
    });
    this.isVisible = true;
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
            //   this.selectedProject.project_id
            // );
          }
        );

        this.isDownloading = false;
      })
    );
  }

  public addToStarred(folder: any, isFolder: boolean) {
    var objectTarget = '';

    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, objectTarget, 'add').subscribe(
        (response: any) => {
          folder.isStarred = 1;
        }
      )
    );
  }

  public removeFromStarred(folder: any, isFolder: boolean) {
    var objectTarget = '';

    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, objectTarget, 'remove').subscribe(
        (response: any) => {
          folder.isStarred = 0;
        }
      )
    );
  }

  public deleteFile(folder: any, isFolder: boolean) {
    var objectTarget = '';
    var segment = folder.Key.split('/');

    if (segment[segment.length-1] == "") {
      objectTarget = segment[segment.length-1];
    } else {
      objectTarget = segment[segment.length-2];
    }

    this.subscriptions.push(
      this.VaultService.deleteFile(folder.Key, objectTarget).subscribe(
        (response: any) => {
          console.log(response);
          folder.deleted = 1;
        }
      )
    );
  }
  // public navigateBreadcrumb(node: any, index: number) {
  //   this.selectedNode = node;
  //   this.directoryLevel -= this.breadcrumbs.splice(index + 1).length;
  // }
}
