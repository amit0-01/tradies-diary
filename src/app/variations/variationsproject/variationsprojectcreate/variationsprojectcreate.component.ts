
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../services/format-datepicker';
import { DatasourceService } from '../../../services/datasource.service';
import { Observable, Observer } from "rxjs";
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { LocalDataSource } from 'ng2-smart-table';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../../../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { DatePipe,formatCurrency } from '@angular/common';
import { MatChipInputEvent} from '@angular/material/chips';
import {ActivatedRoute, Params, Router} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import {ENTER, COMMA, V, I} from '@angular/cdk/keycodes';
// import {NgxImageCompressService} from 'ngx-image-compress';
import imageCompression from 'browser-image-compression';
import { ReplaySubject, Subject } from 'rxjs';
import { first ,take, takeUntil, startWith, finalize } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import * as moment from 'moment';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { NgxProgressOverlayService } from 'ngx-progress-overlay';
import { ConfirmedValidator  } from '../../../services/confirm-password.validator';
// import { Timestamp } from '@firebase/firestore';
import { PlaceholderImage } from '../../../services/placeholder-image';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Clipboard } from '@angular/cdk/clipboard';
import { VariationImage } from '../../../services/variation-image';
import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';
import { parseDate, PDFDocument } from 'pdf-lib'
import { EnlargeImage } from '../../../services/enlarge-image';
import { PDFIcons } from '../../../services/pdf-icons';
import { DeletedialogComponent } from 'src/app/shared/deletedialog/deletedialog.component';
import { checkValidEmail, updateRecipients } from 'src/app/utils/shared-function';
import Swal from 'sweetalert2';

declare const $: any;

@Component({
  selector: 'app-variationsprojectcreate',
  templateUrl: './variationsprojectcreate.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class VariationsProjectCreateComponent implements OnInit {

    addFestForm: FormGroup;

    public passID: any;

    public userDetails;

    protected _onDestroy = new Subject<void>();

    public projectOwners:any = [];
    public projectOwnersProject:any = [];

    public filter_list_owners: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public search_control_owner: FormControl = new FormControl();

    public filter_list_owners_project: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public search_control_owner_project: FormControl = new FormControl();
    variationEmailReceipient: ReplaySubject<[]> = new ReplaySubject<[]>(1);

    public filter_list_trades: ReplaySubject<any[]>[] = [];
    

    projectVariationRecipientControl = new FormControl({ value: [], disabled: true });

    public setProjectVariationRecipient:any = [];

    projectOwnerControl = new FormControl([]); //One time Variation Control

    public listTrades:any = [];

    public adminData;
    public projectData;
    public colorBtnDefault;
    public colorHlightDefault;
    
    currentWebWorker: false
    maxSizeMB: number = 1
    maxWidthOrHeight: number = 1024

    accountFirebase;
    public projUploadFolder;
    allPercentage: Observable<number>[] = [];
    downloadArray= [] ;
    downloadURLs= [] ;

    imgSrc;

    pdfLogo;
    pdfFooterImage;
    pdfClientNames;

    variationId;

    variationAdminData;

    displayVariationNumber;

    unitMeasurements=[
      {value: 'M3', viewValue: 'M3'},
      {value: 'LM', viewValue: 'LM'},
      {value: 'M2', viewValue: 'M2'},
      {value: 'Tons', viewValue: 'Tons'},
      {value: 'Kg', viewValue: 'Kg'},
      {value: 'Hrs', viewValue: 'Hrs'},
      {value: 'Item', viewValue: 'Item'},
    ]

    editorConfig: AngularEditorConfig = {
        editable: true,
          spellcheck: false,
          height: 'auto',
          minHeight: '100',
          maxHeight: 'auto',
          width: 'auto',
          minWidth: '0',
          translate: 'yes',
          enableToolbar: true,
          showToolbar: true,
          placeholder: 'Enter text here...',
          defaultParagraphSeparator: '',
          defaultFontName: 'Arial',
          defaultFontSize: '1',
          fonts: [
            {class: 'arial', name: 'Arial'},
            {class: 'times-new-roman', name: 'Times New Roman'},
            {class: 'calibri', name: 'Calibri'},
            {class: 'comic-sans-ms', name: 'Comic Sans MS'}
          ],
          customClasses: [
          {
            name: 'quote',
            class: 'quote',
          },
          {
            name: 'redText',
            class: 'redText'
          },
          {
            name: 'titleText',
            class: 'titleText',
            tag: 'h1',
          },
        ],
        sanitize: true,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
          ['justifyLeft','justifyCenter','justifyRight','justifyFull','superscript','subscript','strikeThrough','indent','outdent','insertUnorderedList','insertOrderedList','heading'],
          ['toggleEditorMode','insertImage','insertVideo','link','unlink','insertHorizontalRule','removeFormat',]
        ]
    };

    deviceInfo;

    saveFormInterval: any

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private data_api: DatasourceService,
        private spinnerService: NgxSpinnerService,
        public authService: AuthenticationService,
        private formBuilder: FormBuilder,
        public placeholderImage: PlaceholderImage,
        private variationImage: VariationImage,
        public datepipe: DatePipe,
        public dialog: MatDialog,
        // private rolechecker: RoleChecker,
        private afs: AngularFirestore,
        private afStorage: AngularFireStorage,
        private functions: AngularFireFunctions,
        private progressOverlay: NgxProgressOverlayService,
        private deviceService: DeviceDetectorService,
        private clipboard: Clipboard,
        public enlargeImage: EnlargeImage,
        public pdfIcons:PDFIcons,
        // private imageCompress: NgxImageCompressService
        ) { }

    async ngOnInit() {
      this.deviceInfo = this.deviceService.getDeviceInfo();

       this.passID = {
            id: this.route.snapshot.params['id'],
        };
        console.log(this.route.snapshot, 'snapvariation')
        
        this.route.params

        .subscribe(
            (params: Params) => {
                this.passID.id = params['id'];
            }
        );

        this.variationId =  this.afs.createId();

        if (localStorage.getItem('currentUser')) {
            this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
        }


        this.addFestForm = this.formBuilder.group({
            projectId: ['', Validators.required],
            variantsNumber: ['', Validators.required],
            variationsName: ['', Validators.required],
            // clientName: ['', Validators.required],
            dueDate: ['', Validators.required],
            projectOwner: [''],
            variationGroupArray: this.formBuilder.array([]),
            openingMessage: ['', Validators.required], 
            closingMessage: ['', Validators.required],
            status: [''],
            clientEmail: [''],
            folderName: [''],
            signature: [''],
            createdAt: [''],
            createdBy: [''],
            pdfLink: [''],
            bmLineitem : [''],
            bmTotalFigure : [''],
            bmHideAll : [''],
            qtyHideAll : [''],
            unitHideAll : [''],
            unitCostHideAll : [''],
            gstHideAll : [''],
            itemTotalHideAll : [''],
            clientAddress: ['', Validators.required],
        });

        // let _variantsNumber = await this.getFBCounterVariation();


        this.addFestForm.patchValue({
          projectId:  this.passID.id,
          // variantsNumber: _variantsNumber
        });

        

        // this.getFBProjectUsers();
        this.getFBAllTrades();
        this.getAdminSettings();
        this.getVariationSettings();
        // // this.getProject();
        
        this.accountFirebase = this.data_api.getCurrentProject();
        // FOR AUTO SAVE FORM
        this.setFormValue();
        this.saveFormInterval = setInterval(()=>{
          this.saveForm();
        },5000)
    }
     // Method to handle file upload
     onFileUpload(event: any) {
      console.log('event',event)
    }
  
    convertFileToBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);  // Resolve with the base64 string
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(file);  // Start the conversion
      });
    }
    
      ngOnDestroy(){
        clearInterval(this.saveFormInterval);
        localStorage.removeItem("formData")
        localStorage.removeItem('projectOwnerControl')
      }
      
    // setProjectOwners
    public setProjectOwners = [];


    // SET FORM VALUE FOR AUTO SAVE
    setFormValue(){
     const formData = localStorage.getItem('formData');
     let projectOwnerIDs; 
     setTimeout(()=>{
      if(formData){
        const parsedData = JSON.parse(formData);
        if(parsedData){
          // this.projectOwnerControl.setValue(parsedData.clientEmail)
          this.addFestForm.patchValue({
            variationsName: parsedData.variationsName,
            dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : '',
            openingMessage : parsedData.openingMessage, 
            closingMessage: parsedData.closingMessage,
            clientEmail: parsedData.clientEmail,
            // pdfLink: parsedData.pdfLink,
            bmLineitem: this.checkBooleanVariationSettings(parsedData.bmLineitem) ? parsedData.bmLineitem : false,
            bmTotalFigure: this.checkBooleanVariationSettings(parsedData.bmTotalFigure) ? parsedData.bmTotalFigure : false,
            bmHideAll: this.checkBooleanVariationSettings(parsedData.bmHideAll) ? parsedData.bmHideAll : false,
            qtyHideAll: this.checkBooleanVariationSettings(parsedData.qtyHideAll) ? parsedData.qtyHideAll : false,
            unitHideAll: this.checkBooleanVariationSettings(parsedData.unitHideAll) ? parsedData.unitHideAll : false,
            unitCostHideAll: this.checkBooleanVariationSettings(parsedData.unitCostHideAll) ? parsedData.unitCostHideAll : false,
            gstHideAll: this.checkBooleanVariationSettings(parsedData.gstHideAll) ? parsedData.gstHideAll : false,
            itemTotalHideAll: this.checkBooleanVariationSettings(parsedData.itemTotalHideAll) ? parsedData.itemTotalHideAll : false,
            // comments:  parsedData.comments ? parsedData.comments : '',
            // approvedAt: parsedData.approvedAt ? parsedData.approvedAt : '',
            // approvedBy:  parsedData.approvedBy ? parsedData.approvedBy : '',
            // approvedRole: parsedData.approvedRoleparsedData.approvedRole ? parsedData.approvedRoleparsedData.approvedRole  : ''
          })
          // let parsedProjectOwnerControl = JSON.parse(localStorage.getItem('projectOwnerControl'));
          // if(parsedProjectOwnerControl){
          //   projectOwnerIDs = parsedProjectOwnerControl;

          //   projectOwnerIDs.forEach(value => {
          //       if(this.findObjectByKey(this.projectOwners, 'id', value)){
          //           var item = this.findObjectByKey(this.projectOwners, 'id', value);
          //           this.setProjectOwners.push(item);
          //       }
          //   });

          //   this.projectOwnerControl.setValue(this.setProjectOwners);

          //  }
          // let projectOwnerIDs
          // if(parsedData.projectOwner){
          //   projectOwnerIDs = parsedData.projectOwner;
  
          //   projectOwnerIDs.forEach(value => {
          //       if(this.findObjectByKey(this.projectOwners, 'id', value)){
          //           var item = this.findObjectByKey(this.projectOwners, 'id', value);
          //           this.setProjectOwners.push(item);
          //       }
          //   });
  
          //   this.projectOwnerControl.setValue(this.setProjectOwners);
          //   console.log(this.setProjectOwners);
  
          // }
  
          if (parsedData.variationGroupArray){
            this.variationGroupArray().clear()
            let i = 0;
            parsedData.variationGroupArray.forEach(t => {
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
            const updatedArray = parsedData.variationGroupArray.map(item => {
              const { tempFiles, ...rest } = item;
              return rest;
          });
          
            this.variationGroupArray().patchValue(updatedArray)    
        }
       }
      }
     },4000)
    }

    checkBooleanVariationSettings(value){
      if( ((value == true) || (value == false)) && (value !== '') ){
        return true;
      }else{
        return false;
      }
  }

    // SAVE FORM FOR AUTO SAVE
    saveForm(){
    const projectOwnerControlIds = this.projectOwnerControl.value.map(element => element.id);
    localStorage.setItem('projectOwnerControl', JSON.stringify(projectOwnerControlIds))
    localStorage.setItem('formData',JSON.stringify(this.addFestForm.value))
    const tempfiles = this.addFestForm.value.variationGroupArray.map(items => items.tempFiles)
    console.log('tempfiles', tempfiles)
    }

    // UPDATE PROJECT VARIATION RECEIPIENT
    onSelectionChange(event?: any): void {
         try {
          // Extract recipient IDs from the selected values
          const recipientIds = this.projectVariationRecipientControl.value.map((recipient: any) => recipient.id);
      
          // Call the reusable function to update RFI recipients
          updateRecipients(
            this.data_api, // API service
            recipientIds, // List of recipient IDs
            this.projectData.id, // Project ID
            this.spinnerService,
            'Variation', // Spinner service
            (res: any) => {
              // Success callback: Call the `getProject` method after successful update
              // this.getProject();
            },
            (error: any) => {
              // Error callback: Handle error if something goes wrong
              console.error('Error during Variation update:', error);
            }
          );
        } catch (error) {
          console.error('Error processing variation change:', error);
        }
      }

      // ON TOPPIN REMOVE OF PROJECT RFI RECEIPIENT
      onProjectVariationToppingRemoved(topping, index:number){
        console.log('thisproectrficontrol' ,this.projectVariationRecipientControl.value)
        const newToppings = this.projectVariationRecipientControl.value.filter((_, i) => i !== index);
        this.projectVariationRecipientControl.patchValue(newToppings);
        this.onSelectionChange();
       }

    public isNumber(num){
      if(isNaN(num)){
        return false;
      }else{
        return true;
      }
    }
    
    public getSupplierName(id){
      if(id){
        let selectedTrade = this.listTrades.find(o => o.id === id);
        return selectedTrade?.tradeCompanyName;
      }else{
        return;
      }
      
    }

    public htmlToText(html: string) {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    getProject(){
      this.data_api.getFBProject(this.passID.id).subscribe((data) => {
      // this.data_api.getFBProject(this.passID.id).pipe(first()).subscribe(data => 
          this.projectData = data;
          this.projUploadFolder = data.uploadFolder;

          
          let varSetJobNum =  this.variationAdminData.varSetJobNum ? this.variationAdminData.varSetJobNum : true;
          let varSetCode =  this.variationAdminData.varSetCode ? this.variationAdminData.varSetCode : 'V';
          // let varSetStartNumber = this.variationAdminData.varSetStartNumber ? this.variationAdminData.varSetStartNumber : 0;
          let varSetStartNumber = this.projectData.varProjStartNumber ? this.projectData.varProjStartNumber : 1;

          let displayJobNum = ''
          if(varSetJobNum == true){
            displayJobNum = this.projectData.jobNumber;
          }


          if(this.projectData.counterVariation){ //if project variation exist
            

            if(this.projectData.counterVariation >= varSetStartNumber){ //if project var num is higher or equal than admin var num

              this.displayVariationNumber =  this.checkDigitNumbers(parseInt(this.projectData.counterVariation) + 1);

            }else{ //if project var num is lower than admin var num

              if(varSetStartNumber > 1){  //if admin var num is higher than 0
                this.displayVariationNumber = this.checkDigitNumbers(varSetStartNumber);
              }else{
                this.displayVariationNumber = this.checkDigitNumbers(1);
              }

            }

          }else{ //if project variation NOT exist

            if(varSetStartNumber > 1){   //if admin var num is higher than 0
              this.displayVariationNumber =  this.checkDigitNumbers(varSetStartNumber);
            }else{
              this.displayVariationNumber = this.checkDigitNumbers(1);
            }

          }

          this.addFestForm.patchValue({
            variantsNumber: displayJobNum + varSetCode + this.checkDigitNumbers(this.displayVariationNumber ),
            bmLineitem: this.checkGlobalBooleanVariationSettings(data.bmLineitem) ? data.bmLineitem : false,
            bmTotalFigure: this.checkGlobalBooleanVariationSettings(data.bmTotalFigure) ? data.bmTotalFigure : false,
            bmHideAll: this.checkGlobalBooleanVariationSettings(data.bmHideAll) ? data.bmHideAll : false,
            qtyHideAll: this.checkGlobalBooleanVariationSettings(data.qtyHideAll) ? data.qtyHideAll : false,
            unitHideAll: this.checkGlobalBooleanVariationSettings(data.unitHideAll) ? data.unitHideAll : false,
            unitCostHideAll: this.checkGlobalBooleanVariationSettings(data.unitCostHideAll) ? data.unitCostHideAll : false,
            gstHideAll: this.checkGlobalBooleanVariationSettings(data.gstHideAll) ? data.gstHideAll : false,
            itemTotalHideAll: this.checkGlobalBooleanVariationSettings(data.itemTotalHideAll) ? data.itemTotalHideAll : false,
          });

          // if(this.projectData.counterVariation){
          //     this.addFestForm.patchValue({
          //       variantsNumber: displayJobNum + varSetCode + this.checkDigitNumbers( parseInt(this.projectData.counterVariation) + 1 )
          //     });
          // }else{
          //     this.addFestForm.patchValue({
          //       variantsNumber: data.jobNumber + "V0001"
          //     });
          //     this.projectData.counterVariation = 0;
          // } 

          if(data.recipientVariation){

            this.setProjectVariationRecipient = [];
            let projectOwnerIDs;

            projectOwnerIDs = data.recipientVariation;

            projectOwnerIDs.forEach(value => {
                if(this.findObjectByKey(this.projectOwnersProject, 'id', value)){
                    var item = this.findObjectByKey(this.projectOwnersProject, 'id', value);
                 
                    this.setProjectVariationRecipient.push(item);
                }
                var index = this.projectOwners.findIndex(x => x.id == value);
                if (index !== -1) {
                  this.projectOwners.splice(index, 1);
                  this.initializeFilterOwners();
                }
            });
            this.variationEmailReceipient.next(this.setProjectVariationRecipient)
            this.projectVariationRecipientControl.setValue(this.setProjectVariationRecipient);
            
           
          }

          // EMAIL CCS
          if (data.VariationEmailCC) {
            this.VariationEmailCC = data.VariationEmailCC
          }
          
          // EMAIL BCCS
          if (data.VariationEmailBCC) {
            this.VariationEmailBCC = data.VariationEmailBCC
          }


        
      });
    }

       isCCEditable: boolean = false;
          isBCCEditable: boolean = false;
          
          VariationEmailCC: string[] = [];
          VariationEmailBCC: string[] = [];
          
          handleEmailAdd(event: KeyboardEvent, type: 'cc' | 'bcc') {
            event.preventDefault(); 
            const input = event.target as HTMLInputElement;
            const value = input.value.trim();
          
            if (value && checkValidEmail(value, Swal)) {
              console.log('Adding valid email:', value);
          
              const targetArray = type === 'cc' ? this.VariationEmailCC : this.VariationEmailBCC;
              targetArray.push(value);
          
              this.updateEmailList(targetArray, type);
              input.value = '';
            }
          
            console.log('VariationEmailCC:', this.VariationEmailCC);
          }
          
          removeEmail(type: 'cc' | 'bcc', index: number) {
            const targetArray = type === 'cc' ? this.VariationEmailCC : this.VariationEmailBCC;
          
            if (index > -1 && index < targetArray.length) {
              targetArray.splice(index, 1);
              this.updateEmailList(targetArray, type);
            }
          }
          
          private updateEmailList(emailList: string[], type: 'cc' | 'bcc') {
            this.spinnerService.show();
            this.data_api.updateCCsAndBCCs(emailList, type, this.projectData.id, 'variation')
              .then(() => this.spinnerService.hide())
              .catch((err) => {
                console.error(`Error updating ${type.toUpperCase()}s:`, err);
                this.spinnerService.hide();
              });
          }
        
        
            toggleEdit(type: 'cc' | 'bcc') {
            if (type === 'cc') {
              this.isCCEditable = !this.isCCEditable;
            } else {
              this.isBCCEditable = !this.isBCCEditable;
            }
            }
        

            isProjectVariationEditable = false;

            toggleProjectVariationEdit() {
              this.isProjectVariationEditable = !this.isProjectVariationEditable;
              if(this.isProjectVariationEditable){
                this.projectVariationRecipientControl.enable()
              } else{
                this.projectVariationRecipientControl.disable();
              }
            }


    
    findObjectByKey(array, key, value) {

        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return null;
    }


    checkDigitNumbers(digit){
        if(digit < 1000){
          return digit.toString().padStart(4, '0');
        }else{
          return digit;
        }
    }

    variationGroupArray(): FormArray {
      return this.addFestForm.get('variationGroupArray') as FormArray;
    }

    itemArray(groupIndex:number) : FormArray {
      return this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray
    }

    // THIS IS FOR AUTO SAVE START
    createVariationGroupArrayForAutoSave(): FormGroup {
      return this.formBuilder.group({
        groupName: '',
        groupBudget: '',
        hideBudget: true,
        groupTotal: '',
        groupOverUnder: '',
        groupStatus: '',
        files: '',
        tempFiles: new FormControl(null, [FileUploadValidators.accept(['application/pdf']), FileUploadValidators.filesLimit(5)]),
        itemArray: this.formBuilder.array([])
      });
    }

    //    // THIS IS FOR AUTO SAVE END

    createVariationGroupArray(): FormGroup {
      return this.formBuilder.group({
        groupName: '',
        groupBudget: '',
        hideBudget: true,
        groupTotal: '',
        groupOverUnder: '',
        groupStatus: '',
        files: '',
        tempFiles: new FormControl(null, [FileUploadValidators.accept(['application/pdf']), FileUploadValidators.filesLimit(5)]),
        itemArray: this.formBuilder.array([])
      });
    }

    addVariationGroupArray() {
      this.variationGroupArray().push(this.createVariationGroupArray());
    }
  
    removeGroup(groupIndex){
      // this.variationGroupArray().removeAt(groupIndex)
    const deletedialog =  this.dialog.open(DeletedialogComponent,{width: '500px', data: "Group"})
    deletedialog.afterClosed().subscribe((res) =>{
      if(res){
           this.variationGroupArray().removeAt(groupIndex)
      }
    })
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
        hasImage: '',
        imageCaption: ''
      });
    }

    addItemArray(groupIndex: number) {
      this.itemArray(groupIndex).push(this.createItemArray());
    }

    removeGroupItem(groupIndex,itemIndex){

      this.itemArray(groupIndex).removeAt(itemIndex);
      this.computeGroupTotal(groupIndex);
    }

    // async getFBCounterVariation(){
    //   const data =  await this.data_api.getFBCounterVariation().pipe(take(1)).toPromise();
    //   console.log(data);
    //   if(data){
    //     if(data.reportNumber){
    //       return data.reportNumber + 1;  
    //     }else{
    //       return 1
    //     }
    //   }else{
    //     return 1
    //   }
    // }

    onComputeTotal(groupIndex,itemIndex){

        const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;

        let _quantity = adminAdvocacy.controls[itemIndex].get('quantity').value;
        let _unitCost = adminAdvocacy.controls[itemIndex].get('unitCost').value;
        let _subtotal = _quantity *  _unitCost;
        let _taxRate = 10;
        let _bmpercentage = adminAdvocacy.controls[itemIndex].get('buildersMargin').value;
        let _bmp_subtotal = (_bmpercentage * _subtotal) / 100;
        let _gst = ((_subtotal + _bmp_subtotal) * _taxRate) /  100;
        let _itemTotal = _gst + _bmp_subtotal + _subtotal;
        
      
        adminAdvocacy.controls[itemIndex].patchValue({
            // subTotal: _subtotal.toFixed(2),
            gst: _gst.toFixed(2),
            itemTotal: _itemTotal.toFixed(2)
        });

        this.computeGroupTotal(groupIndex);
    }

  computeGroupTotal(groupIndex){

      let len = this.itemArray(groupIndex).length;
      let _groupTotal = 0;
   
      for (let i = 0; i < len; i++) {
       
        _groupTotal = _groupTotal + parseFloat(this.itemArray(groupIndex).value[i].itemTotal);
      
      }
      let _groupBudget = this.variationGroupArray().at(groupIndex).get('groupBudget').value;
      let _groupOverUnder = _groupBudget - _groupTotal;

      this.variationGroupArray().at(groupIndex).get('groupTotal').patchValue(_groupTotal.toFixed(2));
      this.variationGroupArray().at(groupIndex).get('groupOverUnder').patchValue(_groupOverUnder.toFixed(2));
    }

    async onFileChange(event,groupIndex,itemIndex) {
      
      if(event.target.files && event.target.files.length) {
    
            const imageFile = event.target.files[0];
            
            var options = {
              maxSizeMB: this.maxSizeMB,
              maxWidthOrHeight: this.maxWidthOrHeight,
              useWebWorker: this.currentWebWorker,
              maxIteration: 50,
              onProgress: (p) => {
                this.spinnerService.show();
                if(p == 100){
                  this.spinnerService.hide();
                }
              }
            }
    
        
    
            // Crop Lnadscape images and convert to base64
            const imageCropped = await this.fileListToBase64(event.target.files);
    
            // Convert Base64 to File
           
            
    
            // Convert Base64 to File
            const compressedFiles = await  Promise.all(
              imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
            )
    
    
            // Compress File
            const compressedFiles2 = await  Promise.all(
              await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
            )
            
       
    
    
            let reader = new FileReader();
    
            reader.readAsDataURL(compressedFiles2[0]);

            const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;

            reader.onload = () => {

                adminAdvocacy.controls[itemIndex].patchValue({
                    itemImage: reader.result,
                });
                // this.editForm.patchValue({
                //   imageFile: reader.result,
  
                // });
                
                // this.imageURL = reader.result;
    
            }
    
      }
    }
    
    async fileListToBase64(fileList) {
      // create function which return resolved promise
      // with data:base64 string
    
      function crop(url, aspectRatio) {
    
        return new Promise(resolve => {
      
          // this image will hold our source image data
          const inputImage = new Image();
      
          // we want to wait for our image to load
          inputImage.onload = () => {
      
            // let's store the width and height of our image
            const inputWidth = inputImage.naturalWidth;
            const inputHeight = inputImage.naturalHeight;
      
            // get the aspect ratio of the input image
            const inputImageAspectRatio = inputWidth / inputHeight;
      
            // if it's bigger than our target aspect ratio
            let outputWidth = inputWidth;
            let outputHeight = inputHeight;
            if (inputImageAspectRatio > aspectRatio) {
              outputWidth = inputHeight * aspectRatio;
            } else if (inputImageAspectRatio < aspectRatio) {
              outputHeight = inputWidth / aspectRatio;
            }
      
            // calculate the position to draw the image at
            const outputX = (outputWidth - inputWidth) * .5;
            const outputY = (outputHeight - inputHeight) * .5;
      
            // create a canvas that will present the output image
            const outputImage = document.createElement('canvas');
      
            // set it to the same size as the image
            outputImage.width = outputWidth;
            outputImage.height = outputHeight;
      
            // draw our image at position 0, 0 on the canvas
            const ctx = outputImage.getContext('2d');
            ctx.drawImage(inputImage, outputX, outputY);
            resolve(outputImage.toDataURL());
          };
      
          // start loading our image
          inputImage.src = url;
        });
        
      };
    
      function getBase64(file) {
          const reader = new FileReader()
          return new Promise(resolve => {
    
            reader.onload = (event:any) => {
    
                var image = new Image();
                let self = this;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
    
                image.src = event.target.result;
    
                image.onload = () => {
                                                                                                                    
                          // if(image.height > image.width){
                          //   //this.imageURL.push(event.target.result);
                          //   resolve(event.target.result)
    
                          // }else{
    
                            crop(event.target.result, 4/3).then(canvas => {
                              //this.imageURL.push(canvas);
                              resolve(canvas)
                            });
                            
                          // }
    
                          //self.imageURL.push(event.target.result);     
                };
    
            
            }
    
            reader.readAsDataURL(file)
          })
        }
        // here will be array of promisified functions
        const promises = []
      
        // loop through fileList with for loop
        for (let i = 0; i < fileList.length; i++) {
          promises.push(getBase64(fileList[i]))
        }
      
        // array with base64 strings
        return await Promise.all(promises)
      }
    

    public getFBProjectUsers(){
   
        this.data_api.getFBUsersOrderedFname().subscribe((data) => {
             
                if(data){
                  // this.projectOwners = [];
                //   this.projectWorkers = [];
                //   this.siteSupervisors = [];
                //   this.altSupervisors = [];

                    data.forEach(data =>{     
                        if(!data.password){
                          if( (data.userRole == 'project_owner') && (!this.findObjectByKey(this.projectOwners, 'id', data.id)) ){
                              this.projectOwnersProject.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName,email: data.userEmail})
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
                this.initializeFilterOwners();
                this.initializeFilterOwnersProject();
                // this.initializeFilterWorkers();
                // this.initializeFilterSupervisors();
                // this.initializeFilterAltSupervisors();
                if(!this.projectData){
                  this.getProject();
                }
          }
        );
    }

    getFBAllTrades(): void {
      this.data_api.getFBAllTrades().subscribe(data => {
       
  
          if(data){

            data.sort(function(a, b) {
                var textA = a.tradeCompanyName.toUpperCase();
                var textB = b.tradeCompanyName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            this.listTrades = data;
          }
  
      });
    }

    initializeFilterOwners() {

      this.filter_list_owners.next(this.projectOwners.slice());       
        this.search_control_owner.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListOwners();
        });

    }

    initializeFilterOwnersProject() {

      this.filter_list_owners_project.next(this.projectOwnersProject.slice());

        this.search_control_owner_project.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListOwnersProject();
        });

    }

    initializeFilterTrades(groupIndex, itemIndex) {

      this.filter_list_trades[itemIndex] = new ReplaySubject<any[]>(1);

      const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;
      adminAdvocacy.controls[itemIndex].get('search_control_trade').valueChanges
      .pipe(takeUntil(this._onDestroy),
      startWith(adminAdvocacy.controls[itemIndex].get('search_control_trade').value))
      .subscribe(() => {
        this.filterListTrades(groupIndex, itemIndex);
      });

    }

    filterListTrades(groupIndex, itemIndex) {
      if(!this.listTrades) {
        return;
      }

      const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;
      
      let search = adminAdvocacy.controls[itemIndex].get('search_control_trade').value;
      
      if(!search) {
        this.filter_list_trades[itemIndex].next(this.listTrades.slice());
        return;
      } else {
        search = search.toLowerCase();
      }

      this.filter_list_trades[itemIndex].next(
        this.listTrades.filter(trades => trades.tradeCompanyName.toLowerCase().indexOf(search) > -1)
      );
      
    }

    protected filterListOwners() {
        if (!this.projectOwners) {
          return;
        }
        // get the search keyword
        let search = this.search_control_owner.value;
        if (!search) {
          this.filter_list_owners.next(this.projectOwners.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        // filter the banks
        this.filter_list_owners.next(
          this.projectOwners.filter(projectOwner => projectOwner.name.toLowerCase().indexOf(search) > -1)
        );
    }

    protected filterListOwnersProject() {
      if (!this.projectOwnersProject) {
        return;
      }
      // get the search keyword
      let search = this.search_control_owner_project.value;
      if (!search) {
        this.filter_list_owners_project.next(this.projectOwnersProject.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_owners_project.next(
        this.projectOwnersProject.filter(projectOwner => projectOwner.name.toLowerCase().indexOf(search) > -1)
      );
  }

    onToppingRemoved(topping, index: number) {


      const newToppings = this.projectOwnerControl.value.filter((_, i) => i !== index);
      this.projectOwnerControl.patchValue(newToppings);
    }

           inputControl = new FormControl('');
           
           addRecipient(event: KeyboardEvent): void {
            event.stopPropagation();
            event.preventDefault();
            const input = this.inputControl.value;
            if(!checkValidEmail(input, swal)){
                  return;
            }
            if (input) {
              const newRecipient = { 
                email: input,
                id: '123'};  // this is static for error
              const currentValue = this.projectOwnerControl.value;
              console.log('currenvalue', currentValue)
              
              // Ensure the value is an array before pushing newRecipient
              if (Array.isArray(currentValue)) {
                this.projectOwnerControl.setValue([...currentValue, newRecipient]);
              }
          
              // Clear the input field after adding the recipient
              this.inputControl.setValue('');  // Clear the input control
            }
              // Now update the clientEmail field in rfiForm
                // Extract the emails from projectOwnerControl
                const emails = this.projectOwnerControl.value.map((recipient: { email: string }) => recipient.email);
              
                // Update the rfiForm with the new emails array
                this.addFestForm.patchValue({
                  clientEmail: emails
                });
          
                console.log("projectOwnerControl", this.projectOwnerControl.value)
          }




      public findInvalidControls() {
        const invalid = [];
        const controlsVariation = this.addFestForm.controls

        for (const name in controlsVariation) {
            if (controlsVariation[name].invalid) {
                if(name == 'variationsName'){
                  invalid.push('Variation Name');
                }else if(name == 'dueDate'){
                  invalid.push('Due Date');
                }else if(name == 'projectOwner'){
                  invalid.push('Clients');
                }else if(name == 'openingMessage'){
                  invalid.push('Opening Message');
                }else if(name == 'closingMessage'){
                  invalid.push('Closing Message');
                }
            }
        }

        let groupIndex = 0;
        for (let group of this.addFestForm.value.variationGroupArray) { 
        
          let itemIndex = 0;
          for (let item of group.itemArray) {
            
            const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;
           

            if(adminAdvocacy.controls[itemIndex].get('itemImage').status == 'INVALID'){
              invalid.push('Item image');
            }

            itemIndex++;
          }
          groupIndex++;
        }

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

    getFooter (currentPage, pageCount) {
          return [{
              // margin: [31, 0, 31],
              // layout: {
              //     hLineColor: (i) => (i === 0) ? 'lightgray' : '',
              //     vLineWidth: (i) => 0,
              //     hLineWidth: (i) => (i === 0) ? 1 : 0
              // },
              stack: [
                        
                        {
                            image: this.pdfFooterImage,
                            width: '535',
                            margin:[30,0]
                        },
                        {
                            text: currentPage.toString() + ' of ' + pageCount,
                            style: 'test4',
                            margin: [ 30, -35, 30, 0 ]
                        }
                ]
              }
          ];
      };

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
    
        if(arr){
            if(arr.length > 1){
              return arr.join(', ');
            }else{
              return arr;
            }
        }
      }

      getTableHeader(){

        let content = [];

        content.push([
          {
              table: {
                widths: [ '40%','10%','10%','10%','10%','10%','10%'],
                body: [[
                    {
                      text: 'Description', 
                      style: 'tableHeader',
                    },
                    {
                        text:  'Qty', 
                        style: 'tableHeader',  
                    },
                    {
                        text:  'UOM', 
                        style: 'tableHeader',  
                    },
                    {
                        text:  'Cost', 
                        style: 'tableHeader',  
                    },
                    {
                        text:  'Subtotal', 
                        style: 'tableHeader',  
                    },
                    {
                        text:  'GST', 
                        style: 'tableHeader',  
                    },
                    {
                        text:  'Total', 
                        style: 'tableHeader',  
                    }
                ]]                     
              },
              layout: {
                defaultBorder:false,
                paddingTop: function(i, node) { return 0; }, 
                paddingBottom: function(i, node) { return 0;},
              }
            },
          
          ])


        return content;

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
            return newArr;
  
      }
  
      variationSettingsTitle(){
  
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
    
        return newArr;
      }
  
      variationSettingsValue(item){
  
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
     
        return newArr;
      }
  

      pdfBmHideAllTitleWidth(){
        if(this.addFestForm.value.bmHideAll == true){
          return [ '40%','10%','10%','10%','10%','0%','10%','10%'];   
        }else{
            if(this.addFestForm.value.bmLineitem == true){
              return [ '30%','10%','10%','10%','10%','10%','10%','10%'];
            }else{
              return [ '40%','10%','10%','10%','10%','0%','10%','10%'];
            }   
        }
      }
  
      pdfBmHideAllTitle(){
        if(this.addFestForm.value.bmHideAll == true){
          return {};
        }else{
  
          if(this.addFestForm.value.bmLineitem == true){
            return {text:  'BM', style: 'tableHeader'} 
          }else{
            return {};
          }
  
        }
      }
  
      pdfBmHideAllTitleValueWidth(){
        if(this.addFestForm.value.bmHideAll == true){
          return [ '40%','10%','10%','10%','10%','0%','10%','10%'];   
        }else{
            if(this.addFestForm.value.bmLineitem == true){
              return [ '30%','10%','10%','10%','10%','10%','10%','10%'];
            }else{
              return [ '40%','10%','10%','10%','10%','0%','10%','10%'];
            }   
        }
      }
  
      // pdfBmHideAllValue(bmValue){
      //   if(this.addFestForm.value.bmHideAll == true){
      //     return {};
      //   }else{
  
      //     if(this.addFestForm.value.bmLineitem == true){
      //       return {  
      //                 text:  formatCurrency(bmValue, 'en-AU', '$', 'AUD',''),
      //                 style: 'fieldData',  
      //              }
      //     }else{
      //       return {};
      //     }
  
      //   }
      // }
  
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

    public getDocumentDefinition() {

      let variationItemImages = []; 

      for (let group of this.addFestForm.value.variationGroupArray) { 
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
          {
            stack: [
              {
                text: '',
                style: 'test',
              }
            ],
            margin: [ 0, 20, 0, 0 ],
            width: '20%',
          },
          {
            stack: [
              {
                columns: [
                  {
                    stack: [
                      {
                        text: 'Project:',
                        style: 'tableHeader',
                      },
                      {
                        text: 'Variation Name:',
                        style: 'tableHeader',
                      },
                      {
                        text: 'Variation No.:',
                        style: 'tableHeader',
                      }
                    ],
                    width: '35%',
                  },
                  {
                    stack: [
                      {
                        text: this.projectData.projectName,
                        style: 'fieldData',
                      },
                      {
                        text: this.addFestForm.value.variationsName,
                        style: 'fieldData',
                      },
                      {
                        text: this.addFestForm.value.variantsNumber, //(this.editForm.value.reportNumber ? this.editForm.value.reportNumber : ''),
                        style: 'fieldData',
                      }
                    ],
                  }
                ],
                columnGap: 10
              },
            ],
            margin: [ 0, 30, 0, 0 ],
            width: '40%',
          },
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
                  text: ' ', //this.userDetails.name,
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
                  text: ' ', //image: this.addFestForm.value.signature,
                  width: '150',
                  margin: [ 15, 30, 0, 0 ]
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
                  text: ' ', //moment((new Date()).toDate()).format('DD/MM/YYYY'),
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
        },
        footerText: {
          color: '#050708',
          fontSize: 8,
          bold: true,
        },
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


    

    saveStepCheckValidation(){

        let ownerList = this.projectOwnerControl.value;
      
        let ownerIDS = [];
        this.pdfClientNames = [];
        this.addFestForm.patchValue({
          projectOwner: ''
        });


      

        if(ownerList){

            ownerList.forEach( data => {
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

   

        if(this.addFestForm.value.variationGroupArray.length < 1 ){
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

      

        if(this.addFestForm.value.variationGroupArray ){
          let errorDetect = 0;
          let imgCount = 0;
          for (let group of this.addFestForm.value.variationGroupArray) { 
            for (let item of group.itemArray) {
                if(item.itemImage){
                  imgCount = imgCount + 1;
                }
            }
            if(group.itemArray.length < 1){
              errorDetect = 1;
            }
          }
          if( (imgCount < 1) || (errorDetect == 1) ){
            swal.fire({
              title: "Please Add at least 1 Item to each group",
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
        

        if(  (this.addFestForm.value.projectOwner.length < 1) &&  (this.setProjectVariationRecipient.length < 1) ){

          swal.fire({
            title: "Please Add at least 1 Variation Recipient",
                // text: htmlVal,
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
          })

          return;

        }

        
        this.addFestForm.patchValue({
          createdAt: new Date(),
          createdBy: this.userDetails.user_id
        });

        let folderName =  Math.random().toString(36).substring(2);
        this.addFestForm.patchValue({
          folderName: folderName
        });

        let tobeuploadPDFs = 0;
        for (let group of this.addFestForm.value.variationGroupArray) { 
          if(group.tempFiles){
            for (let file of group.tempFiles) {
              tobeuploadPDFs++;
            }
          }
        }

        if(tobeuploadPDFs > 0){
          this.saveStepUploadQuotes();
        }else{
          this.saveStepUploadPDF();
        }

    }

    saveStepUploadQuotes(){

      let pdfDone = 0;
      let i = 0;
      //let imageLen = this.addFestForm.value.variationGroupArray.length;
      let pdfLen = 0;
      for (let group of this.addFestForm.value.variationGroupArray) { 
        if(group.tempFiles){
          for (let file of group.tempFiles) {
            pdfLen++;
          }
        }
      }

      let folderName =  this.addFestForm.value.folderName;    
            this.progressOverlay.show('Uploading Quotes','#0771DE','white','lightslategray',1);

            let groupIndex = 0;
            for (let group of this.addFestForm.value.variationGroupArray) { 
              let groupFiles = [];
              if(group.tempFiles){
                    let fileIndex = 0;
                    for (let file of group.tempFiles) {
                    //for (let i = 0; i < this.imageURL.length; i++) {
                      // let base64image = item.itemImage;
                      let id = Math.random().toString(36).substring(2);
                      let fileName = this.addFestForm.value.variantsNumber+'-'+groupIndex+'-'+fileIndex+'-'+id+'.pdf';


                     

                   
                      let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Variations/'+folderName+'/'+fileName);
                      
                      //let base64String = base64image.split(',').pop();
                      let task = ref.put(file);
                      let _percentage$ = task.percentageChanges();

                      _percentage$.subscribe(
                        (prog: number) => { 
                          this.progressOverlay.setProgress(Math.ceil(prog));
                      });
                      
                      this.allPercentage.push(_percentage$);
                      task.snapshotChanges().pipe(
                        finalize(async () => {

                          ref.getDownloadURL().subscribe((url) => { 
                            let splitName = url.split(/%2..*%2F(.*?)\?alt/);
                            

                            let splitName2 = splitName[1].split("-");
                            let myIndex = splitName2[1];
                            
                            let myFiles = [];
                            myFiles.push(url);
                            let newFiles = [];
                            if(this.variationGroupArray().at(myIndex).get('files').value){
                              newFiles = myFiles.concat(this.variationGroupArray().at(myIndex).get('files').value);
                            }else{
                              newFiles = myFiles;
                            }

                          

                            this.variationGroupArray().at(myIndex).get('files').patchValue(newFiles);

                            pdfDone = pdfDone + 1;
                            if(pdfDone == pdfLen){
                              this.progressOverlay.hide();
                              this.saveStepUploadPDFwithQuotes();
                            } 
                          
                        });
                      })).subscribe();
                      fileIndex++;
                  }
                  
                }
                groupIndex++;
            }
    }

    async saveStepUploadPDFwithQuotes(){

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

        this.progressOverlay.show('Merging PDF','#0771DE','white','lightslategray',1);

        const mergedPdf = await PDFDocument.create();
        
        const documentDefinition = this.getDocumentDefinition();
        
        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        pdfDocGenerator.getBuffer(async (buffer) => {

            const pdfA =  await PDFDocument.load(buffer);
            const copiedPagesA = await mergedPdf.copyPages(pdfA, pdfA.getPageIndices());
            copiedPagesA.forEach((page) => mergedPdf.addPage(page));
    
              const pdfBytes = await mergedPdf.save();
              let folderName =  this.addFestForm.value.folderName;  
              let id = this.addFestForm.value.variationsName+'.pdf';
              pdfDocGenerator.getBase64((data) => {
                let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Variations/'+folderName+'/'+id);

                let task = ref.put(pdfBytes,{contentType:"application/pdf"});
                // let task = ref.putString(data, 'base64',{contentType:"application/pdf"});
                let _percentage$ = task.percentageChanges();
                _percentage$.subscribe(
                  (prog: number) => {
                    this.progressOverlay.setProgress(Math.ceil(prog));
                });

                task.snapshotChanges().pipe(
                  finalize(() => {
                    ref.getDownloadURL().subscribe((url) => { 
                      this.progressOverlay.hide();
                  
                      this.addFestForm.patchValue({
                        pdfLink: url
                      });


                      // this.downloadPDF(data,id)
                      this.downloadPDF(url,id)
                      
                      this.saveStepUploadImages();

                    });
                })).subscribe();

              });
        });

    }

    // public downloadPDF(pdf, fileName) {
    //   const linkSource = `data:application/pdf;base64,${pdf}`;
    //   const element = document.createElement('a');
    //   element.href = linkSource;
    //   element.download = fileName;
    
    //   element.style.display = 'none';
    //   element.click();
    // }

    downloadPDF(pdfUrl: string, fileName: string) {
      fetch(pdfUrl)
        .then(response => response.blob()) 
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob); 
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl); 
        })
        .catch(error => console.error('Error downloading PDF:', error));
    }
    


    async saveStepUploadPDF(){

        this.progressOverlay.show('Uploading Variation PDF','#0771DE','white','lightslategray',1);
        const documentDefinition = this.getDocumentDefinition();

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        let id = this.addFestForm.value.variationsName+'.pdf';
        
        let folderName =  this.addFestForm.value.folderName;   

        pdfDocGenerator.getBase64((data) => {

          let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Variations/'+folderName+'/'+id);
          let task = ref.putString(data, 'base64',{contentType:"application/pdf"});
          let _percentage$ = task.percentageChanges();
          _percentage$.subscribe(
            (prog: number) => {
              this.progressOverlay.setProgress(Math.ceil(prog));
          });

          task.snapshotChanges().pipe(
            finalize(() => {
              ref.getDownloadURL().subscribe((url) => { 
                this.progressOverlay.hide();
         
                this.addFestForm.patchValue({
                  pdfLink: url
                });

                this.downloadPDF(data,id);
                
              

                this.saveStepUploadImages();

              });
          })).subscribe();

        });

    }

    saveStepUploadImages(){

          let imageDone = 0;
          let i = 0;
          //let imageLen = this.addFestForm.value.variationGroupArray.length;
          let imageLen = 0;
          for (let group of this.addFestForm.value.variationGroupArray) { 
            for (let item of group.itemArray) {
            
              imageLen++;
            }
          }

          let folderName =  this.addFestForm.value.folderName;    
          
          

          for (let group of this.addFestForm.value.variationGroupArray) { 
            for (let item of group.itemArray) {
              //for (let i = 0; i < this.imageURL.length; i++) {
                let base64image = item.itemImage;
              let id = Math.random().toString(36).substring(2);
             
                let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Variations/'+folderName+'/'+i);
             
                let task = ref.putString(base64image, 'data_url');
                let _percentage$ = task.percentageChanges();

                _percentage$.subscribe(
                  (prog: number) => {
                    this.progressOverlay.setProgress(Math.ceil(prog));
                });
                
                this.allPercentage.push(_percentage$);

                task.snapshotChanges().pipe(
                  finalize(() => {
                    ref.getDownloadURL().subscribe((url) => { 
                        // this.downloadURLs = this.downloadURLs.concat([url]);
                      
                        let splitName = url.split(/%2..*%2F(.*?)\?alt/);
                    

                        this.downloadArray.push({
                            url: url,
                            nameIndex: splitName[1]
                        });
                        
                        imageDone = imageDone + 1;
                        if(imageDone == imageLen){
                          this.progressOverlay.hide();
                          this.saveStepCreateVariation();
                        } 
                    });
                })).subscribe();
                i++;
            }
          }

    }


   

    async saveStepCreateVariation(){

      


        let tempIndex = 0;
        for (let group of this.addFestForm.value.variationGroupArray) { 
          this.variationGroupArray().at(tempIndex).get('tempFiles').disable();
          tempIndex++;
        }


         if( this.downloadArray){
            //Sort Download URLS by filename
            this.downloadArray.sort((a, b) => {
              return a.nameIndex - b.nameIndex;
            });

        

            this.downloadArray.forEach((data) => {
              this.downloadURLs.push(data.url);
            });
          
        }

        let groupIndex = 0;   
        let i=0;
        
        for (let group of this.addFestForm.value.variationGroupArray) { 
          let itemIndex = 0;
          for (let item of group.itemArray) {

            const adminAdvocacy = this.variationGroupArray().at(groupIndex).get("itemArray") as FormArray;
    
            adminAdvocacy.controls[itemIndex].patchValue({
              itemImage: this.downloadURLs[i],
            });

            itemIndex++;
            i++;

         
            
          }
          groupIndex++;
        }
      


        this.data_api.updateFBCounterProjectVariation(this.addFestForm.value.projectId, this.displayVariationNumber ).then(() => {
        });

        this.addFestForm.patchValue({
          status: 'Draft'
        });

        this.data_api.createFBVariation(this.variationId,this.addFestForm.value).then(data => {
        
  
          $.notify({
            icon: 'notifications',
            message: 'Variation Saved.'
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
  
          this.router.navigate(['/variations/project/'+this.passID.id+'/edit/'+this.variationId]);  
  
        });
    }

    ownerSelectChange(event)
    {
    //   let projectOwnerControl = JSON.parse(localStorage.getItem('projectOwnerControl')) || []; 
    //   // Retrieve existing array from localStorage
    //   const isDuplicate = projectOwnerControl.some(item => item === event.source.value.id);
    //   if(!isDuplicate){
    //   projectOwnerControl.push(event.source.value.id); // Add the new value
    //   console.log('projectOwnerControl after push', projectOwnerControl);
    //   // this.projectOwnerControl.patchValue(projectOwnerControl)
    
    //  localStorage.setItem('projectOwnerControl', JSON.stringify(projectOwnerControl));
    //   }
      if(event.isUserInput) {
       
          if(event.source.selected == true){
              // const clientEmail = this.editForm.get('clientEmail') as FormArray;
              // clientEmail.push(this.formBuilder.control(event.source.value.email));
              let tempArray = [event.source.value.email, ...this.addFestForm.value.clientEmail];
                this.addFestForm.patchValue({
                  clientEmail: tempArray
                });
          }else{  
              // const clientEmail = this.editForm.get('clientEmail') as FormArray;
              // clientEmail.removeAt(clientEmail.value.findIndex(email => email === event.source.value.email));
              let tempArray = this.addFestForm.value.clientEmail;
              var index = tempArray.indexOf(event.source.value.email);
              if (index !== -1) {
                tempArray.splice(index, 1);
                this.addFestForm.patchValue({
                  clientEmail: tempArray
                });
              }
          }
          
      }
    }

    sendAdminEmail(variantID,projectID){

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
  

 

      // this.dialogRef.close();
      // return;
      const adminEmails = [];


      let clientEmail = this.addFestForm.value.clientEmail;
      if(clientEmail){
        clientEmail.forEach(email => {
          adminEmails.push({
              Email: email
            });
        });
      }

      let myURL = window.location.href ;
      let rep2 = '/dashboard-variants/'+variantID ;
      let rep1 = this.router.url ;
      let newUrl = myURL.replace(rep1, rep2)
      
      let tempdata = {
        adminEmail: adminEmails,
        emailHeader: this.adminData.emailHeaderNewUser2,
        varLink: newUrl,
        openingMessage: this.addFestForm.value.openingMessage,
        closingMessage: this.addFestForm.value.closingMessage,
        projectName: this.projectData.projectName,
        variationName: this.addFestForm.value.variationsName
      }
    

      this.spinnerService.show();
      const callableTest = this.functions.httpsCallable('sendFBVariationsRequest');
      callableTest(tempdata).subscribe(result => {
     
        this.spinnerService.hide();
        $.notify({
          icon: 'notifications',
          message: 'Email Sent!'
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

        this.router.navigate(['/variations/project/'+projectID]);

      })

  }

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
          this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
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
          // if(data.pdfHeader1){
          //   this.getBase64ImageFromURL(data.pdfHeader1).subscribe((base64Data: string) => {   
          //     this.pdfHeaderImage1 = base64Data;
          //   });
          // }
          
          // if(data.pdfHeader1){
          //   this.getBase64ImageFromURL(data.pdfHeader2).subscribe((base64Data: string) => {   
          //     this.pdfHeaderImage2 = base64Data;
          //   });
          // }

          // if(data.pdfFooter){
          //   this.getBase64ImageFromURL(data.pdfFooter).subscribe((base64Data: string) => {   
          //     this.pdfFooterImage = base64Data;
          //   });
          // }

      }); 
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
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

  checkGlobalBooleanVariationSettings(value){
      if( ((value == true) || (value == false)) && (value !== '') ){
        return true;
      }else{
        return false;
      }
  }

  toggleBMLineitem(){

    if(this.addFestForm.value.bmLineitem){
        this.addFestForm.patchValue({
          bmHideAll: false,
        });
    }

  }

  toggleBMTotalFigure(){

    if(this.addFestForm.value.bmTotalFigure){
        this.addFestForm.patchValue({
          bmHideAll: false,
        });
    }

  }

  toggleBMHideAll(){

    if(this.addFestForm.value.bmHideAll){
        this.addFestForm.patchValue({
          bmLineitem: false,
          bmTotalFigure: false
        });
    }

  }

  getVariationSettings(){

      this.data_api.getFBVariationsSettings().subscribe((data) => {
          if(data){
              this.variationAdminData = data;
              this.addFestForm.patchValue({
                openingMessage: data.varDefaultOpening,
                closingMessage: data.varDefaultClosing,
                // bmLineitem: this.checkGlobalBooleanVariationSettings(data.bmLineitem) ? data.bmLineitem : false,
                // bmTotalFigure: this.checkGlobalBooleanVariationSettings(data.bmTotalFigure) ? data.bmTotalFigure : false,
                // bmHideAll: this.checkGlobalBooleanVariationSettings(data.bmHideAll) ? data.bmHideAll : false,
                // qtyHideAll: this.checkGlobalBooleanVariationSettings(data.qtyHideAll) ? data.qtyHideAll : false,
                // unitHideAll: this.checkGlobalBooleanVariationSettings(data.unitHideAll) ? data.unitHideAll : false,
                // unitCostHideAll: this.checkGlobalBooleanVariationSettings(data.unitCostHideAll) ? data.unitCostHideAll : false,
                // itemTotalHideAll: this.checkGlobalBooleanVariationSettings(data.itemTotalHideAll) ? data.itemTotalHideAll : false,
              });
              
          }
          this.getFBProjectUsers();
          
      }); 
  }

  openAddOwnerDialog(): void {
    const dialogRef = this.dialog.open(UserAddOwnerDialog, {
        width: '400px',
        data: this.adminData
    });

    dialogRef.afterClosed().subscribe(result => {
        if(result == 'success'){   
            // setTimeout(function(){
            //   window.location.reload();
            // }, 1000);  
          //  this.getProjectOwners();
        }
    });
  }

  openTableItemsAddDialog(groupIndex): void {

    const dialogRef = this.dialog.open(TableCreateItemsAddDialog, {
        width: '650px',
        disableClose: true,
        data: {
          listTrades: this.listTrades
        }
    });
    
    dialogRef.backdropClick().subscribe(() => {
      swal.fire({
          title: "Are you sure you want to close the Item Dialog without Adding the Item?",
          // text: "You clicked the button!",
          buttonsStyling: false,
          customClass: {
          confirmButton: 'btn dcb-btn',
          cancelButton: 'btn dcb-btn',
          },
          showCancelButton: true,
          icon: "question",
          reverseButtons: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          
          if (result.isConfirmed) {
            dialogRef.close();
          } 
        
        })
    })

    dialogRef.afterClosed().subscribe(result => {
    
        if(result){   
          
            let curLen = this.itemArray(groupIndex).length;
            this.itemArray(groupIndex).push(this.createItemArray());

            this.itemArray(groupIndex).at(curLen).get('itemName').patchValue(result.itemName);
            this.itemArray(groupIndex).at(curLen).get('supplier').patchValue(result.supplier);
            this.itemArray(groupIndex).at(curLen).get('itemImage').patchValue(result.itemImage);
            this.itemArray(groupIndex).at(curLen).get('imageCaption').patchValue(result.imageCaption);
            this.itemArray(groupIndex).at(curLen).get('hasImage').patchValue(result.hasImage);
            this.itemArray(groupIndex).at(curLen).get('description').patchValue(result.description);
            this.itemArray(groupIndex).at(curLen).get('quantity').patchValue(result.quantity);
            this.itemArray(groupIndex).at(curLen).get('uom').patchValue(result.uom);
            this.itemArray(groupIndex).at(curLen).get('unitCost').patchValue(result.unitCost);
            // this.itemArray(groupIndex).at(curLen).get('subTotal').patchValue(result.subTotal);
            this.itemArray(groupIndex).at(curLen).get('buildersMargin').patchValue(result.buildersMargin);
            this.itemArray(groupIndex).at(curLen).get('gst').patchValue(result.gst);
            this.itemArray(groupIndex).at(curLen).get('itemTotal').patchValue(result.itemTotal);

            this.computeGroupTotal(groupIndex);

        }
    });
  
  }

  openTableItemsEditDialog(groupIndex,itemIndex): void {
    
    const dialogRef = this.dialog.open(TableCreateItemsEditDialog, {
        width: '650px',
        disableClose: true,
        data: {
          listTrades: this.listTrades,
          itemName: this.itemArray(groupIndex).at(itemIndex).get('itemName').value,
          supplier: this.itemArray(groupIndex).at(itemIndex).get('supplier').value,
          itemImage: this.itemArray(groupIndex).at(itemIndex).get('itemImage').value,
          imageCaption: this.itemArray(groupIndex).at(itemIndex).get('imageCaption').value,
          hasImage: this.itemArray(groupIndex).at(itemIndex).get('hasImage').value,
          description: this.itemArray(groupIndex).at(itemIndex).get('description').value,
          quantity: this.itemArray(groupIndex).at(itemIndex).get('quantity').value,
          uom: this.itemArray(groupIndex).at(itemIndex).get('uom').value,
          unitCost: this.itemArray(groupIndex).at(itemIndex).get('unitCost').value,
          // subTotal: this.itemArray(groupIndex).at(itemIndex).get('subTotal').value,
          buildersMargin: this.itemArray(groupIndex).at(itemIndex).get('buildersMargin').value,
          gst: this.itemArray(groupIndex).at(itemIndex).get('gst').value,
          itemTotal: this.itemArray(groupIndex).at(itemIndex).get('itemTotal').value,
        }
    });
    
    dialogRef.backdropClick().subscribe(() => {
      swal.fire({
          title: "Are you sure you want to close the Item Dialog without Updating the Item?",
          // text: "You clicked the button!",
          buttonsStyling: false,
          customClass: {
          confirmButton: 'btn dcb-btn',
          cancelButton: 'btn dcb-btn',
          },
          showCancelButton: true,
          icon: "question",
          reverseButtons: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          
          if (result.isConfirmed) {
            dialogRef.close();
          } 
        
        })
    })

    dialogRef.afterClosed().subscribe(result => {
      
        if(result){   
          
            // let curLen = this.itemArray(groupIndex).length;

            // this.itemArray(groupIndex).push(this.createItemArray());


            this.itemArray(groupIndex).at(itemIndex).get('itemName').patchValue(result.itemName);
            this.itemArray(groupIndex).at(itemIndex).get('supplier').patchValue(result.supplier);
            this.itemArray(groupIndex).at(itemIndex).get('itemImage').patchValue(result.itemImage);
            this.itemArray(groupIndex).at(itemIndex).get('imageCaption').patchValue(result.imageCaption);
            this.itemArray(groupIndex).at(itemIndex).get('hasImage').patchValue(result.hasImage);
            this.itemArray(groupIndex).at(itemIndex).get('description').patchValue(result.description);
            this.itemArray(groupIndex).at(itemIndex).get('quantity').patchValue(result.quantity);
            this.itemArray(groupIndex).at(itemIndex).get('uom').patchValue(result.uom);
            this.itemArray(groupIndex).at(itemIndex).get('unitCost').patchValue(result.unitCost);
            // this.itemArray(groupIndex).at(itemIndex).get('subTotal').patchValue(result.subTotal);
            this.itemArray(groupIndex).at(itemIndex).get('buildersMargin').patchValue(result.buildersMargin);
            this.itemArray(groupIndex).at(itemIndex).get('gst').patchValue(result.gst);
            this.itemArray(groupIndex).at(itemIndex).get('itemTotal').patchValue(result.itemTotal);

            this.computeGroupTotal(groupIndex);

        }
    });
  
  }

  openTableVarGroupNameAddDialog(groupIndex): void {
      const dialogRef = this.dialog.open(TableVarGroupNameAddDialog, {
          width: '300px',
          data: {
            adminData: this.adminData
          }
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
            this.variationGroupArray().at(groupIndex).get("groupName").patchValue(result.groupName);
          }
      });
    
  }

  // enlargeImage(event){
    
  //   const imgElem = event.target;
    
  //   var target = event.target || event.srcElement || event.currentTarget;
  //   var srcAttr = target.attributes.src;
  //   this.imgSrc = srcAttr.nodeValue;
  //   // this.imgStampString = timestamp.toDate();
  // }

  btnFunctionCancel(){
    // routerLink="/variations/project/{{passID.id}}"
    if(this.addFestForm.dirty){

          swal.fire({

            title: "There are unsaved changes on the form.Are you sure you want to cancel?",
            // text: "You clicked the button!",
            buttonsStyling: false,
            customClass: {
            confirmButton: 'btn dcb-btn',
            cancelButton: 'btn dcb-btn',
            },
            showCancelButton: true,
            icon: "question",
            reverseButtons: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',

          }).then((result) => {
            
            if (result.isConfirmed) {
              this.router.navigate(['/variations/project/'+this.passID.id]);
            } 
          
          })

    }else{
      this.router.navigate(['/variations/project/'+this.passID.id]);
    }

  }

  btnFunctionList(){
    if(this.addFestForm.dirty){

      swal.fire({

            title: "There are unsaved changes on the form.Are you sure you want to proceed to the list?",
            // text: "You clicked the button!",
            buttonsStyling: false,
            customClass: {
            confirmButton: 'btn dcb-btn',
            cancelButton: 'btn dcb-btn',
            },
            showCancelButton: true,
            icon: "question",
            reverseButtons: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',

          }).then((result) => {
            
            if (result.isConfirmed) {
              this.router.navigate(['/variations/project/'+this.passID.id]);
            } 
          
          })

    }else{
      this.router.navigate(['/variations/project/'+this.passID.id]);
    }

  }


}


@Component({
  selector: 'tableitems-adddialog',
  templateUrl: 'tableitems-adddialog.html',
})

export class TableCreateItemsAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listTrades:any = [];

  public filter_list_trades: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_trade:FormControl = new FormControl();

  public listUom:any = [];
  public filter_list_uom: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_uom: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  unitMeasurements=[
    {value: 'M3', viewValue: 'M3'},
    {value: 'LM', viewValue: 'LM'},
    {value: 'M2', viewValue: 'M2'},
    {value: 'Tons', viewValue: 'Tons'},
    {value: 'Kg', viewValue: 'Kg'},
    {value: 'Hrs', viewValue: 'Hrs'},
    {value: 'Item', viewValue: 'Item'},
  ]
  
  protected _onDestroy = new Subject<void>();
  imgSrc;

  currentWebWorker: false
  maxSizeMB: number = 1
  maxWidthOrHeight: number = 1024
  isUpdatedImage = false;
  
  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableCreateItemsAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    public placeholderImage: PlaceholderImage,
    public enlargeImage: EnlargeImage,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }


  getFBUom(): void {
    this.data_api.getFBUom().subscribe(data => {
     

      if(data.uomArray){

        data.uomArray.sort(function(a, b) {
            var textA = a.uom.toUpperCase();
            var textB = b.uom.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        this.listUom = data.uomArray;
        this.initializeFilterUom();
      }

    });
  }
  
  public addNewItem() {

   
    if (this.addFestForm.invalid) {
        this.findInvalidControls();
        return;
    } 
    this.dialogRef.close(this.addFestForm.value);

  }

  resetImage(){

    this.addFestForm.patchValue({
      itemImage: this.placeholderImage.placeholderImage1,
      hasImage: false
    });
    this.isUpdatedImage = false;

  }

  ngOnInit() {
    this.getAdminSettings();
    this.addFestForm = this.formBuilder.group({
      itemName: '',
      supplier: '',
      description: ['', Validators.required],
      quantity: ['', Validators.required],
      uom: ['', Validators.required],
      unitCost: ['', Validators.required],
      subTotal : '',
      buildersMargin: ['', Validators.required],
      gst: '',
      itemTotal: '',
      itemImage:'',// ['', Validators.required],
      hasImage: '',
      imageCaption: ''
    }
  );

    this.getFBUom();
    this.listTrades = this.data.listTrades;
    this.initializeFilterTrades();

    this.addFestForm.patchValue({
      itemImage: this.placeholderImage.placeholderImage1,
      hasImage: false
    });
    
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

  initializeFilterTrades() {

    this.filter_list_trades.next(this.listTrades.slice());

      this.search_control_trade.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListTrades();
      });

  }


  protected filterListTrades() {
      if (!this.listTrades) {
        return;
      }
      // get the search keyword
      let search = this.search_control_trade.value;
      if (!search) {
        this.filter_list_trades.next(this.listTrades.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_trades.next(
        this.listTrades.filter(trades => trades.tradeCompanyName.toLowerCase().indexOf(search) > -1)
      );
  }

  initializeFilterUom() {

    this.filter_list_uom.next(this.listUom.slice());

      this.search_control_uom.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListUom();
      });

  }


  protected filterListUom() {
      if (!this.listUom) {
        return;
      }
      // get the search keyword
      let search = this.search_control_uom.value;
      if (!search) {
        this.filter_list_uom.next(this.listUom.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_uom.next(
        this.listUom.filter(uom => uom.uom.toLowerCase().indexOf(search) > -1)
      );
  }

  openAddUomDialog(): void {
      const dialogRef = this.dialog.open(UomCreateAddDialog, {
          width: '400px',
          data: this.adminData
      });

      dialogRef.afterClosed().subscribe(result => {
     
          if(result){   
                setTimeout(() => {

                  this.addFestForm.patchValue({
                    uom: result.toString(),
                  });

                  this.initializeFilterUom();
                }, 1000); 
          }
      });
      
  }

  public onComputeTotal(){

      let _quantity = this.addFestForm.value.quantity;
      let _unitCost = this.addFestForm.value.unitCost;

      let _subtotal = _quantity *  _unitCost;
      let _taxRate = 10;
      let _bmpercentage = this.addFestForm.value.buildersMargin;
      let _bmp_subtotal = (_bmpercentage * _subtotal) / 100;
      let _gst = ((_subtotal + _bmp_subtotal) * _taxRate) /  100;
      let _itemTotal = _gst + _bmp_subtotal + _subtotal;
      
   
      this.addFestForm.patchValue({
          subTotal: _subtotal.toFixed(2),
          gst: _gst.toFixed(2),
          itemTotal: _itemTotal.toFixed(2)
      });

  }

  public findInvalidControls() {
      const invalid = [];
      const controlsVariation = this.addFestForm.controls;


      for (const name in controlsVariation) {
          if (controlsVariation[name].invalid) {
              if(name == 'itemName'){
                invalid.push('Item Name');
              }else if(name == 'description'){
                invalid.push('Description');
              }else if(name == 'quantity'){
                invalid.push('Quantity');
              }else if(name == 'uom'){
                invalid.push('Unit of Measurement');
              }else if(name == 'unitCost'){
                invalid.push('Unit Cost');
              }else if(name == 'buildersMargin'){
                invalid.push("Builder's Margin");
              }
          }
      }

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


  //  ON DROP EVENT
  onDrop(event: DragEvent): void {    
    this.addFestForm.patchValue({hasImage: true})
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.onFileChange({ target: { files: event.dataTransfer.files } });
  }
  }

  async onFileChange(event) {

    if(event.target.files && event.target.files.length) {
  
          const imageFile = event.target.files[0];
          
          var options = {
            maxSizeMB: this.maxSizeMB,
            maxWidthOrHeight: this.maxWidthOrHeight,
            useWebWorker: this.currentWebWorker,
            maxIteration: 50,
            onProgress: (p) => {
              this.spinnerService.show();
              if(p == 100){
                this.spinnerService.hide();
              }
            }
          }
  
        
  
          // Crop Lnadscape images and convert to base64
          const imageCropped = await this.fileListToBase64(event.target.files);
  
          // Convert Base64 to File
         
        
  
          // Convert Base64 to File
          const compressedFiles = await  Promise.all(
            imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
          )
  
  
          // Compress File
          const compressedFiles2 = await  Promise.all(
            await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
          )
  
  
          let reader = new FileReader();
  
          reader.readAsDataURL(compressedFiles2[0]);


          reader.onload = () => {


              this.addFestForm.patchValue({
                itemImage: reader.result,
                hasImage: true
              });
              
              this.isUpdatedImage = true;
              // this.imageURL = reader.result;
  
          }
  
    }
  }
  
  async fileListToBase64(fileList) {
    // create function which return resolved promise
    // with data:base64 string
  
    function crop(url, aspectRatio) {
  
      return new Promise(resolve => {
    
        // this image will hold our source image data
        const inputImage = new Image();
    
        // we want to wait for our image to load
        inputImage.onload = () => {
    
          // let's store the width and height of our image
          const inputWidth = inputImage.naturalWidth;
          const inputHeight = inputImage.naturalHeight;
    
          // get the aspect ratio of the input image
          const inputImageAspectRatio = inputWidth / inputHeight;
    
          // if it's bigger than our target aspect ratio
          let outputWidth = inputWidth;
          let outputHeight = inputHeight;
          if (inputImageAspectRatio > aspectRatio) {
            outputWidth = inputHeight * aspectRatio;
          } else if (inputImageAspectRatio < aspectRatio) {
            outputHeight = inputWidth / aspectRatio;
          }
    
          // calculate the position to draw the image at
          const outputX = (outputWidth - inputWidth) * .5;
          const outputY = (outputHeight - inputHeight) * .5;
    
          // create a canvas that will present the output image
          const outputImage = document.createElement('canvas');
    
          // set it to the same size as the image
          outputImage.width = outputWidth;
          outputImage.height = outputHeight;
    
          // draw our image at position 0, 0 on the canvas
          const ctx = outputImage.getContext('2d');
          ctx.drawImage(inputImage, outputX, outputY);
          resolve(outputImage.toDataURL());
        };
    
        // start loading our image
        inputImage.src = url;
      });
      
    };
  
    function getBase64(file) {
        const reader = new FileReader()
        return new Promise(resolve => {
  
          reader.onload = (event:any) => {
  
              var image = new Image();
              let self = this;
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
  
              image.src = event.target.result;
  
              image.onload = () => {
                                                                                                                  
                        // if(image.height > image.width){
                        //   //this.imageURL.push(event.target.result);
                        //   resolve(event.target.result)
  
                        // }else{
  
                          crop(event.target.result, 4/3).then(canvas => {
                            //this.imageURL.push(canvas);
                            resolve(canvas)
                          });
                          
                        // }
  
                        //self.imageURL.push(event.target.result);     
              };
  
          
          }
  
          reader.readAsDataURL(file)
        })
      }
      // here will be array of promisified functions
      const promises = []
    
      // loop through fileList with for loop
      for (let i = 0; i < fileList.length; i++) {
        promises.push(getBase64(fileList[i]))
      }
    
      // array with base64 strings
      return await Promise.all(promises)
    }
  
}

@Component({
  selector: 'tableitems-editdialog',
  templateUrl: 'tableitems-editdialog.html',
})

export class TableCreateItemsEditDialog implements OnInit {

  editForm: FormGroup;
  public listTrades:any = [];

  public filter_list_trades: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_trade:FormControl = new FormControl();

  public listUom:any = [];
  public filter_list_uom: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_uom: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  unitMeasurements=[
    {value: 'M3', viewValue: 'M3'},
    {value: 'LM', viewValue: 'LM'},
    {value: 'M2', viewValue: 'M2'},
    {value: 'Tons', viewValue: 'Tons'},
    {value: 'Kg', viewValue: 'Kg'},
    {value: 'Hrs', viewValue: 'Hrs'},
    {value: 'Item', viewValue: 'Item'},
  ]
  
  protected _onDestroy = new Subject<void>();

  imgSrc;

  currentWebWorker: false
  maxSizeMB: number = 1
  maxWidthOrHeight: number = 1024
  isUpdatedImage = false;
  
  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableCreateItemsEditDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    public placeholderImage: PlaceholderImage,
    public enlargeImage: EnlargeImage,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.editForm.controls;
  }

  getFBUom(): void {
    this.data_api.getFBUom().subscribe(data => {
   

      if(data.uomArray){

        data.uomArray.sort(function(a, b) {
            var textA = a.uom.toUpperCase();
            var textB = b.uom.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        this.listUom = data.uomArray;
        this.initializeFilterUom();
      }

    });
  }

  public updateItem() {

   
      if (this.editForm.invalid) {

        this.findInvalidControls();
        return;
    } 
    this.dialogRef.close(this.editForm.value);

  }

  resetImage(){

    this.editForm.patchValue({
      itemImage: this.placeholderImage.placeholderImage1,
      hasImage: false
    });
    this.isUpdatedImage = false;

  }

  ngOnInit() {
    this.getAdminSettings();
    this.editForm = this.formBuilder.group({
      itemName: '',
      supplier: '',
      description: ['', Validators.required],
      quantity:['', Validators.required],
      uom: ['', Validators.required],
      unitCost:['', Validators.required],
      subTotal : '',
      buildersMargin: ['', Validators.required],
      gst: '',
      itemTotal: '',
      itemImage: '', //['', Validators.required],
      hasImage: '',
      imageCaption: ''
    }, {
    });

    this.editForm.patchValue({
      itemName: this.data.itemName,
      supplier: this.data.supplier,
      description: this.data.description,
      quantity: this.data.quantity,
      uom: this.data.uom,
      unitCost: this.data.unitCost,
      buildersMargin: this.data.buildersMargin,
      subTotal : this.data.quantity * ( (this.data.unitCost * 1) + ( (this.data.buildersMargin * this.data.unitCost) / 100 )), //this.data.subTotal,
      gst: this.data.gst,
      itemTotal: this.data.itemTotal,
      itemImage: this.data.itemImage,
      imageCaption: this.data.imageCaption,
      hasImage: this.data.hasImage ? this.data.hasImage: false,
    });

    this.getFBUom();

    this.listTrades = this.data.listTrades;
    this.initializeFilterTrades();
    
    // if(this.placeholderImage.placeholderImage1 != this.data.itemImage){
    //   this.isUpdatedImage = true;
    // }
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

  initializeFilterTrades() {

    this.filter_list_trades.next(this.listTrades.slice());

      this.search_control_trade.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListTrades();
      });

  }


  protected filterListTrades() {
      if (!this.listTrades) {
        return;
      }
      // get the search keyword
      let search = this.search_control_trade.value;
      if (!search) {
        this.filter_list_trades.next(this.listTrades.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_trades.next(
        this.listTrades.filter(trades => trades.tradeCompanyName.toLowerCase().indexOf(search) > -1)
      );
  }

  initializeFilterUom() {

    this.filter_list_uom.next(this.listUom.slice());

      this.search_control_uom.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListUom();
      });

  }


  protected filterListUom() {
      if (!this.listUom) {
        return;
      }
      // get the search keyword
      let search = this.search_control_uom.value;
      if (!search) {
        this.filter_list_uom.next(this.listUom.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_uom.next(
        this.listUom.filter(uom => uom.uom.toLowerCase().indexOf(search) > -1)
      );
  }

  openAddUomDialog(): void {
      const dialogRef = this.dialog.open(UomCreateAddDialog, {
          width: '400px',
          data: this.adminData
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
                setTimeout(() => {

                  this.editForm.patchValue({
                    uom: result.toString(),
                  });

                  this.initializeFilterUom();
                }, 1000); 
          }
      });
      
  }

  public onComputeTotal(){

      let _quantity = this.editForm.value.quantity;
      let _unitCost = this.editForm.value.unitCost;

      let _subtotal = _quantity *  _unitCost;
      let _taxRate = 10;
      let _bmpercentage = this.editForm.value.buildersMargin;
      let _bmp_subtotal = (_bmpercentage * _subtotal) / 100;
      let _gst = ((_subtotal + _bmp_subtotal) * _taxRate) /  100;
      let _itemTotal = _gst + _bmp_subtotal + _subtotal;
      this.editForm.patchValue({
          subTotal: _subtotal.toFixed(2),
          gst: _gst.toFixed(2),
          itemTotal: _itemTotal.toFixed(2)
      });

  }

  public findInvalidControls() {
      const invalid = [];
      const controlsVariation = this.editForm.controls;

      for (const name in controlsVariation) {
          if (controlsVariation[name].invalid) {
              if(name == 'itemName'){
                invalid.push('Item Name');
              }else if(name == 'description'){
                invalid.push('Description');
              }else if(name == 'quantity'){
                invalid.push('Quantity');
              }else if(name == 'uom'){
                invalid.push('Unit of Measurement');
              }else if(name == 'unitCost'){
                invalid.push('Unit Cost');
              }else if(name == 'buildersMargin'){
                invalid.push("Builder's Margin");
              }
          }
      }

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

   //  ON DROP EVENT
 onDrop(event: DragEvent): void {  
  this.editForm.patchValue({hasImage: true})
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    this.onFileChange({ target: { files: event.dataTransfer.files } });
}
}

  async onFileChange(event) {

    if(event.target.files && event.target.files.length) {
  
          const imageFile = event.target.files[0];
          
          var options = {
            maxSizeMB: this.maxSizeMB,
            maxWidthOrHeight: this.maxWidthOrHeight,
            useWebWorker: this.currentWebWorker,
            maxIteration: 50,
            onProgress: (p) => {
              this.spinnerService.show();
              if(p == 100){
                this.spinnerService.hide();
              }
            }
          }
  
          // Crop Lnadscape images and convert to base64
          const imageCropped = await this.fileListToBase64(event.target.files);
  
          // Convert Base64 to File
          const compressedFiles = await  Promise.all(
            imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
          )
  
  
          // Compress File
          const compressedFiles2 = await  Promise.all(
            await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
          )
          
       
  
  
          let reader = new FileReader();
  
          reader.readAsDataURL(compressedFiles2[0]);


          reader.onload = () => {


              this.editForm.patchValue({
                itemImage: reader.result,
                hasImage: true
              });
              this.isUpdatedImage = true;
              // this.imageURL = reader.result;
  
          }
  
    }
  }
  
  async fileListToBase64(fileList) {
    // create function which return resolved promise
    // with data:base64 string
  
    function crop(url, aspectRatio) {
  
      return new Promise(resolve => {
    
        // this image will hold our source image data
        const inputImage = new Image();
    
        // we want to wait for our image to load
        inputImage.onload = () => {
    
          // let's store the width and height of our image
          const inputWidth = inputImage.naturalWidth;
          const inputHeight = inputImage.naturalHeight;
    
          // get the aspect ratio of the input image
          const inputImageAspectRatio = inputWidth / inputHeight;
    
          // if it's bigger than our target aspect ratio
          let outputWidth = inputWidth;
          let outputHeight = inputHeight;
          if (inputImageAspectRatio > aspectRatio) {
            outputWidth = inputHeight * aspectRatio;
          } else if (inputImageAspectRatio < aspectRatio) {
            outputHeight = inputWidth / aspectRatio;
          }
    
          // calculate the position to draw the image at
          const outputX = (outputWidth - inputWidth) * .5;
          const outputY = (outputHeight - inputHeight) * .5;
    
          // create a canvas that will present the output image
          const outputImage = document.createElement('canvas');
    
          // set it to the same size as the image
          outputImage.width = outputWidth;
          outputImage.height = outputHeight;
    
          // draw our image at position 0, 0 on the canvas
          const ctx = outputImage.getContext('2d');
          ctx.drawImage(inputImage, outputX, outputY);
          resolve(outputImage.toDataURL());
        };
    
        // start loading our image
        inputImage.src = url;
      });
      
    };
  
    function getBase64(file) {
        const reader = new FileReader()
        return new Promise(resolve => {
  
          reader.onload = (event:any) => {
  
              var image = new Image();
              let self = this;
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
  
              image.src = event.target.result;
  
              image.onload = () => {
                                                                                                                  
                        // if(image.height > image.width){
                        //   //this.imageURL.push(event.target.result);
                        //   resolve(event.target.result)
  
                        // }else{
  
                          crop(event.target.result, 4/3).then(canvas => {
                            //this.imageURL.push(canvas);
                            resolve(canvas)
                          });
                          
                        // }
  
                        //self.imageURL.push(event.target.result);     
              };
  
          
          }
  
          reader.readAsDataURL(file)
        })
      }
      // here will be array of promisified functions
      const promises = []
    
      // loop through fileList with for loop
      for (let i = 0; i < fileList.length; i++) {
        promises.push(getBase64(fileList[i]))
      }
    
      // array with base64 strings
      return await Promise.all(promises)
    }
  
}


@Component({
  selector: 'variations-create-user-add-owner-dialog',
  templateUrl: 'useraddownerdialog.html',
})

export class UserAddOwnerDialog implements OnInit {

  addFestForm: FormGroup;
  userDetails;
  accountFirebase;
  itemUserAccounts = [];
  colorBtnDefault;
  adminData;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserAddOwnerDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
   
  // public addOwnerLog(id){
  //     // let newDetails;
  //     // newDetails += 'Company:';

  //     let today = new Date();
  //     let passData = {
  //         todaysDate: today,
  //         log: 'Created New User',
  //         method: 'create',
  //         subject: 'user',
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
  
  public checkFBUserExist(): void {
      this.spinnerService.show();
      this.data_api.checkFBUserExist(this.addFestForm.value.userEmail).pipe(first()).subscribe(data => {
  

          if(data.length > 0){

            this.spinnerService.hide();

            this.addFestForm.controls['userEmail'].reset()

            swal.fire({
                title: "Email Address already exist",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })

        }else{

          this.spinnerService.hide();
        }
      });

}


  public addNewUserOwner() {

      if (this.addFestForm.invalid) {
        swal.fire({
          title: "Invalid form. Please fill all the fields and submit again",
              // text: htmlVal,
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
        })
        return;
      }

      if (this.addFestForm.value.password.length < 6) {
        swal.fire({
          title: "Password should be at least 6 characters",
              // text: htmlVal,
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
        })
        return;
      }

      this.itemUserAccounts.push(this.accountFirebase);

      this.addFestForm.patchValue({
          userAccounts: this.itemUserAccounts,
      });

      this.spinnerService.show();
      this.data_api.createUser(this.addFestForm.value).then(() => {

              $.notify({
                icon: 'notifications',
                message: 'Created new Owner successfully!'
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
              this.spinnerService.hide();
              this.dialogRef.close('success');
      });
}



  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userRole: ['', Validators.required],
      userShowTime: [''],
      userStart: [''],
      userBreak: [''],
      userFinish: [''],
      userStaffNo: [''],
      userMobile: [''],
      userAccounts: [this.itemUserAccounts],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      emailHeaderNewUser: [''],
      accountFirebase: ['']
    }, {
      validator: ConfirmedValidator('password', 'confirm_password')
    });

    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

    this.addFestForm.patchValue({
      userRole: "project_owner"
    });

    this.getAdminSettings();
    this.accountFirebase = this.data_api.getCurrentProject();

  }

  onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

  getAdminSettings(){
    this.data_api.getFBAdminSettings().subscribe((data) => {
        if(data){
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
          if(data.emailHeaderNewUser){
            this.addFestForm.patchValue({
              emailHeaderNewUser: data.emailHeaderNewUser,
              accountFirebase: this.accountFirebase,
            });
          }
        }
    }); 
  }

}


@Component({
  selector: 'uom-adddialog',
  templateUrl: 'uom-adddialog.html',
})

export class UomCreateAddDialog implements OnInit {

  addFestForm: FormGroup;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UomCreateAddDialog>,
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

    this.adminData = this.data;
    this.colorBtnDefault = this.data.colourEnabledButton ? this.data.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      uom: ['', Validators.required],
    }, {
    });
    
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }
  
}


@Component({
  selector: 'tablegroupname-adddialog',
  templateUrl: 'tablegroupname-adddialog.html',
})

export class TableVarGroupNameAddDialog implements OnInit {

  addFestForm: FormGroup;
  // public listVisitors:any = [];
  // public listReasons:any = [];
  public listGroupNames:any = [];

  // public filter_list_visitors: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  // public filter_list_reasons: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  // public search_control_visitor:FormControl = new FormControl();
  // public search_control_reason: FormControl = new FormControl();

  public filter_list_groupnames: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_groupname:FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;
    
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableVarGroupNameAddDialog>,
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

  
  public addNewGroupName() {

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
    this.dialogRef.close(this.addFestForm.value);

  }

  ngOnInit() {

    this.adminData = this.data.adminData;
    this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      groupName: ['', Validators.required],
      // search_control_visitor: [null],
      // search_control_reason: [null],
    }, {
    });
    // this.listVisitors = this.data.listVisitors;
    // this.listReasons = this.data.listReasons;
    this.getFBVarGroupNames();
  }

  public getFBVarGroupNames(): void {
    this.spinnerService.show();
    this.data_api.getFBVarGroupNames().subscribe(data => {
        if(data){
          if(data.nameArray){

            data.nameArray.sort(function(a, b) {
                var textA = a.groupName.toUpperCase();
                var textB = b.groupName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            
            this.listGroupNames = data.nameArray;
            this.initializeFilterGroupNames();
          }
        }
        this.spinnerService.hide();
    });
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  initializeFilterGroupNames() {

    this.filter_list_groupnames.next(this.listGroupNames.slice());

      this.search_control_groupname.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListGroupNames();
      });

  }


  protected filterListGroupNames() {
      if (!this.listGroupNames) {
        return;
      }
      // get the search keyword
      let search = this.search_control_groupname.value;
      if (!search) {
        this.filter_list_groupnames.next(this.listGroupNames.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_groupnames.next(
        this.listGroupNames.filter(groupNames => groupNames.groupName.toLowerCase().indexOf(search) > -1)
      );
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(VarGroupNamesAddDialog, {
        width: '400px',
        data: this.adminData
    });

    dialogRef.afterClosed().subscribe(result => {
        if(result){   

          this.data_api.getFBVarGroupNames().subscribe(data => {
              if(data){
                if(data.nameArray){
      
                  data.nameArray.sort(function(a, b) {
                      var textA = a.groupName.toUpperCase();
                      var textB = b.groupName.toUpperCase();
                      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                  });
                  
                  this.listGroupNames = data.nameArray;
                  this.addFestForm.get("groupName").patchValue(result.toString());
                  this.initializeFilterGroupNames();
                }
              }
          }); 

        }
    });
}

 
}

@Component({
  selector: 'vargroupnames-adddialog',
  templateUrl: 'vargroupnames-adddialog.html',
})

export class VarGroupNamesAddDialog implements OnInit {

  addFestForm: FormGroup;

  public userDetails;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<VarGroupNamesAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  public addLog(id){
      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Variation Group Name - Global List',
          method: 'create',
          subject: 'groupname',
          subjectID: id,
          data: this.addFestForm.value,
          url: window.location.href,
          userID: this.userDetails.user_id,
          userName: this.userDetails.name
      }
      this.data_api.addFBActivityLog(passData).then(() => {
        this.dialogRef.close(id);
        this.spinnerService.hide();
      });
  }

  public createFBVarGroupName(): void {

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
      
      this.data_api.createFBVarGroupNameDaily(this.addFestForm.value.groupName).then((result) => {

          // this.dialogRef.close('success');
          // this.spinnerService.hide();
          this.addLog(result);

          $.notify({
            icon: 'notifications',
            message: 'New Group Name Created'
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
      groupName: ['', Validators.required],
    }, {
    });
    
    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

}