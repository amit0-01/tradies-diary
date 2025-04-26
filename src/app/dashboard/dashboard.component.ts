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
import { DailyDeleteRenderComponent } from './dailybutton-render.component';
import { WeeklyDeleteRenderComponent } from './weeklybutton-render.component';
import { AuthenticationService } from '../shared/authentication.service';

declare const $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {

  weeklySource: LocalDataSource = new LocalDataSource;
  dailySource: LocalDataSource = new LocalDataSource;

  public reportList;
  selectedMode: boolean = true;
  // This will contain selected rows
  selectedRows = [];
  filterWeeklyReports: FormGroup;
  public projectNames = [];
  public siteSupervisors = [];

  public selected: any

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

  public weeklyReportSettings = {
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
      class: 'table table-bordered'
    },
    hideSubHeader: true,
    mode: 'external',
    columns: {
      // customactions: {
      //   width: '30px',
      //   title: 'Action',
      //   type : 'html',
      //   filter: false,
      //   valuePrepareFunction: (cell,row) => {
      //     return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">edit</i></a>`;
      //   }
      // },
      customactions: {
        width: '120px',
        title: 'Action',
        type : 'html',
        filter: false,
        valuePrepareFunction: (cell,row) => {
          return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">preview</i></a>
          <a target="myIframe" href="#/weekly-report/edit/${row.id}?downloadmode=true"><i class="material-icons">picture_as_pdf</i></a>
          `;
        }
      },

      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      project_name: {
        title: 'Project Name',
        valuePrepareFunction: (cell,row) => {
            return row.project_name;
        }
      },
      entry_date: {
        title: 'Entry Date',
        valuePrepareFunction: (cell,row) => {
            return this.formatDate(row.entry_date);
        }
      },
      // supervisor_name: {
      //   title: 'Supervisor Name',
      //   valuePrepareFunction: (cell,row) => {
      //       return row.supervisor_name;
      //   }
      // },
      lost_days_week : {
        title: 'Total Days Lost',
        valuePrepareFunction: (cell,row) => {
          return Math.floor( (row.lost_hours_week /8) );
        }
      },
      lost_hours_week : {
        title: 'Total Hours Lost',
        valuePrepareFunction: (cell,row) => {
            return ( (row.lost_hours_week / 8) - Math.floor( (row.lost_hours_week /8) ) ) * 8;
        }
      },
      customdelaction: {
        width: '80px',
        title: '',
        type : 'custom',
        filter: false,
        valuePrepareFunction: (cell, row) => row,
        renderComponent: WeeklyDeleteRenderComponent
      },
      // image_size : {
      //   title: 'Total Size of Images',
      //   valuePrepareFunction: (cell,row) => {
      //       return this.formatBytes(row.total_file_size);
      //   }
      // },
    }
  };

  public dailyReportSettings = {
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
      class: 'table table-bordered'
    },
    hideSubHeader: true,
    mode: 'external',
    columns: {
      customactions: {
        width: '120px',
        title: 'Action',
        type : 'html',
        filter: false,
        valuePrepareFunction: (cell,row) => {
          return `<a href="#/daily-report/project/${row.project_id}?date=${row.entry_date}"><i class="material-icons">preview</i></a>
          <a target="myIframe" href="#/daily-report/project/${row.project_id}?date=${row.entry_date}&downloadmode=true"><i class="material-icons">picture_as_pdf</i></a>
          `;
        }
      },
      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      project_name: {
        title: 'Project Name',
        valuePrepareFunction: (cell,row) => {
            return row.project_name;
        }
      },
      entry_date: {
        title: 'Entry Date',
        valuePrepareFunction: (cell,row) => {
            return this.formatDate(row.entry_date);
        }
      },
      // supervisor_name: {
      //   title: 'Supervisor Name',
      //   valuePrepareFunction: (cell,row) => {
      //       return row.supervisor_name;
      //   }
      // },
      num_of_trades: {
        title: 'Trades On Site',
        valuePrepareFunction: (cell,row) => {
          return this.countNumber(row.trades_site);
        }
      },
      num_of_staff: {
        title: 'Staff On Site',
        valuePrepareFunction: (cell,row) => {
          return this.countNumber(row.staff_site);
        }
      },
      num_of_visitors: {
        title: 'Visitors On Site',
        valuePrepareFunction: (cell,row) => {
          return this.countNumber(row.visitors_site);
        }
      },
      customdelaction: {
        width: '80px',
        title: '',
        type : 'custom',
        filter: false,
        valuePrepareFunction: (cell, row) => row,
        renderComponent: DailyDeleteRenderComponent
      },
      // image_size : {
      //   title: 'Total Size of Images',
      //   valuePrepareFunction: (cell,row) => {
      //       return this.formatBytes(row.total_file_size);
      //   }
      // },
    }
  };

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
    public authService: AuthenticationService
    ) { }

  public ngOnInit() {
      //this.validateToken();
      //this.rolechecker.check(4)
      // this.getWeeklyReports();
      this.filterWeeklyReports = this.formBuilder.group({
          entryDate: [''],
          projectID: [''],
          supervisorId: [''],
          hasImage: [''],
      });

      //this.getProjects();
     // this.getSupervisors();
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
      var d = new Date(date),
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
            console.log(this.reportList);

            this.selectedMode = false;
            setTimeout(() => {
              this.disableCheckboxes();
            }, 1000);
            // this.disableCheckboxes();

        });
  }

  public newfilterWeeklyReports(val){
    console.log(val)     
    if(val){
      this.spinnerService.show();
      this.data_api.filterWeeklyReports(val).subscribe((data) => {
        console.log(data);
        this.weeklySource.load(data);
        this.reportList = data;
        this.spinnerService.hide();
        console.log(this.reportList);
        this.spinnerService.hide();
      });
    }else{
      this.getWeeklyReports();
    }

}

  public getDailyReports(){
      this.spinnerService.show();

      this.data_api.getDailyReports().subscribe((data) => {
        console.log(data);
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

  public filterDailyReports(val){
      console.log(val)     
      if(val){
        this.spinnerService.show();
        this.data_api.filterDailyReports(val).subscribe((data) => {
          console.log(data);
          this.dailySource.load(data);
          this.spinnerService.hide();
        });
      }else{
        this.getDailyReports();
      }

  }


  ngAfterViewInit() {
    /* You can call this with a timeOut because if you don't you'll only see one checkbox... the other checkboxes take some time to render and appear, which is why we wait for it */
    // setTimeout(() => {
    //   this.disableCheckboxes();
    // }, 5000);
    this.getWeeklyReports();
    this.getDailyReports();
  }

  public filterReports(){
    this.spinnerService.show();
      console.log(this.filterWeeklyReports.value);

      this.data_api.getWeeklyReportsQuery(this.filterWeeklyReports.value).subscribe((data) => {
        console.log(data);
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
      console.log(event);
      this.selectedRows = [];
      event.selected.forEach(element => {
          if(element.has_image == 'true'){
            this.selectedRows.push(element)
          }
      });
      console.log(this.selectedRows);
    }
  
    public deleteImages(){
      this.spinnerService.show();
      console.log(this.selectedRows);

      this.data_api.deleteWeeklyReportsImages(this.selectedRows).subscribe((data) => {
          console.log(data);

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
            console.log(result);
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
            console.log(result);
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

    @HostListener('window:message', ['$event'])
    onMessage(e) {
      console.log(e);

      if (e.data.message == "done") {
        console.log('Done Downloading');
        this.spinnerService.hide();
        this.myService.nextMessage("false");
      }else if (e.data.message == "start") {
        console.log('Start Downloading');
        this.myService.nextMessage("pdf");
        this.spinnerService.show();
      }
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