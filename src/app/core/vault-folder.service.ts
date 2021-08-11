import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})

export class VaultFolderService {
    folderMap = {
        "Initiation": {
            "Design Programme":"1.01 Design Programme",
            "High Level Budget":"1.02 High-Level Budget"
        },
        "Design": {
        },
        "Procurement": {

        }, 
        "Construction": {

        }, 
        "Close-out": {

        }
    };
    originalFolder = [];
    constructor(
        private router: Router,

    ) {}

    getConvertedFolder(recentList: any) {
        var stage = '';
        var folder = '';
        var convertedFolder = [];
        
        recentList.viewed.forEach(path => {
            let pathSegment = path.path.split('/');
            let stage = pathSegment[2];
            let folder = pathSegment[3];
            if (Object.keys(this.folderMap).includes(stage)) {
                if (Object.keys(this.folderMap[stage]).includes(folder)) {
            convertedFolder.push(this.folderMap[stage][folder]);
                }
            }
        });
        // return(convertedFolder);
    }

    refreshPage(path: any) {
        this.router.navigate(['home/'+path])
            .then(() => {
            window.location.reload();
            });
    }
}