import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatasourceService} from '../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

declare const $: any;

@Component({
  template: `
    <a [routerLink]="[]" (click)="openDialog()"><i class="material-icons">edit</i></a>
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
})
export class ProductsRenderComponent implements ViewCell, OnInit {

  public renderValue;

 @Input() value: string | number;
 @Input() rowData: any;

 public userDetails;
 public prevdata;

  constructor(
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    ) {  }

  ngOnInit() {
    this.renderValue = this.value;
    console.log(this.renderValue);

    this.prevdata = this.renderValue;

    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

  }

    openDialog(): void {
        console.log(this.renderValue);
        const dialogRef = this.dialog.open(ProductsDialog, {
            width: '400px',
            data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
          
          if(result == 'success'){   
              // setTimeout(function(){
              //   window.location.reload();
              // }, 1000);  
          }
        });
    }

    
    openDeleteDialog(): void {

      const dialogRef = this.dialog.open(ProductsDeleteDialog, {
          width: '400px',
          data: this.renderValue
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
          if(result){ 

            console.log(result);
            this.spinnerService.show();   
                console.log(result);
                this.data_api.deleteFBProduct(result).then(() => {
                  this.addLog(result.productArrayID);
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

  addLog(id){
        this.spinnerService.show();
        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Deleted Product - Global List',
            method: 'delete',
            subject: 'product',
            subjectID: id,
            prevdata: this.prevdata,
            data: '',
            url: window.location.href,
            userID: this.userDetails.user_id,
            userName: this.userDetails.name
        }
        this.data_api.addFBActivityLog(passData).then(() => {
          this.spinnerService.hide();
        });
    }
}

@Component({
    selector: 'products-dialog',
    templateUrl: 'productsdialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class ProductsDialog implements OnInit {
  
    editForm: FormGroup;
    public listSuppliers:any= [];
    public listCategories:any= [];
    public listStages:any= [];
    public listCostCentres:any= [];

    public userDetails;
    public prevdata;

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
  
    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  
    protected _onDestroy = new Subject<void>();

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ProductsDialog>,
      public dialog: MatDialog,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
    ngOnInit() {
        console.log(this.data);
        
        this.editForm = this.formBuilder.group({
            // id: ['', Validators.required],
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
        });

        this.getAdminSettings();

        this.getFBProduct();
        this.getFBSuppliers();
        this.getFBProdCategories();
        this.getFBStages();
        this.getFBCostcentres();

        if (localStorage.getItem('currentUser')) {
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
        }

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

    // public addLog(){
    //     // let newDetails;
    //     // newDetails += 'Company:';

    //     let today = new Date();
    //     let passData = {
    //         todaysDate: today,
    //         log: 'Updated a Product - Global List',
    //         method: 'update',
    //         subject: 'product',
    //         subjectID: this.data.id,
    //         prevdata: this.prevdata,
    //         data: this.editForm.value,
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

    public addLog(){
        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Updated a Product - Global List',
            method: 'update',
            subject: 'product',
            subjectID: this.data.productArrayID,
            prevdata: this.prevdata,
            data: this.editForm.value,
            url: window.location.href,
            userID: this.userDetails.user_id,
            userName: this.userDetails.name
        }
        this.data_api.addFBActivityLog(passData).then(() => {
          this.dialogRef.close('success');
          this.spinnerService.hide();
        });
    }

    updateFBProduct(): void {

      if (this.editForm.invalid) {

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

      console.log(this.editForm.value);
      this.data_api.updateFBProduct(this.data, this.editForm.value).then(() => {
          console.log('Updated item successfully!');
          this.addLog();

          $.notify({
            icon: 'notifications',
            message: 'Product Updated Successfully'
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
          this.listSuppliers.filter(listSupplier => listSupplier.supplier_name.toLowerCase().indexOf(search) > -1)
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
          this.listCategories.filter(listCategory => listCategory.category_name.toLowerCase().indexOf(search) > -1)
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
          this.listCostCentres.filter(listCostCentre => listCostCentre.costcentre_name.toLowerCase().indexOf(search) > -1)
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
          this.listStages.filter(listStage => listStage.stage_name.toLowerCase().indexOf(search) > -1)
        );
    }

    public getFBProduct(){
      this.spinnerService.show();
      this.data_api.getFBProduct(this.data.productArrayID).subscribe((data) => {
              console.log(data);

              this.editForm.patchValue({
                // id: data.id,
                productName: data.productName,
                // quantity: this.agentData[0].quantity,
                // length: this.agentData[0].length,
                // width: this.agentData[0].width,
                // height: this.agentData[0].height,
                // area: this.agentData[0].area,
                // volume: this.agentData[0].volume,
                productUnit: data.productUnit,
                productCost: data.productCost,
                // total: this.agentData[0].total,
                productSizeType: data.productSizeType,
                productBrand: data.productBrand,
                productSku: data.productSku,
                productSupplier: data.productSupplier,
                productCategory: data.productCategory,
                productCostcentre: data.productCostcentre,
                productStage: data.productStage,
            });

              this.prevdata = this.editForm.value;
              console.log(this.prevdata);
              this.spinnerService.hide();
        }
      );
    }

    public onComputeSpace(){
      let length = this.editForm.value.length;
      let width = this.editForm.value.width;
      let height = this.editForm.value.height;
  
      if(this.editForm.value.sizeType == 'squared'){
  
        this.editForm.patchValue({
          area: length * width
        });
  
      }else if(this.editForm.value.sizeType == 'cubed'){
  
        this.editForm.patchValue({
          volume: length * width * height
        });
  
      }
  
      this.onComputeTotal();
    }
  
    public onComputeTotal(){
      let quantity = this.editForm.value.quantity;
      let unitCost = this.editForm.value.cost;
      let area = this.editForm.getRawValue().area;
      let volume = this.editForm.getRawValue().volume;
  
      if(this.editForm.value.sizeType == 'squared'){
        this.editForm.patchValue({
          total: (area * unitCost) * quantity
        });
      }else if(this.editForm.value.sizeType == 'cubed'){
        this.editForm.patchValue({
          total: (volume * unitCost) * quantity
        });
      }else{
        this.editForm.patchValue({
          total: unitCost * quantity
        });
      }
  
    }
  
    public sizeTypeChanged(){
      this.editForm.patchValue({
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
        const dialogRef = this.dialog.open(SuppliersAddDialogEdit, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getFBSuppliers();
                this.editForm.patchValue({
                  supplier: result.toString()
                });
            }
        });
    }

    openAddCategoriesDialog(): void {
        const dialogRef = this.dialog.open(CategoriesAddDialogEdit, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getFBProdCategories();
                this.editForm.patchValue({
                  category: result.toString()
                });
            }
        });
    }

    openAddCostCentresDialog(): void {
        const dialogRef = this.dialog.open(CostcentresAddDialogEdit, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getFBCostcentres();
                this.editForm.patchValue({
                  costCentre: result.toString()
                });
            }
        });
    }

    openAddStageDialog(): void {
      const dialogRef = this.dialog.open(StagesAddDialogEdit, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          if(result){   
              this.getFBStages();
              this.editForm.patchValue({
                stage: result.toString()
              });
          }
      });
    }
}

@Component({
  selector: 'products-deletedialog',
  templateUrl: 'products-deletedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})

export class ProductsDeleteDialog implements OnInit {

  deleteConfirm;

  adminData;

  colorBtnDefault;

  constructor(
    public dialogRef: MatDialogRef<ProductsDeleteDialog>,
    private data_api: DatasourceService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmDelete(): void {

    if(this.deleteConfirm == 'DELETE'){
      this.dialogRef.close(this.data);
    }else{
      this.dialogRef.close();
      $.notify({
        icon: 'notifications',
        message: 'Confirmation Failed'
      }, {
          type: 'danger',
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
    }
    
  }

  ngOnInit() {
      this.getAdminSettings();
      console.log(this.data);
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

}


@Component({
  selector: 'suppliers-adddialog',
  templateUrl: 'suppliers-adddialog.html',
})

export class SuppliersAddDialogEdit implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SuppliersAddDialogEdit>,
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

              this.spinnerService.hide();

              this.dialogRef.close(result);

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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}


@Component({
  selector: 'categories-adddialog',
  templateUrl: 'categories-adddialog.html',
})

export class CategoriesAddDialogEdit implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CategoriesAddDialogEdit>,
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

              this.spinnerService.hide();

              this.dialogRef.close(result);

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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}

@Component({
  selector: 'costcentres-adddialog',
  templateUrl: 'costcentres-adddialog.html',
})

export class CostcentresAddDialogEdit implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CostcentresAddDialogEdit>,
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

              this.spinnerService.hide();

              this.dialogRef.close(result);

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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}

@Component({
  selector: 'stages-adddialog',
  templateUrl: 'stages-adddialog.html',
})

export class StagesAddDialogEdit implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<StagesAddDialogEdit>,
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

              this.spinnerService.hide();

              this.dialogRef.close(result);

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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}