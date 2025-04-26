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
import {ProductsDeleteDialog, ProductsDialog, ProductsRenderComponent} from './productsbutton-render.component';
import { ExportToCsv } from 'export-to-csv';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { RoleChecker } from '../services/role-checker.service';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

declare const $: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styles : [`:host ::ng-deep .material-icons {
    font-size: 13px;
    color: black;
    cursor: pointer;
  }`]
})
export class ProductsComponent implements OnInit {

  source: any
  public projectList;

  public listProducts;
  dtOptions: any = {
    data: [],
    columns: [],
    destroy: true
  };
  dtTrigger: Subject<any> = new Subject();

  csvRecords: any[] = [];
  header = true;
  userDetails:any

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
        renderComponent: ProductsRenderComponent
      //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        // }
      },
      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      product: {
        title: 'Product',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.productArrayName;
        }
      },
      // quantity: {
      //   title: 'Quantity',
      //   valuePrepareFunction: (cell,row) => {
      //       return row.quantity;
      //   }
      // },
      unit: {
        title: 'Unit',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.productArrayUnit;
        }
      },
      cost: {
        title: 'Unit Cost',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.productArrayCost;
        }
      },
      // total: {
      //   title: 'Total',
      //   valuePrepareFunction: (cell,row) => {
      //       return row.total;
      //   }
      // },
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
      this.getFBProductsArray();
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

  // getFBProducts(): void {
  //   this.spinnerService.show();
  //   this.data_api.getFBProducts().subscribe(data => {
  //     console.log(data);

  //       if(data){
  //         this.source = new LocalDataSource(data)

  //         this.spinnerService.hide();

  //       }

  //   });
  // }

  public getFBProductsArray(): void {
    this.spinnerService.show();
    this.data_api.getFBProductsArray().subscribe(data => {
        if(data){
          if(data.productArray){
            data.productArray.sort(function(a, b) {
                var textA = a.productArrayName.toUpperCase();
                var textB = b.productArrayName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            // this.source = new LocalDataSource(data.productArray)
            this.source = data.productArray;
          }
        }
        this.setTableData();
        this.spinnerService.hide();
    });
  }

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
      { title: 'Product', data: 'productArrayName',
       }
    ]
    this.dtTrigger.next();
}

// OPEN DELETE DIALOG
 openDialog(rowData:any): void {
        const dialogRef = this.dialog.open(ProductsDialog, {
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
      console.log('rowData', rowData);
      const dialogRef = this.dialog.open(ProductsDeleteDialog, {
          width: '400px',
          data: rowData
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
          if(result){ 

            console.log(result);
            this.spinnerService.show();   
                console.log(result);
                this.data_api.deleteFBProduct(result).then(() => {
                  this.addLog(rowData,result.productArrayID);
                  $.notify({
                    icon: 'notifications',
                    message: 'Supplier Deleted'
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

  addLog(rowData:any, id:any){
        this.spinnerService.show();
        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Deleted Product - Global List',
            method: 'delete',
            subject: 'product',
            subjectID: id,
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


  // public getProducts(){
  //       this.spinnerService.show();

  //       this.data_api.getProducts().subscribe((data) => {
  //           this.source.load(data);
  //           // this.projectList = data[0];
  //           this.spinnerService.hide();
  //           console.log(data);
  //           this.listProducts = data;
  //       });
  // }

  openAddDialog(): void {
      const dialogRef = this.dialog.open(ProductsAddDialog, {
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

          this.data_api.importProduct(result)
          .subscribe(
            (result2) => {
                swal.fire({
                      title: "New Products Imported!",
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

        if(this.listProducts){

            this.listProducts.forEach(data =>{

                let tempData = {
                  product_name: data.product_name,
                  size_type: data.size_type,
                  unit: data.unit,
                  cost: data.cost,
                  brand: data.brand,
                  sku: data.sku,
                  supplier: data.supplier,
                  category: data.category,
                  cost_centre: data.cost_centre,
                  stage: data.stage,
                }
                exportData.push(tempData);
                // data.forEach(data2 =>{      
                //   if(data == data2.id){
                //     this.listVisitors.push({visitor_name: data2.name})  
                //   }
                // });

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
            filename:'products'
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
          };
        
        const csvExporter = new ExportToCsv(options);
        
        csvExporter.generateCsv(exportData);
     
  }

}


@Component({
  selector: 'products-adddialog',
  templateUrl: 'products-adddialog.html',
})

export class ProductsAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listSuppliers:any= [];
  public listCategories:any= [];
  public listStages:any= [];
  public listCostCentres:any= [];
  sizeTypeChoices= [
    {value: 'length', viewValue: 'Length'},
    {value: 'squared', viewValue: 'Squared'},
    {value: 'cubed', viewValue: 'Cubed'},
    {value: 'weight', viewValue: 'Weight'},
    {value: 'time', viewValue: 'Time'},
    {value: 'item', viewValue: 'Item'},
  ]
  unitMeasurements=[
    {value: 'M3', viewValue: 'M3', type: 'cubed'},
    {value: 'LM', viewValue: 'LM', type: 'length'},
    {value: 'M2', viewValue: 'M2', type: 'squared'},
    {value: 'Tons', viewValue: 'Tons', type: 'weight'},
    {value: 'Kg', viewValue: 'Kg', type: 'weight'},
    {value: 'Hrs', viewValue: 'Hrs', type: 'time'},
  ]

  public filter_list_suppliers: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_categories: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_costcentres: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_stages: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  public search_control_supplier: FormControl = new FormControl();
  public search_control_category: FormControl = new FormControl();
  public search_control_costcentre: FormControl = new FormControl();
  public search_control_stage: FormControl = new FormControl();

  public userDetails;

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ProductsAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  initializeFilterSuppliers() {

    this.filter_list_suppliers.next(this.listSuppliers.slice());

    this.search_control_supplier.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListSuppliers();
      });
      console.log(this.search_control_supplier);
  }

  initializeFilterCategories() {

    this.filter_list_categories.next(this.listCategories.slice());

      this.search_control_category.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListCategories();
      });

  }

  initializeFilterCostcentres() {

    this.filter_list_costcentres.next(this.listCostCentres.slice());

      this.search_control_costcentre.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListCostcentres();
      });

  }

  initializeFilterStages() {

    this.filter_list_stages.next(this.listStages.slice());

      this.search_control_stage.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListStages();
      });

  }

  protected filterListSuppliers() {
      if (!this.listSuppliers) {
        return;
      }
      // get the search keyword
      let search = this.search_control_supplier.value;
      if (!search) {
        this.filter_list_suppliers.next(this.listSuppliers.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_suppliers.next(
        this.listSuppliers.filter(listSupplier => listSupplier.supplierName.toLowerCase().indexOf(search) > -1)
      );
  }

  protected filterListCategories() {
      if (!this.listCategories) {
        return;
      }
      // get the search keyword
      let search = this.search_control_category.value;
      if (!search) {
        this.filter_list_categories.next(this.listCategories.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_categories.next(
        this.listCategories.filter(listCategory => listCategory.prodCategoryName.toLowerCase().indexOf(search) > -1)
      );
  }

  protected filterListCostcentres() {
      if (!this.listCostCentres) {
        return;
      }
      // get the search keyword
      let search = this.search_control_costcentre.value;
      if (!search) {
        this.filter_list_costcentres.next(this.listCostCentres.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_costcentres.next(
        this.listCostCentres.filter(listCostCentre => listCostCentre.costcentreName.toLowerCase().indexOf(search) > -1)
      );
  }

  protected filterListStages() {
      if (!this.listStages) {
        return;
      }
      // get the search keyword
      let search = this.search_control_stage.value;
      if (!search) {
        this.filter_list_stages.next(this.listStages.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_stages.next(
        this.listStages.filter(listStage => listStage.stageName.toLowerCase().indexOf(search) > -1)
      );
  }

  // public addLog(id){
  //     // let newDetails;
  //     // newDetails += 'Company:';

  //     let today = new Date();
  //     let passData = {
  //         todaysDate: today,
  //         log: 'Created New Product - Global List',
  //         method: 'create',
  //         subject: 'product',
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
          log: 'Created New Product - Global List',
          method: 'create',
          subject: 'product',
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

  public addNewProduct() {

   
      if (this.addFestForm.invalid) {
        swal.fire({
            title: "Fill the Required Fields!",
            // text: "You clicked the button!",
            buttonsStyling: false,
            customClass: {
              confirmButton: 'btn btn-success',
            },
            icon: "error"
        })

        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      this.data_api.createFBProduct(this.addFestForm.value).then((result) => {
        console.log('Created new item successfully!');
 
         $.notify({
           icon: 'notifications',
           message: 'New Product Created'
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
        //  this.spinnerService.hide();
        //  this.dialogRef.close('success');

        this.addLog(result);

       });
      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      // this.data_api.addProduct(this.addFestForm.getRawValue())
      // .subscribe(
      //   (result) => {
      //     if(result){

      //         swal.fire({
      //             title: "New Product Created!",
      //             // text: "You clicked the button!",
      //             buttonsStyling: false,
      //             customClass: {
      //               confirmButton: 'btn btn-success',
      //             },
      //             icon: "success"
      //         })

      //         this.addLog(result);

      //         this.spinnerService.hide();

      //     }else{

      //       swal.fire({
      //           title: "Error in Creating New Product",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn btn-success',
      //           },
      //           icon: "error"
      //       })

      //       this.spinnerService.hide();

      //     }
      // },
      // (error) => {
      //     console.log(error)
      //     swal.fire({
      //         title: error.error.message,
      //         // text: "You clicked the button!",
      //         buttonsStyling: false,
      //         customClass: {
      //           confirmButton: 'btn btn-success',
      //         },
      //         icon: "error"
      //     })
          
      // }
      
      //);  
  }

  ngOnInit() {
      this.addFestForm = this.formBuilder.group({
        productName: ['', Validators.required],
        // quantity: [''],
        // length: [''],
        // width: [''],
        // height: [''],
        productUnit: [''],
        // area: [{ value: '', disabled: true }],
        // volume: [{ value: '', disabled: true }],
        productCost: [''],
        // total: [{ value: '', disabled: true }],
        productSizeType: [''],
        productBrand: [''],
        productSku: [''],
        productSupplier: [''],
        productCategory: [''],
        productCostcentre: [''],
        productStage: [''],
      }, {
      });

      this.adminData = this.data;
      this.colorBtnDefault = this.data.colourEnabledButton ? this.data.colourEnabledButton : '';

      this.getFBSuppliers();
      this.getFBProdCategories();
      this.getFBStages();
      this.getFBCostcentres();

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
  
    public onComputeSpace(){
      let length = this.addFestForm.value.length;
      let width = this.addFestForm.value.width;
      let height = this.addFestForm.value.height;
  
      if(this.addFestForm.value.sizeType == 'squared'){
  
        this.addFestForm.patchValue({
          area: length * width
        });
  
      }else if(this.addFestForm.value.sizeType == 'cubed'){
  
        this.addFestForm.patchValue({
          volume: length * width * height
        });
  
      }
  
      this.onComputeTotal();
    }
  
    public onComputeTotal(){
      let quantity = this.addFestForm.value.quantity;
      let unitCost = this.addFestForm.value.cost;
      let area = this.addFestForm.getRawValue().area;
      let volume = this.addFestForm.getRawValue().volume;
  
      if(this.addFestForm.value.sizeType == 'squared'){
        this.addFestForm.patchValue({
          total: (area * unitCost) * quantity
        });
      }else if(this.addFestForm.value.sizeType == 'cubed'){
        this.addFestForm.patchValue({
          total: (volume * unitCost) * quantity
        });
      }else{
        this.addFestForm.patchValue({
          total: unitCost * quantity
        });
      }
  
    }
  
    public sizeTypeChanged(){
      this.addFestForm.patchValue({
          length: '',
          width: '',
          height: '',
          quantity: '',
          cost: '',
          total: '',
      });
    }
  
    public getFBSuppliers(): void {
      this.data_api.getFBSuppliers().subscribe(data => {
          if(data){
            if(data.supplierArray){
                data.supplierArray.forEach(data =>{ 
                    this.listSuppliers.push(data)
                })
                console.log(this.listSuppliers);
                this.initializeFilterSuppliers();
            }
          }
      });
    }
  
    public getFBProdCategories(): void {
      this.data_api.getFBProdCategories().subscribe(data => {
          if(data){
            if(data.prodCategoryArray){
                data.prodCategoryArray.forEach(data =>{ 
                    this.listCategories.push(data)
                })
                this.initializeFilterCategories();
              }
          }
      });
    }
  
    public getFBStages(): void {
      this.data_api.getFBStages().subscribe(data => {
          if(data){
            if(data.stageArray){
              data.stageArray.forEach(data =>{ 
                  this.listStages.push(data)
              })
              this.initializeFilterStages();
            }
          }
      });
    }
  
    public getFBCostcentres(): void {
      this.data_api.getFBCostcentres().subscribe(data => {
          if(data){
            if(data.costcentreArray){
                data.costcentreArray.forEach(data =>{ 
                    this.listCostCentres.push(data)
                })
                this.initializeFilterCostcentres();
            }
          }
      });
    }

    openAddSuppliersDialog(): void {
        const dialogRef = this.dialog.open(SuppliersAddDialog, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getFBSuppliers();
                this.addFestForm.patchValue({
                  supplier: result.toString()
                });
            }
        });
    }

    openAddCategoriesDialog(): void {
        const dialogRef = this.dialog.open(CategoriesAddDialog, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getFBProdCategories();
                this.addFestForm.patchValue({
                  category: result.toString()
                });
            }
        });
    }

    openAddCostCentresDialog(): void {
        const dialogRef = this.dialog.open(CostcentresAddDialog, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getFBCostcentres();
                this.addFestForm.patchValue({
                  costCentre: result.toString()
                });
            }
        });
    }

    openAddStageDialog(): void {
      const dialogRef = this.dialog.open(StagesAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          if(result){   
              this.getFBStages();
              this.addFestForm.patchValue({
                stage: result.toString()
              });
          }
      });
  }

}


@Component({
  selector: 'suppliers-adddialog',
  templateUrl: 'suppliers-adddialog.html',
})

export class SuppliersAddDialog implements OnInit {

  addFestForm: FormGroup;
  public userDetails;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SuppliersAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewSupplier() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addSupplier(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Supplier Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.addSupplierLog(result);
              this.spinnerService.hide();

          }else{

            swal.fire({
                title: "Error in Creating New Supplier",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })

            this.spinnerService.hide();

          }
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
  }

  public addSupplierLog(id){
      // let newDetails;
      // newDetails += 'Company:';

      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Supplier - Global List',
          method: 'create',
          subject: 'supplier',
          subjectID: id,
          data: this.addFestForm.value,
          url: window.location.href
      }
      
      this.data_api.addActivityLog(this.userDetails.user_id,passData)
        .subscribe(
          (result) => {
            console.log(result);
            this.dialogRef.close(id);
          }
      ); 
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });

    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

  }
}


@Component({
  selector: 'categories-adddialog',
  templateUrl: 'categories-adddialog.html',
})

export class CategoriesAddDialog implements OnInit {

  addFestForm: FormGroup;
  userDetails;

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
  
  public addNewCategory() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addCategory(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Category Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })
              this.addCategoryLog(result);
              this.spinnerService.hide();

          }else{

            swal.fire({
                title: "Error in Creating New Category",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })

            this.spinnerService.hide();

          }
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
  }

  public addCategoryLog(id){
    // let newDetails;
    // newDetails += 'Company:';

    let today = new Date();
    let passData = {
        todaysDate: today,
        log: 'Created New Product Category - Global List',
        method: 'create',
        subject: 'product-category',
        subjectID: id,
        data: this.addFestForm.value,
        url: window.location.href
    }
    
    this.data_api.addActivityLog(this.userDetails.user_id,passData)
      .subscribe(
        (result) => {
          console.log(result);
          this.dialogRef.close(id);
        }
    ); 
}


  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

  }
}

@Component({
  selector: 'costcentres-adddialog',
  templateUrl: 'costcentres-adddialog.html',
})

export class CostcentresAddDialog implements OnInit {

  addFestForm: FormGroup;
  userDetails;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CostcentresAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewCostcentre() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addCostcentre(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Cost Centre Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.addCostLog(result);

              this.spinnerService.hide();

          }else{

            swal.fire({
                title: "Error in Creating New Cost Centre",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })

            this.spinnerService.hide();

          }
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
  }

    public addCostLog(id){
      // let newDetails;
      // newDetails += 'Company:';

      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Cost Centre - Global List',
          method: 'create',
          subject: 'costcentre',
          subjectID: id,
          data: this.addFestForm.value,
          url: window.location.href
      }
      
      this.data_api.addActivityLog(this.userDetails.user_id,passData)
        .subscribe(
          (result) => {
            console.log(result);
            this.dialogRef.close(id);
          }
      ); 
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });

    if (localStorage.getItem('currentUser')) {
        this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    } 
    
  }
}

@Component({
  selector: 'stages-adddialog',
  templateUrl: 'stages-adddialog.html',
})

export class StagesAddDialog implements OnInit {

  addFestForm: FormGroup;
  public userDetails;
  
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<StagesAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewStage() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addStage(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Stage Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.addStageLog(result);
              this.spinnerService.hide();

          }else{

            swal.fire({
                title: "Error in Creating New Stage",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })

            this.spinnerService.hide();

          }
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
  }

  public addStageLog(id){
      // let newDetails;
      // newDetails += 'Company:';

      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Stage - Global List',
          method: 'create',
          subject: 'stage',
          subjectID: id,
          data: this.addFestForm.value,
          url: window.location.href
      }
      
      this.data_api.addActivityLog(this.userDetails.user_id,passData)
        .subscribe(
          (result) => {
            console.log(result);
            this.dialogRef.close(id);
          }
      ); 
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });

    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

  }
}