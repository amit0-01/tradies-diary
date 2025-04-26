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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import swal from 'sweetalert2';
import { RoleChecker } from '../services/role-checker.service';
import { NgxSpinnerService } from "ngx-spinner";
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MyService} from '../services/image-upload-service'; 
import { WeeklyDeleteDialog, WeeklyRenderComponent } from './weeklybutton-render.component';
import { AuthenticationService } from '../shared/authentication.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

declare const $: any;

@Component({
  selector: 'app-dashboardweekly',
  templateUrl: './dashboard.component.html'
})
export class DashboardWeeklyComponent {

  // weeklySource: LocalDataSource = new LocalDataSource;
  weeklySource: any

  dtOptions = {};
  dtTrigger: Subject<any> = new Subject();

  public reportList;
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

  accountFirebase

  // public weeklyReportSettings = {
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
  //     // customactions: {
  //     //   width: '30px',
  //     //   title: 'Action',
  //     //   type : 'html',
  //     //   filter: false,
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //     //   }
  //     // },
  //     customactions: {
  //       width: '120px',
  //       title: 'Action',
  //       type : 'custom',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell, row) => {
  //         return this.projectNames.find(o => o.id === row.projectId).projectName;
  //       },
  //       renderComponent: WeeklyRenderComponent
  //       // valuePrepareFunction: (cell,row) => {
  //       //   return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">preview</i></a>
  //       //   <a target="_blank" href="${row.pdfLink}"><i class="material-icons">picture_as_pdf</i></a>
  //       //   `;
  //       // }
  //     },

  //     // id: {
  //     //   title: 'ID',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     return row.id;
  //     //   }
  //     // },
  //     project_name: {
  //       sort: false,
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //         console.log( this.projectNames);
  //         console.log( row.projectId);
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     entry_date: {
  //       sort: false,
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.weekendDate.toDate().toDateString();
  //       }
  //     },
  //     // supervisor_name: {
  //     //   title: 'Supervisor Name',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.supervisor_name;
  //     //   }
  //     // },
  //     lost_days_week : {
  //       sort: false,
  //       title: 'Total Days Lost',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.lostWeekDays;
  //       }
  //     },
  //     lost_hours_week : {
  //       sort: false,
  //       title: 'Total Hours Lost',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.lostWeekHours;
  //       }
  //     },
  //     // customdelaction: {
  //     //   width: '80px',
  //     //   title: '',
  //     //   type : 'custom',
  //     //   filter: false,
  //     //   valuePrepareFunction: (cell, row) => row,
  //     //   renderComponent: WeeklyDeleteRenderComponent
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
    private afStorage: AngularFireStorage
    ) { }

  public ngOnInit() {
    this.getAdminSettings();
      //this.validateToken();
      //this.rolechecker.check(4)
      // this.getWeeklyReports();
      this.filterWeeklyReports = this.formBuilder.group({
          entryDate: [''],
          projectID: [''],
          supervisorId: [''],
          hasImage: [''],
      });


      this.accountFirebase = this.data_api.getCurrentProject();

      this.getFBProjects();
      this.initializeWeeklyDataTable();
      // this.getSupervisors();
      
  }

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
      }); 
  }

  initializeWeeklyDataTable() {
    if ($.fn.DataTable.isDataTable('#DataTables_Table_1')) {
      $('#DataTables_Table_1').DataTable().destroy();
    }
  
    this.dtOptions = {
      pageLength: 10,
      serverSide: true,
      destroy: true,
      pagingType: 'simple',
      info: false,
      searching: false,
      ajax: (dataTablesParams: any, callback) => {
        const pageSize = dataTablesParams.length;
        const pageStart = dataTablesParams.start;
        const isNext = pageStart > this.previousPageStart;
        this.previousPageStart = pageStart;
        const currentPage = Math.floor(pageStart / pageSize) + 1;
  
        this.getFBWeeklyReports(pageSize, isNext).then((data: any) => {
          callback({
            recordsTotal: data.totalRecords,
            recordsFiltered: data.totalRecords,
            data: data.records
          });
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
              <a href="#/weekly-report/edit/${rowData?.id}">
                <i style="font-size: 13px; color: black; cursor: pointer;" class="material-icons" title="Edit">edit</i>
              </a>
              <a target="_blank" href="${rowData?.pdfLink}">
                <i style="font-size: 13px; color: black; cursor: pointer;" class="material-icons" title="Download">download</i>
              </a>
              <a class="delete-btn">
                <i style="font-size: 13px; color: black; cursor: pointer;" class="material-icons" title="Delete">delete</i>
              </a>
            `;
  
            cell.querySelector('.delete-btn')?.addEventListener('click', () => {
              this.openDeleteDialog(rowData);
            });
          },
        },
        {
          title: 'Project Name',
          data: 'projectId',
          render: (data, type, row) => {
            const project = this.projectNames?.find(o => o?.id === row?.projectId);
            return project ? project.projectName : 'Unknown Project';
          },
        },
        {
          title: 'Entry Date',
          render: (data, type, row) =>  {
            return new Date(row.weekendDate).toDateString()
        }
        },
        { title: 'Total Days Lost', data: 'lostWeekDays' },
        { title: 'Total Hours Lost', data: 'lostWeekHours' },
      ],
    };
  }
  
  // ✅ Function to update pagination UI
  updatePaginationUI(currentPage: number) {
    setTimeout(() => {
      $('.dataTables_paginate').each(function () {
        $(this).find('.paginate_button:not(.previous, .next)').remove(); // Remove default page numbers
        $(`<span class="current-page" style="margin:0 10px; font-weight:bold">${currentPage}</span>`).insertAfter('.paginate_button.previous'); // ✅ Insert current page number
      });
    }, 50);
  }
  
  

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  private previousPageStart = 0;
private paginationStack: any[] = [];
private weeklyTotalCount: number | null = null;


  async getFBWeeklyReports(limit: number, isNext: boolean): Promise<any> {
    try {
      this.spinnerService.show();
      
      let query = this.afs.collection('/accounts')
        .doc(this.accountFirebase)
        .collection('/weeklyReport', ref => {
          let q = ref.orderBy('weekendDate', 'desc').limit(limit);
          
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
  
      const records = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Ensure dates are properly formatted
        weekendDate: doc.data().weekendDate?.toDate 
          ? doc.data().weekendDate.toDate() 
          : new Date(doc.data().weekendDate?.seconds * 1000)
      }));
  
      // // Cache total count
      // if (this.weeklyTotalCount === null) {
      //   const countQuery = this.afs.collection('/accounts')
      //     .doc(this.accountFirebase)
      //     .collection('/weeklyReport');
        
      //   // Use count() if available (Firestore v9+)
      //   if ('count' in countQuery.ref) {
      //     const aggregate = await countQuery.ref.count().get();
      //     this.weeklyTotalCount = aggregate.data().count;
      //   } else {
      //     // Fallback to full query
      //     const countSnapshot = await countQuery.get().toPromise();
      //     this.weeklyTotalCount = countSnapshot.size;
      //   }
      // }
  
      this.spinnerService.hide();
      return { 
        totalRecords: 4000, 
        records 
      };
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
      this.spinnerService.hide();
      return { totalRecords: 0, records: [] };
    }
  }
  

  
  

  // getFBWeeklyReports(): void {
  //   this.spinnerService.show();
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref
  //   .orderBy('weekendDate', 'desc')
  //   // .limit(10)
  //   ).snapshotChanges()
  //   .subscribe(response => {
  //       if (!response.length) {
  //         console.log("No Data Available");
  //         return false;
  //       }
  //       console.log(response);

  //       this.firstInResponse = response[0].payload.doc;
  //       this.lastInResponse = response[response.length - 1].payload.doc;

  //       this.tableData = [];
  //       for (let item of response) {
  //         const itemData = item.payload.doc.data();
  //         itemData.id = item.payload.doc.id;
  //         this.tableData.push(itemData);
  //         // this.tableData.push(item.payload.doc.data());
  //       }
  //       console.log(this.tableData);
  //       // this.weeklySource = new LocalDataSource(this.tableData)
  //       this.weeklySource = this.tableData  

  //       //Initialize values
  //       this.prev_strt_at = [];
  //       this.pagination_clicked_count = 0;
  //       this.disable_next = false;
  //       this.disable_prev = false;

  //       this.setTableData()
  //       this.spinnerService.hide();

  //       //Push first item to use for Previous action
  //       this.push_prev_startAt(this.firstInResponse);
  //       }, error => {
  //       });



  // }

  // setTableData() {
  //   console.log('this.weekysource', this.weeklySource)
  //   if ($.fn.DataTable.isDataTable('#DataTables_Table_0')) {
  //     $('#DataTables_Table_0').DataTable().destroy();
  //   }
  
  //   this.dtOptions.data = this.weeklySource;
  //   this.dtOptions.columns = [
      // {
      //   title: 'Action',
      //   width: '120px',
      //   data: null,
      //   createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
      //     // Use a custom HTML template for rendering actions
      //     cell.innerHTML = `
      //       <a href="#/weekly-report/edit/${rowData?.id}">
      //         <i style="font-size: 13px; color: black; cursor: pointer;" class="material-icons" title="Edit">edit</i>
      //       </a>
      //       <a target="_blank" href="${rowData?.pdfLink}">
      //         <i style="font-size: 13px; color: black; cursor: pointer;" class="material-icons" title="Download">download</i>
      //       </a>
      //       <a class="delete-btn">
      //         <i style="font-size: 13px; color: black; cursor: pointer;" class="material-icons" title="Delete">delete</i>
      //       </a>
      //     `;
      
      //     // Bind the click event for the delete button
      //     cell.querySelector('.delete-btn')?.addEventListener('click', () => {
      //       this.openDeleteDialog(rowData);
      //     });
      //   }
      // },
  //     {
  //       title: 'Project Name',
  //       data: 'projectId', // Ensure this maps to the dataset column
  //       render: (data, type, row) => {
  //         const project = this.projectNames?.find(o => o?.id === row?.projectId);
  //         return project ? project.projectName : 'Unknown Project';
  //       }
  //     },      
  //       { title: 'Entry Date',data: null,render: (data, type, row) =>row?.weekendDate.toDate().toDateString() },
  //       { title: 'Total Days Lost', data: 'lostWeekDays' },
  //       { title: 'Total Hours Lost', data: 'lostWeekHours' }
  //     ]
  //     this.dtTrigger.next();
  // }

  // OPEN DEELTE DIALOG

    openDeleteDialog(rowData:any): void {
      const projectName = this.projectNames.find(o => o.id === rowData?.projectId)?.projectName;

      const dialogRef = this.dialog.open(WeeklyDeleteDialog, {
          width: '400px',
          data: {data: rowData, projectName: projectName}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        
          if(result){

                if(result.fest_confirm=='DELETE'){ 


                  if (Array.isArray(result?.data?.imageUpload)) {
                  for (let imageTBD of result.data.imageUpload) { 
                    this.afStorage.storage.refFromURL(imageTBD.imageFile).delete();
                  }
                }
                this.spinnerService.show();  
                  this.data_api.deleteFBWeeklyReport(result.data.id).then(() => {
                    this.spinnerService.hide();  
                    // this.addLog();
                    $.notify({
                      icon: 'notifications',
                      message: 'Weekly Report Deleted'
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
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref
  //     .limit(10)
  //     .orderBy('weekendDate', 'desc')
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

  //        // this.tableData.push(item.data());
  //       }
  //       this.weeklySource = new LocalDataSource(this.tableData)

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
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/weeklyReport', ref => ref
  //     .orderBy('weekendDate', 'desc')
  //     .startAt(this.get_prev_startAt())
  //     .endBefore(this.firstInResponse)
  //     .limit(10)
  //   ).get()
  //     .subscribe(response => {
  //       this.firstInResponse = response.docs[0];
  //       this.lastInResponse = response.docs[response.docs.length - 1];
        
  //       this.tableData = [];
  //       for (let item of response.docs) {
  //           const itemData = item.data();
  //           itemData.id = item.id;
  //           this.tableData.push(itemData);
  //       }
  //       this.weeklySource = new LocalDataSource(this.tableData)
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
      this.projectNames = [];
      data.forEach(data =>{ 
          this.projectNames.push(data)
      })
      // this.getFBWeeklyReports();
    });
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
      let count = JSON.parse(data);
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

  public getProjects(){
      this.spinnerService.show();

      this.data_api.getActiveProjects().subscribe((data) => {
          data.forEach(data =>{ 
              this.projectNames.push(data)
          })
      });
  }

  public getSupervisors(){
        this.spinnerService.show();

        this.data_api.getProjectSupervisors().subscribe((data) => {
            data.forEach(data =>{ 
                this.siteSupervisors.push(data)
            })
        });
  }

  public getWeeklyReports(){
        this.spinnerService.show();

        this.data_api.getWeeklyReports().subscribe((data) => {
            this.weeklySource.load(data);
            this.reportList = data;
            this.spinnerService.hide();

            this.selectedMode = false;
            setTimeout(() => {
              this.disableCheckboxes();
            }, 1000);
            // this.disableCheckboxes();

        });
  }

  public newfilterWeeklyReports(val){
    if(val){
      this.spinnerService.show();
      this.data_api.filterWeeklyReports(val).subscribe((data) => {
        this.weeklySource.load(data);
        this.reportList = data;
        this.spinnerService.hide();
        this.spinnerService.hide();
      });
    }else{
      this.getWeeklyReports();
    }

}

  public getDailyReports(){
      this.spinnerService.show();

      this.data_api.getDailyReports().subscribe((data) => {
          this.weeklySource.load(data);
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

  public filterDailyReports(val){
      if(val){
        this.spinnerService.show();
        this.data_api.filterDailyReports(val).subscribe((data) => {
          this.weeklySource.load(data);
          this.spinnerService.hide();
        });
      }else{
        this.getDailyReports();
      }

  }


  ngAfterViewInit() {
    this.dtTrigger.next();
    /* You can call this with a timeOut because if you don't you'll only see one checkbox... the other checkboxes take some time to render and appear, which is why we wait for it */
    // setTimeout(() => {
    //   this.disableCheckboxes();
    // }, 5000);
    //this.getWeeklyReports();
    // this.getDailyReports();
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

    public testEmail(){
      let userData = {
                "username": 'cjzetroc',
                "first_name": 'CJ',
                "last_name": 'Cortez',
                "email": 'cj@spindesign.com.au',
                "password": 'password123',
      };

      this.data_api.sendTestEmail(userData).subscribe((result2) => {
              swal.fire({
                title: "Test Email Sent!",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                confirmButton: 'btn btn-success',
                },
                icon: "success"
              })
      });

    }

    // @HostListener('window:message', ['$event'])
    // onMessage(e) {
    //   console.log(e);

    //   if (e.data.message == "done") {
    //     console.log('Done Downloading');
    //     this.spinnerService.hide();
    //     this.myService.nextMessage("false");
    //   }else if (e.data.message == "start") {
    //     console.log('Start Downloading');
    //     this.myService.nextMessage("pdf");
    //     this.spinnerService.show();
    //   }
    // }


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