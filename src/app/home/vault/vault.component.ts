import {
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { ProjectService } from 'src/app/core/project.service';
import { UserAuthService } from 'src/app/core/user-auth.service';
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
  selectedItem: any;
  currItemName: any;
  selectedStageRename: any;
  userInfo: any;

  isStarred = false;
  isVisible = false;
  renameModalVisible = false;
  isLoadingVault = false;
  isDownloading = false;
  isDeleting = false;
  isSubmitting = false;
  prevent = false;
  allowDelete = false;
  isFolderTooltip = false;
  timer: any;

  filePath = [];

  uploadForm = new FormGroup({
    uploadType: new FormControl('1'),
    path: new FormControl(''),
    uploadedFile: new FormControl(''),
    folderName: new FormControl(''),
  });

  renameForm = new FormGroup({
    oldName: new FormControl(''),
    newName: new FormControl(''),
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
    private VaultFolderService: VaultFolderService,
    private UserAuthService: UserAuthService,
  ) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    this.uploadForm.patchValue({
      uploadedFile: this.fileList,
    });
    return false;
  };

  ngOnInit(): void {
    this.userInfo = this.UserAuthService.getUserInfo();
    this.subscriptions.push(
      this.VaultStateService.getSelectedProject().subscribe((response:any)=>{
        this.selectedProject = response;
        this.initData();
      }),
    ) ;   
    if(this.userInfo.role != 3) {
      this.allowDelete = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public initData() {
    if(this.selectedProject != undefined) {
      this.isLoadingVault = true;

      this.subscriptions.push(
        this.VaultService.getUserStarred().subscribe((response:any) => {
          this.starredList = response.starred;
        }),
      );
      
      this.subscriptions.push(
        this.ProjectService.getProjects().subscribe((response: any) => {
          this.projects = response.projects.filter(
            (p: { status: string; }) => p.status === 'Approved'
          );
          const projectVaultPaths = [];
          this.projects.forEach((p) => {
            if (p.vault_path) projectVaultPaths.push(p.vault_path);
          });
          this.subscriptions.push(
            this.VaultService.getDeletedFiles().subscribe((response: any) => {
              this.deletedFiles = response.items;
              this.subscriptions.push(
                this.ProjectService.getProjectByID(this.selectedProject.project_id).subscribe((response: any) => {
                  this.vaultDirectory = response.results.filter(
                    (dir: { Key: string; }) =>
                      projectVaultPaths.indexOf(dir.Key.split('/')[1] + '/') !==
                        -1 && this.deletedFiles.indexOf(dir.Key) === -1
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
  }
  public openProject(project: Project) {
    if (this.selectedProject !== project) {
      this.VaultStateService.updateSelectedProject(project);
    }
  }
  //get subdirectory of each folder/files inside the parent folder
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
        var found = 0;
        //if the user is on the general folders stage
        if (stage.currDirLevel == 3) {
          const tmpDir = dir.Key.split('/')[stage.currDirLevel];
          if (
            tmpDir &&
            arr.find((a) => a.name === tmpDir) === undefined &&
            (isFolder ? tmpDir.indexOf('.') === -1 : tmpDir.indexOf('.') !== -1)
          ) {
            const finalDir = dir;
            finalDir['name'] = tmpDir;
            if(this.starredList.length > 0) {
              this.starredList.forEach(item => {
                if (item.path == dir.Key) {
                  if (item.is_starred == 1) {
                    finalDir['finalStarred'] = item.is_starred;
                    found = 1;
                  } else {
                    finalDir['finalStarred'] = dir.isStarred;
                  }
                } else {
                  if ( found == 0) {
                    finalDir['finalStarred'] = (dir.isStarred) ? dir.isStarred : 0;
                  }
                }
              });
            } else {
              finalDir['finalStarred'] = 0;
            }
            if (dir.isDeleted == 0) {
              arr.push(finalDir);
            }
          }
        } else { //if the accessed folder is beyond the general folders
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
            if(this.starredList.length > 0) {
              this.starredList.forEach(item => {
                if (item.path == dir.Key) {
                  if (item.is_starred == 1) {
                    finalDir['finalStarred'] = item.is_starred;
                    found = 1;
                  } else {
                    finalDir['finalStarred'] = dir.isStarred;
                  }
                } else {
                  if (found == 0) {
                    finalDir['finalStarred'] = (dir.isStarred) ? dir.isStarred : 0;
                  }
                }
              });
            } else {
              finalDir['finalStarred'] = 0;
            }
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
    console.log('folder is:',folder);
    clearTimeout(this.timer);
    this.prevent = true;
    if (folder.name.indexOf('.') === -1) {
      this.openedFolder = folder;
      console.log(this.openedFolder);
      stage.currDirLevel += 1;
      stage.breadcrumbs.push(folder.name);
    }
    this.filePath = stage.breadcrumbs;
  }

  public copyLocation(filename: any) {

    let copiedPath = "";

    this.filePath.forEach ((p) => {
      copiedPath += p + '/';
    })
    copiedPath += filename;

    let finalClipboardText = `Project: "` + this.selectedProject.project_name + `" File path: "` + copiedPath +`"`;
    console.log(finalClipboardText);    
    
    navigator.clipboard.writeText(finalClipboardText).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });

    var x = document.getElementById("clipboard-toast");
    x.className = "show";
    x.style.zIndex = "9999";
    setTimeout(function(){ x.className = x.className.replace("show", ""); x.style.zIndex= "-9999"}, 3000);
  }

  public selectDirectory(folder: any) {
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

  public checkToolTip(stage: any, folder: any) {
    // this.isFolderTooltip = false;
    $('.file-menu-folder').click(function(e) {
      if(this.isFolderTooltip == false) {
        this.isFolderTooltip = true;
      } else {
        console.log(e.target);
      }
    });
  }
  
  public selectFile(folder: any) {
    const _this = this;
    this.timer = setTimeout(function () {
      if (!_this.prevent) {
        _this.selectedFile = _this.vaultDirectory.find(
          (dir) => dir.Key === folder.Key
        );
      }
      _this.prevent = false;
    }, 200);
    this.subscriptions.push(
      this.VaultService.updateUserViewed(folder.Key).subscribe((response:any) => {
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
    // console.log(stage.breadcrumbs);
    
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
    this.renameModalVisible = false;
    this.isSubmitting = false;
    this.currItemName = '';
  }

  public renameSubmit() {
    this.isSubmitting = true;
    // if file
    if(this.currItemName.indexOf('.') !== -1) {
      let oldPath = this.renameForm.value.oldName;
      let oldSegment = this.currItemName.split('.');
      let oldKeySegment = this.renameForm.value.oldName.split('/');

      oldSegment[0] = this.renameForm.value.newName;
      let newName = oldSegment.join('.');
      oldKeySegment[oldKeySegment.length-1] = newName;
      let newPath = oldKeySegment.join('/');

      //send form to api
      this.subscriptions.push(
        this.VaultService.rename(oldPath, newPath).subscribe((response:any) => {
          this.isSubmitting = false;
          this.vaultDirectory.forEach((p) => {
            if(p.Key == this.selectedItem.Key) {
              p.newName = newName;
            }
          })
          this.closeUploadModal();
          this.displayMessage('Succesfully renamed the file.');
        })
      );
    } else { //folder 
      let oldPath = this.renameForm.value.oldName;
      let oldKeySegment = this.renameForm.value.oldName.split('/');

      if(oldKeySegment[oldKeySegment.length-1] == '') {
        oldKeySegment[oldKeySegment.length-2] = this.renameForm.value.newName;
      } else {
        oldKeySegment[oldKeySegment.length-1] = this.renameForm.value.newName;
      }

      let newPath = oldKeySegment.join('/');

      //send form to api
      this.subscriptions.push(
        this.VaultService.rename(oldPath, newPath).subscribe((response:any) => {
          this.isSubmitting = false;
          this.vaultDirectory.forEach((p) => {
            if(p.Key == this.selectedItem.Key) {
              p.newName = this.renameForm.value.newName;
            }
          })
          this.closeUploadModal();
          this.displayMessage('Succesfully renamed the folder.');
        })
      );
    }
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
          console.log(response);
          response.results.forEach((file) => {
            this.vaultDirectory.push({
              Key: file.key,
              finalStarred:0,
              isDeleted:0,
              isStarred:0
            });
            console.log(file, this.selectedProject);
            this.VaultStateService.addToRecent(
              file,
              this.selectedProject.project_id
            );
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
            finalStarred:0,
            isDeleted:0,
            isStarred:0
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
    console.log(file);
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
          folder.finalStarred = 1;
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
          folder.finalStarred = 0;
        }
      )
    );
  }

  public openRenameModal(item: any, stage:any) {
    console.log('item is:', item);
    this.selectedStageRename = stage;
    this.selectedItem = item;
    this.currItemName = this.selectedItem.name;
    this.renameForm.patchValue({
      oldName: this.selectedItem.Key
    });
    this.renameModalVisible = true;
  }

  public deleteFile(folder: any, isFolder: boolean) {
    var objectTarget = '';
    var path = '';
    var segment = folder.Key.split('/');

    if (isFolder) {
      if (segment[segment.length-1] == "") {
        objectTarget = segment[segment.length-2];
        segment.pop();
        segment.pop();
      } else {
        objectTarget = segment[segment.length-1];
        segment.pop();
      }
    } else {
      objectTarget = segment[segment.length-1];
      segment.pop();
    }
    path = segment.join('/');
    path = path + '/';
    
    this.subscriptions.push(
      this.VaultService.deleteFile(path, objectTarget).subscribe(
        (response: any) => {
          this.vaultDirectory.forEach((p) => {
            if(p.Key == folder.Key) {
              p.isDeleted = 1;
            }
          })
        }
      )
    );
  }
  // public navigateBreadcrumb(node: any, index: number) {
  //   this.selectedNode = node;
  //   this.directoryLevel -= this.breadcrumbs.splice(index + 1).length;
  // }
}
