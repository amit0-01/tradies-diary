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
import {CategoriesDeleteDialog, CategoriesDialog, CategoriesRenderComponent} from './categoriesbutton-render.component';
import { ExportToCsv } from 'export-to-csv';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { RoleChecker } from '../services/role-checker.service';
import { Subject } from 'rxjs';

declare const $: any;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styles : [`:host ::ng-deep  .material-icons {
    font-size: 13px;
    color: black;
    cursor: pointer;
  }
`]
})
export class CategoriesComponent implements OnInit {

  source: any
   dtOptions: any = {
  data: [],
  columns: [],
  destroy: true
  };
  dtTrigger: Subject<any> = new Subject();
  public projectList;
  userDetails:any

  public listCategories;

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
        width: '100px',
        type : 'custom',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell, row) => row,
        renderComponent: CategoriesRenderComponent
      //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        // }
      },
      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      category_name: {
        title: 'Category Name',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.prodCategoryName;
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
      // this.rolechecker.check(4)
      this.getFBProdCategories();
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

  public getFBProdCategories(): void {
    this.spinnerService.show();
    this.data_api.getFBProdCategories().subscribe(data => {
        if(data){
          if(data.prodCategoryArray){

            data.prodCategoryArray.sort(function(a, b) {
                var textA = a.prodCategoryName.toUpperCase();
                var textB = b.prodCategoryName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            // this.source = new LocalDataSource(data.prodCategoryArray)
            this.source = data.prodCategoryArray;
          }
        }
        this.setTableData();
        this.spinnerService.hide();
    });
  }

  // SET TABLE DATA
  setTableData(){
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
           <a [routerLink]="[]" class="edit"><i class="material-icons">edit</i></a>
          <a [routerLink]="[]" class="delete"><i class="material-icons">delete</i></a>`;

          cell.querySelector('.edit')?.addEventListener('click', () => this.openDialog(rowData));
          cell.querySelector('.delete').addEventListener('click', () => this.openDeleteDialog(rowData) )
        },
      },
      { title: 'Category Name', data: 'prodCategoryName',
       }
    ]
    this.dtTrigger.next();
  }

  // OPEN EDIT DIALOG

      openDialog(rowData:any): void {
          console.log(rowData);
          const dialogRef = this.dialog.open(CategoriesDialog, {
              width: '400px',
              data: rowData
          });
  
          dialogRef.afterClosed().subscribe(result => {
            
            // if(result == 'success'){   
            //     setTimeout(function(){
            //       window.location.reload();
            //     }, 1000);  
            // }
          });
      }

  // OPEN DELETE DIALOG
   openDeleteDialog(rowData:any): void {
  
        const dialogRef = this.dialog.open(CategoriesDeleteDialog, {
            width: '400px',
            data: rowData
        });
    
        dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          
            if(result){ 
  
                console.log(result);
                this.spinnerService.show();   
                    console.log(result);
                    this.data_api.deleteFBProdCategory(result).then(() => {
                      this.addLog(rowData);
                      $.notify({
                        icon: 'notifications',
                        message: 'Product Category Deleted'
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

      addLog(rowData:any){
        this.spinnerService.show();
        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Deleted Product Category - Global List',
            method: 'delete',
            subject: 'product-category',
            subjectID: rowData.prodCategoryID,
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
      const dialogRef = this.dialog.open(CategoriesAddDialog, {
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

          this.data_api.importCategory(result)
          .subscribe(
            (result2) => {
                swal.fire({
                      title: "New Categories Imported!",
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

        if(this.listCategories){

            this.listCategories.forEach(data =>{

                let tempData = {
                  category_name: data.category_name,
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
            filename:'categories'
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
          };
        
        const csvExporter = new ExportToCsv(options);
        
        csvExporter.generateCsv(exportData);
     
  }

}

@Component({
  selector: 'categories-adddialog',
  templateUrl: 'categories-adddialog.html',
})

export class CategoriesAddDialog implements OnInit {

  addFestForm: FormGroup;

  public userDetails;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CategoriesAddDialog>,
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
  //         log: 'Created New Product Category - Global List',
  //         method: 'create',
  //         subject: 'product-category',
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
          log: 'Created New Product Category - Global List',
          method: 'create',
          subject: 'product-category',
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

  public createFBProdCategory(): void {

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
      
      this.data_api.createFBProdCategory(this.addFestForm.value.prodCategoryName).then((result) => {
          console.log('Created new Supplier Global List successfully!');
          this.addLog(result);
          $.notify({
            icon: 'notifications',
            message: 'New Product Category Created'
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
      prodCategoryName: ['', Validators.required],
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