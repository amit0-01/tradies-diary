import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef, Input, Inject, HostListener} from '@angular/core';
import { DatasourceService} from '../services/datasource.service';
import { LocalDataSource } from 'ng2-smart-table';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
// import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import * as ExcelJS from "exceljs/dist/exceljs.min.js"
import * as fs from 'file-saver'
// import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import swal from 'sweetalert2';
import { RoleChecker } from '../services/role-checker.service';
import { NgxSpinnerService } from "ngx-spinner";
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MyService} from '../services/image-upload-service'; 
// import { DailyDeleteRenderComponent } from './dailybutton-render.component';
// import { WeeklyDeleteRenderComponent } from './weeklybutton-render.component';
import { AuthenticationService } from '../shared/authentication.service';
import * as moment from 'moment';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import {  first, reduce, map, finalize  } from 'rxjs/operators';
import { NgxProgressOverlayService } from 'ngx-progress-overlay';
import { getStorage, ref, list, listAll } from "firebase/storage";
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, Observer, Subject } from 'rxjs';
import * as Highcharts from 'highcharts';
import { WorkerLogsImageRenderComponent } from './workerlogsimagesbutton/workerlogsimagesbutton';
import { MatDialog } from '@angular/material/dialog';
declare const $: any;


@Component({
  selector: 'app-dashboardnew',
  templateUrl: './dashboard.component.html',
  styles : [`
:host ::ng-deep .material-icons {
    font-size: 13px;
    color: black;
  }`]
})  
export class DashboardNewComponent {
  datataableOptiions = {
    data: [],
    columns: [],
    paging: false,  
    searching: false, 
    destroy: true, 
  };
  latestDailyReportsLogsOptions = {...this.datataableOptiions};
  dtTriggerLatestDailyReport : Subject<any> = new Subject;
  latestWeeklyReportOptions = {...this.datataableOptiions};
  dtTriggerLatestWeeklyReport: Subject<any> = new Subject();
  latestWokerEntryLogsOptions = {...this.datataableOptiions};
  dtTriggerWorker: Subject <any> = new Subject();
  latestProjectsCreatedOptions = {...this.datataableOptiions};
  dtTriggerLatestProject : Subject<any> = new Subject();
  dashboardSearchDateDailyOptions:any = {...this.datataableOptiions};
  dtTriggerSearchDateDaily : Subject <any> = new Subject();
  dashboardSearchDateWeeklyOptions = {...this.datataableOptiions};
  dtTriggerSearchDateWeekly : Subject<any> = new Subject();
  dashboardSearchDateWorkerOptions = {...this.datataableOptiions}
  dtTriggerSearchDateWorker:  Subject<any> = new Subject();
  dashboardSearchProjectsOptions  = {...this.datataableOptiions};
  dtTriggerSearchProjects : Subject<any> = new Subject();
  dashboardSearchProjectDailyOptions = {...this.datataableOptiions};
  dtTriggerSearchProjectDaily : Subject<any> = new Subject();
  dashboardSearchProjectWeeklyOptions ={ ...this.datataableOptiions };
  dtTriggerSearchProjectWeekly : Subject<any> = new Subject();
  dashboardSearchProjectWorkerOptions = {... this.datataableOptiions};
  dtTriggerSearchProjectWorker : Subject<any> = new Subject();
  dashboardSearchWorkerOptions = {... this.datataableOptiions};
  dtTriggerSearchWorker : Subject<any> = new Subject();
  dashboardSearchSupervisorDailyOptions = {... this.datataableOptiions};
  dtTriggerSearchSupervisorDaily : Subject<any> = new Subject();
  dashboardSearchTradesDailyOptions = {...this.datataableOptiions};
  dtTriggerSearchTradesDaily: Subject<any> = new Subject();

  
  public dashboardWorkerList = [];
  public dashboardDailyReportList = [];
  public dashboardWeeklyReportList = [];
  public dashboardProjectsList = [];
  public dashboardWorkerImagesList = [];
  public dashboardTradesList = [];
  public dashboardUsersList = [];

  public projectNames = [];

  public dashboardSearchDateDailyReportList = [];
  public dashboardSearchDateWeeklyReportList = [];
  public dashboardSearchDateWorkerList = [];
  public dashboardSearchProjectList = [];
  public dashboardSearchProjectDailyList = [];
  public dashboardSearchProjectWeeklyList = [];
  public dashboardSearchProjectWorkerList = [];
  public dashboardSearchWorkerList = [];
  public dashboardSearchSupervisorDailyList = [];
  public dashboardSearchTradesDailyList = [];

  public dashboardSearchWorkerId;
  public dashboardSearchSupervisorDailyId;
  public dashboardSearchTradesDailyId;

  searchWorkerTableData: any[] = [];
  searchWorkerFirstInResponse: any = [];
  searchWorkerLastInResponse: any = [];
  searchWorkerPrev_strt_at: any = [];
  searchWorkerPagination_clicked_count = 0;
  searchWorkerDisable_next: boolean = false;
  searchWorkerDisable_prev: boolean = false;

  searchTradesTableData: any[] = [];
  searchTradesFirstInResponse: any = [];
  searchTradesLastInResponse: any = [];
  searchTradesPrev_strt_at: any = [];
  searchTradesPagination_clicked_count = 0;
  searchTradesDisable_next: boolean = false;
  searchTradesDisable_prev: boolean = false;

  searchSupervisorTableData: any[] = [];
  searchSupervisorFirstInResponse: any = [];
  searchSupervisorLastInResponse: any = [];
  searchSupervisorPrev_strt_at: any = [];
  searchSupervisorPagination_clicked_count = 0;
  searchSupervisorDisable_next: boolean = false;
  searchSupervisorDisable_prev: boolean = false;

  accountFirebase;


  public selected: any
  userCountsByDate:any
  productCountsByDate:any
  workerImagesWithInfo:any[]
  dailyReportImagesWithInfo:any
  users:any


  // public dashboardWorkerSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   selectedRowIndex: -1,
  //   columns: {
  //     worker_name: {
  //       title: 'Name',
  //       width: '300px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return this.filterWorkers.find(o => o.id === row.workerID)?.userFirstName + ' ' +this.filterWorkers.find(o => o.id === row.workerID)?.userLastName;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project',
  //       width: '300px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     number_images: {
  //       title: 'No. Images',
  //       width: '120px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.imageUpload.length;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.selectedDate ? row.selectedDate.toDate().toDateString(): '';
  //       }
  //     },
  //     entry_status: {
  //       title: 'Entry Status',
  //       width: '10%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.entryStatus;
  //       }
  //     },
  //     notes: {
  //       title: 'Accomplishments',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return this.beautifyNotes(row.accomplishments);
  //       }
  //     },
  //     // start: {
  //     //   title: 'Start',
  //     //   width: '8%',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.start;
  //     //   }
  //     // },
  //     // break: {
  //     //   title: 'Break',
  //     //   width: '8%',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.break;
  //     //   }
  //     // },
  //     // finish: {
  //     //   title: 'Finish',
  //     //   width: '8%',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.finish;
  //     //   }
  //     // },
  //     // entry_status: {
  //     //   title: 'Status',
  //     //   width: '10%',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.entry_status + ' ' + (row.modified_by ? "(modified by "+row.modified_by+")" : "") + ' ' + (row.modified_date ? "(updated last "+moment(row.modified_date).format('MM/DD/YYYY')+")" : "");
  //     //   }
  //     // },
  //   }
  // };

//  public dashboardDailyReportSettings = {
//     actions: { 
//       delete: false,
//       add: false,
//       edit: false,
//       //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
//     },
//     pager: {
//       display: false,
//     },
//     attr: {
//       class: 'table'
//     },
//     hideSubHeader: true,
//     mode: 'external',
//     selectedRowIndex: -1,
//     columns: {
//       customactions: {
//         width: '80px',
//         title: '',
//         type : 'html',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//           return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}"><i class="material-icons">edit</i></a>
//                   <a target="_blank" href="${row.pdfLink}"><i class="material-icons">download</i></a>
//                   `;
//         }
//       },
//       report_number: {
//         title: 'Report No.',
//         width: '100px',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//           return row.reportNumber;
//         }
//       },
//       project_name: {
//         title: 'Project Name',
//         width: '350px',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//           return this.projectNames.find(o => o.id === row.projectId)?.projectName;
//         }
//       },
//       entry_date: {
//         title: 'Entry Date',
//         width: '150px',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//             return row.todaysDate ? row.todaysDate.toDate().toDateString(): '';
//         }
//       },
//       number_trades: {
//         title: 'No. Trades',
//         width: '120px',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//           return row.tradeFormArray.length;
//         }
//       },
//       number_visitors: {
//         title: 'No. Visitors',
//         width: '120px',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//           return row.visitorFormArray.length;
//         }
//       },
//       number_images: {
//         title: 'No. Images',
//         width: '120px',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//           return row.imageUpload.length;
//         }
//       },
//       created_at: {
//         title: 'Created At',
//         filter: false,
//         sort: false,
//         valuePrepareFunction: (cell,row) => {
//             return row.createdAt ? row.createdAt.toDate().toString(): '';
//         }
//       },
//     }
//   };

  // public dashboardWeeklyReportSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   selectedRowIndex: -1,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '80px',
  //       title: '',
  //       type : 'html',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/weekly-report/edit/${row.id}"><i class="material-icons">edit</i></a>
  //         <a target="_blank" href="${row.pdfLink}"><i class="material-icons">download</i></a>
  //         `;
  //       }
  //     },
  //     report_number: {
  //       title: 'Report #',
  //       width: '100px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.reportNumber;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       width: '350px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return  row.weekendDate ? row.weekendDate.toDate().toDateString(): ''; 
  //           //this.formatDate(row.weekendDate);
  //       }
  //     },
  //     number_images: {
  //       title: 'No. Images',
  //       width: '120px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.imageUpload ? row.imageUpload.length: '0'; 
  //       }
  //     },
  //     // supervisor_name: {
  //     //   title: 'Supervisor Name',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.supervisor_name;
  //     //   }
  //     // },
  //     // lost_days_week : {
  //     //   title: 'Total Days Lost',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     //return Math.floor( (row.lost_hours_week /8) );
  //     //     return row.lostTotalDays;
  //     //   }
  //     // },
  //     // lost_hours_week : {
  //     //   title: 'Total Hours Lost',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       //return ( (row.lost_hours_week / 8) - Math.floor( (row.lost_hours_week /8) ) ) * 8;
  //     //       return row.lostTotalHours;
  //     //   }
  //     // },
  //     created_at: {
  //       title: 'Created At',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.createdAt ? row.createdAt.toDate().toString(): '';
  //       }
  //     },
  //   }
  // };

  // public dashboardProjectsSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   selectedRowIndex: -1,
  //   columns: {
  //     customactions: {
  //       width: '80px',
  //       title: '',
  //       type : 'html',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a href="#/projects/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.projectName;
  //       }
  //     },
  //     project_address: {
  //       title: 'Project Address',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.projectAddress;
  //       }
  //     },
  //     job_number: {
  //       title: 'Job Number',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.jobNumber;
  //       }
  //     },    
  //   }
  // };

  public dashboardTradesSettings = {
    actions: { 
      delete: false,
      add: false,
      edit: false,
      //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
    },
    pager: {
      display: false,
    },
    attr: {
      class: 'table'
    },
    hideSubHeader: true,
    mode: 'external',
    columns: {
      customactions: {
        width: '80px',
        title: 'Action',
        type : 'html',
        filter: false,
        valuePrepareFunction: (cell,row) => {
          return `<a href="#/trades/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        }
      }, 
      company_name: {
        title: 'Company Name',
        valuePrepareFunction: (cell,row) => {
            return row.company_name;
        }
      },
      email: {
        title: 'Email',
        valuePrepareFunction: (cell,row) => {
            return row.email;
        }
      },
      phone: {
        title: 'Phone',
        valuePrepareFunction: (cell,row) => {
            return row.phone;
        }
      },
    }
  };

  public dashboardUsersSettings = {
    actions: { 
      delete: false,
      add: false,
      edit: false,
      //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
    },
    attr: {
      class: 'table'
    },
    pager : {
      display : false,
    },
    hideSubHeader: true,
    mode: 'external',
    columns: {
      UserID: {
        title: 'ID',
        valuePrepareFunction: (cell,row) => {
          return row.id;
        }
      },
      DisplayName: {
        title: 'Full Name',
        valuePrepareFunction: (cell,row) => {
          return row.display_name;
        }
      },
      EmailAddress: {
        title: 'Email Address',
        valuePrepareFunction: (cell,row) => {
          return row.user_email;
        }
      },
    }
  };

  // public dashboardSearchDateDailySettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}"><i class="material-icons">preview</i></a>
  //         `;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //           return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.todaysDate ? row.todaysDate.toDate().toDateString(): '';
  //       }
  //     },
  //     num_of_trades: {
  //       title: 'Trades On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.tradeFormArray);
  //       }
  //     },
  //     num_of_staff: {
  //       title: 'Staff On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.staffFormArray);
  //       }
  //     },
  //     num_of_visitors: {
  //       title: 'Visitors On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.visitorFormArray);
  //       }
  //     },
  //   }
  // };

  // public dashboardSearchDateWeeklySettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/weekly-report/edit/${row.id}"><i class="material-icons">preview</i></a>
  //         `;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.weekendDate ? row.weekendDate.toDate().toDateString(): '';
  //       }
  //     },
  //     lost_days_week : {
  //       title: 'Total Days Lost',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.lostWeekDays ? row.lostWeekDays : 0;
  //       }
  //     },
  //     lost_hours_week : {
  //       title: 'Total Hours Lost',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.lostWeekHours ? row.lostWeekHours : 0;
  //       }
  //     },
  //   }
  // };

  // public dashboardSearchDateWorkerSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     worker_name: {
  //       title: 'Name',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //           return this.filterWorkers.find(o => o.id === row.workerID)?.userFirstName + ' ' +this.filterWorkers.find(o => o.id === row.workerID)?.userLastName;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.selectedDate ? row.selectedDate.toDate().toDateString(): '';
  //       }
  //     },
  //     notes: {
  //       title: 'Notes',
  //       width: '25%',
  //       valuePrepareFunction: (cell,row) => {
  //           return this.beautifyNotes(row.accomplishments);
  //       }
  //     },
  //     start: {
  //       title: 'Start',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.start;
  //       }
  //     },
  //     break: {
  //       title: 'Break',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.break;
  //       }
  //     },
  //     finish: {
  //       title: 'Finish',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.finish;
  //       }
  //     },
  //   }
  // };

  // public dashboardSearchProjectsSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/projects/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.projectName;
  //       }
  //     },
  //     project_address: {
  //       title: 'Project Address',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.projectAddress;
  //       }
  //     },
  //     job_number: {
  //       title: 'Job Number',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.jobNumber;
  //       }
  //     },    
  //   }
  // };

  // public dashboardSearchProjectDailySettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}"><i class="material-icons">preview</i></a>
  //         `;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //          return row.todaysDate ? row.todaysDate.toDate().toDateString(): '';
  //       }
  //     },
  //     num_of_trades: {
  //       title: 'Trades On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.tradeFormArray);
  //       }
  //     },
  //     num_of_staff: {
  //       title: 'Staff On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.staffFormArray);
  //       }
  //     },
  //     num_of_visitors: {
  //       title: 'Visitors On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.visitorFormArray);
  //       }
  //     },
  //   }
  // };

  // public dashboardSearchProjectWeeklySettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/weekly-report/edit/${row.id}"><i class="material-icons">preview</i></a>
  //         `;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.weekendDate ? row.weekendDate.toDate().toDateString(): '';
  //       }
  //     },
  //     // supervisor_name: {
  //     //   title: 'Supervisor Name',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.supervisor_name;
  //     //   }
  //     // },
  //     lost_days_week : {
  //       title: 'Total Days Lost',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.lostWeekDays ? row.lostWeekDays : 0;
  //       }
  //     },
  //     lost_hours_week : {
  //       title: 'Total Hours Lost',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.lostWeekHours ? row.lostWeekHours : 0;
  //       }
  //     },
  //   }
  // };

  // public dashboardSearchProjectWorkerSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     worker_name: {
  //       title: 'Name',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.filterWorkers.find(o => o.id === row.workerID)?.userFirstName + ' ' +this.filterWorkers.find(o => o.id === row.workerID)?.userLastName;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.selectedDate ? row.selectedDate.toDate().toDateString(): '';
  //       }
  //     },
  //     notes: {
  //       title: 'Notes',
  //       width: '25%',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.beautifyNotes(row.accomplishments);
  //       }
  //     },
  //     start: {
  //       title: 'Start',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.start;
  //       }
  //     },
  //     break: {
  //       title: 'Break',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.break;
  //       }
  //     },
  //     finish: {
  //       title: 'Finish',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.finish;
  //       }
  //     },
  //     // entry_status: {
  //     //   title: 'Status',
  //     //   width: '10%',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.entry_status + ' ' + (row.modified_by ? "(modified by "+row.modified_by+")" : "") + ' ' + (row.modified_date ? "(updated last "+moment(row.modified_date).format('MM/DD/YYYY')+")" : "");
  //     //   }
  //     // },
  //   }
  // };

  // public dashboardSearchWorkerSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     worker_name: {
  //       title: 'Name',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.filterWorkers.find(o => o.id === row.workerID)?.userFirstName + ' ' +this.filterWorkers.find(o => o.id === row.workerID)?.userLastName;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       width: '15%',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.selectedDate ? row.selectedDate.toDate().toDateString(): '';
  //       }
  //     },
  //     notes: {
  //       title: 'Notes',
  //       width: '25%',
  //       valuePrepareFunction: (cell,row) => {
  //           return this.beautifyNotes(row.accomplishments);
  //       }
  //     },
  //     start: {
  //       title: 'Start',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.start;
  //       }
  //     },
  //     break: {
  //       title: 'Break',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.break;
  //       }
  //     },
  //     finish: {
  //       title: 'Finish',
  //       width: '8%',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.finish;
  //       }
  //     },
  //     // entry_status: {
  //     //   title: 'Status',
  //     //   width: '10%',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.entry_status + ' ' + (row.modified_by ? "(modified by "+row.modified_by+")" : "") + ' ' + (row.modified_date ? "(updated last "+moment(row.modified_date).format('MM/DD/YYYY')+")" : "");
  //     //   }
  //     // },
  //   }
  // };

  // public dashboardSearchSupervisorDailySettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}"><i class="material-icons">preview</i></a>
  //         `;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.todaysDate ? row.todaysDate.toDate().toDateString(): '';
  //       }
  //     },
  //     num_of_trades: {
  //       title: 'Trades On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.tradeFormArray);
  //       }
  //     },
  //     num_of_staff: {
  //       title: 'Staff On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.staffFormArray);
  //       }
  //     },
  //     num_of_visitors: {
  //       title: 'Visitors On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.visitorFormArray);
  //       }
  //     },
  //   }
  // };

  // public dashboardSearchTradesDailySettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}"><i class="material-icons">preview</i></a>
  //         `;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.todaysDate ? row.todaysDate.toDate().toDateString(): '';
  //       }
  //     },
  //     num_of_trades: {
  //       title: 'Trades On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.tradeFormArray);
  //       }
  //     },
  //     num_of_staff: {
  //       title: 'Staff On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.staffFormArray);
  //       }
  //     },
  //     num_of_visitors: {
  //       title: 'Visitors On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.visitorFormArray);
  //       }
  //     },
  //   }
  // };

  dashboardWorkerImagesSetting = {
    actions: { 
      delete: false,
      add: false,
      edit: false,
      //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
    },
    pager: {
      display: false,
    },
    attr: {
      class: 'table'
    },
    hideSubHeader: true,
    mode: 'external',
    selectedRowIndex: -1,
    columns: {
      worker_name: {
        title: 'Worker',
        width: '300px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          // console.log('this.worker', this.filterWorkers)
          // console.log('row',row)
          // console.log('this.filterworkers',this.filterWorkers.find(o => o?.id === row?.workerID))
          const worker = this.filterWorkers.find(o => o?.id === row?.workerID);
          return worker ? worker.userFirstName + " " + worker.userLastName : '';
        }
      },
      project_name: {
        title: 'Project',
        width: '300px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
        }
      },
      created_date: {
        title: 'Created Date',
        width: '120px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.createdAt ? row.createdAt.toDate().toDateString() : '';
        }
      },
      image: {
        title: 'Image',
        type : 'custom',
        width: '200px',
        valuePrepareFunction: (cell,row)  => row,
            renderComponent: WorkerLogsImageRenderComponent,
            onComponentInitFunction :(instance) => {
                instance.save.subscribe(row => {
                  // console.log(row);
                });
            }
      },
    }
  };

  filterLogsForm: FormGroup;

  public filterUsers = [];
  public filterWorkers = [];
  public filterSupervisors = [];
  public filterTrades = [];

  searchChoices = [
      {value: 'entry_date', viewValue: 'Entry Date'},
      {value: 'project_id', viewValue: 'Project'},
      {value: 'supervisor_id', viewValue: 'Supervisor'},
      {value: 'worker_id', viewValue: 'Workers'},
      {value: 'trades_id', viewValue: 'Trades'},
    ]
  
  recentDailyReportImages = [];
  recentWeeklyReportImages = [];
  recentWorkerImages = [];
  recentWorkerEntries = [];

  galleryOptionsDaily: NgxGalleryOptions[];
  galleryOptionsWorker: NgxGalleryOptions[];
  galleryDailyReportImages: NgxGalleryImage[];
  galleryWeeklyReportImages: NgxGalleryImage[];
  galleryWorkerImages: NgxGalleryImage[];

  public userDetails;
  public sortDashboard = [];
  
  adminData;

  colorBtnDefault;

  constructor(
    private data_api: DatasourceService,
    private formBuilder: FormBuilder,
    // private spinnerService: Ng4LoadingSpinnerService,
    public dialog: MatDialog,
    private renderer2: Renderer2,
    private e: ElementRef,
    private rolechecker: RoleChecker,
    private spinnerService: NgxSpinnerService,
    private router: Router,
    private myService: MyService,
    public authService: AuthenticationService,
    private afStorage: AngularFireStorage,
    private progressOverlay: NgxProgressOverlayService,
    private afs: AngularFirestore
    ) { }

  public ngOnInit() {
    this.getAdminSettings();
    // this.validateToken();
    // this.rolechecker.check(4);
    // this.getDasboardWorkerLogs();
    // this.getAllUsers();

    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
      // console.log(this.userDetails);
    }
    
    this.arrangeDashboard();

      this.galleryOptionsDaily = [
          { 
            "image": false,  width: '100%', "height": "400px", "imageSize": "700px", 
            thumbnailsColumns: 12, 
            "thumbnailsRows": 2, 
            // "previewDownload": true, 
            "arrowPrevIcon": "fa fa-arrow-circle-o-left", 
            "arrowNextIcon": "fa fa-arrow-circle-o-right",
            imageAnimation: NgxGalleryAnimation.Slide ,
            actions : [{icon: 'fa fa-download', onClick: this.downloadImageDaily.bind(this), titleText: 'download'}]
          },
          {
            breakpoint: 1200,
            thumbnailsColumns: 6,
          },
          {
            breakpoint: 1000,
            thumbnailsColumns: 5,
          },
          {
              breakpoint: 800,
              thumbnailsColumns: 4,
          },
          {
            breakpoint: 600,
            thumbnailsColumns: 2,
          },
          {
              breakpoint: 400,
              thumbnailsColumns: 1,
          }
      ];

      // OLD

    //   this.galleryOptionsWorker = [
    //     { 
    //       "image": false,  width: '100%', "height": "400px", "imageSize": "700px", 
    //       thumbnailsColumns: 12, 
    //       "thumbnailsRows": 2, 
    //       // "previewDownload": true, 
    //       "arrowPrevIcon": "fa fa-arrow-circle-o-left", 
    //       "arrowNextIcon": "fa fa-arrow-circle-o-right",
    //       imageAnimation: NgxGalleryAnimation.Slide ,
    //       actions : [{icon: 'fa fa-download', onClick: this.downloadImageWorker.bind(this), titleText: 'download'}]
    //     },
    //     {
    //       breakpoint: 1200,
    //       thumbnailsColumns: 6,
    //     },
    //     {
    //       breakpoint: 1000,
    //       thumbnailsColumns: 5,
    //     },
    //     {
    //         breakpoint: 800,
    //         thumbnailsColumns: 4,
    //     },
    //     {
    //       breakpoint: 600,
    //       thumbnailsColumns: 2,
    //     },
    //     {
    //         breakpoint: 400,
    //         thumbnailsColumns: 1,
    //     }
    // ];


    // NEW 
    
    this.galleryOptionsWorker = 
  //   [
  //     { 
  //       "imageAutoPlay": true, "imageAutoPlayPauseOnHover": true, "previewAutoPlay": true, "previewAutoPlayPauseOnHover": true,
  //       "image": false,  width: '100%', "height": "300px", "imageSize": "700px", 
  //       thumbnailsColumns: 1, 
  //       "thumbnailsRows": 1, 
  //       // "previewDownload": true, 
  //       "arrowPrevIcon": "fa fa-arrow-circle-o-left", 
  //       "arrowNextIcon": "fa fa-arrow-circle-o-right",
  //       imageAnimation: NgxGalleryAnimation.Slide ,
  //       actions : [{icon: 'fa fa-download', onClick: this.downloadImageWorker.bind(this), titleText: 'download'}]
  //     },
  //     {
  //       breakpoint: 1200,
  //       thumbnailsColumns: 6,
  //     },
  //     {
  //       breakpoint: 1000,
  //       thumbnailsColumns: 5,
  //     },
  //     {
  //         breakpoint: 800,
  //         thumbnailsColumns: 4,
  //     },
  //     {
  //       breakpoint: 600,
  //       thumbnailsColumns: 2,
  //     },
  //     {
  //         breakpoint: 400,
  //         thumbnailsColumns: 1,
  //     }
  // ];

  [
    { 
      imageAutoPlay: true, 
      imageAutoPlayPauseOnHover: true, 
      // previewAutoPlay: true, 
      previewAutoPlayPauseOnHover: true,
      image: true, 
      width: '100%',
      height: '500px',
      imageSize: "700px",
      // thumbnailsColumns: 1,
      // thumbnailsRows: 1,
      imageAnimation: NgxGalleryAnimation.Slide,
      arrowPrevIcon: 'fa fa-arrow-circle-o-left', 
      arrowNextIcon: 'fa fa-arrow-circle-o-right',
      actions: [{ icon: 'fa fa-download', onClick: this.downloadImageWorker.bind(this), titleText: 'Download' }]
    },
    { breakpoint: 1200, thumbnailsColumns: 6 },
    { breakpoint: 1000, thumbnailsColumns: 5 },
    { breakpoint: 800, thumbnailsColumns: 4 },
    { breakpoint: 600, thumbnailsColumns: 2 },
    { breakpoint: 400, thumbnailsColumns: 1 }
  ];

    this.getFBWorkers();
    this.getFBProjects();
    // this.getFBRecent();
  
    this.filterLogsForm = this.formBuilder.group({
        entryDate: [''],
        projectID: [''],
        workerID: [''],
        supervisorID: [''],
        tradesID: [''],
    });

      this.accountFirebase = this.data_api.getCurrentProject();

  }

  ngOnDestroy() {
    this.dtTriggerLatestDailyReport.unsubscribe(); 
  }

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          // console.log(data);
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
      }); 
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    // console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  onButtonEnter2(hoverName: HTMLElement) {
    hoverName.style.color = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    // console.log(hoverName);
  }

  onButtonOut2(hoverName: HTMLElement) {
      hoverName.style.color = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  downloadImageDaily(event, index): void {
      // console.log(event);
      // console.log(index);
      // console.log(this.galleryDailyReportImages[index].url)

      this.getBase64ImageFromURL(this.galleryDailyReportImages[index].url).subscribe((base64Data: string) => {   
            
        const element = document.createElement('a');
        element.href = base64Data;
        element.download = 'image.jpg';
        element.style.display = 'none';
        element.click();

      });

  }

  downloadImageWorker(event, index): void {
      // console.log(event);
      // console.log(index);
      // console.log(this.galleryWorkerImages[index].url)

      this.getBase64ImageFromURL(this.galleryWorkerImages[index].url).subscribe((base64Data: string) => {   
            
        const element = document.createElement('a');
        element.href = base64Data;
        element.download = 'image.jpg';
        element.style.display = 'none';
        element.click();

      });

  }

  orderUp(index){
    // console.log(this.sortDashboard);
    // console.log(index);
     [this.sortDashboard[index - 1], this.sortDashboard[index]] = [this.sortDashboard[index], this.sortDashboard[index -1]];
    // console.log(this.sortDashboard);

    this.data_api.updateFBUserSortDashboard(this.userDetails.user_id,this.sortDashboard).then(() => {
      // console.log('success');
    }); 

  }

  orderDown(index){
    // console.log(this.sortDashboard);
    // console.log(index);
     [this.sortDashboard[index + 1], this.sortDashboard[index]] = [this.sortDashboard[index], this.sortDashboard[index +1]];
    // console.log(this.sortDashboard);

    this.data_api.updateFBUserSortDashboard(this.userDetails.user_id,this.sortDashboard).then(() => {
      // console.log('success');
    }); 
  }
  
  arrangeDashboard(){

    if(this.userDetails.user_id){
      this.data_api.getFBUser(this.userDetails.user_id).subscribe((data) => {

            if(data.sortDashboard){
              this.sortDashboard = data.sortDashboard
              //this.sortDashboard[0] = daily report
              //this.sortDashboard[1] = weekly report
              //this.sortDashboard[2] = worker entry
              //this.sortDashboard[3] = projects
              //this.sortDashboard[4] = images daily report
              //this.sortDashboard[4] = images weekly report
              //this.sortDashboard[4] = images worker entry
              // console.log(this.sortDashboard);
            }else{
              this.sortDashboard = ["dly","wkly","wrkr","proj","imgdly","imgwrkr"]
            }

        }
      );
    }

    
    
  }

  // convertImages(){
  //   if(this.recentDailyReportImages.length > 0){
  //       let i = 0;
  //       for (let img of this.recentDailyReportImages) {
  //         // const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
  //         // const awaitData = this.getBase64ImageFromURL(img.imageFile).subscribe((base64Data: string) => {   return base64Data}); 
  //         // myForm.patchValue({
  //         //   imageCaption: i,
  //         // });

  //         this.getBase64ImageFromURL(img.url).subscribe((base64Data: string) => {  
  //             // console.log(base64Data);
  //             this.recentDailyReportImages[i].big = base64Data;
  //             this.recentDailyReportImages[i].medium = base64Data;
  //             this.recentDailyReportImages[i].small = base64Data;
  //             this.recentDailyReportImages[i].url = base64Data;
  //             // this.imageURLRaw[i] = base64Data;
  //             // myForm.patchValue({
  //             //   imageFile: base64Data,
  //             // });
  //         });

  //         i++;

  //       }
  //   }
  // }

  getBase64ImageFromURL(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      // create an image object
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      if (!img.complete) {
        // This will call another method that will create image from url
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = err => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement): string {
    // We create a HTML canvas object that will create a 2d image
    var canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    let dataURL: string = canvas.toDataURL("image/jpeg");
    return dataURL;
    // this.base64DefaultURL = dataURL;
    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  getFBRecent(){
  
    // OLD DAILY IMAGES
    // this.data_api.getFBRecentDailyReport().pipe(first()).subscribe(dataDailyReports => {
    //     // console.log(dataDailyReports);

    //     if(dataDailyReports){
    //         this.dashboardDailyReportList = [];
    //         this.galleryDailyReportImages = [];
    //         this.recentDailyReportImages = [];

    //         dataDailyReports.forEach(data =>{ 
    //             this.dashboardDailyReportList.push(data)
    //         })
    //         dataDailyReports.forEach(data =>{ 
    //           if(data.imageUpload){
    //             data.imageUpload.forEach(async image => {

    //               let imageText = '';
    //               imageText += this.projectNames.find(o => o.id === data.projectId)?.projectName;
    //               if(image.imageCaption){
    //                 imageText += " - "+ image.imageCaption
    //               }
    //               if(image.imageStamp){
    //                 imageText += " - uploaded at "+ image.imageStamp.toDate()
    //               }

    //               this.recentDailyReportImages.push(
    //               {
    //                 small: image.imageFile,
    //                 medium: image.imageFile,
    //                 big: image.imageFile,
    //                 url: image.imageFile,
    //                 description: imageText
    //               }); 
                
    //               // await this.getBase64ImageFromURL(image.imageFile).subscribe((base64Data: string) => {   
                        
    //               //     this.recentDailyReportImages.push(
    //               //       {
    //               //         small: image.imageFile,
    //               //         medium: image.imageFile,
    //               //         big: base64Data,
    //               //         url: base64Data,
    //               //         description: imageText
    //               //       }); 

    //               // });
                

    //             });
    //           }

    //         })
    //         this.galleryDailyReportImages = this.recentDailyReportImages;
    //     }
    // });

    // NEW DAILY IMAGES


    this.data_api.getFBRecentDailyReport().pipe(first()).subscribe(dataDailyReports => {
      // console.log(dataDailyReports);

      if(dataDailyReports){
          this.dashboardDailyReportList = [];
          this.galleryDailyReportImages = [];
          this.recentDailyReportImages = [];
          this.dailyReportImagesWithInfo = [];

          dataDailyReports.forEach(data =>{ 
            // console.log('dailydata',data)
              this.dashboardDailyReportList.push(data)
          })
          dataDailyReports.forEach(data =>{ 
            // console.log('data',data)
            if (data.imageUpload && Array.isArray(data.imageUpload)) {
              const DailyReportImages = [];
        
              data.imageUpload.forEach(image => {
                // Generate imageText for each image
                let imageText = '';
                const worker = this.users.find(o => o.id === data.createdBy);
                // console.log('worker',worker)
                if (worker) {
                  imageText += `${worker.userFirstName || 'Unnamed'} ${worker.userLastName || ''}`.trim();
                }
                const projectName = this.projectNames.find(o => o.id === data.projectId)?.projectName;
                if (projectName) {
                  imageText += ` - ${projectName}`;
                }
                if (image.imageCaption) {
                  imageText += ` - ${image.imageCaption}`;
                }
                if (image.imageStamp) {
                  imageText += ` - uploaded at ${image.imageStamp.toDate()}`;
                }
        
                // console.log('imageText', imageText);
        
                // Push each image with its description to workerImages
                DailyReportImages.push({
                  small: image.imageFile,
                  medium: image.imageFile,
                  big: image.imageFile,
                  url: image.imageFile,
                  description: imageText
                });
              });
        
              // Find worker information
              // console.log('data', data);
              // console.log('filterworkers', this.filterWorkers);
              const User = this.users.find(o => o.id == data.createdBy);
              const userName = User ? User.userFirstName + " " + User.userLastName || 'Unnamed Worker' : 'Unnamed Worker';
              const projectName = this.projectNames.find(o => o.id === data.projectId)?.projectName;
              // Add worker and their images to the grouped list
              this.dailyReportImagesWithInfo.push({
                userName: userName,
                dailyReportImages: DailyReportImages,
                projectName : projectName
              });
        
              // console.log('this.DailyReportImagesWithInfo', this.dailyReportImagesWithInfo);
        
              // Update the gallery with recent images
              this.recentDailyReportImages = this.recentWorkerImages.concat(DailyReportImages);
          }
       this.dashboardDailyReportList.push(data);
       this.setTableDataForDailyReportList();
          
  });
      }
    });


    this.data_api.getFBRecentWeeklyReport().pipe(first()).subscribe(dataWeeklyReports => {

        if(dataWeeklyReports){
            this.dashboardWeeklyReportList = [];
            dataWeeklyReports.forEach(data =>{ 
                this.dashboardWeeklyReportList.push(data)
            })
            this.setTableDataForWeeklyReport();
            // dataWeeklyReports.forEach(data =>{ 
            //   if(data.imageUpload){
            //     data.imageUpload.forEach(image => {

            //         this.recentWeeklyReportImages.push(
            //           {
            //             small: image.imageFile,
            //             medium: image.imageFile,
            //             big: image.imageFile,
            //             url: image.imageFile,
            //             description: image.imageCaption
            //           }); 

            //     });
            //   }
            // })
            // this.galleryWeeklyReportImages = this.recentWeeklyReportImages;
        }
    });

    


    // OLD WORKER IMAGES

    // this.data_api.getFBRecentWorkerEntryLogs().pipe(first()).subscribe(dataWorkerEntryLogs => {
    //     // console.log(dataWorkerEntryLogs);
    //     this.dashboardWorkerImagesList = dataWorkerEntryLogs
    //     if(dataWorkerEntryLogs){
    //         this.dashboardWorkerList = [];
    //         this.galleryWorkerImages = [];
    //         this.recentWorkerImages = [];

    //         dataWorkerEntryLogs.forEach(data =>{ 
    //             this.dashboardWorkerList.push(data)
    //         })

    //         dataWorkerEntryLogs.forEach(data =>{ 
    //           if(data.imageUpload){
    //             data.imageUpload.forEach(async image => {

    //               let imageText = '';
    //               const worker = this.filterWorkers.find(o => o.id === data.workerID);
    //               if (worker) {
    //                 imageText += worker.userFirstName + " " + worker.userLastName;
    //               }
    //               imageText += " - " + this.projectNames.find(o => o.id === data.projectId)?.projectName;
    //               if(image.imageCaption){
    //                 imageText += " - "+ image.imageCaption
    //               }
    //               if(image.imageStamp){
    //                 imageText += " - uploaded at "+ image.imageStamp.toDate()
    //               }
          
    //               this.recentWorkerImages.push(
    //                 {
    //                   small: image.imageFile,
    //                   medium: image.imageFile,
    //                   big: image.imageFile,
    //                   url: image.imageFile,
    //                   description: imageText
    //                 }); 

    //               // await this.getBase64ImageFromURL(image.imageFile).subscribe((base64Data: string) => {   
                        
    //               //       this.recentWorkerImages.push(
    //               //         {
    //               //           small: image.imageFile,
    //               //           medium: image.imageFile,
    //               //           big: base64Data,
    //               //           url: base64Data,
    //               //           description: imageText
    //               //         }); 

    //               //   });

    //             });
    //           }
    //         })
    //         this.galleryWorkerImages = this.recentWorkerImages;
    //     }

    // });

    

    // NEW WORKER IMAGES
    this.data_api.getFBRecentWorkerEntryLogs().pipe(first()).subscribe(dataWorkerEntryLogs => {
      // console.log(dataWorkerEntryLogs);
    
      // Initialize arrays
      this.dashboardWorkerImagesList = dataWorkerEntryLogs || [];
      this.dashboardWorkerList = [];
      this.galleryWorkerImages = [];
      this.recentWorkerImages = [];
      this.workerImagesWithInfo = [];
    
      // Process all workers
      dataWorkerEntryLogs.forEach(data => {
        // console.log('workerdata', data);
    
        if (data.imageUpload && Array.isArray(data.imageUpload)) {
          const workerImages = [];
    
          data.imageUpload.forEach(image => {
            // Generate imageText for each image
            let imageText = '';
            const worker = this.filterWorkers.find(o => o.id === data.workerID);
            if (worker) {
              imageText += `${worker.userFirstName || 'Unnamed'} ${worker.userLastName || ''}`.trim();
            }
            const projectName = this.projectNames.find(o => o.id === data.projectId)?.projectName;
            if (projectName) {
              imageText += ` - ${projectName}`;
            }
            if (image.imageCaption) {
              imageText += ` - ${image.imageCaption}`;
            }
            if (image.imageStamp) {
              imageText += ` - uploaded at ${image.imageStamp.toDate()}`;
            }
    
            // console.log('imageText', imageText);
    
            // Push each image with its description to workerImages
            workerImages.push({
              small: image.imageFile,
              medium: image.imageFile,
              big: image.imageFile,
              url: image.imageFile,
              description: imageText
            });
          });
    
          // Find worker information
          const workerInfo = this.filterWorkers.find(o => o.id == data.workerID);
          const workerName = workerInfo ? workerInfo.userFirstName + " " + workerInfo.userLastName || 'Unnamed Worker' : 'Unnamed Worker';
          const projectName = this.projectNames.find(o => o.id === data.projectId)?.projectName;

          // Add worker and their images to the grouped list
          this.workerImagesWithInfo.push({
            workerName: workerName,
            WorkerImages: workerImages,
            projectName : projectName
          });
    
    
          // Update the gallery with recent images
          this.recentWorkerImages = this.recentWorkerImages.concat(workerImages);
        }

    
        // Push worker data to the dashboard list
        this.dashboardWorkerList.push(data);
        this.setTableDataForWorkerEntryLogs();
      });
      console.log('this.workerimageswithinfo', this.workerImagesWithInfo)

      // Assign recent images to gallery
      this.galleryWorkerImages = this.recentWorkerImages;
    
      // console.log('this.workerImagesWithInfo', this.workerImagesWithInfo);
    });
    
  }


  // SETTING DATATABLE DATA OPEN 11-03-2025
  setTableDataForDailyReportList() {
    this.latestDailyReportsLogsOptions.data =this.dashboardDailyReportList,
    this.latestDailyReportsLogsOptions.columns =  [
            {
                data: null,
                title: 'Actions',
                width: '80px',
                render: (data, type, row) => {
                    return `
                        <a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}">
                            <i class="material-icons" title="Edit">edit</i>
                        </a>
                        <a target="_blank" href="${row.pdfLink}">
                            <i class="material-icons" title="Download">download</i>
                        </a>
                    `;
                }
            },
            {
                data: 'reportNumber',
                title: 'Report No.',
            },
            {
                data: 'projectId',
                title: 'Project Name',
                render: (data, type, row) => {
                    return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
                }
            },
            {
                title: 'Entry Date',
                render: (data, type, row) => {
                  return row?.todaysDate ? row?.todaysDate.toDate().toDateString(): '';
                }
            },
            {
                data: 'tradeFormArray',
                title: 'No. Trades',
                render: (data) => data.length
            },
            {
                data: 'visitorFormArray',
                title: 'No. Visitors',
                render: (data) => data.length
            },
            {
                data: 'imageUpload',
                title: 'No. Images',
                render: (data) => data.length
            },
            {
                title: 'Created At',
                render: (data, type, row)=> {
                  return row?.createdAt ? row?.createdAt.toDate().toString(): '';
                }
            }
        ]
    if (this.dtTriggerLatestDailyReport.closed) {
      this.dtTriggerLatestDailyReport = new Subject<void>(); 
    }
    this.dtTriggerLatestDailyReport.next(); 
}   

setTableDataForWeeklyReport() {
  if ($.fn.DataTable.isDataTable('#latestWeeklyReportTable')) {
    $('#dashboardSearchDateWeeklytable').DataTable().destroy();
  }
  if (!this.dashboardWeeklyReportList || !Array.isArray(this.dashboardWeeklyReportList)) {
    this.dashboardWeeklyReportList = []; 
  }

  this.latestWeeklyReportOptions.data =this.dashboardWeeklyReportList, 
  this.latestWeeklyReportOptions.columns = [
      {
        data: null, 
        title: '',
        width: '80px',
        render: (data: any, type: any, row: any) => {
          return `
            <a target="_blank" href="#/weekly-report/edit/${row.id}">
              <i class="material-icons" title="Edit">edit</i>
            </a>
            <a target="_blank" href="${row.pdfLink}">
              <i class="material-icons" title="Download">download</i>
            </a>
          `;
        },
      },
      {
        data: 'reportNumber',
        title: 'Report #',
        width: '100px',
      },
      {
        data: 'projectId',
        title: 'Project Name',
        width: '350px',
        render: (data: any, type: any, row: any) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
        },
      },
      {
        title: 'Entry Date',
        width: '150px',
        render: (data: any, type: any, row: any) => {
            return  row.weekendDate ? row.weekendDate.toDate().toDateString(): ''; 
      },
      },
      {
        data: 'imageUpload',
        title: 'No. Images',
        width: '120px',
        render: (data: any, type: any, row: any) => {
          return data ? data.length : '0';
        },
      },
      {
        title: 'Created At',
        render: (data: any, type: any, row: any) => {
          return row.createdAt ? row.createdAt.toDate().toString(): '';
},
      },
    ]
if (this.dtTriggerLatestWeeklyReport.closed) {
  this.dtTriggerLatestWeeklyReport = new Subject<void>(); 
}

this.dtTriggerLatestWeeklyReport.next(); 
}

setTableDataForWorkerEntryLogs(){
  this.latestWokerEntryLogsOptions.data= this.dashboardWorkerList, 
  this.latestWokerEntryLogsOptions.columns= [
      {
        data: 'workerID',
        title: 'Name',
        width: '300px',
        orderable: false, 
        searchable: false, 
        render: (data: any, type: any, row: any) => {
          const worker = this.filterWorkers.find(o => o.id === row.workerID);
          return worker ? `${worker.userFirstName} ${worker.userLastName}` : '';
        },
      },
      { 
        data: 'projectId',
        title: 'Project',
        width: '300px',
        render: (data: any, type: any, row: any) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
        },
      },
      {
        data: 'imageUpload',
        title: 'No. Images',
        width: '120px',
        render: (data: any, type: any, row: any) => {
          return data ? data.length : '0';
        },
      },
      {
        title: 'Entry Date',
        width: '150px',
        render: (data: any, type: any, row: any) => {
          return row.selectedDate ? row.selectedDate.toDate().toDateString(): '';
        },
      },
      {
        data: 'entryStatus',
        title: 'Entry Status',
        width: '10%',
        render: (data: any, type: any, row: any) => {
          return data || '';
        },
      },
      {
        data: 'accomplishments',
        title: 'Accomplishments',
        render: (data: any, type: any, row: any) => {
          return this.beautifyNotes(row.accomplishments);
        },
      },
    ]
  if (this.dtTriggerWorker.closed) {
    this.dtTriggerWorker = new Subject<void>(); 
  }
  
  this.dtTriggerWorker.next(); 
}

setTableDataForProjectsList(){
  this.latestProjectsCreatedOptions.data = this.dashboardProjectsList, 
  this.latestProjectsCreatedOptions.columns= [
      {
        data: null, 
        title: '',
        width: '80px',
        render: (data: any, type: any, row: any) => {
          return `
            <a href="#/projects/edit/${row.id}">
              <i class="material-icons" title="Edit">edit</i>
            </a>
          `;
        },
      },
      {
        data: 'projectName',
        title: 'Project Name',
        render: (data: any, type: any, row: any) => {
          return data || '';
        },
      },
      {
        data: 'projectAddress',
        title: 'Project Address',
        render: (data: any, type: any, row: any) => {
          return data || '';
        },
      },
      {
        data: 'jobNumber',
        title: 'Job Number',
        render: (data: any, type: any, row: any) => {
          return data || '';
        },
      },
    ]

  if (this.dtTriggerLatestProject.closed) {
    this.dtTriggerLatestProject = new Subject<void>(); 
  }
  
  this.dtTriggerLatestProject.next();
 }

setTableDataForDdashboardSearchDateDailyReportList() {
  this.dashboardSearchDateDailyOptions = {
    data: this.dashboardSearchDateDailyReportList,
    columns: [
      {
        data: null,
        title: 'Action',
        width: '120px',
        orderable: false,
        searchable: false,
        render: (data: any, type: any, row: any) => {
          return `
            <a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}">
              <i class="material-icons">preview</i>
            </a>
          `;
        },
      },
      {
        data: 'projectId',
        title: 'Project Name',
        render: (data: any, type: any, row: any) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
        },
      },
      {
        data: 'todaysDate',
        title: 'Entry Date',
        render: (data: any, type: any, row: any) => {
          return row ? data.toDate().toDateString() : '';
        },
      },
      {
        data: 'tradeFormArray',
        title: 'Trades On Site',
        render: (data: any, type: any, row: any) => {
          return this.countNumber(row.tradeFormArray);
        },
      },
      {
        data: 'staffFormArray',
        title: 'Staff On Site',
        render: (data: any, type: any, row: any) => {
          return this.countNumber(row.staffFormArray);
        },
      },
      {
        data: 'visitorFormArray',
        title: 'Visitors On Site',
        render: (data: any, type: any, row: any) => {
          return this.countNumber(row.visitorFormArray);
        },
      },
    ]
  };
  if (this.dtTriggerSearchDateDaily.closed) {
    this.dtTriggerSearchDateDaily = new Subject<void>(); 
  }
  
  setTimeout(()=>{
    this.dtTriggerSearchDateDaily.next(); 
  },1000)
}


// SEARCHING TABLES
setTableFordashboardSearchDateWeeklyReportList() {
  if ($.fn.DataTable.isDataTable('#dashboardSearchDateWeeklytable')) {
    $('#dashboardSearchDateWeeklytable').DataTable().destroy();
  }
  this.dashboardSearchDateWeeklyOptions.data= this.dashboardSearchDateWeeklyReportList,
  this.dashboardSearchDateWeeklyOptions.columns =[
      {
        title: 'Action',
        data: 'id',
        render: (data, type, row) => {
          return `<a target="_blank" href="#/weekly-report/edit/${row.id}">
                    <i class="material-icons">preview</i>
                  </a>`;
        },
        orderable: false
      },
      {
        title: 'Project Name',
        data: 'projectId',
        render: (data) => {
          const project = this.projectNames.find(o => o.id === data);
          return project ? project.projectName : 'N/A';
        }
      },
      {
        title: 'Entry Date',
        data: 'weekendDate',
        render: (data, type, row) => {
          return row.weekendDate ? row.weekendDate.toDate().toDateString(): '';
        }
      },
      {
        title: 'Total Days Lost',
        data: 'lostWeekDays',
        render: (data) => {
          return data ? data : 0;
        }
      },
      {
        title: 'Total Hours Lost',
        data: 'lostWeekHours',
        render: (data) => {
          return data ? data : 0;
        }
      }
    ]
    if (this.dtTriggerSearchDateWeekly.closed) {
      this.dtTriggerSearchDateWeekly = new Subject<void>(); 
    }
    setTimeout(()=>{
      this.dtTriggerSearchDateWeekly.next(); 
    },1000)
  }


setTableDataFordashboardSearchDateWorkerList(data: any) {
  if ($.fn.DataTable.isDataTable('#dashboardSearchDateWorkerTable')) {
    $('#dashboardSearchDateWorkerTable').DataTable().destroy();
  }
  this.dashboardSearchDateWorkerOptions.data = data,
  this.dashboardSearchDateWorkerOptions.columns = [
      {
        title: 'Name',
        data: 'workerID',
        render: (data, type, row) => {
          const worker = this.filterWorkers.find(o => o.id === data);
          return worker ? `${worker.userFirstName} ${worker.userLastName}` : 'N/A';
        },
        width: '15%'
      },
      {
        title: 'Project',
        data: 'projectId',
        render: (data) => {
          const project = this.projectNames.find(o => o.id === data);
          return project ? project.projectName : 'N/A';
        },
        width: '15%'
      },
      {
        title: 'Entry Date',
        render: (data, type, row) => {
          return row.selectedDate ? row.selectedDate.toDate().toDateString(): '';
        },
        width: '15%'
      },
      {
        title: 'Notes',
        data: 'accomplishments',
        render: (data, type, row) => {
          return this.beautifyNotes(data);
        },
        width: '25%'
      },
      {
        title: 'Start',
        data: 'start',
        width: '8%'
      },
      {
        title: 'Break',
        data: 'break',
        width: '8%'
      },
      {
        title: 'Finish',
        data: 'finish',
        width: '8%'
      }
    ]
    if (this.dtTriggerSearchDateWorker.closed) {
      this.dtTriggerSearchDateWorker = new Subject<void>(); 
    }
    
    setTimeout(()=>{
      this.dtTriggerSearchDateWorker.next(); 
    },1000)
  }

setTableDataFordashboardSearchProjectList(data: any) {
  // console.log('changed data',data);
   // Destroy existing DataTable instance before updating
   if ($.fn.DataTable.isDataTable('#dashboardSearchProjectsTable')) {
    $('#dashboardSearchProjectsTable').DataTable().destroy();
  }
  this.dashboardSearchProjectsOptions.data = data 
  this.dashboardSearchProjectsOptions.columns = [
      {
        title: 'Action',
        render: (data, type, row) => {
          return `<a target="_blank" href="#/projects/edit/${row.id}">
                    <i class="material-icons">edit</i>
                  </a>`;
        },
        width: '120px',
        orderable: false,
        searchable: false
      },
      {
        title: 'Project Name',
        width: '30%',
        render : (data,type, row) =>{
          return row ? row.projectName : '';
        }
      },
      {
        title: 'Project Address',
        data: 'projectAddress',
        width: '40%'
      },
      {
        title: 'Job Number',
        data: 'jobNumber',
        width: '20%'
      }
    ]
    if (this.dtTriggerSearchProjects.closed) {
      this.dtTriggerSearchProjects = new Subject<void>(); 
    }
    
   setTimeout(()=>{this.dtTriggerSearchProjects.next();},1000) }

setTableDataFordashboardSearchProjectDailyList(data: any) {
  if ($.fn.DataTable.isDataTable('#dashboardSearchProjectDailytable')) {
    $('#dashboardSearchProjectDailytable').DataTable().destroy();
  }
    this.dashboardSearchProjectDailyOptions.data = data,
    this.dashboardSearchProjectDailyOptions.columns = [
        {
          title: 'Action',
          render: (data, type, row) => {
            return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}">
                      <i class="material-icons">preview</i>
                    </a>`;
          },
          width: '120px',
          orderable: false,
          searchable: false
        },
        {
          title: 'Project Name',
          data: 'projectId',
          render: (data) => {
            const project = this.projectNames.find(o => o.id === data);
            return project ? project.projectName : '';
          },
          width: '25%'
        },
        {
          title: 'Entry Date',
          render: (data, type, row) => {
            return row.todaysDate ? row.todaysDate.toDate().toDateString(): '';
          },
          width: '15%'
        },
        {
          title: 'Trades On Site',
          data: 'tradeFormArray',
          render: (data) => {
            return this.countNumber(data);
          },
          width: '15%'
        },
        {
          title: 'Staff On Site',
          data: 'staffFormArray',
          render: (data) => {
            return this.countNumber(data);
          },
          width: '15%'
        },
        {
          title: 'Visitors On Site',
          data: 'visitorFormArray',
          render: (data) => {
            return this.countNumber(data);
          },
          width: '15%'
        }
      ]
      if (this.dtTriggerSearchProjectDaily.closed) {
        this.dtTriggerSearchProjectDaily = new Subject<void>(); 
      }
      
      setTimeout(()=>{
        this.dtTriggerSearchProjectDaily.next();
        console.log('this is running')
      },1000)
     }


setTableFordashboardSearchProjectWeeklyList(data:any){
  if ($.fn.DataTable.isDataTable('#dashboardSearchProjectWeeklytTable')) {
    $('#dashboardSearchProjectWeeklytTable').DataTable().destroy();
  }
  // console.log('dashboardSearchProjectWeeklyOptions',data)
  this.dashboardSearchProjectWeeklyOptions.data = data 
  this.dashboardSearchProjectWeeklyOptions.columns = [
    {
      title: 'Action',
      render: (data, type, row) => {
        return `<a target="_blank" href="#/weekly-report/edit/${row.id}">
                  <i class="material-icons">preview</i>
                </a>`;
      },
      width: '120px',
      orderable: false,
      searchable: false
    },
    {
      title: 'Project Name',
      render: (data, type, row) => {
        return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
      },
      width: '25%'
    },
    {
      title: 'Entry Date',
      render: (data, type, row) => {
        return row.weekendDate ? row.weekendDate.toDate().toDateString() : '';
      },
      width: '20%'
    },
    {
      title: 'Total Days Lost',
      render: (data, type, row) => {
        return row.lostWeekDays ? row.lostWeekDays : 0;
      },
      width: '15%'
    },
    {
      title: 'Total Hours Lost',
      render: (data, type, row) => {
        return row.lostWeekHours ? row.lostWeekHours : 0;
      },
      width: '20%'
    }
  ];

  if (this.dtTriggerSearchProjectWeekly.closed) {
    this.dtTriggerSearchProjectWeekly = new Subject<void>(); 
  }

  // Trigger DataTable re-initialization
  setTimeout(()=>{
    this.dtTriggerSearchProjectWeekly.next();
  },1000)
}

setTableDataFordashboardSearchProjectWorkerList(data:any){
  if ($.fn.DataTable.isDataTable('#dashboardSearchProjectWorkerTable')) {
    $('#dashboardSearchProjectWorkerTable').DataTable().destroy();
  }
  this.dashboardSearchProjectWorkerOptions.data = data 
  this.dashboardSearchProjectWorkerOptions.columns = [
    {
      title: 'Name',
      render: (data, type, row) => {
        const worker = this.filterWorkers.find(o => o.id === row.workerID);
        return worker ? `${worker.userFirstName} ${worker.userLastName}` : '';
      },
      width: '15%'
    },
    {
      title: 'Project',
      render: (data, type, row) => {
        return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
      },
      width: '15%'
    },
    {
      title: 'Entry Date',
      render: (data, type, row) => {
        return row.selectedDate ? row.selectedDate.toDate().toDateString() : '';
      },
      width: '15%'
    },
    {
      title: 'Notes',
      render: (data, type, row) => {
        return this.beautifyNotes(row.accomplishments);
      },
      width: '25%'
    },
    {
      title: 'Start',
      data: 'start',
      width: '8%'
    },
    {
      title: 'Break',
      data: 'break',
      width: '8%'
    },
    {
      title: 'Finish',
      data: 'finish',
      width: '8%'
    }
  ];

  if (this.dtTriggerSearchProjectWorker.closed) {
    this.dtTriggerSearchProjectWorker = new Subject<void>(); 
  }
  setTimeout(()=>{
    this.dtTriggerSearchProjectWorker.next(); 
  },1000)
}

setTableDataFordashboardSearchWorkerList(data:any){
  if ($.fn.DataTable.isDataTable('#dashboardSearchWorkerTable')) {
    $('#dashboardSearchWorkerTable').DataTable().destroy();
  }
  this.dashboardSearchWorkerOptions.data = data 
  this.dashboardSearchWorkerOptions.columns = [
    {
      title: 'Name',
      render: (data, type, row) => {
        const worker = this.filterWorkers.find(o => o.id === row.workerID);
        return worker ? `${worker.userFirstName} ${worker.userLastName}` : '';
      },
      width: '15%'
    },
    {
      title: 'Project',
      render: (data, type, row) => {
        return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
      },
      width: '15%'
    },
    {
      title: 'Entry Date',
      render: (data, type, row) => {
        return row.selectedDate ? row.selectedDate.toDate().toDateString() : '';
      },
      width: '15%'
    },
    {
      title: 'Notes',
      render: (data, type, row) => {
        return this.beautifyNotes(row.accomplishments);
      },
      width: '25%'
    },
    {
      title: 'Start',
      data: 'start',
      width: '8%'
    },
    {
      title: 'Break',
      data: 'break',
      width: '8%'
    },
    {
      title: 'Finish',
      data: 'finish',
      width: '8%'
    }
  ];

  // Trigger DataTable re-initialization
  if (this.dtTriggerSearchWorker.closed) {
    this.dtTriggerSearchWorker = new Subject<void>(); 
  }
  setTimeout(()=>{
    this.dtTriggerSearchWorker.next(); 
  },1000)
  }

setTableDataFordashboardSearchSupervisorDailyList(data:any){
  if ($.fn.DataTable.isDataTable('#dashboardSearchSupervisorDailyTable')) {
    $('#dashboardSearchSupervisorDailyTable').DataTable().destroy();
  }
  this.dashboardSearchSupervisorDailyOptions.data = data 
  this.dashboardSearchSupervisorDailyOptions.columns = [
    {
      title: 'Action',
      render: (data, type, row) => {
        return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}">
                  <i class="material-icons">preview</i>
                </a>`;
      },
      width: '120px',
      orderable: false,
      searchable: false
    },
    {
      title: 'Project Name',
      render: (data, type, row) => {
        return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
      }
    },
    {
      title: 'Entry Date',
      render: (data, type, row) => {
        return row.todaysDate ? row.todaysDate.toDate().toDateString() : '';
      }
    },
    {
      title: 'Trades On Site',
      render: (data, type, row) => {
        return this.countNumber(row.tradeFormArray);
      }
    },
    {
      title: 'Staff On Site',
      render: (data, type, row) => {
        return this.countNumber(row.staffFormArray);
      }
    },
    {
      title: 'Visitors On Site',
      render: (data, type, row) => {
        return this.countNumber(row.visitorFormArray);
      }
    }
  ];

  if (this.dtTriggerSearchSupervisorDaily.closed) {
    this.dtTriggerSearchSupervisorDaily = new Subject<void>(); 
  }
  setTimeout(()=>{
    this.dtTriggerSearchSupervisorDaily.next(); 
  },1000)
}

setTableDataFordashboardSearchTradesDailyList(data:any){
  if ($.fn.DataTable.isDataTable('#dashboardSearchSupervisorDailyTable')) {
    $('#dashboardSearchTradesDailyTable').DataTable().destroy();
  }
    this.dashboardSearchTradesDailyOptions.data = data
    this.dashboardSearchTradesDailyOptions.columns = [
      {
        title: 'Action',
        render: (data, type, row) => {
          return `<a target="_blank" href="#/daily-report/project/${row.projectId}?date=${this.formatDate(row.todaysDate)}">
                    <i class="material-icons">preview</i>
                  </a>`;
        },
        width: '120px',
        orderable: false,
        searchable: false
      },
      {
        title: 'Project Name',
        render: (data, type, row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
        }
      },
      {
        title: 'Entry Date',
        render: (data, type, row) => {
          return row.todaysDate ? row.todaysDate.toDate().toDateString() : '';
        }
      },
      {
        title: 'Trades On Site',
        render: (data, type, row) => {
          return this.countNumber(row.tradeFormArray);
        }
      },
      {
        title: 'Staff On Site',
        render: (data, type, row) => {
          return this.countNumber(row.staffFormArray);
        }
      },
      {
        title: 'Visitors On Site',
        render: (data, type, row) => {
          return this.countNumber(row.visitorFormArray);
        }
      }
    ];
  
    if (this.dtTriggerSearchTradesDaily.closed) {
      this.dtTriggerSearchTradesDaily = new Subject<void>(); 
    }
    
    setTimeout(()=>{
      this.dtTriggerSearchTradesDaily.next();   
    },1000)
}




// SETTING DATATABLE DATA CLOSE

  getFBProjects() {
     
    this.data_api.getFBRecentProjects().subscribe(data => {
      // console.log(data);
      let projectList = [];
      this.projectNames = [];
        if(data){
          data.forEach(data2 =>{ 
            projectList.push(data2)
          })

          this.dashboardProjectsList = projectList.slice(0, 5);
          this.setTableDataForProjectsList()

          this.projectNames = projectList;

          this.projectNames.sort(function(a, b) {
              var textA = a.projectName.toUpperCase();
              var textB = b.projectName.toUpperCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
          });

          // console.log(this.projectNames);
          this.getFBUsers();
        }


    });

  }


  getFBUsers():void {
    this.data_api.getFBUsers().subscribe((users:any)=>{
      // console.log('users',users)
      this.users = users
      this.getFBRecent();
    }) 
  }

  public getFBWorkers(): void {
    if(this.filterWorkers.length < 1){
        this.spinnerService.show();
        this.data_api.getFBWorkers().subscribe(data => {
          // console.log(data);

            if(data){

              this.spinnerService.hide();
              
              data.forEach(data =>{ 

                if(!data.password){

                  this.filterWorkers.push(data)

                }

              })
            }
        });
    }
  }

  public getFBSupervisors(): void {
    if(this.filterSupervisors.length < 1){
        this.spinnerService.show();
        this.data_api.getFBSupervisors().subscribe(data => {
          // console.log(data);

            if(data){

              this.spinnerService.hide();
              
              data.forEach(data =>{ 
                  if(!data.password){
                    this.filterSupervisors.push(data)
                  }
              })
            }
        });
    }
  }

  getFBAllTrades(): void {
    if(this.filterTrades.length < 1){
      this.spinnerService.show();
      this.data_api.getFBAllTrades().subscribe(data => {
        // console.log(data);

          if(data){
            this.spinnerService.hide();
            
                data.sort(function(a, b) {
                    var textA = a.tradeCompanyName.toUpperCase();
                    var textB = b.tradeCompanyName.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });

                data.forEach(data =>{ 
                    this.filterTrades.push(data)
                })
          }

      });
    }
  }

  public reset(){
    this.filterLogsForm.reset();

    this.dashboardSearchDateDailyReportList = [];
    this.dashboardSearchDateWeeklyReportList = [];
    this.dashboardSearchDateWorkerList = [];
    this.dashboardSearchSupervisorDailyList = [];

    this.dashboardSearchProjectList = []; 
    this.dashboardSearchProjectDailyList = [];
    this.dashboardSearchProjectWeeklyList = [];
    this.dashboardSearchProjectWorkerList = [];

    this.dashboardSearchWorkerList = []; 

    this.dashboardSearchTradesDailyList = [];

  }

  public filterByChange(event){
    // console.log(event.value);
    if(event.value == 'entry_date'){
        // this.getFBWorkers();
    }else if(event.value == 'project_id'){
        // this.getFBWorkers();
    }else if(event.value == 'worker_id'){
        // this.getFBWorkers();
    }else if(event.value == 'trades_id'){
        this.getFBAllTrades();
    }else if(event.value == 'supervisor_id'){
        this.getFBSupervisors();
    }
  }

  public filterLogs(){
      
        // console.log(this.filterLogsForm.value);
        this.dashboardSearchDateDailyReportList = [];
        this.dashboardSearchDateWeeklyReportList = [];
        this.dashboardSearchDateWorkerList = [];
        this.dashboardSearchSupervisorDailyList = [];
        
        this.dashboardSearchProjectList = []; 
        this.dashboardSearchProjectDailyList = [];
        this.dashboardSearchProjectWeeklyList = [];
        this.dashboardSearchProjectWorkerList = [];

        this.dashboardSearchWorkerList = []; 

        this.dashboardSearchTradesDailyList = [];

        this.dashboardSearchWorkerId = [];
        this.dashboardSearchTradesDailyId = [];
        

      if( this.filterLogsForm.value.entryDate){
        
          this.data_api.getFBDashboardSearchDateDailyReport(this.filterLogsForm.value.entryDate).subscribe(data => {
            // console.log(data);
              if (data.length > 0){
                  data.forEach(data =>{ 
                      this.dashboardSearchDateDailyReportList.push(data)
                      this.setTableDataForDdashboardSearchDateDailyReportList();
                  })
              }
          });

          this.data_api.getFBDashboardSearchDateWeeklyReport(this.filterLogsForm.value.entryDate).subscribe(data => {
            // console.log(data);
              if (data.length > 0){
                  data.forEach(data =>{ 
                      this.dashboardSearchDateWeeklyReportList.push(data)
                      this.setTableFordashboardSearchDateWeeklyReportList();
                  })
              }
          });

          this.data_api.getFBDashboardSearchDateWorker(this.filterLogsForm.value.entryDate).subscribe(data => {
            // console.log(data);
              if (data.length > 0){
                  data.forEach(data =>{ 
                      this.dashboardSearchDateWorkerList.push(data)
                      this.setTableDataFordashboardSearchDateWorkerList(this.dashboardSearchDateWorkerList);
                  })
              }
          });

      }else if( this.filterLogsForm.value.projectID){
          

        if(this.projectNames){
        
          let selectedProject = this.projectNames.find(o => o.id ===this.filterLogsForm.value.projectID);
          // console.log(selectedProject);
          if(selectedProject){
            this.dashboardSearchProjectList.push(selectedProject);
            this.setTableDataFordashboardSearchProjectList(this.dashboardSearchProjectList)
          }
          
        }

        this.data_api.getFBDashboardSearchProjectDailyReport(this.filterLogsForm.value.projectID).subscribe(data => {
          // console.log(data);
            if (data.length > 0){
                data.forEach(data =>{ 
                    this.dashboardSearchProjectDailyList.push(data)
                    this.setTableDataFordashboardSearchProjectDailyList(this.dashboardSearchProjectDailyList)
                })
            }
        });

        this.data_api.getFBDashboardSearchProjectWeeklyReport(this.filterLogsForm.value.projectID).subscribe(data => {
          // console.log(data);
            if (data.length > 0){
                data.forEach(data =>{ 
                    this.dashboardSearchProjectWeeklyList.push(data)
                    this.setTableFordashboardSearchProjectWeeklyList(this.dashboardSearchProjectWeeklyList)
                })
            }
        });

        this.data_api.getFBDashboardSearchProjectWorker(this.filterLogsForm.value.projectID).subscribe(data => {
          // console.log(data);
            if (data.length > 0){
                data.forEach(data =>{ 
                    this.dashboardSearchProjectWorkerList.push(data)
                    this.setTableDataFordashboardSearchProjectWorkerList(this.dashboardSearchProjectWorkerList);
                })
            }
        });

      }else if( this.filterLogsForm.value.supervisorID){

        // this.data_api.getFBDashboardSearchWorkerTimesheet(this.filterLogsForm.value.workerID).subscribe(data => {
        //   // console.log(data);
        // });
        this.dashboardSearchSupervisorDailyId = this.filterLogsForm.value.supervisorID;
        this.getFBDashboardSearchSupervisorReport();


      }else if( this.filterLogsForm.value.workerID){

        // this.data_api.getFBDashboardSearchWorkerTimesheet(this.filterLogsForm.value.workerID).subscribe(data => {
        //   // console.log(data);
        // });
        this.dashboardSearchWorkerId = this.filterLogsForm.value.workerID;
        this.getFBDashboardSearchWorkerTimesheet();

      }else if( this.filterLogsForm.value.tradesID){

        // this.data_api.getFBDashboardSearchTradeReport(this.filterLogsForm.value.tradesID).subscribe(data => {
        //   // console.log(data);
        // });
        this.dashboardSearchTradesDailyId = this.filterLogsForm.value.tradesID;
        this.getFBDashboardSearchTradeReport();

      }
      // this.spinnerService.show();
      // this.data_api.getFBDashboardSearch(this.filterLogsForm.value).subscribe((data) => {            
      //     }else if( this.filterLogsForm.value.workerID){
      //       if (data[0].length > 0){
      //         data[0].forEach(data =>{ 
      //             this.dashboardSearchWorkerList.push(data)
      //         })
      //       }
      //     }else if( this.filterLogsForm.value.tradesID){
      //       if (data[0].length > 0){
      //         data[0].forEach(data =>{ 
      //             this.dashboardSearchTradesDailyList.push(data)
      //         })
      //       }

      //     }
      //   this.spinnerService.hide();
      // })
  }

  //Search Worker
  getFBDashboardSearchWorkerTimesheet(){
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
    .orderBy('selectedDate', 'desc')
    .where("workerID", '==', this.dashboardSearchWorkerId)
    .limit(10)
    ).snapshotChanges()
    .subscribe(response => {
      if (!response.length) {
      // console.log("No Data Available");
      return false;
      }
      // console.log(response);
  
      this.searchWorkerFirstInResponse = response[0].payload.doc;
      this.searchWorkerLastInResponse = response[response.length - 1].payload.doc;
  
      this.searchWorkerTableData = [];
      for (let item of response) {
        let tempdata = {
          id: item.payload.doc.id,
          ...item.payload.doc.data()
        }
        this.searchWorkerTableData.push(tempdata);
      }

      this.dashboardSearchWorkerList = this.searchWorkerTableData;
      this.setTableDataFordashboardSearchWorkerList(this.dashboardSearchWorkerList);
  
      //Initialize values
      this.searchWorkerPrev_strt_at = [];
      this.searchWorkerPagination_clicked_count = 0;
      this.searchWorkerDisable_next = false;
      this.searchWorkerDisable_prev = false;
  
      //Push first item to use for Previous action
      this.searchWorkerPush_prev_startAt(this.searchWorkerFirstInResponse);
      }, error => {
        // console.log(error);
      });
  
  }

  //Add document
  searchWorkerPush_prev_startAt(prev_first_doc) {
    this.searchWorkerPrev_strt_at.push(prev_first_doc);
  }

  //Remove not required document 
  searchWorkerPop_prev_startAt(prev_first_doc) {
    this.searchWorkerPrev_strt_at.forEach(element => {
      if (prev_first_doc.data().id == element.data().id) {
        element = null;
      }
    });
  }
  
  //Return the Doc rem where previous page will startAt
  searchWorkerGet_prev_startAt() {
    if (this.searchWorkerPrev_strt_at.length > (this.searchWorkerPagination_clicked_count + 1))
      this.searchWorkerPrev_strt_at.splice(this.searchWorkerPrev_strt_at.length - 2, this.searchWorkerPrev_strt_at.length - 1);
    return this.searchWorkerPrev_strt_at[this.searchWorkerPagination_clicked_count - 1];
  }

  //Show next set 
  // searchWorkerNextPage() {
  //   this.searchWorkerDisable_next = true;
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
  //     .limit(10)
  //     .where("workerID", '==', this.dashboardSearchWorkerId)
  //     .orderBy('selectedDate', 'desc')
  //     .startAfter(this.searchWorkerLastInResponse)
  //   ).get()
  //     .subscribe(response => {

  //       if (!response.docs.length) {
  //         this.searchWorkerDisable_next = true;
  //         return;
  //       }

  //       this.searchWorkerFirstInResponse = response.docs[0];

  //       this.searchWorkerLastInResponse = response.docs[response.docs.length - 1];
  //       this.searchWorkerTableData = [];
  //       for (let item of response.docs) {
  //         this.searchWorkerTableData.push(item.data());
  //       }
  //       this.dashboardSearchWorkerList = this.searchWorkerTableData;

  //       this.searchWorkerPagination_clicked_count++;

  //       this.searchWorkerPush_prev_startAt(this.searchWorkerFirstInResponse);

  //       this.searchWorkerDisable_next = false;
  //     }, error => {
  //       this.searchWorkerDisable_next = false;
  //     });
  // }

  //Show previous set 
  // searchWorkerPrevPage() {
  //   this.searchWorkerDisable_prev = true;
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
  //     .orderBy('selectedDate', 'desc')
  //     .where("workerID", '==', this.dashboardSearchWorkerId)
  //     .startAt(this.searchWorkerGet_prev_startAt())
  //     .endBefore(this.searchWorkerFirstInResponse)
  //     .limit(10)
  //   ).get()
  //     .subscribe(response => {
  //       this.searchWorkerFirstInResponse = response.docs[0];
  //       this.searchWorkerLastInResponse = response.docs[response.docs.length - 1];
        
  //       this.searchWorkerTableData = [];
  //       for (let item of response.docs) {
  //         this.searchWorkerTableData.push(item.data());
  //       }

  //       this.dashboardSearchWorkerList = this.searchWorkerTableData;

  //       //Maintaing page no.
  //       this.searchWorkerPagination_clicked_count--;

  //       //Pop not required value in array
  //       this.searchWorkerPush_prev_startAt(this.searchWorkerFirstInResponse);

  //       //Enable buttons again
  //       this.searchWorkerDisable_prev = false;
  //       this.searchWorkerDisable_next = false;
  //     }, error => {
  //       this.searchWorkerDisable_prev = false;
  //     });
  // }

  //Search Supervisor
  getFBDashboardSearchSupervisorReport(){
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .orderBy('todaysDate', 'desc')
    .where("staffIdArray", 'array-contains', this.dashboardSearchSupervisorDailyId)
    // .limit(10)
    ).snapshotChanges()
    .subscribe(response => {
      if (!response.length) {
      // console.log("No Data Available");
      return false;
      }
      // console.log(response);

      this.searchSupervisorFirstInResponse = response[0].payload.doc;
      this.searchSupervisorLastInResponse = response[response.length - 1].payload.doc;

      this.searchSupervisorTableData = [];
      for (let item of response) {
      this.searchSupervisorTableData.push(item.payload.doc.data());
      }
      // console.log('this.search', this.searchSupervisorTableData)
      this.dashboardSearchSupervisorDailyList = this.searchSupervisorTableData;
      // console.log('this.dashboardSearchSupervisorDailyList', this.dashboardSearchSupervisorDailyList)
      this.setTableDataFordashboardSearchSupervisorDailyList(this.searchSupervisorTableData)

      //Initialize values
      this.searchSupervisorPrev_strt_at = [];
      this.searchSupervisorPagination_clicked_count = 0;
      this.searchSupervisorDisable_next = false;
      this.searchSupervisorDisable_prev = false;

      //Push first item to use for Previous action
      this.searchSupervisorPush_prev_startAt(this.searchSupervisorFirstInResponse);
      }, error => {
        // console.log(error);
      });

  }

    //Add document
    searchSupervisorPush_prev_startAt(prev_first_doc) {
      this.searchSupervisorPrev_strt_at.push(prev_first_doc);
    }
  
    //Remove not required document 
    searchSupervisorPop_prev_startAt(prev_first_doc) {
      this.searchSupervisorPrev_strt_at.forEach(element => {
        if (prev_first_doc.data().id == element.data().id) {
          element = null;
        }
      });
    }
    
    //Return the Doc rem where previous page will startAt
    searchSupervisorGet_prev_startAt() {
      if (this.searchSupervisorPrev_strt_at.length > (this.searchSupervisorPagination_clicked_count + 1))
        this.searchSupervisorPrev_strt_at.splice(this.searchSupervisorPrev_strt_at.length - 2, this.searchSupervisorPrev_strt_at.length - 1);
      return this.searchSupervisorPrev_strt_at[this.searchSupervisorPagination_clicked_count - 1];
    }
  
    //Show next set 
    // searchSupervisorNextPage() {
    //   this.searchSupervisorDisable_next = true;
    //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    //     .limit(10)
    //     .where("staffIdArray", 'array-contains', this.dashboardSearchSupervisorDailyId)
    //     .orderBy('todaysDate', 'desc')
    //     .startAfter(this.searchSupervisorLastInResponse)
    //   ).get()
    //     .subscribe(response => {
  
    //       if (!response.docs.length) {
    //         this.searchSupervisorDisable_next = true;
    //         return;
    //       }
  
    //       this.searchSupervisorFirstInResponse = response.docs[0];
  
    //       this.searchSupervisorLastInResponse = response.docs[response.docs.length - 1];
    //       this.searchSupervisorTableData = [];
    //       for (let item of response.docs) {
    //         this.searchSupervisorTableData.push(item.data());
    //       }
    //       this.setTableDataFordashboardSearchSupervisorDailyList(this.searchSupervisorTableData)
    //       this.dashboardSearchSupervisorDailyList = this.searchSupervisorTableData;
  
    //       this.searchSupervisorPagination_clicked_count++;
  
    //       this.searchSupervisorPush_prev_startAt(this.searchSupervisorFirstInResponse);
  
    //       this.searchSupervisorDisable_next = false;
    //     }, error => {
    //       this.searchSupervisorDisable_next = false;
    //     });
    // }
  
    //Show previous set 
    // searchSupervisorPrevPage() {
    //   this.searchSupervisorDisable_prev = true;
    //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    //     .orderBy('todaysDate', 'desc')
    //     .where("staffIdArray", 'array-contains', this.dashboardSearchSupervisorDailyId)
    //     .startAt(this.searchSupervisorGet_prev_startAt())
    //     .endBefore(this.searchSupervisorFirstInResponse)
    //     .limit(10)
    //   ).get()
    //     .subscribe(response => {
    //       this.searchSupervisorFirstInResponse = response.docs[0];
    //       this.searchSupervisorLastInResponse = response.docs[response.docs.length - 1];
          
    //       this.searchSupervisorTableData = [];
    //       for (let item of response.docs) {
    //         this.searchSupervisorTableData.push(item.data());
    //       }
  
    //       this.dashboardSearchSupervisorDailyList = this.searchSupervisorTableData;
  
    //       //Maintaing page no.
    //       this.searchSupervisorPagination_clicked_count--;
  
    //       //Pop not required value in array
    //       this.searchSupervisorPush_prev_startAt(this.searchSupervisorFirstInResponse);
  
    //       //Enable buttons again
    //       this.searchSupervisorDisable_prev = false;
    //       this.searchSupervisorDisable_next = false;
    //     }, error => {
    //       this.searchSupervisorDisable_prev = false;
    //     });
    // }

    
  //Search Trade
  getFBDashboardSearchTradeReport(){
    console.log('this.dashboardSearchTradesDailyId', this.dashboardSearchTradesDailyId);
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
    .orderBy('todaysDate', 'desc')
    .where("tradesIdArray", 'array-contains', this.dashboardSearchTradesDailyId)
    .limit(10)
    ).snapshotChanges()
    .subscribe(response => {
      if (!response.length) {
      // console.log("No Data Available");
      return false;
      }
      // console.log(response);
  
      this.searchTradesFirstInResponse = response[0].payload.doc;
      this.searchTradesLastInResponse = response[response.length - 1].payload.doc;
  
      this.searchTradesTableData = [];
      for (let item of response) {
      this.searchTradesTableData.push(item.payload.doc.data());
      }
  
      this.dashboardSearchTradesDailyList = this.searchTradesTableData;
      this.setTableDataFordashboardSearchTradesDailyList(this.dashboardSearchTradesDailyList)
  
      //Initialize values
      this.searchTradesPrev_strt_at = [];
      this.searchTradesPagination_clicked_count = 0;
      this.searchTradesDisable_next = false;
      this.searchTradesDisable_prev = false;
  
      //Push first item to use for Previous action
      this.searchTradesPush_prev_startAt(this.searchTradesFirstInResponse);
      }, error => {
        console.log(error);
      });
  
  }

  //Add document
  searchTradesPush_prev_startAt(prev_first_doc) {
    this.searchTradesPrev_strt_at.push(prev_first_doc);
  }

  //Remove not required document 
  searchTradesPop_prev_startAt(prev_first_doc) {
    this.searchTradesPrev_strt_at.forEach(element => {
      if (prev_first_doc.data().id == element.data().id) {
        element = null;
      }
    });
  }
  
  //Return the Doc rem where previous page will startAt
  searchTradesGet_prev_startAt() {
    if (this.searchTradesPrev_strt_at.length > (this.searchTradesPagination_clicked_count + 1))
      this.searchTradesPrev_strt_at.splice(this.searchTradesPrev_strt_at.length - 2, this.searchTradesPrev_strt_at.length - 1);
    return this.searchTradesPrev_strt_at[this.searchTradesPagination_clicked_count - 1];
  }

  //Show next set 
  // searchTradesNextPage() {
  //   this.searchTradesDisable_next = true;
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //     .limit(10)
  //     .where("tradesIdArray", 'array-contains', this.dashboardSearchTradesDailyId)
  //     .orderBy('todaysDate', 'desc')
  //     .startAfter(this.searchTradesLastInResponse)
  //   ).get()
  //     .subscribe(response => {

  //       if (!response.docs.length) {
  //         this.searchTradesDisable_next = true;
  //         return;
  //       }

  //       this.searchTradesFirstInResponse = response.docs[0];

  //       this.searchTradesLastInResponse = response.docs[response.docs.length - 1];
  //       this.searchTradesTableData = [];
  //       for (let item of response.docs) {
  //         this.searchTradesTableData.push(item.data());
  //       }
  //       this.dashboardSearchTradesDailyList = this.searchTradesTableData;

  //       this.searchTradesPagination_clicked_count++;

  //       this.searchTradesPush_prev_startAt(this.searchTradesFirstInResponse);

  //       this.searchTradesDisable_next = false;
  //     }, error => {
  //       this.searchTradesDisable_next = false;
  //     });
  // }

  //Show previous set 
  // searchTradesPrevPage() {
  //   this.searchTradesDisable_prev = true;
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //     .orderBy('todaysDate', 'desc')
  //     .where("tradesIdArray", 'array-contains', this.dashboardSearchTradesDailyId)
  //     .startAt(this.searchTradesGet_prev_startAt())
  //     .endBefore(this.searchTradesFirstInResponse)
  //     .limit(10)
  //   ).get()
  //     .subscribe(response => {
  //       this.searchTradesFirstInResponse = response.docs[0];
  //       this.searchTradesLastInResponse = response.docs[response.docs.length - 1];
        
  //       this.searchTradesTableData = [];
  //       for (let item of response.docs) {
  //         this.searchTradesTableData.push(item.data());
  //       }

  //       this.dashboardSearchTradesDailyList = this.searchTradesTableData;

  //       //Maintaing page no.
  //       this.searchTradesPagination_clicked_count--;

  //       //Pop not required value in array
  //       this.searchTradesPush_prev_startAt(this.searchTradesFirstInResponse);

  //       //Enable buttons again
  //       this.searchTradesDisable_prev = false;
  //       this.searchTradesDisable_next = false;
  //     }, error => {
  //       this.searchTradesDisable_prev = false;
  //     });
  // }

  // public getDasboardWorkerLogs(){
  //     this.spinnerService.show();

  //     this.data_api.getDashboardWidgetList().subscribe((data) => {
  //       // console.log(data);
  //       this.dashboardWorkerList = [];
  //       this.dashboardDailyReportList = [];
  //       this.dashboardWeeklyReportList = [];
  //       this.dashboardProjectsList = [];
  //       this.dashboardTradesList = [];
  //       this.dashboardUsersList = [];

  //       if (data[0].length > 0){
  //         data[0].forEach(data =>{ 
  //             this.dashboardWorkerList.push(data)
  //         })
  //       }

  //       if (data[1].length > 0){
  //         data[1].forEach(data =>{ 
  //             this.dashboardDailyReportList.push(data)
  //         })
  //       }

  //       if (data[2].length > 0){
  //         data[2].forEach(data =>{ 
  //             this.dashboardWeeklyReportList.push(data)
  //         })
  //       }

  //       if (data[3].length > 0){
  //         data[3].forEach(data =>{ 
  //             this.dashboardProjectsList.push(data)
  //         })
  //       }

  //       if (data[4].length > 0){
  //         data[4].forEach(data =>{ 
  //             this.dashboardTradesList.push(data)
  //         })
  //       }

  //       if (data[5].length > 0){
  //         data[5].forEach(data =>{ 
  //             this.dashboardUsersList.push(data)
  //         })
  //       }

  //       if (data[6].length > 0){
  //         data[6].forEach(data =>{ 
  //           this.projectNames.push(data)
  //         })
  //       }

  //       if (data[7].length > 0){
  //         data[7].forEach(data =>{ 
  //           this.filterTrades.push(data)
  //         })
  //       }
        
  //       this.spinnerService.hide();
         
  //     });
  // }

  // public getAllUsers(){
  //   this.data_api.getAllUsers().subscribe((data) => {
           
  //           // console.log(data);
  //           data.forEach(data =>{ 
  //               //this.filterUsers.push(data)
  //               //// console.log(data.meta.admin_role)
  //               if(data.meta.admin_role == 'project_worker'){
  //                 this.filterWorkers.push(data)
  //               }
                
  //           })
  //           // console.log(this.filterWorkers);
  //     }
  //   );
  // }

  public beautifyNotes(data) {

      if(data){
        return data.join(', ');  
      }else{
        return;
      }
          
  }

  public formatDate(date) {
      var d = new Date(date.toDate()),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;

      return [year, month, day].join('-');
      //return [day, month, year].join('/');
  }

  public countNumber(data) {
      let count = data;
      if (count){
        return count.length;
      }else{
        return 0;
      }
      
  }

  // public validateToken(){
  //   this.spinnerService.show();
  //     this.data_api.checkToken().subscribe((data) => {
  //         // console.log(data);
  //         if(data.code =='jwt_auth_valid_token'){
  //             return;
  //         }else{

  //           this.spinnerService.hide();

  //           swal.fire({
  //               title: "Session Expired.",
  //               text: "Please log in again.",
  //               buttonsStyling: false,
  //               customClass: {
  //                 confirmButton: 'btn btn-success',
  //               },
  //               icon: "error"
  //           }).then((result) => {
  //             this.authService.logout();
  //           })

  //         }
  //     },
  //     (error) =>{

  //       // console.log(error);
  //       if(error.error.code == "jwt_auth_invalid_token"){
  //         this.spinnerService.hide();
  //         swal.fire({
  //             title: "Session Expired.",
  //             text: "Please log in again.",
  //             buttonsStyling: false,
  //             customClass: {
  //               confirmButton: 'btn btn-success',
  //             },
  //             icon: "error"
  //         }).then((result) => {
  //           this.authService.logout();
  //           })

  //       }else{
  //         this.spinnerService.hide();
  //         swal.fire({
  //             title: error.error.message,
  //             // text: "You clicked the button!",
  //             buttonsStyling: false,
  //             customClass: {
  //               confirmButton: 'btn btn-success',
  //             },
  //             icon: "error"
  //         })

  //       } 


  //       }
  //     );

  // }

}

