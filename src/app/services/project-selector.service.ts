// src/app/services/project-data.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatasourceService } from './datasource.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService implements OnDestroy {

  public projectNames: any[] = [];
  public filter_list_projects: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public _onDestroy = new Subject<void>();

  constructor(private data_api: DatasourceService) {}

  public getProjects(currentUser: any): void {
    this.projectNames = []; // reset project list
    if (currentUser.userRole === 'app_admin') {
      this.getFBProjects();
    } else if (currentUser.userRole === 'project_supervisor') {
      this.getSupervisorProjects(currentUser.user_id);
    }
  }

  private getFBProjects(): void {
    this.data_api.getFBProjectsSelection().subscribe(response => {
      const data = response.docs.map(doc => {
        const itemData = doc.data();
        itemData.id = doc.id;
        return itemData;
      });
      this.projectNames = data;
      this.filter_list_projects.next([...this.projectNames]);
    });
  }

  private getSupervisorProjects(curUserID: string): void {
    this.data_api.getFBProjectsSupervisor(curUserID).subscribe(data => {
      data.forEach(item => {
        if (!this.projectNames.find(p => p.id === item.id)) {
          this.projectNames.push(item);
        }
      });

      this.getAltSupervisorProjects(curUserID);
    });
  }

  private getAltSupervisorProjects(curUserID: string): void {
    this.data_api.getFBProjectsAltSupervisor(curUserID).subscribe(data => {
      data.forEach(item => {
        if (!this.projectNames.find(p => p.id === item.id)) {
          this.projectNames.push(item);
        }
      });

      this.filter_list_projects.next([...this.projectNames]);
    });
  }

  public applyProjectFilter(searchText: string): void {
    if (!searchText) {
      this.filter_list_projects.next([...this.projectNames]);
      return;
    }
    const filtered = this.projectNames.filter(project =>
      project.projectName?.toLowerCase().includes(searchText.toLowerCase())
    );
    this.filter_list_projects.next(filtered);
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
