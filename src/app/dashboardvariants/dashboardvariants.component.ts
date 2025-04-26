import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef, Input, Inject} from '@angular/core';
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
import {ActivatedRoute, Params, Router} from '@angular/router';
import {  first, reduce, map, finalize  } from 'rxjs/operators';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { Observable, Observer } from "rxjs";
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { PlaceholderImage } from '../services/placeholder-image';
import { Timestamp } from '@firebase/firestore';
import { PDFIcons } from '../services/pdf-icons';
import * as moment from 'moment';
import { DatePipe,formatCurrency } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import { VariationImage } from '../services/variation-image';
import { PDFDocument } from 'pdf-lib'
import { NgxProgressOverlayService } from 'ngx-progress-overlay';

declare const $: any;

@Component({
  selector: 'app-dashboardvariants',
  templateUrl: './dashboardvariants.component.html'
})
export class DashboardVariantsComponent implements OnInit, AfterViewInit {

  @ViewChild('signature')
    
  signaturePad: SignaturePadComponent;

  public signaturePadOptions: NgSignaturePadOptions = { // passed through to szimek/signature_pad constructor
    minWidth: 5,
    canvasWidth: 400,
    canvasHeight: 100
  };

  public passID: any;

  public userDetails;
  public variationData;
  public projectData;

  pdfLogo;
  pdfFooterImage;
  pdfClientNames;

  source: LocalDataSource = new LocalDataSource;
  public reportList;
  selectedMode: boolean = true;
  // This will contain selected rows
  selectedRows = [];
  filterWeeklyReports: FormGroup;
  public projectNames = [];
  public siteSupervisors = [];
  public curUserID;

  public selected: any

  pdfLink;

  searchChoices = [
    {value: 'entry_date', viewValue: 'Entry Date'},
    {value: 'project_id', viewValue: 'Project'},
    // {value: 'supervisor_id', viewValue: 'Supervisor'},
    {value: 'has_image', viewValue: 'Uploaded Images'},
  ]

  imageBoolean = [
    {value: 'true', viewValue: 'Yes'},
    {value: 'false', viewValue: 'No'},
  ]

  public projectOwners:any = [];
  public setProjectOwners = [];
  projectOwnerControl = new FormControl([]);
  public projUploadFolder;

  public settings = {
    // selectMode: 'multi',
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
        width: '30px',
        title: 'Action',
        type : 'html',
        filter: false,
        valuePrepareFunction: (cell,row) => {
          return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">edit</i></a>`;
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
      supervisor_name: {
        title: 'Supervisor Name',
        valuePrepareFunction: (cell,row) => {
            return row.display_name;
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

  addFestForm: FormGroup;
  tempVariationArray; 

  accountFirebase;
  downloadURL;

  imgSrc;

  adminData;
  variationSettingsData;

  constructor(
    private data_api: DatasourceService,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private renderer2: Renderer2,
    private e: ElementRef,
    private rolechecker: RoleChecker,
    private route: ActivatedRoute,
    private router: Router,
    private afStorage: AngularFireStorage,
    private functions: AngularFireFunctions,
    public placeholderImage: PlaceholderImage,
    public pdfIcons:PDFIcons,
    private variationImage: VariationImage,
    private progressOverlay: NgxProgressOverlayService,
    ) { }

  public ngOnInit() {

    this.passID = {
        id: this.route.snapshot.params['id'],
    };
    this.route.params

    .subscribe(
        (params: Params) => {
            this.passID.id = params['id'];
        }
    );

    console.log(location.origin)

    if (localStorage.getItem('currentUser')) {
        this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }
    
      // this.rolechecker.check(3)
      // this.getWeeklyReports();
      // this.filterWeeklyReports = this.formBuilder.group({
      //     entryDate: [''],
      //     projectID: [''],
      //     supervisorId: [''],
      //     hasImage: [''],
      // });

      this.addFestForm = this.formBuilder.group({
          projectId: ['', Validators.required],
          variantsNumber: ['', Validators.required],
          variationsName: ['', Validators.required],
          // clientName: ['', Validators.required],
          dueDate: ['', Validators.required],
          projectOwner: ['', Validators.required],
          variationGroupArray: this.formBuilder.array([ this.createVariationGroupArray() ]),
          openingMessage: ['', Validators.required],
          closingMessage: ['', Validators.required],
          status: [''],
          clientEmail: [''],
          folderName: [''],
          signature: ['', Validators.required],
          createdAt: [''],
          createdBy: [''],
          pdfLink: [''],
          bmHideAll : [''],
          bmLineitem : [''],
          bmTotalFigure : [''],
          qtyHideAll : [''],
          unitHideAll : [''],
          unitCostHideAll : [''],
          gstHideAll : [''],
          itemTotalHideAll : [''],
          comments:  [''],
          approvedAt: [''],
          approvedBy:  [''],
          approvedRole: [''],
      });

      // this.addFestForm.patchValue({
      //   projectId:  this.passID.id,
      //   variantsNumber: 'test-001'
      // });
      
      // this.getProjects();
      // this.getSupervisors();
      this.getFBProjectUsers();
      this.accountFirebase = this.data_api.getCurrentProject();

      this.getAdminSettings();
      this.getVariationSettings();

  }

  openExternalQuotesDialog(files): void {
      const dialogRef = this.dialog.open(ExternalQuotesClientDialog, {
          width: '700px',
          data: files
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
          // if(result){   
          //       setTimeout(() => {

          //         this.editForm.patchValue({
          //           uom: result.toString(),
          //         });

          //         this.initializeFilterUom();
          //       }, 1000); 
          // }
      });
      
  }

  async enlargeImage(event){
    
    const imgElem = event.target;
    
    var target = event.target || event.srcElement || event.currentTarget;
    var srcAttr = target.attributes.src;
    ;

    const awaitData = await this.getBase64ImageFromURL(srcAttr.nodeValue).toPromise(); 
    console.log(awaitData);
    this.imgSrc = awaitData
    // this.imgStampString = timestamp.toDate();
  }

  
  ngAfterViewInit() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  drawComplete(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onEnd event
    console.log('Completed drawing', event);
    console.log(this.signaturePad.toDataURL());

    this.addFestForm.patchValue({
      signature: this.signaturePad.toDataURL()
    });

  }

  drawStart(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('Start drawing', event);
  }

  getBase64ImagePngFromURL(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      // create an image object
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      if (!img.complete) {
        // This will call another method that will create image from url
        img.onload = () => {
          observer.next(this.getBase64PngImage(img));
          observer.complete();
        };
        img.onerror = err => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64PngImage(img));
        observer.complete();
      }
    });
  }

  getBase64PngImage(img: HTMLImageElement): string {
    // We create a HTML canvas object that will create a 2d image
    var canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    let dataURL: string = canvas.toDataURL("image/png");
    return dataURL;
    // this.base64DefaultURL = dataURL;
    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
          this.adminData = data;

          if(data.pdfFooter){
            this.getBase64ImagePngFromURL(data.pdfFooter).subscribe((base64Data: string) => {   
              this.pdfFooterImage = base64Data;
            });
          }

          if(data.logo){
            this.getBase64ImagePngFromURL(data.logo).subscribe((base64Data: string) => {   
              this.pdfLogo = base64Data;
            });
          }

      }); 
  }

  getVariationSettings(){

      this.data_api.getFBVariationsSettings().subscribe((data) => {
          console.log(data);
          this.variationSettingsData = data;
      }); 
  }


  public getFBProjectUsers(){
   
    this.data_api.getFBUsersOrderedFname().subscribe((data) => {
          console.log(data);
            if(data){
              this.projectOwners = [];
            //   this.projectWorkers = [];
            //   this.siteSupervisors = [];
            //   this.altSupervisors = [];

                data.forEach(data =>{     
                    if(!data.password){
                        if(data.userRole == 'project_owner' ){
                          this.projectOwners.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName,email: data.userEmail})
                        }

                        // if(data.userRole == 'project_worker' ){
                        //   this.projectWorkers.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                        // }

                        // if(data.userRole == 'project_supervisor' ){
                        //   this.siteSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                        //   this.altSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                        // }
                    } 
                      
                })
            }
            // console.log(this.siteSupervisors);
            // this.initializeFilterOwners();
            this.getVariation();
            // this.initializeFilterWorkers();
            // this.initializeFilterSupervisors();
            // this.initializeFilterAltSupervisors();

      }
    );
}

  checkGlobalBooleanVariationSettings(value){
    if( ((value == true) || (value == false)) && (value !== '') ){
      return true;
    }else{
      return false;
    }
  }

  checkBooleanVariationSettings(value){
    if( ((value == true) || (value == false)) && (value !== '') ){
      return true;
    }else{
      return false;
    }
  }

  public getVariation(){
    this.data_api.getFBVariation(this.passID.id).subscribe(data => {
        console.log(data);
        this.variationData = data;

        this.data_api.getFBProject(data.projectId).pipe(first()).subscribe(data2 => {
            console.log(data2);
            this.projectData = data2;
            this.projUploadFolder = data2.uploadFolder;
            
            this.setProjectOwners = [];
            let projectOwnerIDs;
            this.addFestForm.patchValue({
              projectId: data.projectId,
              variantsNumber: data.variantsNumber,
              variationsName: data.variationsName,
              dueDate: data.dueDate ? data.dueDate.toDate() : '', 
              // projectOwner: data.projectOwner,
              openingMessage: data.openingMessage, 
              closingMessage: data.closingMessage,
              status: data.status,
              clientEmail: data.clientEmail,
              folderName: data.folderName,
              // signature: data.signature,
              createdAt: data.createdAt,
              createdBy: data.createdBy,
              pdfLink: data.pdfLink,
              bmLineitem: this.checkBooleanVariationSettings(data.bmLineitem) ? data.bmLineitem : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.bmLineitem) ? this.variationSettingsData.bmLineitem : false),
              bmTotalFigure: this.checkBooleanVariationSettings(data.bmTotalFigure) ? data.bmTotalFigure : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.bmTotalFigure) ? this.variationSettingsData.bmTotalFigure : false),
              bmHideAll: this.checkBooleanVariationSettings(data.bmHideAll) ? data.bmHideAll : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.bmHideAll) ? this.variationSettingsData.bmHideAll : false),
              qtyHideAll: this.checkBooleanVariationSettings(data.qtyHideAll) ? data.qtyHideAll : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.qtyHideAll) ? this.variationSettingsData.qtyHideAll : false),
              unitHideAll: this.checkBooleanVariationSettings(data.unitHideAll) ? data.unitHideAll : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.unitHideAll) ? this.variationSettingsData.unitHideAll : false),
              unitCostHideAll: this.checkBooleanVariationSettings(data.unitCostHideAll) ? data.unitCostHideAll : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.unitCostHideAll) ? this.variationSettingsData.unitCostHideAll : false),
              gstHideAll: this.checkBooleanVariationSettings(data.gstHideAll) ? data.gstHideAll : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.gstHideAll) ? this.variationSettingsData.gstHideAll : false),
              itemTotalHideAll: this.checkBooleanVariationSettings(data.itemTotalHideAll) ? data.itemTotalHideAll : (this.checkGlobalBooleanVariationSettings(this.variationSettingsData.itemTotalHideAll) ? this.variationSettingsData.itemTotalHideAll : false),
              comments:  data.comments ? data.comments : '',
              approvedAt: data.approvedAt ? data.approvedAt : '',
              approvedBy:  data.approvedBy ? data.approvedBy : '',
              approvedRole: data.approvedRole ? data.approvedRole : '',
            });
            
            this.pdfLink = data.pdfLink;
            
            if(data.projectOwner){
              projectOwnerIDs = data.projectOwner;
  
              projectOwnerIDs.forEach(value => {
                  if(this.findObjectByKey(this.projectOwners, 'id', value)){
                      var item = this.findObjectByKey(this.projectOwners, 'id', value);
                      this.setProjectOwners.push(item);
                  }
              });
  
              this.projectOwnerControl.setValue(this.setProjectOwners);
              console.log(this.setProjectOwners);
  
            }
  
            if (data.variationGroupArray){
              console.log(data.variationGroupArray);
              this.variationGroupArray().clear()
              let i = 0;
              data.variationGroupArray.forEach(t => {
                console.log(t)
                let teacher: FormGroup = this.createVariationGroupArray();
                this.variationGroupArray().push(teacher);
  
                if(t.itemArray){
  
                    (teacher.get("itemArray") as FormArray).clear()
                    let x = 0;
                      t.itemArray.forEach(b => {
                        
                        let item = this.createItemArray();
                          (teacher.get("itemArray") as FormArray).push(item)
  
                      });
  
                      x++;
                }
                // this.initializeFilterTrades(i);
                // this.loadTradeStaffs(i,t.tradesOnSite);
                i++;
              });
  
              this.variationGroupArray().patchValue(data.variationGroupArray);
              this.tempVariationArray = data.variationGroupArray;

              this.convertImages();
            }
  
            // this.data_api.getFBProject(data.projectId).pipe(first()).subscribe(data2 => {
            //     console.log(data2);
            //     this.projectData = data2;
            // });
        });
    });
  }

  public findInvalidControls() {
    const invalid = [];
    const controlsVariation = this.addFestForm.controls;

    for (const name in controlsVariation) {
        if (controlsVariation[name].invalid) {
          if (controlsVariation[name].invalid) {
              if(name == 'signature'){
                invalid.push('Signature');
              }
          }
        }
    }

    // let groupIndex = 0;
    // for (let group of this.addFestForm.value.variationGroupArray) { 
    //   let itemIndex = 0;
    //   for (let item of group.itemArray) {

    //     const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;
    //     console.log(adminAdvocacy.controls[itemIndex].get('itemImage').status);

    //     if(adminAdvocacy.controls[itemIndex].get('itemImage').status == 'INVALID'){
    //       invalid.push('Item image');
    //     }

    //     itemIndex++;
    //   }
    //   groupIndex++;
    // }

    console.log(controlsVariation);
    console.log(invalid);

    let htmlVal = '';

    invalid.forEach( data => {
        htmlVal += data + ' <br>'
    });

    swal.fire({
        title: "Please fill required fields!",
        html: htmlVal,
        buttonsStyling: false,
        customClass: {
          confirmButton: 'btn btn-success',
        },
        icon: "error"
    })

}

getPDFIcons(iconType){
  if( (iconType=='telephone') && this.adminData.pdfPhone){
      return {
        image: this.pdfIcons.telephone, 
        width: 10, 
        height: 10
      }
  }else if( (iconType=='mobile') && this.adminData.pdfMobile){
      return {
        image: this.pdfIcons.mobile, 
        width: 10, 
        height: 10
      }
  }else if( (iconType=='email') && this.adminData.pdfEmail){
      return {
        image: this.pdfIcons.email, 
        width: 10, 
        height: 10
      }
  }else if( (iconType=='pin') && this.adminData.pdfAddress){
      return {
        image: this.pdfIcons.pin, 
        width: 10, 
        height: 10
      }
  }else{
     return {
      width: 0, 
      text: ''
     }
  }
  
}

getPDFIconsSpace(iconType){
  if( (iconType=='telephone') && this.adminData.pdfPhone){
      return { width: 5, text: '' } 
  }else if( (iconType=='mobile') && this.adminData.pdfMobile){
    return { width: 5, text: '' } 
  }else if( (iconType=='email') && this.adminData.pdfEmail){
    return { width: 5, text: '' } 
  }else if( (iconType=='pin') && this.adminData.pdfAddress){
    return { width: 5, text: '' } 
  }else{
    return {
      width: 0, 
      text: ''
    }
  }
}

getPDFIconsSpace2(iconType){
if( (iconType=='telephone') && this.adminData.pdfPhone){
    return { width: 10, text: '' } 
}else if( (iconType=='mobile') && this.adminData.pdfMobile){
  return { width: 10, text: '' } 
}else if( (iconType=='email') && this.adminData.pdfEmail){
  return { width: 10, text: '' } 
}else if( (iconType=='pin') && this.adminData.pdfAddress){
  return { width: 10, text: '' } 
}else{
  return {
    width: 0, 
    text: ''
  }
}
}


getFooter2(currentPage, pageCount) {
  return [{
      stack: [
                {
                    text: currentPage.toString() + ' of ' + pageCount,
                    style: 'test4',
                    margin: [ 30, 0, 30, 0 ]
                },
                {canvas: [{ type: 'line', x1: 30, y1: 0, x2: 565, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 0, 0, 0 ],},             
                {
                  columns: [
                    { width: '*', text: '' },
                    this.getPDFIcons('telephone'),
                    this.getPDFIconsSpace('telephone'),
                    {
                      width: 'auto',
                      text: this.adminData.pdfPhone ? this.adminData.pdfPhone : '',
                      style: 'footerText',
                    },
                    this.getPDFIconsSpace2('telephone'),
                    this.getPDFIcons('mobile'),
                    this.getPDFIconsSpace('mobile'),
                    {
                      width: 'auto',
                      text: this.adminData.pdfMobile,
                      style: 'footerText',
                    },
                    this.getPDFIconsSpace2('mobile'),
                    this.getPDFIcons('email'),
                    this.getPDFIconsSpace('email'),
                    {
                      width: 'auto',
                      text: this.adminData.pdfEmail,
                      style: 'footerText',
                    },
                    this.getPDFIconsSpace2('email'),
                    this.getPDFIcons('pin'),
                    this.getPDFIconsSpace('pin'),
                    {
                      width: 'auto',
                      text: this.adminData.pdfAddress,
                      style: 'footerText',
                    },
                    { width: '*', text: '' },
                  ],
                  margin: [ 0, 4, 0, 0 ]
                }
  
        ]
      }
  ];
};
  
splitArray(arr){
  console.log(arr);
  if(arr){
      if(arr.length > 1){
        return arr.join(', ');
      }else{
        return arr;
      }
  }
}

pdfBmHideAll2(bmGroupTotal){
  if(this.addFestForm.value.bmHideAll == true){
    return[{},{},{}];
  }else{
    if(this.addFestForm.value.bmTotalFigure == true){
      return [
                {
                  text: '', 
                  style: 'tableHeader',
                },
                {
                  text: 'BM', 
                  style: 'tableHeader',
                },
                {
                  text:  formatCurrency(bmGroupTotal, 'en-AU', '', '',''), 
                  style: 'tableHeaderCurrency',  
                }
            ];
    }else{
      return[{},{},{}];
    }
  }
}

getOverunder(hideBudget,groupOverUnder){
  console.log(hideBudget);
  console.log(groupOverUnder);
  if(hideBudget != true){

        return [ 
          {
            text: '', 
            style: 'tableHeader',
          },
          {
            text: 'Over Under', 
            style: 'tableHeader',
          },
          {
            text:  formatCurrency(groupOverUnder, 'en-AU', '', '',''), 
            style: 'tableHeaderCurrency',  
          }    
      ]
  }else{
        return [{},{},{}];
  }
}

getClosingMessage(closingMessage){
    if(closingMessage){
      return htmlToPdfmake(closingMessage);
    }else{
      return;
    }

}

getOpeningMessage(openingMessage){
  if(openingMessage){
    return htmlToPdfmake(openingMessage);
  }else{
    return;
  }

}

isPageBreak(images){
  if(images.length > 0){
    return {text: '', pageBreak: 'after'};
  }else{
    return {}
  }

}


getTableTotal() {

  let accsList = this.addFestForm.value.variationGroupArray;

  if(accsList && accsList.length > 1){
  
      let bulletList = [];
      let content = [];

      let subTotalOverall = 0;
      let gstGroupOverall = 0;
      let totalOverall = 0;

      for (let group of accsList){              

          bulletList = [];

          let bmGroupTotal = 0;
          let gstGroupTotal = 0;
          let subTotalGroup = 0;
          let totalGroup = 0;
          
          for (let item of group.itemArray) {

              let _quantity = item.quantity;
              let _unitCost = item.unitCost;
              let _bmpercentage = item.buildersMargin;
              let _bmCost = (_bmpercentage * _unitCost) / 100;
              let _newUnitCost = ( _unitCost * 1) + _bmCost;
              let _subtotal = _quantity * _newUnitCost;

              bmGroupTotal = bmGroupTotal + _bmCost;
              gstGroupTotal = gstGroupTotal + parseFloat(item.gst);
              subTotalGroup = subTotalGroup + _subtotal;
              totalGroup = totalGroup + (_subtotal + parseFloat(item.gst));

              // var htmlDescription = htmlToPdfmake(item.description);

          }

          subTotalOverall = subTotalOverall + subTotalGroup;
          gstGroupOverall = gstGroupOverall + gstGroupTotal;
          totalOverall = totalOverall + totalGroup;
      }
          content.push(
            {
              stack: [
                  {
                    stack: [
                      {canvas: [{ type: 'line', x1: 400, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                      {
                        table: {
                          widths: [ '80%','10%','10%'],
                          body: [
                            [
                                {
                                  text: '', 
                                  style: 'tableHeader',
                                },
                                {
                                  text: 'Sub Total', 
                                  style: 'tableHeader',
                                },
                                {
                                  text:  formatCurrency(subTotalOverall, 'en-AU', '', '',''), 
                                  style: 'tableHeaderCurrency',  
                                }
                            ],
                            [
                                {
                                  text: '', 
                                  style: 'tableHeader',
                                },
                                {
                                  text: 'GST', 
                                  style: 'tableHeader',
                                },
                                {
                                  text:  formatCurrency(gstGroupOverall, 'en-AU', '', '',''), 
                                  style: 'tableHeaderCurrency',  
                                }
                            ],
                            [
                              {
                                text: '', 
                                style: 'tableHeader',
                              },
                              {
                                text: 'Total Cost', 
                                style: 'tableHeader',
                              },
                              {
                                text:  formatCurrency(totalOverall, 'en-AU', '', '','') , 
                                style: 'tableHeaderCurrency',  
                              }
                          ],
                          ]                                        
                        },
                        layout: {
                          defaultBorder:false,
                          paddingTop: function(i, node) { return 0; }, 
                          paddingBottom: function(i, node) { return 0;},
                        }
                      }
                    ],
                    unbreakable: true,
                  },
              ],
            },
            
          )


      
    return content;
    
  }else{
    return;
  }

}  

getTableValues() {

let accsList = this.addFestForm.value.variationGroupArray;

if(accsList){

    let bulletList = [];
    let content = [];


    for (let group of accsList){              

        bulletList = [];
        let bmGroupTotal = 0;
        let gstGroupTotal = 0;
        let subTotalGroup = 0;
        let totalGroup = 0;

        for (let item of group.itemArray) {

            let _quantity = item.quantity;
            let _unitCost = item.unitCost;
            let _bmpercentage = item.buildersMargin;
            let _bmCost = (_bmpercentage * _unitCost) / 100;
            let _newUnitCost = ( _unitCost * 1) + _bmCost;
            let _subtotal = _quantity * _newUnitCost;

            bmGroupTotal = bmGroupTotal + _bmCost;
            gstGroupTotal = gstGroupTotal + parseFloat(item.gst);
            subTotalGroup = subTotalGroup + _subtotal;
            totalGroup = totalGroup + (_subtotal + parseFloat(item.gst));

            // var htmlDescription = htmlToPdfmake(item.description);
            bulletList.push(
                
     
               this.variationSettingsValue(item)
                    
            )
        }

        content.push(
          {
            stack: [
                {
                  stack: [
                    {
                      text: group.groupName,
                      style: 'fieldHeader',
                      margin: [ 5, 10, 0, 0 ],
                    },
                    {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                    {
                      table: {
                        widths: this.variationSettingsWidth(),
                        body: [
          
                            this.variationSettingsTitle()
                        ]                     
                      },
                      layout: {
                        defaultBorder:false,
                        paddingTop: function(i, node) { return 0; }, 
                        paddingBottom: function(i, node) { return 0;},
                      }
                    },
                    {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                    {
                      table: {
                        widths: this.variationSettingsWidth(),
                        body: bulletList                     
                      },
                      layout: {
                        defaultBorder:false,
                        fillColor: function (i, node) {
                          return (i % 2 === 0) ?  null : '#F1F1F1';
                        },
                        paddingTop: function(i, node) { return 0; }, 
                        paddingBottom: function(i, node) { return 0;},
                      }
                    },
                    {canvas: [{ type: 'line', x1: 400, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                    {
                      table: {
                        widths: [ '80%','10%','10%'],
                        body: [
                          this.pdfBmHideAll2(bmGroupTotal),
                          [
                              {
                                text: '', 
                                style: 'tableHeader',
                              },
                              {
                                text: 'Sub Total', 
                                style: 'tableHeader',
                              },
                              {
                                text:  formatCurrency(subTotalGroup, 'en-AU', '', '',''), 
                                style: 'tableHeaderCurrency',  
                              }
                          ],
                          [
                              {
                                text: '', 
                                style: 'tableHeader',
                              },
                              {
                                text: 'GST', 
                                style: 'tableHeader',
                              },
                              {
                                text:  formatCurrency(gstGroupTotal, 'en-AU', '', '',''), 
                                style: 'tableHeaderCurrency',  
                              }
                          ],
                          [
                            {
                              text: '', 
                              style: 'tableHeader',
                            },
                            {
                              text: (accsList.length > 1 ? 'Group Total' : 'Total Cost'), 
                              style: 'tableHeader',
                            },
                            {
                              text:  formatCurrency(totalGroup, 'en-AU', '', '','') ,  //formatCurrency(group.groupTotal, 'en-AU', '', '','') , 
                              style: 'tableHeaderCurrency',  
                            }
                        ],
                        this.getOverunder(group.hideBudget,group.groupOverUnder),
                        ]                                        
                      },
                      layout: {
                        defaultBorder:false,
                        paddingTop: function(i, node) { return 0; }, 
                        paddingBottom: function(i, node) { return 0;},
                      }
                    }
                  ],
                  unbreakable: true,
                },
            ],
          },
          
        )


    }
  return content;
  
}else{
  return;
}

}  


variationSettingsWidth(){

    console.log(this.addFestForm.value.bmLineitem);
    console.log(this.addFestForm.value.bmHideAll);

    console.log(this.addFestForm.value.qtyHideAll);
    console.log(this.addFestForm.value.unitHideAll);
    console.log(this.addFestForm.value.unitCostHideAll);
    console.log(this.addFestForm.value.gstHideAll);
    console.log(this.addFestForm.value.itemTotalHideAll);

    var descWidth = 50;
    let bulletWidths = [];

    if(this.addFestForm.value.qtyHideAll == true){ //Qty
      descWidth = descWidth + 10;
    }else{
      bulletWidths.push('10%');
    }

    if(this.addFestForm.value.unitHideAll == true){  //UOM
      descWidth = descWidth + 10;
    }else{
      bulletWidths.push('10%');
    }

    if(this.addFestForm.value.unitCostHideAll == true){ //Cost
      descWidth = descWidth + 10;
    }else{
      bulletWidths.push('10%');
    }

    if(this.addFestForm.value.bmHideAll == true){ //BM
      descWidth = descWidth + 10;
    }else{
      if(this.addFestForm.value.bmLineitem == true){
        bulletWidths.push('10%');
      }else{
        descWidth = descWidth + 10;
      }
    }

    if(this.addFestForm.value.itemTotalHideAll == true){ //Subtotal
      descWidth = descWidth + 10;
    }else{
      bulletWidths.push('10%');
    }

    // if(this.addFestForm.value.gstHideAll == true){ //GST
    //   descWidth = descWidth + 10;
    // }else{
    //   bulletWidths.push('10%');
    // }

    // if(this.addFestForm.value.itemTotalHideAll == true){ //Total
    //   descWidth = descWidth + 10;
    // }else{
    //   bulletWidths.push('10%');
    // }

    let newArr = [descWidth+'%', ...bulletWidths];
    // console.log(newArr);
    return newArr;

}

variationSettingsTitle(){

console.log(this.addFestForm.value.bmLineitem);
console.log(this.addFestForm.value.bmHideAll);

console.log(this.addFestForm.value.qtyHideAll);
console.log(this.addFestForm.value.unitHideAll);
console.log(this.addFestForm.value.unitCostHideAll);
console.log(this.addFestForm.value.gstHideAll);
console.log(this.addFestForm.value.itemTotalHideAll);

// var descWidth = 30;
let bulletTitle = [];

if(this.addFestForm.value.qtyHideAll == true){ //Qty
  // descWidth = descWidth + 10;
}else{
  bulletTitle.push({text:  'Qty', style: 'tableHeader'});
}

if(this.addFestForm.value.unitHideAll == true){//UOM
  // descWidth = descWidth + 10;
}else{
  bulletTitle.push({text:  'UOM', style: 'tableHeader'});
}

if(this.addFestForm.value.unitCostHideAll == true){ //Cost
  // descWidth = descWidth + 10;
}else{
  bulletTitle.push({text:  'Unit Cost', style: 'tableHeaderCurrency'});
}

if(this.addFestForm.value.bmHideAll == true){ //BM 
  // descWidth = descWidth + 10;
}else{
  if(this.addFestForm.value.bmLineitem == true){
    bulletTitle.push({text:  'BM', style: 'tableHeaderCurrency'});
  }else{
    // descWidth = descWidth + 10;
  }
}

if(this.addFestForm.value.itemTotalHideAll == true){ //Subtotal Total
  // descWidth = descWidth + 10;
}else{
  bulletTitle.push({text:  'Total', style: 'tableHeaderCurrency'});
}

// if(this.addFestForm.value.gstHideAll == true){ //GST
//   // descWidth = descWidth + 10;
// }else{
//   bulletTitle.push({text:  'GST', style: 'tableHeaderCurrency'});
// }

// if(this.addFestForm.value.itemTotalHideAll == true){ //Total
//   // descWidth = descWidth + 10;
// }else{
//   bulletTitle.push({text:  'Total', style: 'tableHeaderCurrency'});
// }

let newArr = [{text:  'Description', style: 'tableHeader'}, ...bulletTitle];
console.log(newArr);
return newArr;
}

variationSettingsValue(item){

console.log(this.addFestForm.value.bmLineitem);
console.log(this.addFestForm.value.bmHideAll);

console.log(this.addFestForm.value.qtyHideAll);
console.log(this.addFestForm.value.unitHideAll);
console.log(this.addFestForm.value.unitCostHideAll);
console.log(this.addFestForm.value.gstHideAll);
console.log(this.addFestForm.value.itemTotalHideAll);

let _quantity = item.quantity;
let _unitCost = item.unitCost;
let _bmpercentage = item.buildersMargin;
let _bmCost = (_bmpercentage * _unitCost) / 100;
let _newUnitCost = ( _unitCost * 1) + _bmCost;
let _subtotal = _quantity * _newUnitCost;

// var descWidth = 30;
let bulletValue = [];

if(this.addFestForm.value.qtyHideAll == true){ //Qty
  // descWidth = descWidth + 10;
}else{
  bulletValue.push({text: item.quantity, style: 'fieldData'});
}

if(this.addFestForm.value.unitHideAll == true){ //UOM
  // descWidth = descWidth + 10;
}else{
  bulletValue.push({text: item.uom, style: 'fieldData'});
}


if(this.addFestForm.value.bmHideAll == true){ //BM
  if(this.addFestForm.value.unitCostHideAll == true){ //Cost
    // descWidth = descWidth + 10;
  }else{
    bulletValue.push({text: formatCurrency(_newUnitCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
  }
}else{

  if(this.addFestForm.value.bmLineitem == true){

      if(this.addFestForm.value.unitCostHideAll == true){ //Cost
        // descWidth = descWidth + 10;
      }else{
        bulletValue.push({text: formatCurrency(item.unitCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
      }
    
  }else{

      if(this.addFestForm.value.unitCostHideAll == true){ //Cost
        // descWidth = descWidth + 10;
      }else{
        bulletValue.push({text: formatCurrency(_newUnitCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
      }

  }

}

if(this.addFestForm.value.bmHideAll == true){ //BM
  // descWidth = descWidth + 10;
}else{
  if(this.addFestForm.value.bmLineitem == true){
    bulletValue.push({text: formatCurrency(_bmCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
    
  }else{
    // descWidth = descWidth + 10;
  }
}

if(this.addFestForm.value.itemTotalHideAll == true){ //Subtotal
  // descWidth = descWidth + 10;
}else{
  bulletValue.push({text: formatCurrency(_subtotal, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
}

// if(this.addFestForm.value.gstHideAll == true){ //GST
//   // descWidth = descWidth + 10;
// }else{
//   bulletValue.push({text:  formatCurrency(item.gst, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
// }

// if(this.addFestForm.value.itemTotalHideAll == true){ //Total
//   // descWidth = descWidth + 10;
// }else{
//   bulletValue.push({text:  formatCurrency(item.itemTotal, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
// }


var htmlDescription = htmlToPdfmake(item.description);

let newArr = [{text:htmlDescription, style: 'fieldData'}, ...bulletValue];
console.log(newArr);
return newArr;
}

public getDocumentDefinition() {
  
      let variationItemImages = []; 

      for (let group of this.tempVariationArray) { 
        for (let item of group.itemArray) {
          if( (item.hasImage == true) ){
            variationItemImages.push(item)
          }
        }
      }

      let headerObj1 = {
        columns: [
          {
            stack: [
              {
                image: this.pdfLogo,
                width: '210',
                // margin: [ 0, 20, 0, 0 ]
              }
            ],
            margin:[30,20],
            width: '40%',
          },
          // {
          //   stack: [
          //     {
          //       text: '',
          //       style: 'test',
          //     }
          //   ],
          //   margin: [ 0, 20, 0, 0 ],
          //   width: '20%',
          // },
          // {
          //   stack: [
          //     {
          //       columns: [
          //         {
          //           stack: [
          //             {
          //               text: 'Project:',
          //               style: 'tableHeader',
          //             },
          //             {
          //               text: 'Variation Name:',
          //               style: 'tableHeader',
          //             },
          //             {
          //               text: 'Variation No.:',
          //               style: 'tableHeader',
          //             }
          //           ],
          //           width: '35%',
          //         },
          //         {
          //           stack: [
          //             {
          //               text: this.projectData.projectName,
          //               style: 'fieldData',
          //             },
          //             {
          //               text: this.addFestForm.value.variationsName,
          //               style: 'fieldData',
          //             },
          //             {
          //               text: this.addFestForm.value.variantsNumber, //(this.editForm.value.reportNumber ? this.editForm.value.reportNumber : ''),
          //               style: 'fieldData',
          //             }
          //           ],
          //         }
          //       ],
          //       columnGap: 10
          //     },
          //   ],
          //   margin: [ 0, 30, 0, 0 ],
          //   width: '40%',
          // },
        ],
        columnGap: 10
      }
      let headerObj2 = {
          image: this.pdfLogo,
          width: 210,
          margin:[30,20],
      }

    return {
      pageOrientation: 'portrait',
      pageMargins: [ 30, 110, 30, 30 ],

      // HEADER SETTNGS
      header:function(page) { 
          if (page != 1){
                return headerObj2;
          }else{
                return headerObj1;
          }
      },

      // FOOTER SETTNGS
      footer: (currentPage, pageCount) => {
          return this.getFooter2(currentPage, pageCount)
      },

      pageSize: 'A4',
      info: {
          title: 'Variations',
      },
      content: [
        // { text: 'Variation Order', style: 'Header', margin: [0, 0, 0, 20 ],},
        // { text: 'To: '+this.splitArray(this.pdfClientNames), style: 'fieldHeader', margin: [0, 0, 0, 20 ],},
        {
          columns: [
            {
              text: 'Variation Order',
              style: 'Header',
              width: '40%',
            },
            {
              text: '',
              width: '14%',
            },
            {
              text: 'Variation No: ',
              style: 'fieldHeader',
              width: '14%',
            },
            {
              text:  this.addFestForm.value.variantsNumber,
              style: 'fieldHeader',
              width: '32%',
            }
          ],
          margin: [ 0, 0, 0, 20 ],
        },   
        {
          columns: [
            {
              stack: [
                {
                  text: 'To: ',
                  style: 'tableHeader',
                },
                {
                  text: 'Address: ',
                  style: 'tableHeader',
                },
              ],
              margin: [ 0, 0, 0, 20 ],
              width: '8%',
            },
            {
              stack: [
                {
                  text: this.splitArray(this.pdfClientNames),
                  style: 'fieldData',
                },
                {
                  text: this.cleanChar(this.projectData.clientAddress),
                  style: 'fieldData',
                },
              ],
              margin: [ 0, 0, 0, 20 ],
              width: '32%',
            },
            {
              stack: [
                {
                  text: '',
                  style: 'tableHeader',
                },
              ],
              margin: [ 0, 0, 0, 20 ],
              width: '14%',
            },
            {
              stack: [
                {
                  text: 'Date: ',
                  style: 'tableHeader',
                },
                {
                  text: 'Due Date: ',
                  style: 'tableHeader',
                },
                {
                  text: 'Project No: ',
                  style: 'tableHeader',
                },
                {
                  text: 'Project name: ',
                  style: 'tableHeader',
                },
                {
                  text: 'Site Contact: ',
                  style: 'tableHeader',
                },
                {
                  text: 'Contact Ph: ',
                  style: 'tableHeader',
                },
                {
                  text: 'Site Address: ',
                  style: 'tableHeader',
                }
              ],
              margin: [ 0, 0, 0, 20 ],
              width: '14%',
            },    
            {
              stack: [
                {
                  text: moment().locale("en-au").format('LL'),
                  style: 'fieldData',
                },
                {
                  text: moment(this.addFestForm.value.dueDate).locale("en-au").format('LL'),
                  style: 'fieldData',
                },
                {
                  text: this.projectData.jobNumber ? this.cleanChar(this.projectData.jobNumber) : ' ',
                  style: 'fieldData',
                },
                {
                  text: this.projectData.projectName ? this.cleanChar(this.projectData.projectName) : ' ',
                  style: 'fieldData',
                },
                {
                  text: this.projectData.siteContact ? this.cleanChar(this.projectData.siteContact) : ' ',
                  style: 'fieldData',
                },
                {
                  text: this.projectData.contactPhone ? this.cleanChar(this.projectData.contactPhone) : ' ',
                  style: 'fieldData',
                },
                {
                  text: this.projectData.projectAddress ? this.cleanChar(this.projectData.projectAddress) : ' ',
                  style: 'fieldData',
                }
              ],
              width: '32%',
            },
          ],
        },
        { text: this.addFestForm.value.variationsName, style: 'fieldHeader', margin: [0, -33, 0, 20 ],},
        { text: '', style: 'fieldHeader', margin: [0, 0, 0, 20 ],},
        this.getOpeningMessage(this.addFestForm.value.openingMessage),
        { text: '', style: 'fieldHeader', margin: [0, 0, 0, 20 ],},
        // this.getTableHeader(),
        // {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 1 ],},
        this.getTableValues(),
        { text: '', style: 'fieldHeader', margin: [0, 0, 0, 20 ],},
        this.getTableTotal(),
        { text: '', style: 'fieldHeader', margin: [0, 20, 0, 0 ],},
        this.getClosingMessage(this.addFestForm.value.closingMessage), 
        {
          columns: [
            {
              text: 'Approved by:',
              style: 'fieldData',
              width: '10%',
              // margin: [ 0, 30, 0, 0 ],
            },
            {
              stack: [
                {
                  text: this.userDetails.name,
                  style: 'fieldData',
                  width: '150',
                  margin: [ 15, 0, 0, 0 ]
                },
                {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 0, 0, 2 ],},
              ],
            },
          ],
          margin: [ 0, 30, 0, 0 ],
        }, 
        {
          columns: [
            {
              text: 'Sign:',
              style: 'fieldData',
              width: '4.5%',
              margin: [ 0, 30, 0, 0 ],
            },
            {
              stack: [
                {
                  image: this.addFestForm.value.signature,
                  width: '150',
                  margin: [ 15, 0, 0, 0 ]
                },
                {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 177, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 0, 0, 2 ],},
              ],
            },
          ],
          margin: [ 0, 0, 0, 20 ],
        }, 
        {
          columns: [
            {
              text: 'Date:',
              style: 'fieldData',
              width: '4%',
              // margin: [ 0, 30, 0, 0 ],
            },
            {
              stack: [
                {
                 text: moment(new Date()).format('DD/MM/YYYY'),
                  style: 'fieldData',
                  width: '150',
                  margin: [ 15, 0, 0, 0 ]
                },
                {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 0, 0, 2 ],},
              ],
            },
          ],
          margin: [ 0, 0, 0, 20 ],
        }, 
        // { text: 'Approved by: ___________________', style: 'fieldData', margin: [0, 20, 0, 0 ],},
        // { text: 'Sign: __________________________', style: 'fieldData', margin: [0, 20, 0, 0 ],},
        // { text: 'Date: __________________________', style: 'fieldData', margin: [0, 20, 0, 0 ],},
        // {text: '', pageBreak: 'after'},
        this.isPageBreak(variationItemImages),
        this.variationImage.getUploadedImages(variationItemImages),
      ], 
      styles: 
      {
        // name: {
        //   fontSize: 16,
        //   bold: true
        // }
        defaultStyle: {
          fontSize: 8,
          font: 'Helvetica'
        },
        testcaption: {
          color: '#050708',
          fontSize: 8,
        },
        test: {
            color: '#050708',
            fontSize: 9,
        },
        test2: {
          color: '#050708',
          fontSize: 9,
          alignment: 'center'
        },
        test3: {
          color: '#050708',
          fontSize: 9,
        },
        test4: {
            color: '#050708',
            fontSize: 9,
            alignment: 'right'
        },
        Header: {
          color: '#050708',
          fontSize: 15,
          bold: true,
        },
        fieldHeader: {
          color: '#050708',
          fontSize: 10,
          bold: true,
        },
        tableHeader: {
          color: '#050708',
          fontSize: 9,
          bold: true,
        },
        tableHeaderCurrency: {
          color: '#050708',
          fontSize: 9,
          bold: true,
          alignment: 'right'
        },
        fieldData: {
          color: '#050708',
          fontSize: 9,
        },
        fieldDataCurrency: {
          color: '#050708',
          fontSize: 9,
          alignment: 'right'
        },
        'html-strong':{
          fontSize: 9,
        },
        'html-span':{
          fontSize: 9,
        },
        'html-p':{
          fontSize: 9,
        },
        'html-ol':{
          fontSize: 9,
        },
        'html-ul':{
          fontSize: 9,
        },
        'html-li':{
          fontSize: 9,
        },
        'html-h1':{
          fontSize: 9,
        },
        'html-h2':{
          fontSize: 9,
        },
        'html-h3':{
          fontSize: 9,
        },
        'html-h4':{
          fontSize: 9,
        },
        'html-h5':{
          fontSize: 9,
        },
        'html-h6':{
          fontSize: 9,
        },
        'html-a':{
          fontSize: 9,
        },
        footerText: {
          color: '#050708',
          fontSize: 8,
          bold: true,
        },
        testHeader2: {
          color: '#ffffff',
          fontSize: 16,
        },
        tableTotal: {
          fontSize: 8,
          bold: true,
          fillColor: '#F0F1F0',
        },
        tableFooter: {
            fontSize: 8,
            bold: true,
            // fillColor: '#F0F1F0',
        }
    }
  }
}

cleanChar(str){
  if(str){
    return str.replace(/[^\x20-\x7E]/g, '') ;
  }else{
    return;
  }
  
}

  public async saveStepCheckValidation(){ 

      let ownerList = this.projectOwnerControl.value;
      let ownerIDS = [];
      this.pdfClientNames = [];
      this.addFestForm.patchValue({
        projectOwner: ''
      });
      
      if(ownerList){

          ownerList.forEach( data => {
            console.log(data);
              ownerIDS.push(data.id);
              this.pdfClientNames.push(data.name);
          });

          this.addFestForm.patchValue({
            projectOwner: ownerIDS
          });
      }

      // if (this.addFestForm.invalid) {
      //     this.findInvalidControls();
      //     return;
      // } 
      console.log(this.addFestForm.value);

      if(this.addFestForm.value.variationGroupArray ){
        let errorDetect = 0;
        let imgCount = 0;
        for (let group of this.addFestForm.value.variationGroupArray) { 

          if(group.groupStatus){
            imgCount = imgCount + 1;
          }

        }
        if( (imgCount < 1) || (errorDetect == 1) ){
          swal.fire({
            title: "Please mark at least one of the group of items as Approved, Rejected or Undecided before submitting",
                // text: htmlVal,
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
          })

          return;
        }

      }else{
        
        swal.fire({
          title: "Please Add at least 1 Group",
              // text: htmlVal,
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
        })
        return;
      }  
      
      if(!this.addFestForm.value.signature ){
          swal.fire({
            title: "Please Sign the Signature Box",
                // text: htmlVal,
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
          })
          return;
      }  
     
      this.saveStepPDF();

  }

  async saveStepPDF(){
    
        let myFiles = [];

        let imageDone = 0;
        let i = 0;
        //let imageLen = this.addFestForm.value.variationGroupArray.length;
        let imageLen = 0;
        for (let group of this.addFestForm.value.variationGroupArray) { 
          if(group.files){
            for (let file of group.files) {
              imageLen++;
            }
          }
        }

        if(imageLen > 0){
          

          let groupIndex = 0;
          for (let group of this.addFestForm.value.variationGroupArray) { 
            let groupFiles = [];
            if(group.files){
                  let fileIndex = 0;
                  for (let file of group.files) {
                      myFiles.push(file);
                  }
            }
          }
        }

      this.progressOverlay.show('Updating PDF','#0771DE','white','lightslategray',1);

      const mergedPdf = await PDFDocument.create();

      const documentDefinition = this.getDocumentDefinition();

      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

      pdfDocGenerator.getBuffer(async (buffer) => {

        const pdfA =  await PDFDocument.load(buffer);
        const copiedPagesA = await mergedPdf.copyPages(pdfA, pdfA.getPageIndices());
        copiedPagesA.forEach((page) => mergedPdf.addPage(page));

          for (const document of myFiles) {
              const existingPdfBytes = await fetch(document).then((res) =>
                res.arrayBuffer()
              );
        
              const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
              const copiedPages = await mergedPdf.copyPages(
                pdfDoc,
                pdfDoc.getPageIndices()
              );
              copiedPages.forEach((page) => mergedPdf.addPage(page));
          }

          const pdfBytes = await mergedPdf.save();

          let folderName =  this.addFestForm.value.folderName;  

          let id = this.addFestForm.value.variationsName+'.pdf';

          let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Variations/'+folderName+'/'+id);
          let task = ref.put(pdfBytes,{contentType:"application/pdf"});
          // let task = ref.putString(pdfDataUri, 'base64',{contentType:"application/pdf"});
          let _percentage$ = task.percentageChanges();
          _percentage$.subscribe(
            (prog: number) => {
              this.progressOverlay.setProgress(Math.ceil(prog));
          });

          task.snapshotChanges().pipe(
            finalize(() => {
              ref.getDownloadURL().subscribe((url) => { 
                this.progressOverlay.hide();
                console.log(url);
                this.addFestForm.patchValue({
                  pdfLink: url
                });
                
                console.log(this.addFestForm.value);

                this.saveStepSignature();
              });
          })).subscribe();
          

      });
      
  }

  async saveStepSignature(){

    if(this.addFestForm.value.signature){
      let folderName =  this.addFestForm.value.folderName;      
      // let id = Math.random().toString(36).substring(2);
      //let ref = this.afStorage.ref(rootFolder+'/'+this.timeForm.value.uploadFolder+'/Timesheet/'+folderName+'/'+id);
      // let ref = this.afStorage.ref(this.accountFirebase+'/project-images/'+id);
      let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Variations/'+folderName+'/signature');
      //let base64String = base64image.split(',').pop();
      let task = ref.putString(this.addFestForm.value.signature, 'data_url');
      let _percentage$ = task.percentageChanges();
      //this.allPercentage.push(_percentage$);
      
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe((url) => { 
            this.downloadURL = url;
            // imageDone = imageDone + 1;
            // if(imageDone == imageLen){
              // this.progressOverlay.hide();
              // this.saveStep2();
              this.addFestForm.patchValue({
                signature: this.downloadURL
              });
              this.saveStepUpdateVariation();
            // } 
          });
      })).subscribe();

    }

  }

  async saveStep1(){

    let ownerList = this.projectOwnerControl.value;
    let ownerIDS = [];
    this.pdfClientNames = [];
    this.addFestForm.patchValue({
      projectOwner: ''
    });
    
    if(ownerList){

        ownerList.forEach( data => {
          console.log(data);
            ownerIDS.push(data.id);
            this.pdfClientNames.push(data.name);
        });

        this.addFestForm.patchValue({
          projectOwner: ownerIDS
        });
    }

    console.log(this.addFestForm.value);

    const documentDefinition = this.getDocumentDefinition();
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.open();
    return

}

saveStep1Old(){
    let ownerList = this.projectOwnerControl.value;
    let ownerIDS = [];
    
    if(ownerList){

        ownerList.forEach( data => {
            ownerIDS.push(data.id);
        });

        this.addFestForm.patchValue({
          projectOwner: ownerIDS
        });
    }

    if (this.addFestForm.invalid) {
        this.findInvalidControls();
        return;
    } 

    if(this.addFestForm.value.signature){
        let folderName =  this.addFestForm.value.folderName;      
        // let id = Math.random().toString(36).substring(2);
        //let ref = this.afStorage.ref(rootFolder+'/'+this.timeForm.value.uploadFolder+'/Timesheet/'+folderName+'/'+id);
        // let ref = this.afStorage.ref(this.accountFirebase+'/project-images/'+id);
        let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Variations/'+folderName+'/signature');
        //let base64String = base64image.split(',').pop();
        let task = ref.putString(this.addFestForm.value.signature, 'data_url');
        let _percentage$ = task.percentageChanges();
        //this.allPercentage.push(_percentage$);
        
        task.snapshotChanges().pipe(
          finalize(() => {
            ref.getDownloadURL().subscribe((url) => { 
              this.downloadURL = url;
              // imageDone = imageDone + 1;
              // if(imageDone == imageLen){
                // this.progressOverlay.hide();
                // this.saveStep2();
                this.addFestForm.patchValue({
                  signature: this.downloadURL
                });
                this.saveStepUpdateVariation();
              // } 
            });
        })).subscribe();

    }else{
      this.saveStepUpdateVariation();
    }

  }

  saveStepUpdateVariation(){

    let _status;
    let _statuses = [];

    for (let group of this.addFestForm.value.variationGroupArray) { 
        console.log(group.groupStatus);
        _statuses.push(group.groupStatus);
    }

    if(_statuses.includes('approved')){
      _status = 'Approved';
    }else if(_statuses.includes('undecided')){
      _status = 'Undecided';
    }else if(_statuses.includes('rejected')){
      _status = 'Rejected';
    }else{
      _status = 'Submitted to Client';
    }
     
    this.addFestForm.patchValue({
      status: _status,
      approvedAt: new Date(),
      approvedBy: this.userDetails.user_id,
      approvedRole: 'client'
    });


    this.data_api.updateFBVariation(this.passID.id,this.addFestForm.value).then(data => {
      console.log('Submitted the Variation successfully!');

      console.log(data);

      $.notify({
        icon: 'notifications',
        message: 'Submitted'
      }, {
          type: 'success',
          timer: 1000,
          placement: {
              from: 'top',
              align: 'center'
          },
          template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
            '<button  mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
            '<i class="material-icons" data-notify="icon">notifications</i> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
              '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '</div>'
      });
      this.sendAdminEmail(this.passID.id,this.projectData.id);
              //   setTimeout(function(){
              //   window.location.reload();
              // }, 1000);  
        // this.router.navigate(['/dashboard-client']);
   
    });
  }

  public htmlToText(html: string) {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
  }

  sendAdminEmail(variantID,projectID){

      // console.log(this.addFestForm.value);

      // // this.dialogRef.close();
      // // return;
      const adminEmails = [];


      // let clientEmail = this.addFestForm.value.clientEmail;
      // if(clientEmail){
      //   clientEmail.forEach(email => {
      //     adminEmails.push({
      //         Email: email
      //       });
      //   });
      // }

      let varEmails = this.variationSettingsData.varEmailRecipient;
      if(varEmails){
        varEmails.forEach(email => {
          adminEmails.push({
              Email: email
            });
        });
      }

      let myURL = window.location.href ;
      let rep2 = '/variations/project/'+projectID+'/edit/'+variantID ;
      let rep1 = this.router.url ;
      let newUrl = myURL.replace(rep1, rep2)
      
      let tempdata = {
        adminEmail: adminEmails,
        emailHeader: this.adminData.logo, //emailHeaderNewUser2,
        textSignature:  this.adminData.textSignature,
        emailSignature:  this.adminData.emailSignature,
        varLink: newUrl,
        projectName: this.projectData.projectName,
        variationName: this.addFestForm.value.variationsName
      }
      console.log(tempdata);

    
      const callableTest = this.functions.httpsCallable('sendFBVariationsSubmit');
      callableTest(tempdata).subscribe(result => {
        console.log(result)
        this.spinnerService.hide();
        // $.notify({
        //   icon: 'notifications',
        //   message: 'Email Sent!'
        // }, {
        //     type: 'success',
        //     timer: 1000,
        //     placement: {
        //         from: 'top',
        //         align: 'center'
        //     },
        //     template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
        //       '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        //       '<i class="material-icons" data-notify="icon">notifications</i> ' +
        //       '<span data-notify="title">{1}</span> ' +
        //       '<span data-notify="message">{2}</span>' +
        //       '<div class="progress" data-notify="progressbar">' +
        //         '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        //       '</div>' +
        //       '<a href="{3}" target="{4}" data-notify="url"></a>' +
        //     '</div>'
        // });

        // this.router.navigate(['/variations/project/'+projectID]);
        window.location.reload();
      })

  }

  async convertImages(){

    let groupIndex = 0;   

    for (let group of this.tempVariationArray) { 

      let itemIndex = 0;

      for (let item of group.itemArray) {

        // const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;
        console.log(item.itemImage);

        // await this.getBase64ImageFromURL(item.itemImage).subscribe((base64Data: string) => {  
        //   console.log(base64Data);
        //   console.log(itemIndex);
        //     // this.imageURL[i] = base64Data;
        //     // this.imageURLRaw[i] = base64Data;
        //     adminAdvocacy.controls[itemIndex].patchValue({
        //       itemImage: base64Data,
        //     });
        //     itemIndex++;
        // });

        const awaitData = await this.getBase64ImageFromURL(item.itemImage).toPromise(); 
        console.log(awaitData);
        // adminAdvocacy.controls[itemIndex].patchValue({
        //   itemImage: awaitData,
        // });
        this.tempVariationArray[groupIndex].itemArray[itemIndex].itemImage = awaitData;
        itemIndex++;

      }

      groupIndex++;

    }


  }

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

  findObjectByKey(array, key, value) {

      for (var i = 0; i < array.length; i++) {
          if (array[i][key] === value) {
              return array[i];
          }
      }
      return null;
  }

  variationGroupArray(): FormArray {
    return this.addFestForm.get('variationGroupArray') as FormArray;
  }

  itemArray(groupIndex:number) : FormArray {
    return this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray
  }

  createVariationGroupArray(): FormGroup {
    return this.formBuilder.group({
      groupName: '',
      groupBudget: '',
      hideBudget: '',
      groupTotal: '',
      groupOverUnder: '',
      groupStatus: '',
      files: '',
      itemArray: this.formBuilder.array([ this.createItemArray()  ])
    });
  }

  addVariationGroupArray() {
    this.variationGroupArray().push(this.createVariationGroupArray());
  }


  createItemArray(): FormGroup {
    return this.formBuilder.group({
      itemName: '',
      supplier: '',
      description: '',
      quantity: '',
      uom: '',
      unitCost: '',
      // subTotal : '',
      buildersMargin: '',
      gst: '',
      itemTotal: '',
      itemImage: ['', Validators.required],
      hasImage: ''
    });
  }

  addItemArray(groupIndex: number) {
    this.itemArray(groupIndex).push(this.createItemArray());
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
      // this.spinnerService.show();
      let currentUser = JSON.parse((localStorage.getItem('currentUser')));
      this.curUserID = currentUser.user_id;

      this.data_api.getProjectsClient(this.curUserID).subscribe((data) => {
        console.log(data);
          data.forEach(data =>{ 
              this.projectNames.push(data)
          })
      });
  }
  

  // public getSupervisors(){
  //       // this.spinnerService.show();

  //       this.data_api.getProjectSupervisors().subscribe((data) => {
  //           data.forEach(data =>{ 
  //               this.siteSupervisors.push(data)
  //           })
  //       });
  // }

  public getWeeklyReports(){
        this.spinnerService.show();

        let currentUser = JSON.parse((localStorage.getItem('currentUser')));
        this.curUserID = currentUser.user_id;

        this.data_api.getWeeklyReportsClient(this.curUserID).subscribe((data) => {
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

  // ngAfterViewInit() {
  //   /* You can call this with a timeOut because if you don't you'll only see one checkbox... the other checkboxes take some time to render and appear, which is why we wait for it */
  //   // setTimeout(() => {
  //   //   this.disableCheckboxes();
  //   // }, 5000);
  //   // this.getWeeklyReports();
  // }

  public filterReports(){
    this.spinnerService.show();
      console.log(this.filterWeeklyReports.value);

      this.data_api.getClientWeeklyReportsQuery(this.curUserID, this.filterWeeklyReports.value).subscribe((data) => {
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

    approveAll(){
         console.log('approve all');
          let groupIndex = 0;
          for (let group of this.addFestForm.value.variationGroupArray) { 

              const adminAdvocacy2 = this.variationGroupArray().at(groupIndex)

              adminAdvocacy2.patchValue({
                groupStatus: 'approved'
              })

            groupIndex++;
          }

          console.log(this.addFestForm.value.variationGroupArray);
    }

}

@Component({
  selector: 'external-quotesdialog',
  templateUrl: 'external-quotesdialog.html',
})

export class ExternalQuotesClientDialog implements OnInit {

  addFestForm: FormGroup;
  pdfSrcs = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ExternalQuotesClientDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewUom() {

   
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

      this.data_api.createFBUomDaily(this.addFestForm.value.uom).then((result) => {
        console.log(result);
        this.dialogRef.close('success');
        this.spinnerService.hide();
        this.dialogRef.close(result);

        $.notify({
          icon: 'notifications',
          message: 'New Unit of Measurement Created'
        }, {
            type: 'success',
            timer: 1000,
            placement: {
                from: 'top',
                align: 'center'
            },
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
              '<button  mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
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
    console.log(this.data)
    this.pdfSrcs = this.data
    // this.addFestForm = this.formBuilder.group({
    //   uom: ['', Validators.required],
    // }, {
    // });
    
  }
}