import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Inject} from '@angular/core';
import { DatasourceService} from '../services/datasource.service';
import { LocalDataSource } from 'ng2-smart-table';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import * as ExcelJS from "exceljs/dist/exceljs.min.js"
import * as fs from 'file-saver'
// import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import swal from 'sweetalert2';
import { RoleChecker } from '../services/role-checker.service';
import {LogsDialog, LogsDialogDailyReport, LogsDialogDailyWork, LogsDialogEmployees, LogsDialogProduct, LogsDialogProject, LogsDialogTrade, LogsDialogUser, LogsDialogWeeklyReport, LogsRenderComponent} from './logsbutton-render.component';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import { render } from 'ngx-color';
import { PageEvent } from '@angular/material/paginator';

declare const $: any;

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class LogsComponent implements OnInit {

    source: any
    public projects;
    public users;

    public hidePaginator = false;

    public paginatorQuery = false;

    public selected: any
    dtOptions: any = {
      data: [],
      columns: [],
      destory: true
    };
    dtTrigger: Subject<any> = new Subject();
    
    public projectNames = [];
    public filterUsers = [];
    searchChoices = [
      {value: 'entry_date', viewValue: 'Entry Date'},
      {value: 'project_id', viewValue: 'Project'},
      {value: 'user_id', viewValue: 'User'},
    ]

    length = 100;
    pageSize = 20;
    pageSizeOptions: number[] = [10, 20, 30, 50];
    currentPage = 1;
    pageEvent: PageEvent;
    filterLogsForm: FormGroup;

    buttonMode = "unfiltered";
    searchField;
    searchValue;

    tableData: any[] = [];
    firstInResponse: any = [];
    lastInResponse: any = [];
    prev_strt_at: any = [];
    pagination_clicked_count = 0;
    disable_next: boolean = false;
    disable_prev: boolean = false;

    tableDataRegular: any[] = [];
    firstInResponseRegular: any = [];
    lastInResponseRegular: any = [];
    prev_strt_atRegular: any = [];
    pagination_clicked_countRegular = 0;
    disable_nextRegular: boolean = false;
    disable_prevRegular: boolean = false;

    tableDataProject: any[] = [];
    firstInResponseProject: any = [];
    lastInResponseProject: any = [];
    prev_strt_atProject: any = [];
    pagination_clicked_countProject = 0;
    disable_nextProject: boolean = false;
    disable_prevProject: boolean = false;

    tableDataDateSearch: any[] = [];
    firstInResponseDateSearch: any = [];
    lastInResponseDateSearch: any = [];
    prev_strt_atDateSearch: any = [];
    pagination_clicked_countDateSearch = 0;
    disable_nextDateSearch: boolean = false;
    disable_prevDateSearch: boolean = false;

    accountFirebase;

    // public settings = {
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
    //       class: 'table table-bordered'
    //     },
    //     hideSubHeader: true,
    //     mode: 'external',
    //     columns: {
    //       customactions: {
    //         title: 'Action',
    //         type : 'custom',
    //         width: '150px',
    //         filter: false,
    //         valuePrepareFunction: (cell, row) => row,
    //         renderComponent: LogsRenderComponent
    //       },
    //       // id: {
    //       //   title: 'ID',
    //       //   valuePrepareFunction: (cell,row) => {
    //       //     return row.id;
    //       //   }
    //       // },
    //       timestamp: {
    //         title: 'Log Date/Time',
    //         valuePrepareFunction: (cell,row) => {
    //             return row.todaysDate.toDate().toString();
    //         }
    //       },
    //       user: {
    //         title: 'User',
    //         valuePrepareFunction: (cell,row) => {
    //             return row.userName;
    //         }
    //       },
    //       activity: {
    //         title: 'Activity',
    //         valuePrepareFunction: (cell,row) => {
    //             return row.log;
    //         }
    //       },
    //       project: {
    //         title: 'Project',
    //         valuePrepareFunction: (cell,row) => {
    //             return this.getProjectName(row);
    //         }
    //       },
    //       url: {
    //         title: 'URL',
    //         valuePrepareFunction: (cell,row) => {
    //             return row.url;
    //         }
    //       },

    //     }
    //   };

    adminData;

    colorBtnDefault;

    constructor(
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        private rolechecker: RoleChecker,
        public datepipe: DatePipe,
        private afs: AngularFirestore
        ) { }

    public ngOnInit() {
        this.getAdminSettings();
        
        this.filterLogsForm = this.formBuilder.group({
            entryDate: [''],
            projectID: [''],
            userId: [''],
        });


        this.accountFirebase = this.data_api.getCurrentProject();
        this.getFBProjects();
        this.getFBLogs();
        this.getFBUsersOrdered()
        // this.getAllUsers();
        // this.getActiveProjects();
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    // public getFBLogs(): void {
    //   this.spinnerService.show();
    //   this.data_api.getFBLogs().subscribe(data => {
    //       if(data){
    //           this.source = new LocalDataSource(data)
    //       }
    //       this.spinnerService.hide();
    //   });
    // }\
    formatRole(userRole){
        if(userRole == 'project_owner' ){
          return 'Project Owner';
        }else if(userRole == 'project_worker' ){
          return 'Project Worker';
        }else if(userRole == 'project_supervisor' ){
          return 'Project Supervisor';
        }else if(userRole == 'app_admin' ){
          return 'App Admin';
        }
    }
    
    getFBUsersOrdered(): void {
      this.spinnerService.show();
      this.data_api.getFBUsersOrderedFname().subscribe(data => {
        console.log(data);

          if(data){

            var filtered = data.filter(function(el) { return el.userEmail != "cj@spindesign.com.au"; }); 

            filtered.forEach(data =>{ 
                this.filterUsers.push(data)
            })

            this.spinnerService.hide();

          }

      });
    }


    filterFBLogs(){
      console.log(this.filterLogsForm.value);
      
      this.searchField = '';
      this.searchValue = '';
      if( (this.filterLogsForm.value.entryDate) && (!this.filterLogsForm.value.projectID) && (!this.filterLogsForm.value.userId) ){
        this.searchField = 'todaysDate';
        this.searchValue = this.filterLogsForm.value.entryDate;
        this.filterFBLogsDateSearch();
      }else if( (!this.filterLogsForm.value.entryDate) && (this.filterLogsForm.value.projectID) && (!this.filterLogsForm.value.userId) ){
        this.searchField = 'subjectID';
        this.searchValue = this.filterLogsForm.value.projectID; // .substring(0, (this.filterLogsForm.value.projectID).length - 8);
        this.filterFBLogsRegular();
      }else if( (!this.filterLogsForm.value.entryDate) && (!this.filterLogsForm.value.projectID) && (this.filterLogsForm.value.userId) ){
        this.searchField = 'userID';
        this.searchValue = this.filterLogsForm.value.userId;
        this.filterFBLogsRegular();
      }else{
        alert('invalid');
      }

    }

    filterFBLogsRegular(){

      this.buttonMode = 'regular';

      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
      .where(this.searchField, '==', this.searchValue)
      .orderBy('todaysDate', 'desc')
      .limit(10)
      ).snapshotChanges()
      .subscribe(response => {
          if (!response.length) {
           alert("No Data Available");
            return false;
          }
          console.log(response);

          this.firstInResponseRegular = response[0].payload.doc;
          this.lastInResponseRegular = response[response.length - 1].payload.doc;

          this.tableDataRegular = [];
          for (let item of response) {
            this.tableDataRegular.push(item.payload.doc.data());
          }

          this.source = new LocalDataSource(this.tableDataRegular)

          //Initialize values
          this.prev_strt_atRegular = [];
          this.pagination_clicked_countRegular = 0;
          this.disable_nextRegular = false;
          this.disable_prevRegular = false;

          //Push first item to use for Previous action
          this.push_prev_startAtRegular(this.firstInResponseRegular);
          }, error => {
            console.log(error);
          });
    }

    //Add document
    push_prev_startAtRegular(prev_first_doc) {
      this.prev_strt_atRegular.push(prev_first_doc);
    }

    //Remove not required document 
    pop_prev_startAtRegular(prev_first_doc) {
      this.prev_strt_atRegular.forEach(element => {
        if (prev_first_doc.data().id == element.data().id) {
          element = null;
        }
      });
    }

    

    //Return the Doc rem where previous page will startAt
    get_prev_startAtRegular() {
      if (this.prev_strt_atRegular.length > (this.pagination_clicked_countRegular + 1))
        this.prev_strt_atRegular.splice(this.prev_strt_atRegular.length - 2, this.prev_strt_atRegular.length - 1);
      return this.prev_strt_atRegular[this.pagination_clicked_countRegular - 1];
    }


    nextPageRegular() {
      this.disable_nextRegular = true;
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
        .where(this.searchField, '==', this.searchValue)
        .limit(10)
        .orderBy('todaysDate', 'desc')
        .startAfter(this.lastInResponseRegular)
      ).get()
        .subscribe(response => {
  
          if (!response.docs.length) {
            this.disable_nextRegular = true;
            return;
          }
  
          this.firstInResponseRegular = response.docs[0];
  
          this.lastInResponseRegular = response.docs[response.docs.length - 1];
          this.tableDataRegular = [];
          for (let item of response.docs) {
            this.tableDataRegular.push(item.data());
          }
          this.source = new LocalDataSource(this.tableDataRegular)
  
          this.pagination_clicked_countRegular++;
  
          this.push_prev_startAtRegular(this.firstInResponseRegular);
  
          this.disable_nextRegular = false;
        }, error => {
          this.disable_nextRegular = false;
        });
    }

    //Show previous set 
    prevPageRegular() {
      console.log(this.get_prev_startAtRegular());
      this.disable_prevRegular = true;
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
        .where(this.searchField, '==', this.searchValue)
        .orderBy('todaysDate', 'desc')
        .limit(10)
        .startAt(this.get_prev_startAtRegular())
        .endBefore(this.firstInResponseRegular)
      ).get()
        .subscribe(response => {
          this.firstInResponseRegular = response.docs[0];
          this.lastInResponseRegular = response.docs[response.docs.length - 1];
          
          this.tableDataRegular = [];
          for (let item of response.docs) {
            this.tableDataRegular.push(item.data());
          }
          this.source = new LocalDataSource(this.tableDataRegular)
          //Maintaing page no.
          this.pagination_clicked_countRegular--;

          //Pop not required value in array
          this.pop_prev_startAtRegular(this.firstInResponseRegular);

          //Enable buttons again
          this.disable_prevRegular = false;
          this.disable_nextRegular = false;
        }, error => {
          console.log(error);
          this.disable_prevRegular = false;
        });
    }

    // filterFBLogsProject(){

    //   this.buttonMode = 'project';

    //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
    //   .where(this.searchField, '==', this.searchValue)
    //   .orderBy('todaysDate', 'desc')
    //   // .orderBy(this.searchField)
    //   // .where(this.searchField, '>=', this.searchValue)
    //   // .where(this.searchField, '<=', this.searchValue+ '\uf8ff')
    //   .limit(1)
    //   ).snapshotChanges()
    //   .subscribe(response => {
    //       if (!response.length) {
    //        alert("No Data Available");
    //         return false;
    //       }
    //       console.log(response);

    //       this.firstInResponseProject = response[0].payload.doc;
    //       this.lastInResponseProject = response[response.length - 1].payload.doc;

    //       this.tableDataProject = [];
    //       for (let item of response) {
    //         this.tableDataProject.push(item.payload.doc.data());
    //       }

    //       this.source = new LocalDataSource(this.tableDataProject)

    //       //Initialize values
    //       this.prev_strt_atProject = [];
    //       this.pagination_clicked_countProject = 0;
    //       this.disable_nextProject = false;
    //       this.disable_prevProject = false;

    //       //Push first item to use for Previous action
    //       this.push_prev_startAtProject(this.firstInResponseProject);
    //       }, error => {
    //         console.log(error);
    //       });
    // }

    // //Add document
    // push_prev_startAtProject(prev_first_doc) {
    //   this.prev_strt_atProject.push(prev_first_doc);
    // }

    // //Remove not required document 
    // pop_prev_startAtProject(prev_first_doc) {
    //   this.prev_strt_atProject.forEach(element => {
    //     if (prev_first_doc.data().id == element.data().id) {
    //       element = null;
    //     }
    //   });
    // }

    

    // //Return the Doc rem where previous page will startAt
    // get_prev_startAtProject() {
    //   if (this.prev_strt_atProject.length > (this.pagination_clicked_countProject + 1))
    //     this.prev_strt_atProject.splice(this.prev_strt_atProject.length - 2, this.prev_strt_atProject.length - 1);
    //   return this.prev_strt_atProject[this.pagination_clicked_countProject - 1];
    // }


    // nextPageProject() {
    //   this.disable_nextProject = true;
    //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
    //     .where(this.searchField, '==', this.searchValue)
    //     .orderBy('todaysDate', 'desc')
    //     // .where(this.searchField, '>=', this.searchValue)
    //     // .where(this.searchField, '<=', this.searchValue+ '\uf8ff')
    //     // .orderBy(this.searchField)
    //     .limit(1)
    //     .startAfter(this.lastInResponseProject)
    //   ).get()
    //     .subscribe(response => {
  
    //       if (!response.docs.length) {
    //         this.disable_nextProject = true;
    //         return;
    //       }
  
    //       this.firstInResponseProject = response.docs[0];
  
    //       this.lastInResponseProject = response.docs[response.docs.length - 1];
    //       this.tableDataProject = [];
    //       for (let item of response.docs) {
    //         this.tableDataProject.push(item.data());
    //       }
    //       this.source = new LocalDataSource(this.tableDataProject)
  
    //       this.pagination_clicked_countProject++;
  
    //       this.push_prev_startAt(this.firstInResponseProject);
  
    //       this.disable_nextProject = false;
    //     }, error => {
    //       this.disable_nextProject = false;
    //     });
    // }

    // //Show previous set 
    // prevPageProject() {
    //   this.disable_prevProject = true;
    //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
    //     .where(this.searchField, '==', this.searchValue)
    //     // .where(this.searchField, '>=', this.searchValue)
    //     // .orderBy('subjectID')
    //     .orderBy('todaysDate', 'desc')
    //     .startAt(this.get_prev_startAtProject())
    //     .endBefore(this.firstInResponseProject)
    //     .limit(1)
    //   ).get()
    //     .subscribe(response => {
    //       this.firstInResponseProject = response.docs[0];
    //       this.lastInResponseProject = response.docs[response.docs.length - 1];
          
    //       this.tableDataProject = [];
    //       for (let item of response.docs) {
    //         this.tableDataProject.push(item.data());
    //       }
    //       this.source = new LocalDataSource(this.tableDataProject)
    //       //Maintaing page no.
    //       this.pagination_clicked_countProject--;

    //       //Pop not required value in array
    //       this.pop_prev_startAt(this.firstInResponseProject);

    //       //Enable buttons again
    //       this.disable_prevProject = false;
    //       this.disable_nextProject = false;
    //     }, error => {
    //       this.disable_prevProject = false;
    //     });
    // }

    filterFBLogsDateSearch(){

      this.buttonMode = 'dateSearch';

      var startDate = new Date(this.searchValue) ;
      var endDate = new Date(this.searchValue);
      endDate.setDate(startDate.getDate() + 1);
      console.log(startDate);
      console.log(endDate);

      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
      .where(this.searchField, '>=', startDate)
      .where(this.searchField, '<', endDate)
      .orderBy('todaysDate', 'desc')
      .limit(10)
      ).snapshotChanges()
      .subscribe(response => {
          if (!response.length) {
           alert("No Data Available");
            return false;
          }
          console.log(response);

          this.firstInResponseDateSearch = response[0].payload.doc;
          this.lastInResponseDateSearch = response[response.length - 1].payload.doc;

          this.tableDataDateSearch = [];
          for (let item of response) {
            this.tableDataDateSearch.push(item.payload.doc.data());
          }

          this.source = new LocalDataSource(this.tableDataDateSearch)

          //Initialize values
          this.prev_strt_atDateSearch = [];
          this.pagination_clicked_countDateSearch = 0;
          this.disable_nextDateSearch = false;
          this.disable_prevDateSearch = false;

          //Push first item to use for Previous action
          this.push_prev_startAtDateSearch(this.firstInResponseDateSearch);
          }, error => {
            console.log(error);
          });
    }

    //Add document
    push_prev_startAtDateSearch(prev_first_doc) {
      this.prev_strt_atDateSearch.push(prev_first_doc);
    }

    //Remove not required document 
    pop_prev_startAtDateSearch(prev_first_doc) {
      this.prev_strt_atDateSearch.forEach(element => {
        if (prev_first_doc.data().id == element.data().id) {
          element = null;
        }
      });
    }

    

    //Return the Doc rem where previous page will startAt
    get_prev_startAtDateSearch() {
      if (this.prev_strt_atDateSearch.length > (this.pagination_clicked_countDateSearch + 1))
        this.prev_strt_atDateSearch.splice(this.prev_strt_atDateSearch.length - 2, this.prev_strt_atDateSearch.length - 1);
      return this.prev_strt_atDateSearch[this.pagination_clicked_countDateSearch - 1];
    }


    nextPageDateSearch() {
      this.disable_nextDateSearch = true;

      var startDate = new Date(this.searchValue) ;
      var endDate = new Date(this.searchValue);
      endDate.setDate(startDate.getDate() + 1);
      console.log(startDate);
      console.log(endDate);

      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
         .where(this.searchField, '>=', startDate)
         .where(this.searchField, '<', endDate)
        .limit(10)
        .orderBy('todaysDate', 'desc')
        .startAfter(this.lastInResponseDateSearch)
      ).get()
        .subscribe(response => {
  
          if (!response.docs.length) {
            this.disable_nextDateSearch = true;
            return;
          }
  
          this.firstInResponseDateSearch = response.docs[0];
  
          this.lastInResponseDateSearch = response.docs[response.docs.length - 1];
          this.tableDataDateSearch = [];
          for (let item of response.docs) {
            this.tableDataDateSearch.push(item.data());
          }
          this.source = new LocalDataSource(this.tableDataDateSearch)
  
          this.pagination_clicked_countDateSearch++;
  
          this.push_prev_startAtDateSearch(this.firstInResponseDateSearch);
  
          this.disable_nextDateSearch = false;
        }, error => {
          this.disable_nextDateSearch = false;
        });
    }

    //Show previous set 
    prevPageDateSearch() {
      this.disable_prevDateSearch = true;

      var startDate = new Date(this.searchValue) ;
      var endDate = new Date(this.searchValue);
      endDate.setDate(startDate.getDate() + 1);
      console.log(startDate);
      console.log(endDate);

      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
        .where(this.searchField, '>=', startDate)
        .where(this.searchField, '<', endDate)
        .orderBy('todaysDate', 'desc')
        .startAt(this.get_prev_startAtDateSearch())
        .endBefore(this.firstInResponseDateSearch)
        .limit(10)
      ).get()
        .subscribe(response => {
          this.firstInResponseDateSearch = response.docs[0];
          this.lastInResponseDateSearch = response.docs[response.docs.length - 1];
          
          this.tableDataDateSearch = [];
          for (let item of response.docs) {
            this.tableDataDateSearch.push(item.data());
          }
          this.source = new LocalDataSource(this.tableDataDateSearch)
          //Maintaing page no.
          this.pagination_clicked_countDateSearch--;

          //Pop not required value in array
          this.pop_prev_startAtDateSearch(this.firstInResponseDateSearch);

          //Enable buttons again
          this.disable_prevDateSearch = false;
          this.disable_nextDateSearch = false;
        }, error => {
          this.disable_prevDateSearch = false;
        });
    }



    getFBLogs(){
        this.spinnerService.show();
        this.buttonMode = 'unfiltered';
        this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
        .orderBy('todaysDate', 'desc')
        // .limit(10)
        ).snapshotChanges()
        .subscribe(response => {
            if (!response.length) {
              console.log("No Data Available");
              return false;
            }
            console.log(response);

            this.firstInResponse = response[0].payload.doc;
            this.lastInResponse = response[response.length - 1].payload.doc;

            this.tableData = [];
            for (let item of response) {
              this.tableData.push(item.payload.doc.data());
            }

            // this.source = new LocalDataSource(this.tableData)
            this.source = this.tableData;

            //Initialize values
            this.prev_strt_at = [];
            this.pagination_clicked_count = 0;
            this.disable_next = false;
            this.disable_prev = false;

            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse);
            this.setTableData();
            this.spinnerService.hide();
            }, error => {
              console.log(error);
            });
    }

      // SET TABLE DATA
  
      setTableData(){
        this.spinnerService.show();
          if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
          $('#DataTables_Table_0').DataTable().destroy();
        }        
        this.dtOptions.data = this.source
        this.dtOptions.columns  = [
          {
            title: 'Actions',
            data: null,
            createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
              cell.innerHTML = `
            <span (click)= "openDialog()" class = "open btn-span" mat-button>See Details</span>
             `;
              cell.querySelector('.open')?.addEventListener('click', () => this.openDialog(rowData));
            },
          },
          { 
            title: 'Log Date/Time',
            data:null,
            render: function (data, type, row) {
              return row?.todaysDate ? row.todaysDate.toDate().toString() : '--';
            }
            
          },
          { 
            title: 'User', 
            // data:null,
            render: (data, type, row) => row?.userName ? row.userName : '--'          },
          { 
            title: 'Activity', 
            data: 'log' 
          },
          { 
            title: 'Project',
            data:null,
            render: (data, type, row) => this.getProjectName(row) || '--' 
          },
          { 
            title: 'URL', 
            data: 'url' 
          }

        ]
        this.dtTrigger.next();
        this.spinnerService.hide();
    }

    // OPEN DIALOG
    openDialog(row: any): void {
      if (row.subject == 'visitor' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '400px',
          data: { data: row, caption: 'Visitor Name' }
        });
      } else if (row.subject == 'visitor' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Visitor Name' }
        });
      } else if (row.subject == 'visitor' && row.method == 'delete') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Visitor Name' }
        });
      } else if (row.subject == 'supplier' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '600px',
          data: { data: row, caption: 'Supplier Name' }
        });
      } else if (row.subject == 'supplier' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Supplier Name' }
        });
      } else if (row.subject == 'supplier' && row.method == 'delete') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Supplier Name' }
        });
      } else if (row.subject == 'product-category' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '600px',
          data: { data: row, caption: 'Product Category' }
        });
      } else if (row.subject == 'product-category' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Product Category' }
        });
      } else if (row.subject == 'product-category' && row.method == 'delete') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Product Category' }
        });
      } else if (row.subject == 'stage' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '600px',
          data: { data: row, caption: 'Stage Name' }
        });
      } else if (row.subject == 'stage' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Stage Name' }
        });
      } else if (row.subject == 'stage' && row.method == 'delete') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Stage Name' }
        });
      } else if (row.subject == 'costcentre' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '600px',
          data: { data: row, caption: 'CostCentre' }
        });
      } else if (row.subject == 'costcentre' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'CostCentre' }
        });
      } else if (row.subject == 'costcentre' && row.method == 'delete') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'CostCentre' }
        });
      } else if (row.subject == 'tool' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '600px',
          data: { data: row, caption: 'Tool Name' }
        });
      } else if (row.subject == 'tool' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '600px',
          data: { data: row, caption: 'Tool Name' }
        });
      } else if (row.subject == 'tool' && row.method == 'delete') {
        this.dialog.open(LogsDialog, {
          width: '600px',
          data: { data: row, caption: 'Tool Name' }
        });
      } else if (row.subject == 'reason' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '400px',
          data: { data: row, caption: 'Reason' }
        });
      } else if (row.subject == 'reason' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Reason' }
        });
      } else if (row.subject == 'reason' && row.method == 'delete') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Reason' }
        });
      } else if (row.subject == 'question' && row.method == 'create') {
        this.dialog.open(LogsDialog, {
          width: '400px',
          data: { data: row, caption: 'Question' }
        });
      } else if (row.subject == 'question' && row.method == 'update') {
        this.dialog.open(LogsDialog, {
          width: '800px',
          data: { data: row, caption: 'Question' }
        });
      } else if (row.subject == 'daily-work' && row.method == 'create') {
        this.dialog.open(LogsDialogDailyWork, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'daily-work' && row.method == 'update') {
        this.dialog.open(LogsDialogDailyWork, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'trade' && row.method == 'create') {
        this.dialog.open(LogsDialogTrade, {
          width: '800px'
        });
      } else if (row.subject == 'trade' && row.method == 'update') {
        this.dialog.open(LogsDialogTrade, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'trade' && row.method == 'delete') {
        this.dialog.open(LogsDialogTrade, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'employee' && row.method == 'create') {
        this.dialog.open(LogsDialogEmployees, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'employee' && row.method == 'update') {
        this.dialog.open(LogsDialogEmployees, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'product' && row.method == 'create') {
        this.dialog.open(LogsDialogProduct, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'product' && row.method == 'update') {
        this.dialog.open(LogsDialogProduct, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'product' && row.method == 'delete') {
        this.dialog.open(LogsDialogProduct, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'user' && row.method == 'create') {
        this.dialog.open(LogsDialogUser, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'user' && row.method == 'update') {
        this.dialog.open(LogsDialogUser, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'project' && row.method == 'create') {
        this.dialog.open(LogsDialogProject, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'project' && row.method == 'update') {
        this.dialog.open(LogsDialogProject, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'daily-report' && row.method == 'create') {
        this.dialog.open(LogsDialogDailyReport, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'daily-report' && row.method == 'update') {
        this.dialog.open(LogsDialogDailyReport, {
          width: '800px',
          data: row
        });
      } else if (row.subject == 'weekly-report' && row.method == 'create') {
        this.dialog.open(LogsDialogWeeklyReport, {
          width: '600px',
          data: row
        });
      } else if (row.subject == 'weekly-report' && row.method == 'update') {
        this.dialog.open(LogsDialogWeeklyReport, {
          width: '800px',
          data: row
        });
      }
    }
    

    //Add document
    push_prev_startAt(prev_first_doc) {
      this.prev_strt_at.push(prev_first_doc);
    }

    //Remove not required document 
    pop_prev_startAt(prev_first_doc) {
      this.prev_strt_at.forEach(element => {
        if (prev_first_doc.data().id == element.data().id) {
          element = null;
        }
      });
    }

    //Return the Doc rem where previous page will startAt
    get_prev_startAt() {
      if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
        this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
      return this.prev_strt_at[this.pagination_clicked_count - 1];
    }

    nextPage() {
      this.disable_next = true;
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
        .limit(10)
        .orderBy('todaysDate', 'desc')
        .startAfter(this.lastInResponse)
      ).get()
        .subscribe(response => {
  
          if (!response.docs.length) {
            this.disable_next = true;
            return;
          }
  
          this.firstInResponse = response.docs[0];
  
          this.lastInResponse = response.docs[response.docs.length - 1];
          this.tableData = [];
          for (let item of response.docs) {
            this.tableData.push(item.data());
          }
          this.source = new LocalDataSource(this.tableData)
  
          this.pagination_clicked_count++;
  
          this.push_prev_startAt(this.firstInResponse);
  
          this.disable_next = false;
        }, error => {
          this.disable_next = false;
        });
    }

    //Show previous set 
    prevPage() {
      console.log(this.get_prev_startAt());
      this.disable_prev = true;
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/userLogs', ref => ref
        .orderBy('todaysDate', 'desc')
        .startAt(this.get_prev_startAt())
        .endBefore(this.firstInResponse)
        .limit(10)
      ).get()
        .subscribe(response => {
          this.firstInResponse = response.docs[0];
          this.lastInResponse = response.docs[response.docs.length - 1];
          
          this.tableData = [];
          for (let item of response.docs) {
            this.tableData.push(item.data());
          }
          this.source = new LocalDataSource(this.tableData)
          //Maintaing page no.
          this.pagination_clicked_count--;

          //Pop not required value in array
          this.pop_prev_startAt(this.firstInResponse);

          //Enable buttons again
          this.disable_prev = false;
          this.disable_next = false;
        }, error => {
          this.disable_prev = false;
        });
    }


    // public getActiveProjects(){
    //     this.spinnerService.show();

    //     this.data_api.getActiveProjects().subscribe((data) => {
    //         data.forEach(data =>{ 
    //             this.projectNames.push(data)
    //         })
    //     });
    // }

    // public filterLogs(){
    //   this.spinnerService.show();
    //     this.paginatorQuery = true;
    //     console.log(this.filterLogsForm.value);
  
    //     this.data_api.getActivityLogsQuery(this.currentPage,this.pageSize,this.filterLogsForm.value).subscribe((data) => {
    //       console.log(data);
    //       this.source.load(data[0]);
    //       this.length =  data[1];
    //       //this.reportList = data;
    //       this.spinnerService.hide();
    //       // this.hidePaginator = true;
  
    //       // this.selectedMode = false;
    //       // setTimeout(() => {
    //       //   this.disableCheckboxes();
    //       // }, 1000);
          
    //     })
    // }

    // public filterLogs2(event?:PageEvent){
    //   this.spinnerService.show();
    //     this.paginatorQuery = true;
    //     console.log(this.filterLogsForm.value);
  
    //     this.data_api.getActivityLogsQuery(event.pageIndex+1,event.pageSize,this.filterLogsForm.value).subscribe((data) => {
    //       console.log(data);
    //       this.source.load(data[0]);
    //       this.length =  data[1];
    //       //this.reportList = data;
    //       this.spinnerService.hide();
    //       // this.hidePaginator = true;
  
    //       // this.selectedMode = false;
    //       // setTimeout(() => {
    //       //   this.disableCheckboxes();
    //       // }, 1000);
          
    //     })
    // }


    public getProjectName(data){

      // text: this.siteSupervisors.find(x => x.id === this.editForm.value.siteSupervisor).supervisor_name,
      if(data.subject == 'project'){
        return this.projects.find(x => x.id === data.subjectID)?.projectName;
      }else if( (data.subject == 'weekly-report') || (data.subject == 'daily-report') || (data.subject == 'daily-work') ){
        let projectNameTemp = this.projects.find(x => x.id === (data.subjectID)?.substring(0, (data.subjectID)?.length - 8))?.projectName;

        if(projectNameTemp){
          return projectNameTemp;
        }else{
          return this.projects.find(x => x.id === data.subjectID)?.projectName;
        }
       

      }else{
        return;
      }
    }

    public getUser(data){
  
      if(data.user_id == 1){
        return 'Spin Design';
      }else if(data){
        return this.users.find(x => x.id === parseInt(data.user_id))?.name;
      }else{
        return;
      }
    }

    getFBProjects(): void {
      this.data_api.getFBProjects().subscribe(data => {
        console.log(data);
  
          if(data){
            this.projects = data;

            data.forEach(data =>{ 
                this.projectNames.push(data)
            })
            
          }
  
      });
    }

    // public getProjects(){
    //       this.spinnerService.show();

    //       this.data_api.getProjects().subscribe((data) => {
    //           this.projects = data;
    //           console.log(data);
    //       });
    // }

    // public getAllUsers(){
    //   this.spinnerService.show();
    //   this.data_api.getAllUsers().subscribe((data) => {
             
    //           console.log(data);
    //           this.users = data;
    //           this.spinnerService.hide();

    //           data.forEach(data =>{ 
    //               this.filterUsers.push(data)
    //           })
              
    //     }
    //   );
    // }

    // public getLogs(){
    //         this.filterLogsForm.reset();
    //         this.spinnerService.show();
    //         this.paginatorQuery = false;
    //         this.data_api.getActivityLogs(this.currentPage,this.pageSize).subscribe((data) => {
    //             this.source.load(data[0]);
    //             // this.projectList = data[0];
    //             this.length =  data[1];
    //             this.spinnerService.hide();
    //             console.log(data);
    //         });
    // }

    // public getLogs2(event?:PageEvent){
    //   this.spinnerService.show();

    //   this.data_api.getActivityLogs(event.pageIndex+1,event.pageSize).subscribe((data) => {
    //       this.source.load(data[0]);
    //       // this.projectList = data[0];
    //       this.length =  data[1];
    //       this.spinnerService.hide();
    //       console.log(data);
    //   });
    // }

}