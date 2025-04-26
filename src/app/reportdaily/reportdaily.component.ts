import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef, Input, Inject} from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';

declare const $: any;

@Component({
  selector: 'app-report-daily',
  templateUrl: './reportdaily.component.html'
})
export class ReportDailyComponent {

  source: LocalDataSource = new LocalDataSource;
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

  public settings = {
    selectMode: 'multi',
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
        title: 'Action',
        type : 'html',
        filter: false,
        valuePrepareFunction: (cell,row) => {
          return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        }
      },
      id: {
        title: 'ID',
        valuePrepareFunction: (cell,row) => {
          return row.id;
        }
      },
      entry_date: {
        title: 'Entry Date',
        valuePrepareFunction: (cell,row) => {
            return this.formatDate(row.entry_date);
        }
      },
      project_name: {
        title: 'Project Name',
        valuePrepareFunction: (cell,row) => {
            return row.project_name;
        }
      },
      supervisor_name: {
        title: 'Supervisor Name',
        valuePrepareFunction: (cell,row) => {
            return row.supervisor_name;
        }
      },
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
      image_size : {
        title: 'Total Size of Images',
        valuePrepareFunction: (cell,row) => {
            return this.formatBytes(row.total_file_size);
        }
      },
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
    private spinnerService: NgxSpinnerService
    ) { }

  public ngOnInit() {
      this.rolechecker.check(3)
      // this.getWeeklyReports();
      this.filterWeeklyReports = this.formBuilder.group({
          entryDate: [''],
          projectID: [''],
          supervisorId: [''],
          hasImage: [''],
      });

      this.getProjects();
      this.getSupervisors();
  }

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
            this.source.load(data);
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

  ngAfterViewInit() {
    /* You can call this with a timeOut because if you don't you'll only see one checkbox... the other checkboxes take some time to render and appear, which is why we wait for it */
    // setTimeout(() => {
    //   this.disableCheckboxes();
    // }, 5000);
    this.getWeeklyReports();
  }

  public filterReports(){
    this.spinnerService.show();
      console.log(this.filterWeeklyReports.value);

      this.data_api.getWeeklyReportsQuery(this.filterWeeklyReports.value).subscribe((data) => {
        console.log(data);
        this.source.load(data);
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


}