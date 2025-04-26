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
import {ReasonsDeleteDialog, ReasonsDialog, ReasonsRenderComponent} from './reasonsbutton-render.component';
import { ExportToCsv } from 'export-to-csv';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { RoleChecker } from '../services/role-checker.service';
import { Subject } from 'rxjs';

declare const $: any;

@Component({
  selector: 'app-reasons',
  templateUrl: './reasons.component.html',
  styles : [`:host ::ng-deep .material-icons {
    font-size: 13px;
    color: black;
    cursor: pointer;
  }`]
})
export class ReasonsComponent implements OnInit {

  source: any
  dtOptions: any = {
      data: [],
      columns: [],
      destroy : true
    };
    userDetails:any
  dtTrigger: Subject<any> = new Subject();
  public projectList;

  public listReasons;

  csvRecords: any[] = [];
  header = true;

  public settings = {
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
        type : 'custom',
        width: '100px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell, row) => row,
        renderComponent: ReasonsRenderComponent
      //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        // }
      },
      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      reason: {
        title: 'Reasons',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.reason;
        }
      },
    }
  };

  adminData;

  colorBtnDefault;

  constructor(
    private data_api: DatasourceService,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private ngxCsvParser: NgxCsvParser,
    private rolechecker: RoleChecker
    ) { }

  public ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }
      this.getAdminSettings();
      // this.rolechecker.check(4);
      this.getFBReasons();
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

  public getFBReasons(): void {
    this.spinnerService.show();
    this.data_api.getFBReasons().subscribe(data => {
        if(data){
          if(data.reasonArray){

            data.reasonArray.sort(function(a, b) {
                var textA = a.reason.toUpperCase();
                var textB = b.reason.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            
            // this.source = new LocalDataSource(data.reasonArray)
            this.source = data.reasonArray;
          }
        }
        this.setTableData();
        this.spinnerService.hide();
    });
  }

  // SET TABLE DATA
  public setTableData(){
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
        <a [routerLink]="[]" class="edit" ><i class="material-icons">edit</i></a>
        <a [routerLink]="[]" class="delete"><i class="material-icons">delete</i></a>          `;

          cell.querySelector('.edit')?.addEventListener('click', () => this.openDialog(rowData));
          cell.querySelector('.delete').addEventListener('click', () => this.openDeleteDialog(rowData) )
        },
      },
      { title: 'Reasons', data: 'reason',
       }
    ]
    this.dtTrigger.next();
}

// OPEN EDIT DIALOG

   openDialog(rowData:any): void {
         const dialogRef = this.dialog.open(ReasonsDialog, {
             width: '400px',
             data: rowData
         });
 
         dialogRef.afterClosed().subscribe(result => {
           
           if(result == 'success'){   
               // setTimeout(function(){
               //   window.location.reload();
               // }, 1000);  
           }
         });
     }
  
  // OPEN DELETE DIALOG
   openDeleteDialog(rowData:any): void {
       console.log('rowData', rowData)
        const dialogRef = this.dialog.open(ReasonsDeleteDialog, {
            width: '400px',
            data: rowData
        });
    
        dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          
            if(result){ 
  
              console.log(result);
              this.spinnerService.show();   
                  console.log(result);
                  this.data_api.deleteFBReason(result).then(() => {
                    this.addLog(rowData);
                    $.notify({
                      icon: 'notifications',
                      message: 'Reason Deleted'
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
                    
                  });
    
            }
  
        });
    }

 // ADD LOG

 addLog(rowData:any){
  this.spinnerService.show();
  let today = new Date();
  let passData = {
      todaysDate: today,
      log: 'Deleted Reason - Global List',
      method: 'delete',
      subject: 'reason',
      subjectID: rowData.reasonID,
      prevdata: rowData,
      data: '',
      url: window.location.href,
      userID: this.userDetails.user_id,
      userName: this.userDetails.name
  }
  this.data_api.addFBActivityLog(passData).then(() => {
    this.spinnerService.hide();
  });
}
  

  openAddDialog(): void {
      const dialogRef = this.dialog.open(ReasonsAddDialog, {
          width: '400px',
          data: this.adminData
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          if(result == 'success'){   
              // setTimeout(function(){
              //   window.location.reload();
              // }, 1000);  
          }
      });
  }

  // Your applications input change listener for the CSV File
  fileChangeListener($event: any): void {
    this.spinnerService.show();
      // Select the files from the event
      const files = $event.srcElement.files;
  
      // Parse the file you want to select for the operation along with the configuration
      this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',' })
        .pipe().subscribe((result: Array<any>) => {
  
          console.log('Result', result);
          this.csvRecords = result;

          this.data_api.importReasons(result)
          .subscribe(
            (result2) => {
                swal.fire({
                      title: "New Reasons Imported!",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-success',
                      },
                      icon: "success"
                  })

                  this.spinnerService.hide();
                  setTimeout(function(){
                    window.location.reload();
                  }, 1000);  

            },
            (error) => {
                console.log(error)
                swal.fire({
                    title: error.error.message,
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "error"
                })
                
            }
            
          );  


        }, (error: NgxCSVParserError) => {
          console.log('Error', error);
        });
  
    }

  downloadCSV(){
        let exportData=[];

        if(this.listReasons){

            this.listReasons.forEach(data =>{

                let tempData = {
                  reason: data.reason,
                }
                exportData.push(tempData);

            });

        }

          const options = { 
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true, 
            showTitle: false,
            // title: 'My Awesome CSV',
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            filename:'reason'
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
          };
        
        const csvExporter = new ExportToCsv(options);
        
        csvExporter.generateCsv(exportData);
     
  }


}


@Component({
  selector: 'reasons-adddialog',
  templateUrl: 'reasons-adddialog.html',
})

export class ReasonsAddDialog implements OnInit {

  addFestForm: FormGroup;

  public userDetails;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ReasonsAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  // public addLog(id){
  //     let today = new Date();
  //     let passData = {
  //         todaysDate: today,
  //         log: 'Created New Reason - Global List',
  //         method: 'create',
  //         subject: 'reason',
  //         subjectID: id,
  //         data: this.addFestForm.value,
  //         url: window.location.href
  //     }
      
  //     this.data_api.addActivityLog(this.userDetails.user_id,passData)
  //       .subscribe(
  //         (result) => {
  //           console.log(result);
  //           this.dialogRef.close('success');
  //         }
  //     ); 
  // }

  public addLog(id){
      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Reason - Global List',
          method: 'create',
          subject: 'reason',
          subjectID: id,
          data: this.addFestForm.value,
          url: window.location.href,
          userID: this.userDetails.user_id,
          userName: this.userDetails.name
      }
      this.data_api.addFBActivityLog(passData).then(() => {
        this.dialogRef.close('success');
        this.spinnerService.hide();
      });
  }

  public createFBReason(): void {

      if (this.addFestForm.invalid) {

        swal.fire({
            title: "Please fill required fields!",
            // text: "You clicked the button!",
            buttonsStyling: false,
            customClass: {
              confirmButton: 'btn btn-success',
            },
            icon: "error"
        })

        return;
    } 

      this.spinnerService.show();

      console.log(this.addFestForm.value.supplierName);
      
      this.data_api.createFBReason(this.addFestForm.value.reason).then((result) => {

          // this.dialogRef.close('success');
          // this.spinnerService.hide();
          this.addLog(result);

          $.notify({
            icon: 'notifications',
            message: 'New Reason Created'
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
          
        });
      
  }

  ngOnInit() {

    this.adminData = this.data;
    this.colorBtnDefault = this.data.colourEnabledButton ? this.data.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      reason: ['', Validators.required],
    }, {
    });
    
    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

}