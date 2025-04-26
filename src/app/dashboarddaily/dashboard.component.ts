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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import swal from 'sweetalert2';
import { RoleChecker } from '../services/role-checker.service';
import { NgxSpinnerService } from "ngx-spinner";
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MyService} from '../services/image-upload-service'; 
import { DailyDeleteDialog, DailyRenderComponent } from './dailybutton-render.component';
import { AuthenticationService } from '../shared/authentication.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

declare const $: any;

@Component({
  selector: 'app-dashboarddaily',
  templateUrl: './dashboard.component.html'
})
export class DashboardDailyComponent {

  weeklySource: LocalDataSource = new LocalDataSource;
  // dailySource: LocalDataSource = new LocalDataSource;
  dailySource :any

  public reportList = [];
  public reportLast;
  
  selectedMode: boolean = true;
  // This will contain selected rows
  selectedRows = [];
  filterWeeklyReports: FormGroup;
  public projectNames = [];
  public siteSupervisors = [];

  public selected: any

  //Data object for listing items
  tableData: any[] = [];

  //Save first document in snapshot of items received
  firstInResponse: any = [];

  //Save last document in snapshot of items received
  lastInResponse: any = [];

  //Keep the array of first document of previous pages
  prev_strt_at: any = [];

  //Maintain the count of clicks on Next Prev button
  pagination_clicked_count = 0;

  //Disable next and prev buttons
  disable_next: boolean = false;
  disable_prev: boolean = false;
  
  accountFirebase;

  searchChoices = [
    {value: 'entry_date', viewValue: 'Entry Date'},
    {value: 'project_id', viewValue: 'Project'},
    {value: 'supervisor_id', viewValue: 'Supervisor'},
    {value: 'has_image', viewValue: 'Uploaded Images'},
  ]

  imageBoolean = [
    {value: 'true', viewValue: 'Yes'},
    {value: 'false', viewValue: 'No'},
  ]
  dtOptions:any

  dtTrigger: Subject<any> = new Subject();

  // public dailyReportSettings = {
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
  //     class: 'table table-bordered'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'custom',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell, row) => {
  //         return this.projectNames.find(o => o.id === row?.projectId)?.projectName;
  //       },
        // renderComponent: DailyRenderComponent
        // valuePrepareFunction: (cell,row) => {
        //   return `<a href="#/daily-report/project/${row.projectId}?date=${this.formatDate2(row.todaysDate.toDate())}"><i class="material-icons">preview</i></a>
        //   <a target="_blank" href="${row.pdfLink}"><i class="material-icons">picture_as_pdf</i></a>
        //   `;
        // }
  //     },
  //     // id: {
  //     //   title: 'ID',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     return row.id;
  //     //   }
  //     // },
  //     project_name: {
  //       sort: false,
  //       width: '300px',
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //           return this.projectNames.find(o => o.id === row?.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       sort: false,
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.todaysDate.toDate().toDateString();
  //       }
  //     },
  //     // supervisor_name: {
  //     //   title: 'Supervisor Name',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.supervisor_name;
  //     //   }
  //     // },
  //     num_of_trades: {
  //       sort: false,
  //       title: 'Trades On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.tradeFormArray);
  //       }
  //     },
  //     num_of_staff: {
  //       sort: false,
  //       title: 'Staff On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return (this.countNumber(row.staffFormArray)) + (row.staffCount ? row.staffCount : 0);
  //       }
  //     },
  //     num_of_visitors: {
  //       sort: false,
  //       title: 'Visitors On Site',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.countNumber(row.visitorFormArray);
  //       }
  //     },
  //     // customdelaction: {
  //     //   width: '80px',
  //     //   title: '',
  //     //   type : 'custom',
  //     //   filter: false,
  //     //   valuePrepareFunction: (cell, row) => row,
  //     //   renderComponent: DailyRenderComponent
  //     // },
  //     // image_size : {
  //     //   title: 'Total Size of Images',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return this.formatBytes(row.total_file_size);
  //     //   }
  //     // },
  //   }
  // };

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
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    ) { }

  public ngOnInit() {
    this.initializeDataTable();
    //this.validateToken();
      //this.rolechecker.check(4)
      // this.getWeeklyReports();
      this.getAdminSettings();
      this.filterWeeklyReports = this.formBuilder.group({
          entryDate: [''],
          projectID: [''],
          supervisorId: [''],
          hasImage: [''],
      });

      this.accountFirebase = this.data_api.getCurrentProject();

      this.getFBProjects();
      //this.getSupervisors();
      // this.getFBDailyReports();

  }


  initializeDataTable() {
    if ($.fn.DataTable.isDataTable('#DataTables_Table_0')) {
      $('#DataTables_Table_0').DataTable().destroy();
    }
  
    this.dtOptions = {
      pageLength: 10,
      serverSide: true,
      destroy: true,
      info: false,
      pagingType: "simple",
      searching: false,
      ajax: (dataTablesParams: any, callback) => {
        const pageSize = dataTablesParams.length;
        const pageStart = dataTablesParams.start;
        const isNext = pageStart > this.previousPageStart;
        this.previousPageStart = pageStart;
  
        this.getFBDailyReports(pageSize, isNext).then((data: any) => {
          console.log('data',data)
          callback({
            recordsTotal: data.totalRecords,
            recordsFiltered: data.totalRecords,
            data: data.records
          });
  
          const currentPage = Math.floor(pageStart / pageSize) + 1;
          setTimeout(() => this.updatePaginationUI(currentPage), 10);
        });
      },
      columns: [
        {
          title: 'Action',
          width: '120px',
          data: null,
          createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
            cell.innerHTML = `
              <a class ='edit-btn' href="#/daily-report/project/${rowData.projectId}?date=${this.formatDate2(rowData.todaysDate.toDate())}">
                <i style="font-size: 13px; color: black; cursor:pointer" class="material-icons" title="Edit">edit</i>
              </a>
              <a target="_blank" href="${rowData.pdfLink}">
                <i style="font-size: 13px; color: black; cursor:pointer" class="material-icons" title="Download">download</i>
              </a>
              <a class="delete-btn">
                <i style="font-size: 13px; color: black; cursor:pointer" class="material-icons" title="Delete">delete</i>
              </a>
            `;
            cell.querySelector('.delete-btn')?.addEventListener('click', () => this.openDeleteDialog(rowData));
            cell.querySelector('.edit-btn')?.addEventListener('click', () => this.consolegprojectid(rowData));
          }
        },
        { title: 'Project Name', data: 'projectName', render: (data: any, type: any, row: any) => {
            return this.projectNames.find(o => o.id === row.projectId)?.projectName || ''; 
        }},
        { title: 'Entry Date', data: 'todaysDate', render: (data) => data ? data.toDate().toDateString() : '' },
        { title: 'Created At', data: 'createdAt', render: (data) => data ? data.toDate().toDateString() : '' },
        { title: 'Trades On Site', data: 'tradeFormArray', render: (data) => this.countNumber(data) },
        { title: 'Staff On Site', data: 'staffFormArray', render: (data, type, row) => (this.countNumber(data)) + (row.staffCount || 0) },
        { title: 'Visitors On Site', data: 'visitorFormArray', render: (data) => this.countNumber(data) },
      ]
    };
  }
  
  updatePaginationUI(currentPage: number) {
    setTimeout(() => {
      $('.dataTables_paginate').each(function () {
        $(this).find('.paginate_button:not(.previous, .next)').remove(); // Remove default page numbers
        $(`<span class="current-page" style="margin:0 10px; font-weight:bold">${currentPage}</span>`).insertAfter('.paginate_button.previous'); // ✅ Insert current page number
      });
    }, 50);
  }

  consolegprojectid(row:number){
   console.log('row',row)
  }
  
  
  // 🔹 Fetch Paginated Data from Firebase
  private previousPageStart = 0;
  private paginationStack: any[] = [];
  private totalRecordsCount: number | null = null;
  async getFBDailyReports(limit: number, isNext: boolean): Promise<any> {
  try {
    this.spinnerService.show();
    
    let query = this.afs.collection('/accounts').doc(this.accountFirebase)
      .collection('/dailyReport', ref => {
        let q = ref.orderBy('todaysDate', 'desc').limit(limit);
        
        if (isNext && this.lastInResponse) {
          q = q.startAfter(this.lastInResponse);
        } else if (!isNext && this.paginationStack.length > 0) {
          const prevStartAt = this.paginationStack.pop();
          q = q.startAt(prevStartAt).endBefore(this.firstInResponse);
        }
        
        return q;
      });

    const snapshot = await query.get().toPromise();

    if (snapshot.empty) {
      this.spinnerService.hide();
      return { totalRecords: 0, records: [] };
    }

    // Update pagination markers
    if (isNext) {
      this.paginationStack.push(this.firstInResponse);
    }

    this.firstInResponse = snapshot.docs[0];
    this.lastInResponse = snapshot.docs[snapshot.docs.length - 1];

    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // if (this.totalRecordsCount === null) {
    //   const countSnapshot = await this.afs.collection('/accounts')
    //     .doc(this.accountFirebase)
    //     .collection('/dailyReport')
    //     .get().toPromise();
    //   this.totalRecordsCount = countSnapshot.size;
    // }

    this.spinnerService.hide();
    return { totalRecords: 4000,records };
  } catch (error) {
    console.error('Error fetching reports:', error);
    this.spinnerService.hide();
    return { totalRecords: 0, records: [] };
  }
}

  
  

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
      }); 
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }
    
  // getFBDailyReports(): void {
  //   this.spinnerService.show();
  //   this.data_api.getFBDailyReportsPageFirst().subscribe(data => {
  //     console.log(data);

  //       if(data){
  //         this.reportList = data;
  //         this.dailySource = new LocalDataSource(this.reportList)
  //         this.reportLast = this.reportList[this.reportList.length - 1];
  //       }
  //       this.spinnerService.hide();
  //   });
  // }

    
  // getFBDailyReports(): void {
  //  // this.spinnerService.show();
  //   // this.data_api.getFBDailyReportsPageFirst().subscribe(data => {
  //   //   console.log(data);

  //   //     if(data){
  //   //       this.reportList = data;
  //   //       this.dailySource = new LocalDataSource(this.reportList)
  //   //       this.reportLast = data[data.length - 1];
  //   //     }
  //   //     this.spinnerService.hide();
  //   // });

  //   this.data_api.getFBDailyReportsFirst().then(data => {
  //     console.log(data);
  //   });
  // }

  // getFBDailyReports(){
  //     this.spinnerService.show();
  //     this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //     .orderBy('todaysDate', 'desc')
  //     // .limit(10)
  //     ).snapshotChanges()
  //     .subscribe(response => {
  //         if (!response.length) {
  //           console.log("No Data Available");
  //           return false;
  //         }
  //         console.log(response);

  //         this.firstInResponse = response[0].payload.doc;
  //         this.lastInResponse = response[response.length - 1].payload.doc;

  //         this.tableData = [];
  //         for (let item of response) {
  //           const itemData = item.payload.doc.data();
  //           itemData.id = item.payload.doc.id;
  //           this.tableData.push(itemData);
  //           //this.tableData.push(item.payload.doc.data());
  //         }

  //         // this.dailySource = new LocalDataSource(this.tableData)
  //         this.dailySource = this.tableData
  //         console.log(this.dailySource);
  //         //Initialize values
  //         this.prev_strt_at = [];
  //         this.pagination_clicked_count = 0;
  //         this.disable_next = false;
  //         this.disable_prev = false;

  //         //Push first item to use for Previous action
  //         this.push_prev_startAt(this.firstInResponse);
  //         this.setTableData();
  //         this.spinnerService.hide(); 
  //         }, error => {
  //         });

  // }

  
  // setTableData() {
    // if ($.fn.DataTable.isDataTable('#DataTables_Table_0')) {
    //   $('#DataTables_Table_0').DataTable().destroy();
    // }
  
    // if (!this.dailySource || this.dailySource.length === 0) {
    //   console.error('No data available for DataTable');
    //   return;
    // }
  
    // // Initialize DataTable with updated settings
    // this.dtOptions.data = this.dailySource;
    // this.dtOptions.columns = [
      // {
      //   title: 'Action',
      //   width: '120px',
      //   data:null,
      //   createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
      //     // Use a custom HTML template for rendering actions
      //     cell.innerHTML = `
      //       <a href="#/daily-report/project/${rowData.projectId}?date=${this.formatDate2(rowData.todaysDate.toDate())}">
      //         <i style="font-size: 13px; color: black; cursor:pointer" class="material-icons" title="Edit">edit</i>
      //       </a>
      //       <a target="_blank" href="${rowData.pdfLink}">
      //         <i style="font-size: 13px; color: black; cursor:pointer" class="material-icons" title="Download">download</i>
      //       </a>
      //       <a class="delete-btn">
      //         <i style="font-size: 13px; color: black; cursor:pointer" class="material-icons" title="Delete">delete</i>
      //       </a>
      //     `;
  
      //     // Bind the click event for the delete button
      //     cell.querySelector('.delete-btn')?.addEventListener('click', () => this.openDeleteDialog(rowData));
      //   }
      // },
    //   {
    //     title: 'Project Name',
    //     width: '300px',
    //     data: null,
        // render: (data: any, type: any, row: any) => {
        //   return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
        // }
    //   },
    //   {
    //     title: 'Entry Date',
    //     data: null,
    //     render: (data: any, type: any, row: any) => {
    //       // Ensure the rowData has the `todaysDate` property
    //       return row.todaysDate ? row.todaysDate.toDate().toDateString() : '';
    //     }
    //   },
    //   {
    //     title: 'Trades On Site',
    //     data: null,
    //     render: (data: any, type: any, row: any) => {
    //       return this.countNumber(row.tradeFormArray);
    //     }
    //   },
    //   {
    //     title: 'Staff On Site',
    //     data: null,
    //     render: (data: any, type: any, row: any) => {
    //       return (this.countNumber(row.staffFormArray)) + (row.staffCount || 0);
    //     }
    //   },
    //   {
    //     title: 'Visitors On Site',
    //     data: null,
    //     render: (data: any, type: any, row: any) => {
    //       return this.countNumber(row.visitorFormArray);
    //     }
    //   }
    // ];
  
    // // Trigger DataTable initialization
    // this.dtTrigger.next();
  // }
  

    // DATATABLE ACTIONS
       openDeleteDialog(rowData:any): void {
        const projectName = this.projectNames.find(o => o.id === rowData?.projectId)?.projectName;
            const dialogRef = this.dialog.open(DailyDeleteDialog, {
                width: '400px',
                data: {data: rowData, projectName: projectName}
            });
        
            dialogRef.afterClosed().subscribe(result => {
              console.log(result);
          
                if(result){
      
                      if(result.fest_confirm=='DELETE'){ 
      
      
                          for (let imageTBD of result.data.imageUpload) { 
                            this.afStorage.storage.refFromURL(imageTBD.imageFile).delete();
                          }
      
                          console.log(result.data.id);
                          
                          this.spinnerService.show();   
                          this.data_api.deleteFBDailyReport(result.data.id).then(() => {
                            // this.addLog();
                            $.notify({
                              icon: 'notifications',
                              message: 'Daily Report Deleted'
                            }, {
                                type: 'success',
                                timer: 1000,
                                placement: {
                                    from: 'top',
                                    align: 'center'
                                },
                                template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                                  '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
                                  '<i class="material-icons" data-notify="icon">notifications</i> ' +
                                  '<span data-notify="title">{1}</span> ' +
                                  '<span data-notify="message">{2}</span>' +
                                  '<div class="progress" data-notify="progressbar">' +
                                    '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                                  '</div>' +
                                  '<a href="{3}" target="{4}" data-notify="url"></a>' +
                                '</div>'
                            });
                            $('#DataTables_Table_0').DataTable().ajax.reload(null, false); 
                            this.spinnerService.hide();
                          });
              
                      }else{
                        rowData["fest_confirm"] = "";
                          swal.fire({
                              title: "Confirmation Failed!",
                              // text: "You clicked the button!",
                              buttonsStyling: false,
                              customClass: {
                                confirmButton: 'btn btn-success',
                              },
                              icon: "warning"
                          })
                          this.spinnerService.hide();
                      }
      
                }
            });
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

  // nextPage() {
  //   this.disable_next = true;
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //     .limit(10)
  //     .orderBy('todaysDate', 'desc')
  //     .startAfter(this.lastInResponse)
  //   ).get()
  //     .subscribe(response => {

  //       if (!response.docs.length) {
  //         this.disable_next = true;
  //         return;
  //       }

  //       this.firstInResponse = response.docs[0];

  //       this.lastInResponse = response.docs[response.docs.length - 1];
  //       this.tableData = [];
  //       for (let item of response.docs) {
  //         const itemData = item.data();
  //         itemData.id = item.id;
  //         this.tableData.push(itemData);
  //         // this.tableData.push(item.data());
  //       }
  //       this.dailySource = new LocalDataSource(this.tableData)

  //       console.log(this.dailySource);

  //       this.pagination_clicked_count++;

  //       this.push_prev_startAt(this.firstInResponse);

  //       this.disable_next = false;
  //     }, error => {
  //       this.disable_next = false;
  //     });
  // }

  //Show previous set 
  // prevPage() {
  //   this.disable_prev = true;
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/dailyReport', ref => ref
  //     .orderBy('todaysDate', 'desc')
  //     .startAt(this.get_prev_startAt())
  //     .endBefore(this.firstInResponse)
  //     .limit(10)
  //   ).get()
  //     .subscribe(response => {
  //       this.firstInResponse = response.docs[0];
  //       this.lastInResponse = response.docs[response.docs.length - 1];
        
  //       this.tableData = [];
  //       for (let item of response.docs) {
  //         const itemData = item.data();
  //           itemData.id = item.id;
  //           this.tableData.push(itemData);
  //         //this.tableData.push(item.data());
  //       }
  //       this.dailySource = new LocalDataSource(this.tableData)
  //       //Maintaing page no.
  //       this.pagination_clicked_count--;

  //       //Pop not required value in array
  //       this.pop_prev_startAt(this.firstInResponse);

  //       //Enable buttons again
  //       this.disable_prev = false;
  //       this.disable_next = false;
  //     }, error => {
  //       this.disable_prev = false;
  //     });
  // }

  getFBProjects(): void {
    this.data_api.getFBProjects().subscribe(data => {

      data.forEach(data =>{ 
          this.projectNames.push(data)
      })

    });
  }

  public formatDate2(date) {
      var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;

      // return [year, month, day].join('-');
      return [year, month, day ].join('-');
  }

  // public validateToken(){
  //   this.spinnerService.show();
  //     this.data_api.checkToken().subscribe((data) => {
  //         console.log(data);
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

  //       console.log(error);
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


  public formatDate(date) {
      var d = new Date(date+'T00:00'),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
          
  
      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;
  
      // return [year, month, day].join('-');
      return [day, month, year].join('/');
  }

  public countNumber(data) {
      let count = data;
      if (count){
        return count.length;
      }else{
        return 0;
      }
      
  }

  public formatBytes(bytes, decimals = 2) {

     if (bytes > 0){
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
     }else{
        return '0 Bytes';
     }
}


  // public getSupervisors(){
  //       this.spinnerService.show();

  //       this.data_api.getProjectSupervisors().subscribe((data) => {
  //           data.forEach(data =>{ 
  //               this.siteSupervisors.push(data)
  //           })
  //       });
  // }

  // public getWeeklyReports(){
  //       this.spinnerService.show();

  //       this.data_api.getWeeklyReports().subscribe((data) => {
  //           this.weeklySource.load(data);
  //           this.reportList = data;
  //           this.spinnerService.hide();
  //           console.log(this.reportList);

  //           this.selectedMode = false;
  //           setTimeout(() => {
  //             this.disableCheckboxes();
  //           }, 1000);
  //           // this.disableCheckboxes();

  //       });
  // }

//   public newfilterWeeklyReports(val){
//     console.log(val)     
//     if(val){
//       this.spinnerService.show();
//       this.data_api.filterWeeklyReports(val).subscribe((data) => {
//         console.log(data);
//         this.weeklySource.load(data);
//         this.reportList = data;
//         this.spinnerService.hide();
//         console.log(this.reportList);
//         this.spinnerService.hide();
//       });
//     }else{
//       this.getWeeklyReports();
//     }

// }



  // public filterDailyReports(val){
  //     console.log(val)     
  //     if(val){
  //       this.spinnerService.show();
  //       this.data_api.filterDailyReports(val).subscribe((data) => {
  //         console.log(data);
  //         this.dailySource.load(data);
  //         this.spinnerService.hide();
  //       });
  //     }else{
  //       this.getDailyReports();
  //     }

  // }

  public getDailyReports(){
      this.spinnerService.show();

      this.data_api.getDailyReports().subscribe((data) => {
          this.dailySource.load(data);
          // this.reportList = data;
          this.spinnerService.hide();
          // console.log(this.reportList);

          this.selectedMode = false;
          // setTimeout(() => {
          //   this.disableCheckboxes();
          // }, 1000);
          // this.disableCheckboxes();

      });
  }

  

  ngAfterViewInit() {
    this.dtTrigger.next();  // Manually trigger DataTable
    /* You can call this with a timeOut because if you don't you'll only see one checkbox... the other checkboxes take some time to render and appear, which is why we wait for it */
    // setTimeout(() => {
    //   this.disableCheckboxes();
    // }, 5000);
    // this.getWeeklyReports();
  }

  public filterReports(){
    this.spinnerService.show();

      this.data_api.getWeeklyReportsQuery(this.filterWeeklyReports.value).subscribe((data) => {
        this.weeklySource.load(data);
        this.reportList = data;
        this.spinnerService.hide();
        // this.hidePaginator = true;

        this.selectedMode = false;
        setTimeout(() => {
          this.disableCheckboxes();
        }, 1000);
        
      })
  }

  public disableCheckboxes() {
    var checkbox = this.e.nativeElement.querySelectorAll('input[type=checkbox]');
    checkbox.forEach((element, index) => {

      // /* disable the select all checkbox */
      // if (index == 0){this.renderer2.setAttribute(element, "disabled", "true");}

      /* disable the checkbox if set column is false */
      if (index >0 && this.reportList[index-1].has_image != 'true') {
        this.renderer2.setAttribute(element, "disabled", "true");
      }

    });
  }

    // UserRowSelected Event handler
    onRowSelect(event) {
      this.selectedRows = [];
      event.selected.forEach(element => {
          if(element.has_image == 'true'){
            this.selectedRows.push(element)
          }
      });
    }
  
    public deleteImages(){
      this.spinnerService.show();

      this.data_api.deleteWeeklyReportsImages(this.selectedRows).subscribe((data) => {

          swal.fire({
            title: "Images Deleted.",
            // text: "You clicked the button!",
            buttonsStyling: false,
            customClass: {
              confirmButton: 'btn btn-success',
            },
            icon: "success"
        })

         this.spinnerService.hide();
          window.location.reload();
      });
      
    }

    openDailyProjectSelect(): void {

        const dialogRef = this.dialog.open(DailyProjectSelectDialog, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result.project){
              this.router.navigate(['/daily-report/project/'+result.project]);
            }
        });
    }

    openDailyDateSelect(): void {

        const dialogRef = this.dialog.open(DailyDateSelectDialog, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
              let selectedDate = result.date;
              let selecteddd = String(selectedDate.getDate()).padStart(2, '0');
              let selectedmm = String(selectedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
              let selectedyyyy = selectedDate.getFullYear();

              let selecteddateToday = selectedyyyy + '-' + selectedmm + '-' + selecteddd;

              this.router.navigate(['/daily-report/project/'+result.project], { queryParams: { date: selecteddateToday } });
            }
        });
    }


}


@Component({
  selector: 'daily-project-select-dialog',
  templateUrl: 'daily-project-select-dialog.html',
})

export class DailyProjectSelectDialog implements OnInit {

  addFestForm: FormGroup;
  public listProjects;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DailyProjectSelectDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      project: ['', Validators.required],
    }, {
    });
    this.getActiveProjects();
  }

  public getActiveProjects(){
    this.spinnerService.show();

      this.data_api.getActiveProjects().subscribe((data) => {

          this.listProjects = data;
          this.spinnerService.hide();
      });
  }

  
}


@Component({
  selector: 'daily-date-select-dialog',
  templateUrl: 'daily-date-select-dialog.html',
})

export class DailyDateSelectDialog implements OnInit {

  addFestForm: FormGroup;
  public listProjects;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DailyDateSelectDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      project: ['', Validators.required],
      date: ['', Validators.required],
    }, {
    });
    this.getActiveProjects();
  }

  public getActiveProjects(){
    this.spinnerService.show();

      this.data_api.getActiveProjects().subscribe((data) => {

          this.listProjects = data;
          this.spinnerService.hide();
      });
  }

  
}