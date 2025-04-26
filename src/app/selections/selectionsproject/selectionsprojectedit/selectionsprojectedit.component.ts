import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../services/format-datepicker';
import { DatasourceService } from '../../../services/datasource.service';
import { PdfImage } from '../../../services/pdf-image';
import { PDFIcons } from '../../../services/pdf-icons';
import { Observable, Observer } from "rxjs";
import Swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { LocalDataSource } from 'ng2-smart-table';
import { Input } from '@angular/core';
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
import {ENTER, COMMA, V, L} from '@angular/cdk/keycodes';
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
import { PlaceholderImage } from '../../../services/placeholder-image';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Clipboard } from '@angular/cdk/clipboard';
import { VariationImage } from '../../../services/variation-image';
import { EnlargeImage } from '../../../services/enlarge-image';
import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';
import { PDFDocument } from 'pdf-lib'
// import * as fs from 'fs';
// import { Timestamp } from '@firebase/firestore';
import { DeletedialogComponent } from 'src/app/shared/deletedialog/deletedialog.component';
import { checkValidEmail, updateRecipients } from 'src/app/utils/shared-function';

declare const $: any;

@Component({
  selector: 'app-selectionsprojectedit',
  templateUrl: './selectionsprojectedit.component.html',
  styleUrls: ['./selectionsprojectedit.component.css']
})
export class SelectionsprojecteditComponent {
  selectionFom: FormGroup;

  public passID: any;

  public userDetails;

  protected _onDestroy = new Subject<void>();

  public projectOwners:any = [];
  public projectOwnersProject:any = [];

  public filter_list_owners: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_owner: FormControl = new FormControl();
  selectionEmailReceipient :  ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_owners_project: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_owner_project: FormControl = new FormControl();

  public filter_list_trades: ReplaySubject<any[]>[] = [];

  projectSelectionControl =  new FormControl({value : [], disabled: true});

  projectOwnerControl = new FormControl([]);//One time Variation Control

  public setProjectOwners = [];
  public setProjectSelectionRecipient:any = [];

  public listTrades:any = [];
  public listUom:any = [];

  public adminData;
  public selectionAdminData;
  public colorBtnDefault;
  public colorHlightDefault;

  public projectData;
  public selectionData;

  pdfLogo;
  pdfFooterImage;
  pdfClientNames;

  currentWebWorker: false
  maxSizeMB: number = 1
  maxWidthOrHeight: number = 1024

  accountFirebase;
  public projUploadFolder;
  allPercentage: Observable<number>[] = [];
  downloadArray= [] ;
  downloadURLs= [] ;

  showApprovedOnly : boolean = false;
  saveFormInterval: any

  imgSrc;
  items: Array<any>;
 
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

  unitMeasurements=[
    {value: 'M3', viewValue: 'M3'},
    {value: 'LM', viewValue: 'LM'},
    {value: 'M2', viewValue: 'M2'},
    {value: 'Tons', viewValue: 'Tons'},
    {value: 'Kg', viewValue: 'Kg'},
    {value: 'Hrs', viewValue: 'Hrs'},
    {value: 'Item', viewValue: 'Item'},
  ]

  deviceInfo;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      public authService: AuthenticationService,
      private formBuilder: FormBuilder,
      public pdfImage: PdfImage,
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
      public placeholderImage: PlaceholderImage,
      public enlargeImage: EnlargeImage,
      public pdfIcons:PDFIcons,
      // private imageCompress: NgxImageCompressService
      ) { }

  ngOnInit() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
     this.passID = {
          id: this.route.snapshot.params['id'],
          id2: this.route.snapshot.params['id2']
      };
      this.route.params

      .subscribe(
          (params: Params) => {
              this.passID.id = params['id'];
              this.passID.id2 = params['id2'];
          }
      );


      if (localStorage.getItem('currentUser')) {
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
      }


      this.selectionFom = this.formBuilder.group({
          projectId: ['', Validators.required],
          selectionNumber: ['', Validators.required],
          selectionName: ['', Validators.required],
          // clientName: ['', Validators.required],
          dueDate: ['', Validators.required],
          projectOwner: [''],
          selectionGroupArray: this.formBuilder.array([ this.createselectionGroupArray() ]),
          openingMessage: ['', Validators.required],
          closingMessage: ['', Validators.required],
          status: [''],
          clientEmail: [''],
          folderName: [''],
          signature: [''],
          createdAt: [''],
          createdBy: [''],
          pdfLink: [''],
          // bmHideAll : [''],
          // bmLineitem : [''],
          // bmTotalFigure : [''],
          // qtyHideAll : [''],
          // unitHideAll : [''],
          // unitCostHideAll : [''],
          gstHideAll : [''],
          // itemTotalHideAll : [''],
          comments:  [''],
          approvedAt: [''],
          approvedBy:  [''],
          approvedRole: [''],
          // clientAddress: ['', Validators.required],
      });

      // this.selectionFom.patchValue({
      //   projectId:  this.passID.id,
      //   variantsNumber: 'test-001'
      // });

      // this.getFBProjectUsers();
      this.getFBAllTrades();
      this.getAdminSettings();
      this.getSelectionSettings();
      this.getProject();
      
      this.accountFirebase = this.data_api.getCurrentProject();

       // FOR AUTO SAVE FORM
       setTimeout(()=>{this.setFormValue()},4000);
       this.saveFormInterval = setInterval(()=>{
         this.saveForm();
       },5000)

  }

  
  setFormValue(){
    const formData = localStorage.getItem('formData');
    let projectOwnerIDs;
     if(formData){
       const parsedData = JSON.parse(formData);
       if(parsedData){
         // this.projectOwnerControl.setValue(parsedData.clientEmail)
         this.selectionFom.patchValue({
           selectionName: parsedData.selectionName,
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
        //  const projectOwnerControlIds = JSON.parse(localStorage.getItem('projectOwnerControl'));
        //    if (projectOwnerControlIds) {
        //     projectOwnerIDs = projectOwnerControlIds;
            
        //     // Clear the setProjectOwners array to avoid duplication
        //     this.setProjectOwners = []; 
          
        //     projectOwnerIDs.forEach(value => {
        //       const item = this.findObjectByKey(this.projectOwners, 'id', value);
        //       if (item && !this.setProjectOwners.includes(item)) {
        //         this.setProjectOwners.push(item);
        //       }
        //     });
          

        //     this.projectOwnerControl.setValue(this.setProjectOwners);

        //   }          
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
 
         if (parsedData.selectionGroupArray){
           this.selectionGroupArray().clear()
           let i = 0;
           parsedData.selectionGroupArray.forEach(t => {
             let teacher: FormGroup = this.createselectionGroupArray();
             this.selectionGroupArray().push(teacher);
 
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
           const updatedArray = parsedData.selectionGroupArray.map(item => {
            const { tempFiles, ...rest } = item;
            return rest;
            });
           this.selectionGroupArray().patchValue(updatedArray)    
       }
      }
     }
    
   }

  saveForm(){
    const projectOwnerControlIds = this.projectOwnerControl.value.map(element => element.id);
    localStorage.setItem('projectOwnerControl', JSON.stringify(projectOwnerControlIds))
    localStorage.setItem('formData',JSON.stringify(this.selectionFom.value))
    }

    ngOnDestroy(){
      clearInterval(this.saveFormInterval);
      localStorage.removeItem("formData")
      localStorage.removeItem('projectOwnerControl')
    }

        inputControl = new FormControl('');
      
      
        addRecipient(event: KeyboardEvent): void {
          event.stopPropagation();
          event.preventDefault();
          const input = this.inputControl.value;
          if(!checkValidEmail(input, Swal)){
          return;
          }
          if (input) {
            const newRecipient = { 
              email: input,
              id: '123'  // Static ID, as you mentioned
            };
        
            // Get the current value of projectOwnerControl
            const currentValue = this.projectOwnerControl.value;
        
            // E  nsure the value is an array before pushing the newRecipient
            if (Array.isArray(currentValue)) {
              // Add newRecipient to the array and update projectOwnerControl
              this.projectOwnerControl.setValue([...currentValue, newRecipient]);
            }
        
            // Clear the input field after adding the recipient
            this.inputControl.setValue('');  // Clear the input control
          }
        
          // Now update the clientEmail field in rfiForm
          // Extract the emails from projectOwnerControl
          const emails = this.projectOwnerControl.value.map((recipient: { email: string }) => recipient.email);
        
          // Update the rfiForm with the new emails array
          this.selectionFom.patchValue({
            clientEmail: emails
          });
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

  public counter :number = 0;

  getProject(){
    this.data_api.getFBProject(this.passID.id).pipe(first()).subscribe(data => {
        this.projectData = data;
        this.projUploadFolder = data.uploadFolder;

        if(data.recipientSelection){

          this.setProjectSelectionRecipient = [];
          let projectOwnerIDs;

          projectOwnerIDs = data.recipientSelection;
          projectOwnerIDs.forEach(value => {
              if(this.findObjectByKey(this.projectOwnersProject, 'id', value)){
                  var item = this.findObjectByKey(this.projectOwnersProject, 'id', value);
                  this.setProjectSelectionRecipient.push(item);
              }
              var index = this.projectOwners.findIndex(x => x.id == value);
              if (index !== -1) {
                this.projectOwners.splice(index, 1);
                this.initializeFilterOwners();
              }
          });
          this.selectionEmailReceipient.next(this.setProjectSelectionRecipient)
          this.projectSelectionControl.setValue(this.setProjectSelectionRecipient);

        }

        // EMAIL CCS
        if (data.selectionEmailCC) {
          this.selectionEmailCC = data.selectionEmailCC
        }
        
        // EMAIL BCCS
        if (data.selectionEmailBCC) {
          this.selectionEmailBCC = data.selectionEmailBCC
        }


        
        // if(!this.variationData){
          if(this.counter == 0){
          this.getSelection();
          this.counter++;
        }
        // }
    });
  }


    isCCEditable: boolean = false;
      isBCCEditable: boolean = false;
      
      selectionEmailCC: string[] = [];
      selectionEmailBCC: string[] = [];
      
      handleEmailAdd(event: KeyboardEvent, type: 'cc' | 'bcc') {
        event.preventDefault(); 
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();
      
        if (value && checkValidEmail(value, Swal)) {
          console.log('Adding valid email:', value);
      
          const targetArray = type === 'cc' ? this.selectionEmailCC : this.selectionEmailBCC;
          targetArray.push(value);
      
          this.updateEmailList(targetArray, type);
          input.value = '';
        }
      
        console.log('selectionEmailCC:', this.selectionEmailCC);
      }
      
      removeEmail(type: 'cc' | 'bcc', index: number) {
        const targetArray = type === 'cc' ? this.selectionEmailCC : this.selectionEmailBCC;
      
        if (index > -1 && index < targetArray.length) {
          targetArray.splice(index, 1);
          this.updateEmailList(targetArray, type);
        }
      }
      
      private updateEmailList(emailList: string[], type: 'cc' | 'bcc') {
        this.spinnerService.show();
        this.data_api.updateCCsAndBCCs(emailList, type, this.projectData.id, 'selection')
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
    
      
        isProjectSelectionEditable = false;

        toggleProjectSelectionEdit() {
          this.isProjectSelectionEditable = !this.isProjectSelectionEditable;
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

  toggleBMLineitem(){

    if(this.selectionFom.value.bmLineitem){
        this.selectionFom.patchValue({
          bmHideAll: false,
        });
    }

  }

  toggleBMTotalFigure(){

    if(this.selectionFom.value.bmTotalFigure){
        this.selectionFom.patchValue({
          bmHideAll: false,
        });
    }

  }

  toggleBMHideAll(){

    if(this.selectionFom.value.bmHideAll){
        this.selectionFom.patchValue({
          bmLineitem: false,
          bmTotalFigure: false
        });
    }

  }

  public getSelection(){
    this.data_api.getFBSelection(this.passID.id2).subscribe(data => {
        console.log('selectiondata',data);
        this.selectionData = data;
        this.setProjectOwners = [];
        let projectOwnerIDs;
        this.selectionFom.patchValue({
          projectId: data.projectId,
          selectionNumber: data.selectionNumber,
          selectionName: data.selectionName,
          dueDate: data.dueDate ? data?.dueDate?.toDate() : '', 
          // clientAddress: data.clientAddress,
          // projectOwner: data.projectOwner,
          openingMessage: data.openingMessage, 
          closingMessage: data.closingMessage,
          status: data.status,
          clientEmail: data.clientEmail,
          folderName: data.folderName,
          signature: data.signature,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          pdfLink: data.pdfLink,
          bmLineitem: this.checkBooleanVariationSettings(data.bmLineitem) ? data.bmLineitem : false,
          bmTotalFigure: this.checkBooleanVariationSettings(data.bmTotalFigure) ? data.bmTotalFigure : false,
          bmHideAll: this.checkBooleanVariationSettings(data.bmHideAll) ? data.bmHideAll : false,
          qtyHideAll: this.checkBooleanVariationSettings(data.qtyHideAll) ? data.qtyHideAll : false,
          unitHideAll: this.checkBooleanVariationSettings(data.unitHideAll) ? data.unitHideAll : false,
          unitCostHideAll: this.checkBooleanVariationSettings(data.unitCostHideAll) ? data.unitCostHideAll : false,
          gstHideAll: this.checkBooleanVariationSettings(data.gstHideAll) ? data.gstHideAll : false,
          itemTotalHideAll: this.checkBooleanVariationSettings(data.itemTotalHideAll) ? data.itemTotalHideAll : false,
          comments:  data.comments ? data.comments : '',
          approvedAt: data.approvedAt ? data.approvedAt : '',
          approvedBy:  data.approvedBy ? data.approvedBy : '',
          approvedRole: data.approvedRole ? data.approvedRole : '',
          // bmLineitem: this.checkBooleanVariationSettings(data.bmLineitem) ? data.bmLineitem : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.bmLineitem) ? this.selectionAdminData.bmLineitem : false),
          // bmTotalFigure: this.checkBooleanVariationSettings(data.bmTotalFigure) ? data.bmTotalFigure : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.bmTotalFigure) ? this.selectionAdminData.bmTotalFigure : false),
          // bmHideAll: this.checkBooleanVariationSettings(data.bmHideAll) ? data.bmHideAll : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.bmHideAll) ? this.selectionAdminData.bmHideAll : false),
          // qtyHideAll: this.checkBooleanVariationSettings(data.qtyHideAll) ? data.qtyHideAll : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.qtyHideAll) ? this.selectionAdminData.qtyHideAll : false),
          // unitHideAll: this.checkBooleanVariationSettings(data.unitHideAll) ? data.unitHideAll : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.unitHideAll) ? this.selectionAdminData.unitHideAll : false),
          // unitCostHideAll: this.checkBooleanVariationSettings(data.unitCostHideAll) ? data.unitCostHideAll : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.unitCostHideAll) ? this.selectionAdminData.unitCostHideAll : false),
          // gstHideAll: this.checkBooleanVariationSettings(data.gstHideAll) ? data.gstHideAll : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.gstHideAll) ? this.selectionAdminData.gstHideAll : false),
          // itemTotalHideAll: this.checkBooleanVariationSettings(data.itemTotalHideAll) ? data.itemTotalHideAll : (this.checkGlobalBooleanVariationSettings(this.selectionAdminData.itemTotalHideAll) ? this.selectionAdminData.itemTotalHideAll : false),
        });

        

        // console.log(data.qtyHideAll)
        // console.log(this.checkBooleanVariationSettings(data.qtyHideAll))
        // console.log(this.selectionAdminData.qtyHideAll);
        // console.log(this.checkGlobalBooleanVariationSettings(this.selectionAdminData.qtyHideAll));
        // console.log(this.selectionFom.value.qtyHideAll)

        // if(data.projectOwner){
        //   projectOwnerIDs = data.projectOwner;

        //   projectOwnerIDs.forEach(value => {
        //       if(this.findObjectByKey(this.projectOwners, 'id', value)){
        //           var item = this.findObjectByKey(this.projectOwners, 'id', value);
        //           this.setProjectOwners.push(item);
        //       }
        //   });

        //   this.projectOwnerControl.setValue(this.setProjectOwners);
        //   console.log(this.setProjectOwners);

        // }
        const emailList = data.clientEmail || [];
        const projectOwnerArray = emailList.map(email => ({
          email: email,
          id: 'static-id' // or generate dynamic ID if needed
        }));
        
        this.projectOwnerControl.setValue(projectOwnerArray);

        if (data.selectionGroupArray){
          this.selectionGroupArray().clear()
          let i = 0;
          data.selectionGroupArray.forEach(t => {
            let teacher: FormGroup = this.createselectionGroupArray();
            this.selectionGroupArray().push(teacher);

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

          this.selectionGroupArray().patchValue(data.selectionGroupArray);
          
        }

        // this.data_api.getFBProject(data.projectId).pipe(first()).subscribe(data2 => {
        //     console.log(data2);
        //     this.projectData = data2;
        // });

        this.convertImages();
    });
  }

  async convertImages(){

    let groupIndex = 0;   

    for (let group of this.selectionFom.value.selectionGroupArray) { 
      let itemIndex = 0;
      for (let item of group.itemArray) {

        const adminAdvocacy = this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray;

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
        adminAdvocacy.controls[itemIndex].patchValue({
          itemImage: awaitData,
        });
        itemIndex++;

      }

      groupIndex++;

    }

  }

  // showApprovedOnly(event){
  //     console.log(event.currentTarget.checked);
  // }

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

  findObjectByKey(array, key, value) {

      for (var i = 0; i < array.length; i++) {
          if (array[i][key] === value) {
              return array[i];
          }
      }
      return null;
  }

  selectionGroupArray(): FormArray {
    return this.selectionFom.get('selectionGroupArray') as FormArray;
  }

  itemArray(groupIndex:number) : FormArray {
    return this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray
  }

  createselectionGroupArray(): FormGroup {
    return this.formBuilder.group({
      groupName: '',
      groupBudget: '',
      hideBudget: true,
      groupTotal: '',
      groupOverUnder: '',
      groupStatus: '',
      files: '',
      tempFiles: new FormControl(null, [FileUploadValidators.accept(['application/pdf']), FileUploadValidators.filesLimit(5)]),
      itemArray: this.formBuilder.array([ ])
    });
  }

  addselectionGroupArray() {
    this.selectionGroupArray().push(this.createselectionGroupArray());
  }

  removeGroup(groupIndex){
    this.dialog.open(DeletedialogComponent, {width : '500px', data: 'Group'}).afterClosed().subscribe((res)=>{
      this.selectionGroupArray().removeAt(groupIndex)
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
      imageCaption: '',
    });
  }

  addItemArray(groupIndex: number) {
    this.itemArray(groupIndex).push(this.createItemArray());
  }

  removeGroupItem(groupIndex,itemIndex){

    this.itemArray(groupIndex).removeAt(itemIndex);
    this.computeGroupTotal(groupIndex);
  }

  public copyPdfLink(){
    this.clipboard.copy(this.selectionFom.value.pdfLink);

    $.notify({
      icon: 'notifications',
      message: 'PDF link copied.'
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

  }

    onSelectionChange(event?: any): void {
          try {
            // Extract recipient IDs from the selected values
            const recipientIds = this.projectSelectionControl.value.map((recipient: any) => recipient.id);
        
            // Call the reusable function to update RFI recipients
            updateRecipients(
              this.data_api, // API service
              recipientIds, // List of recipient IDs
              this.projectData.id, // Project ID
              this.spinnerService,
              'Selection', // Spinner service
              (res: any) => {
                // Success callback: Call the `getProject` method after successful update
                this.getProject();
              },
              (error: any) => {
                // Error callback: Handle error if something goes wrong
                console.error('Error during RFI update:', error);
              }
            );
          } catch (error) {
            console.error('Error processing selection change:', error);
          }
        }

        
 // REMOVE SELECTION TOPPINGS
 onProjectSelectionToppingRemoved(topping, index:number){
  console.log('thisproectrficontrol' ,this.projectSelectionControl.value)
  const newToppings = this.projectSelectionControl.value.filter((_, i) => i !== index);
  this.projectSelectionControl.patchValue(newToppings);
  this.onSelectionChange();
 }

  onComputeTotal(groupIndex,itemIndex){

      const adminAdvocacy = this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray;

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
    console.log(this.itemArray(groupIndex));
    for (let i = 0; i < len; i++) {
      console.log(this.itemArray(groupIndex).value[i].itemTotal);
      _groupTotal = _groupTotal + parseFloat(this.itemArray(groupIndex).value[i].itemTotal);
      console.log(_groupTotal);
    }
    let _groupBudget = this.selectionGroupArray().at(groupIndex).get('groupBudget').value;
    let _groupOverUnder = _groupBudget - _groupTotal;
    console.log(_groupBudget);
    console.log(_groupOverUnder);
    console.log(_groupTotal);
    
    this.selectionGroupArray().at(groupIndex).get('groupTotal').patchValue(_groupTotal.toFixed(2));
    this.selectionGroupArray().at(groupIndex).get('groupOverUnder').patchValue(_groupOverUnder.toFixed(2));
  }

  async onFileChange(event,groupIndex,itemIndex) {
    console.log(groupIndex);
    console.log(itemIndex);
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
  
          console.log(imageFile);
  
          // Crop Lnadscape images and convert to base64
          const imageCropped = await this.fileListToBase64(event.target.files);
  
          // Convert Base64 to File
         
          console.log(imageCropped);
  
          // Convert Base64 to File
          const compressedFiles = await  Promise.all(
            imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
          )
  
  
          // Compress File
          const compressedFiles2 = await  Promise.all(
            await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
          )
          
          console.log(compressedFiles2);
  
  
          let reader = new FileReader();
  
          reader.readAsDataURL(compressedFiles2[0]);

          const adminAdvocacy = this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray;

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

              // if(!this.projectData){
                this.getProject();
              // }
              // this.initializeFilterWorkers();
              // this.initializeFilterSupervisors();
              // this.initializeFilterAltSupervisors();

        }
      );
  }

  getFBAllTrades(): void {
    this.data_api.getFBAllTrades().subscribe(data => {
      console.log(data);

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

    const adminAdvocacy = this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray;
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

    const adminAdvocacy = this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray;
    
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

  public findInvalidControls() {
      const invalid = [];
      const controlsVariation = this.selectionFom.controls;

      for (const name in controlsVariation) {
          if (controlsVariation[name].invalid) {
            if (controlsVariation[name].invalid) {
                if(name == 'selectionName'){
                  invalid.push('Selection Name');
                }else if(name == 'dueDate'){
                  invalid.push('Due Date');
                }else if(name == 'projectOwner'){
                  invalid.push('One-time Variation Recipients');
                }else if(name == 'openingMessage'){
                  invalid.push('Opening Message');
                }else if(name == 'closingMessage'){
                  invalid.push('Closing Message');
                }
            }
          }
      }

      let groupIndex = 0;
      for (let group of this.selectionFom.value.selectionGroupArray) { 
        let itemIndex = 0;
        for (let item of group.itemArray) {

          const adminAdvocacy = this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray;
          console.log(adminAdvocacy.controls[itemIndex].get('itemImage').status);

          if(adminAdvocacy.controls[itemIndex].get('itemImage').status == 'INVALID'){
            invalid.push('Item image');
          }

          itemIndex++;
        }
        groupIndex++;
      }

      console.log(controlsVariation);
      console.log(invalid);

      let htmlVal = '';

      invalid.forEach( data => {
          htmlVal += data + ' <br>'
      });

      Swal.fire({
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
    console.log(arr);
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
            body: [

              [
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
            ]

          ]                     
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

      let accsList = this.selectionFom.value.selectionGroupArray;

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

    let accsList = this.selectionFom.value.selectionGroupArray;

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

        console.log(this.selectionFom.value.bmLineitem);
        console.log(this.selectionFom.value.bmHideAll);

        console.log(this.selectionFom.value.qtyHideAll);
        console.log(this.selectionFom.value.unitHideAll);
        console.log(this.selectionFom.value.unitCostHideAll);
        console.log(this.selectionFom.value.gstHideAll);
        console.log(this.selectionFom.value.itemTotalHideAll);

        var descWidth = 50;
        let bulletWidths = [];

        if(this.selectionFom.value.qtyHideAll == true){ //Qty
          descWidth = descWidth + 10;
        }else{
          bulletWidths.push('10%');
        }

        if(this.selectionFom.value.unitHideAll == true){  //UOM
          descWidth = descWidth + 10;
        }else{
          bulletWidths.push('10%');
        }

        if(this.selectionFom.value.unitCostHideAll == true){ //Cost
          descWidth = descWidth + 10;
        }else{
          bulletWidths.push('10%');
        }

        if(this.selectionFom.value.bmHideAll == true){ //BM
          descWidth = descWidth + 10;
        }else{
          if(this.selectionFom.value.bmLineitem == true){
            bulletWidths.push('10%');
          }else{
            descWidth = descWidth + 10;
          }
        }

        if(this.selectionFom.value.itemTotalHideAll == true){ //Subtotal
          descWidth = descWidth + 10;
        }else{
          bulletWidths.push('10%');
        }

        // if(this.selectionFom.value.gstHideAll == true){ //GST
        //   descWidth = descWidth + 10;
        // }else{
        //   bulletWidths.push('10%');
        // }

        // if(this.selectionFom.value.itemTotalHideAll == true){ //Total
        //   descWidth = descWidth + 10;
        // }else{
        //   bulletWidths.push('10%');
        // }

        let newArr = [descWidth+'%', ...bulletWidths];
        // console.log(newArr);
        return newArr;

  }

  variationSettingsTitle(){

   
    // var descWidth = 30;
    let bulletTitle = [];

    if(this.selectionFom.value.qtyHideAll == true){ //Qty
      // descWidth = descWidth + 10;
    }else{
      bulletTitle.push({text:  'Qty', style: 'tableHeader'});
    }

    if(this.selectionFom.value.unitHideAll == true){//UOM
      // descWidth = descWidth + 10;
    }else{
      bulletTitle.push({text:  'UOM', style: 'tableHeader'});
    }

    if(this.selectionFom.value.unitCostHideAll == true){ //Cost
      // descWidth = descWidth + 10;
    }else{
      bulletTitle.push({text:  'Unit Cost', style: 'tableHeaderCurrency'});
    }

    if(this.selectionFom.value.bmHideAll == true){ //BM 
      // descWidth = descWidth + 10;
    }else{
      if(this.selectionFom.value.bmLineitem == true){
        bulletTitle.push({text:  'BM', style: 'tableHeaderCurrency'});
      }else{
        // descWidth = descWidth + 10;
      }
    }

    if(this.selectionFom.value.itemTotalHideAll == true){ //Subtotal Total
      // descWidth = descWidth + 10;
    }else{
      bulletTitle.push({text:  'Total', style: 'tableHeaderCurrency'});
    }

    // if(this.selectionFom.value.gstHideAll == true){ //GST
    //   // descWidth = descWidth + 10;
    // }else{
    //   bulletTitle.push({text:  'GST', style: 'tableHeaderCurrency'});
    // }

    // if(this.selectionFom.value.itemTotalHideAll == true){ //Total
    //   // descWidth = descWidth + 10;
    // }else{
    //   bulletTitle.push({text:  'Total', style: 'tableHeaderCurrency'});
    // }

    let newArr = [{text:  'Description', style: 'tableHeader'}, ...bulletTitle];
    console.log(newArr);
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

    if(this.selectionFom.value.qtyHideAll == true){ //Qty
      // descWidth = descWidth + 10;
    }else{
      bulletValue.push({text: item.quantity, style: 'fieldData'});
    }

    if(this.selectionFom.value.unitHideAll == true){ //UOM
      // descWidth = descWidth + 10;
    }else{
      bulletValue.push({text: item.uom, style: 'fieldData'});
    }

    
    if(this.selectionFom.value.bmHideAll == true){ //BM
      if(this.selectionFom.value.unitCostHideAll == true){ //Cost
        // descWidth = descWidth + 10;
      }else{
        bulletValue.push({text: formatCurrency(_newUnitCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
      }
    }else{

      if(this.selectionFom.value.bmLineitem == true){

          if(this.selectionFom.value.unitCostHideAll == true){ //Cost
            // descWidth = descWidth + 10;
          }else{
            bulletValue.push({text: formatCurrency(item.unitCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
          }
        
      }else{

          if(this.selectionFom.value.unitCostHideAll == true){ //Cost
            // descWidth = descWidth + 10;
          }else{
            bulletValue.push({text: formatCurrency(_newUnitCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
          }

      }

    }
    
    if(this.selectionFom.value.bmHideAll == true){ //BM
      // descWidth = descWidth + 10;
    }else{
      if(this.selectionFom.value.bmLineitem == true){
        bulletValue.push({text: formatCurrency(_bmCost, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
        
      }else{
        // descWidth = descWidth + 10;
      }
    }

    if(this.selectionFom.value.itemTotalHideAll == true){ //Subtotal
      // descWidth = descWidth + 10;
    }else{
      bulletValue.push({text: formatCurrency(_subtotal, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
    }

    // if(this.selectionFom.value.gstHideAll == true){ //GST
    //   // descWidth = descWidth + 10;
    // }else{
    //   bulletValue.push({text:  formatCurrency(item.gst, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
    // }

    // if(this.selectionFom.value.itemTotalHideAll == true){ //Total
    //   // descWidth = descWidth + 10;
    // }else{
    //   bulletValue.push({text:  formatCurrency(item.itemTotal, 'en-AU', '', '',''), style: 'fieldDataCurrency'});
    // }


    var htmlDescription = htmlToPdfmake(item.description);

    let newArr = [{text:htmlDescription, style: 'fieldData'}, ...bulletValue];
    console.log(newArr);
    return newArr;
  }

  pdfBmHideAllTitleWidth(){
    if(this.selectionFom.value.bmHideAll == true){
      return [ '40%','10%','10%','10%','10%','0%','10%','10%'];   
    }else{
        if(this.selectionFom.value.bmLineitem == true){
          return [ '30%','10%','10%','10%','10%','10%','10%','10%'];
        }else{
          return [ '40%','10%','10%','10%','10%','0%','10%','10%'];
        }   
    }
  }

  pdfBmHideAllTitle(){
    if(this.selectionFom.value.bmHideAll == true){
      return {};
    }else{

      if(this.selectionFom.value.bmLineitem == true){
        return {text:  'BM', style: 'tableHeader'} 
      }else{
        return {};
      }

    }
  }

  pdfBmHideAllTitleValueWidth(){
    if(this.selectionFom.value.bmHideAll == true){
      return [ '40%','10%','10%','10%','10%','0%','10%','10%'];   
    }else{
        if(this.selectionFom.value.bmLineitem == true){
          return [ '30%','10%','10%','10%','10%','10%','10%','10%'];
        }else{
          return [ '40%','10%','10%','10%','10%','0%','10%','10%'];
        }   
    }
  }

  // pdfBmHideAllValue(bmValue){
  //   if(this.selectionFom.value.bmHideAll == true){
  //     return {};
  //   }else{

  //     if(this.selectionFom.value.bmLineitem == true){
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
    if(this.selectionFom.value.bmHideAll == true){
      return[{},{},{}];
    }else{
      if(this.selectionFom.value.bmTotalFigure == true){
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
          if(groupOverUnder < 0){
              return [ 
                  {
                    text: '', 
                    style: 'tableHeader',
                  },
                  {
                    text: 'Over', 
                    style: 'tableHeader',
                  },
                  {
                    text:  formatCurrency(groupOverUnder, 'en-AU', '', '',''), 
                    style: 'tableHeaderCurrency',  
                  }    
              ]
          }else{
              return [ 
                  {
                    text: '', 
                    style: 'tableHeader',
                  },
                  {
                    text: 'Under', 
                    style: 'tableHeader',
                  },
                  {
                    text:  formatCurrency(groupOverUnder, 'en-AU', '', '',''), 
                    style: 'tableHeaderCurrency',  
                  }    
              ]
          }
            
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

        for (let group of this.selectionFom.value.selectionGroupArray) { 
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
            //               text: this.selectionFom.value.selectionName,
            //               style: 'fieldData',
            //             },
            //             {
            //               text: this.selectionFom.value.variantsNumber, //(this.editForm.value.reportNumber ? this.editForm.value.reportNumber : ''),
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
                text:  this.selectionFom.value.variantsNumber,
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
                    text: moment(this.selectionFom.value.dueDate).locale("en-au").format('LL'),
                    style: 'fieldData',
                  },
                  {
                    text: this.projectData.jobNumber ? this.cleanChar(this.projectData.jobNumber) : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.projectData.projectName ?  this.cleanChar(this.projectData.projectName) : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.projectData.siteContact ?  this.cleanChar(this.projectData.siteContact) : ' ',
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
          { text: this.selectionFom.value.selectionName, style: 'fieldHeader', margin: [0, -33, 0, 20 ],},
          { text: '', style: 'fieldHeader', margin: [0, 0, 0, 20 ],},
          this.getOpeningMessage(this.selectionFom.value.openingMessage),
          { text: '', style: 'fieldHeader', margin: [0, 0, 0, 20 ],},
          // this.getTableHeader(),
          // {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 1 ],},
          this.getTableValues(),
          { text: '', style: 'fieldHeader', margin: [0, 0, 0, 20 ],},
          this.getTableTotal(),
          { text: '', style: 'fieldHeader', margin: [0, 20, 0, 0 ],},
          this.getClosingMessage(this.selectionFom.value.closingMessage), 
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
                    text: ' ', //image: this.selectionFom.value.signature,
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
            lineHeight: 1,
            alignment: 'right',
          },
          fieldDataCurrency2: {
            color: '#050708',
            fontSize: 9,
            alignment: 'right',
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

  // testpdf(){

  //   const documentDefinition = this.getDocumentDefinition();
  //   console.log(documentDefinition);
  //   const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
  //   pdfDocGenerator.open();

  // }

  public downloadPDF(pdf, fileName) {
    const linkSource = `data:application/pdf;base64,${pdf}`;
    const element = document.createElement('a');
    element.href = linkSource;
    element.download = fileName;

    element.style.display = 'none';
    element.click();
  }
  
  public saveStep1Confirmation(message){

      Swal.fire({
          // title: 'Are you sure?',
          text: "This will override this Variation and will require the client approve it again. Are you sure you want to do this?",
          icon: 'warning',
          showDenyButton: false,
          showCancelButton: true,
          confirmButtonText: 'Continue',
          // denyButtonText: `Don't save`,
          cancelButtonText: 'Cancel',
          customClass:{
            // denyButton: 'btn dcb-btn',
            confirmButton: 'btn dcb-btn',
            cancelButton: 'btn dcb-btn',
          },
          buttonsStyling: false
      }).then((result2) => {
        if(result2.isConfirmed){
          this.saveStepCheckValidation(message,'reset');
        }
      })
      
  }

  cleanChar(str){
    if(str){
      return str.replace(/[^\x20-\x7E]/g, '') ;
    }else{
      return;
    }
    
  }

  public async submitApproveAdmin(){   // Submit Approve Admin

      if(this.selectionFom.dirty){

          Swal.fire({
              title: "Please save your unsaved changes first.",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })

          return;
      }

      const dialogRef = this.dialog.open(ApproveAdminDialog, {
          width: '400px',
          // data: this.adminData
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          if(result){   
            
            let currDateTime = new Date();

            let tempdata = {
              status: 'Approved',
              comments: result.comments,
              approvedAt: currDateTime,
              approvedBy: this.userDetails.user_id,
              approvedRole: 'admin'
            }

            console.log(tempdata);
            this.data_api.approveAdminFBSelection(this.passID.id2,tempdata).then(data => {

                  $.notify({
                    icon: 'notifications',
                    message: 'Variation Approved.'
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

                  setTimeout(function(){
                    //window.location.reload();
                  }, 1000);

            });

          }
      });

  }

  public async viewApproveAdmin(comments){   // View Approve Admin

      const dialogRef = this.dialog.open(ApproveViewDialog, {
          width: '400px',
          data: comments
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log(result);
      });

  }



  public async saveStepCheckValidation(message,action){   // Generate and Upload PDF to Firebase  

    console.log(this.selectionFom.value);

        let ownerList = this.projectOwnerControl.value;
        let ownerIDS = [];
        this.pdfClientNames = [];
        this.selectionFom.patchValue({
          projectOwner: ''
        });
        
        if(ownerList){

            ownerList.forEach( data => {
              console.log(data);
                ownerIDS.push(data.id);
                this.pdfClientNames.push(data.name);
            });

            this.selectionFom.patchValue({
              projectOwner: ownerIDS
            });
        }

        if (this.selectionFom.invalid) {
            this.findInvalidControls();
            return;
        } 

        if(this.selectionFom.value.selectionGroupArray.length < 1 ){

          Swal.fire({
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

        if(this.selectionFom.value.selectionGroupArray ){
          let errorDetect = 0;
          let imgCount = 0;
          for (let group of this.selectionFom.value.selectionGroupArray) { 
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
            Swal.fire({
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
          
          Swal.fire({
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

        if(  (this.selectionFom.value.projectOwner.length < 1) &&  (this.setProjectSelectionRecipient.length < 1) ){

          Swal.fire({
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

        let tobeuploadPDFs = 0;
        let uploadedPDFs = 0;
        for (let group of this.selectionFom.value.selectionGroupArray) { 
          if(group.tempFiles){
            for (let file of group.tempFiles) {
              tobeuploadPDFs++;
            }
          }
          if(group.files){
            for (let file of group.files) {
              uploadedPDFs++;
            }
  
          }
        }

        if( (tobeuploadPDFs == 0) && (uploadedPDFs == 0)){
          console.log('first');
          
          this.saveStepUploadPDF(message,action);
        }else{
           console.log('second');
           
          if(tobeuploadPDFs > 0){
            console.log('thired');
            
            this.saveStepUploadQuotes(message,action);
          }else{
            console.log('fourth');
            
            this.saveStepUploadPDFwithQuotes(message,action);
          }

        }

        
        
  }

  saveStepUploadQuotes(message,action){
    console.log('third again');
    
    console.log(this.selectionFom.value);

    let pdfDone = 0;
    let i = 0;
    //let imageLen = this.selectionFom.value.selectionGroupArray.length;
    let pdfLen = 0;
    for (let group of this.selectionFom.value.selectionGroupArray) { 
      if(group.tempFiles){
        for (let file of group.tempFiles) {
          pdfLen++;
        }
      }
    }

    let folderName =  this.selectionFom.value.folderName;    
      // console.log(this.selectionFom.value);
      // return;
      if(pdfLen > 0){

          this.progressOverlay.show('Uploading Quotes','#0771DE','white','lightslategray',1);

          let groupIndex = 0;
          for (let group of this.selectionFom.value.selectionGroupArray) { 
            let groupFiles = [];
            if(group.tempFiles){
                  let fileIndex = 0;
                  for (let file of group.tempFiles) {
                  //for (let i = 0; i < this.imageURL.length; i++) {
                    // let base64image = item.itemImage;
                    let id = Math.random().toString(36).substring(2);
                    let fileName = this.selectionFom.value.variantsNumber+'-'+groupIndex+'-'+fileIndex+'-'+id+'.pdf';
                    let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Selections/'+folderName+'/'+fileName);
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
          
                          console.log(url);
                          let splitName = url.split(/%2..*%2F(.*?)\?alt/);
                          console.log(splitName[1]);

                          let splitName2 = splitName[1].split("-");
                          let myIndex = splitName2[1];
                          
                          let myFiles = [];
                          myFiles.push(url);
                          let newFiles = [];
                          if(this.selectionGroupArray().at(myIndex).get('files').value){
                            newFiles = myFiles.concat(this.selectionGroupArray().at(myIndex).get('files').value);
                          }else{
                            newFiles = myFiles;
                          }

                          this.selectionGroupArray().at(myIndex).get('files').patchValue(newFiles);

                          pdfDone = pdfDone + 1;
                          if(pdfDone == pdfLen){
                            this.progressOverlay.hide();
                            console.log(this.selectionFom.value);
                            this.saveStepUploadPDFwithQuotes(message,action);
                          } 
                        
                      });
                    })).subscribe();
                    fileIndex++;
                }
                
              }
              groupIndex++;
          }
      }else{
        // this.saveStep4(message,action);
      }

  }

  async saveStepUploadPDFwithQuotes(message,action){

      let myFiles = [];

      let imageDone = 0;
      let i = 0;
      //let imageLen = this.selectionFom.value.selectionGroupArray.length;
      let imageLen = 0;
      for (let group of this.selectionFom.value.selectionGroupArray) { 
        if(group.files){
          for (let file of group.files) {
            imageLen++;
          }
        }
      }

      if(imageLen > 0){
        

        let groupIndex = 0;
        for (let group of this.selectionFom.value.selectionGroupArray) { 
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
        for (const document of myFiles) {
            const existingPdfBytes = await fetch(document).then((res) =>
              res.arrayBuffer()
            );
            console.log('esitingpdbytes', existingPdfBytes);
             
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            console.log('pdfdoc', pdfDoc);
            
            const copiedPages = await mergedPdf.copyPages(
              pdfDoc,
              pdfDoc.getPageIndices()
            );
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();

        let folderName =  this.selectionFom.value.folderName;  

        let id = this.selectionFom.value.selectionName+'.pdf';

        let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Selections/'+folderName+'/'+id);
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
              console.log('url',url);
              this.selectionFom.patchValue({
                pdfLink: url
              });
              
              console.log(this.selectionFom.value);

              this.saveStepUploadImages(message,action);
            });
        })).subscribe();
        
    console.log('this is wokings');
    
    });

  }

  saveStepUploadPDF(message,action){

    this.progressOverlay.show('Uploading Variation PDF','#0771DE','white','lightslategray',1); 
  
    const documentDefinition = this.getDocumentDefinition();

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    let folderName =  this.selectionFom.value.folderName;  
    console.log('folder name', folderName);
    

    let id = this.selectionFom.value.selectionName+'.pdf';

    pdfDocGenerator.getBase64((data) => {
      console.log(data);
    
      console.log(this.selectionFom.value);


      let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Selections/'+folderName+'/'+id);
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
            console.log(url);
            this.selectionFom.patchValue({
              pdfLink: url
            });
            
            console.log(this.selectionFom.value);

            this.saveStepUploadImages(message,action);
          });
      })).subscribe();

    });

  }

  saveStepUploadImages(message,action){

    let imageDone = 0;
    let i = 0;
    //let imageLen = this.selectionFom.value.selectionGroupArray.length;
    let imageLen = 0;
    for (let group of this.selectionFom.value.selectionGroupArray) { 
       for (let item of group.itemArray) {
        console.log(item);
        imageLen++;
       }
    }


    let folderName =  this.selectionFom.value.folderName;    

    console.log(imageLen);
    // console.log(this.selectionFom.value);
    // return;

    this.progressOverlay.show('Uploading Images','#0771DE','white','lightslategray',1);

    for (let group of this.selectionFom.value.selectionGroupArray) { 
        for (let item of group.itemArray) {
        //for (let i = 0; i < this.imageURL.length; i++) {
          let base64image = item.itemImage;
          let id = Math.random().toString(36).substring(2);
          let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Selections/'+folderName+'/'+i);
          //let base64String = base64image.split(',').pop();
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
                console.log(url);
                let splitName = url.split(/%2..*%2F(.*?)\?alt/);
                console.log(splitName[1]);

                this.downloadArray.push({
                    url: url,
                    nameIndex: splitName[1]
                });
                
                imageDone = imageDone + 1;
                if(imageDone == imageLen){
                  this.progressOverlay.hide();
                  console.log(this.downloadArray);
                   this.saveStepUpdateVariation(message,action);
                } 
              });
          })).subscribe();
          i++;
      }
    }

    console.log(this.selectionFom.value);

  }

  saveStepUpdateVariation(message,action){

        let tempIndex = 0;
        for (let group of this.selectionFom.value.selectionGroupArray) { 
          this.selectionGroupArray().at(tempIndex).get('tempFiles').disable();
          tempIndex++;
        }

        console.log(this.selectionFom.value);

        if( this.downloadArray){
            //Sort Download URLS by filename
            this.downloadArray.sort((a, b) => {
              return a.nameIndex - b.nameIndex;
            });

            console.log(this.downloadArray);

            this.downloadArray.forEach((data) => {
              this.downloadURLs.push(data.url);
            });
            console.log(this.downloadURLs);
        }

        let groupIndex = 0;   
        let i=0;

        for (let group of this.selectionFom.value.selectionGroupArray) { 
          let itemIndex = 0;
          for (let item of group.itemArray) {

            const adminAdvocacy = this.selectionGroupArray().at(groupIndex).get("itemArray") as FormArray;
    
            adminAdvocacy.controls[itemIndex].patchValue({
              itemImage: this.downloadURLs[i],
            });
            
            itemIndex++;
            i++;

            console.log(this.selectionFom.value);
            
          }
          const adminAdvocacy2 = this.selectionGroupArray().at(groupIndex)

            if(action == 'reset'){
              adminAdvocacy2.patchValue({
                groupStatus: ''
              })
            }

          groupIndex++;
        }
        console.log(this.selectionFom.value);

        if(message == 'submitAdmin'){
          this.selectionFom.patchValue({
            status: 'Submitted to Admin',
            signature: ''
          });
        }else if(message == 'submitClient'){
            this.selectionFom.patchValue({
              status: 'Submitted to Client',
              signature: ''
            });
        }else{
          this.selectionFom.patchValue({
            status: 'Draft',
            signature: ''
          });
        }


        this.data_api.updateFBSelection(this.passID.id2,this.selectionFom.value).then(data => {

          console.log('Updated Selection successfully!');

          console.log(data);

          $.notify({
            icon: 'notifications',
            message: 'Selection Saved.'
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
          if(message == 'submitClient'){
            console.log('under the submti cient');
            this.sendClientEmail(this.passID.id2,this.passID.id);
          }else if(message == 'submitAdmin'){
            this.sendAdminEmail(this.passID.id2,this.passID.id);
          }else{
            // this.router.navigate(['/variations/project/'+this.passID.id]);
            setTimeout(function(){
              //window.location.reload();
            }, 1000);

          }


        });

  }

  ownerSelectChange(event)
  {
    if(event.isUserInput) {
      console.log(event.source.value, event.source.selected);
        if(event.source.selected == true){
            // const clientEmail = this.editForm.get('clientEmail') as FormArray;
            // clientEmail.push(this.formBuilder.control(event.source.value.email));
            let tempArray = [event.source.value.email, ...this.selectionFom.value.clientEmail];
              this.selectionFom.patchValue({
                clientEmail: tempArray
              });
        }else{
            // const clientEmail = this.editForm.get('clientEmail') as FormArray;
            // clientEmail.removeAt(clientEmail.value.findIndex(email => email === event.source.value.email));
            let tempArray = this.selectionFom.value.clientEmail;
            var index = tempArray.indexOf(event.source.value.email);
            if (index !== -1) {
              tempArray.splice(index, 1);
              this.selectionFom.patchValue({
                clientEmail: tempArray
              });
            }
        }

    }
  }

  sendAdminEmail(selectionID,projectID){

    console.log(this.selectionFom.value);
    const adminEmails = [];
    const cc = [];
    const bcc = [];

    let adminEmail = this.selectionAdminData.selEmailRecipient;
    if(adminEmail){
      adminEmail.forEach(email => {
        adminEmails.push({
            Email: email
          });
      });
    }

    let myURL = window.location.href ;
    let rep2 = '/selections/project/'+projectID+'/edit/'+selectionID ;
    let rep1 = this.router.url ;
    let newUrl = myURL.replace(rep1, rep2)
    
    let tempdata = {
      adminEmail: adminEmails,
      cc : cc,
      bcc : bcc,
      emailHeader: this.adminData.logo, //emailHeaderNewUser2,
      textSignature:  this.adminData.textSignature,
      emailSignature:  this.adminData.emailSignature,
      varLink: newUrl,
      pdfLink: this.selectionFom.value.pdfLink,
      openingMessage: this.selectionFom.value.openingMessage,
      closingMessage: this.selectionFom.value.closingMessage,
      projectName: this.projectData.projectName,
      selectionName: this.selectionFom.value.selectionName,
      subjectTitle: 'Selection Admin Approval'
    }
    console.log('tempdata',tempdata);

    this.spinnerService.show();
    const callableTest = this.functions.httpsCallable('sendFBSelectionsRequest');
    callableTest(tempdata).subscribe(result => {
      console.log(result)
      this.spinnerService.hide();
      $.notify({
        icon: 'notifications',
        message: 'Email Sent to Admin!'
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

      // this.router.navigate(['/variations/project/'+projectID]);
         setTimeout(function(){
              //window.location.reload();
            }, 1000);
    })

}

public getUniqueListBy(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}

sendClientEmail(selectionID,projectID){

    const adminEmails = [];
    const cc = [];
    const bcc = [];

    let clientEmail = this.selectionFom.value.clientEmail;
    if(clientEmail){
      clientEmail.forEach(email => {
        adminEmails.push({
            Email: email
          });
      });
    }

    let recipientSelection = this.setProjectSelectionRecipient;
    if(recipientSelection){
      recipientSelection.forEach(user => {
        adminEmails.push({
            Email: user.email
          });
      });
    }
    console.log('this.selectionAdminData',this.selectionAdminData)
    let emailsCC = [...this.projectData.selectionEmailCC];
    console.log('emailsCC', emailsCC);
    if(emailsCC){
      emailsCC.forEach(email => {
        cc.push({
            Email: email
          });
      });
    }
    
    let emailsBCC = [...this.projectData.selectionEmailBCC]
    if(emailsBCC){
      emailsBCC.forEach(email =>{
        bcc.push({
          Email : email
        })
      })
    }

    let myURL = window.location.href ;
    let rep2 = '/dashboard-selection/'+selectionID ;
    let rep1 = this.router.url ;
    let newUrl = myURL.replace(rep1, rep2)
    
    let tempdata = {
      adminEmail: this.getUniqueListBy(adminEmails,"Email"),
      cc : cc,
      bcc : bcc,
      emailHeader: this.adminData.logo, //emailHeaderNewUser2,
      textSignature:  this.adminData.textSignature,
      emailSignature:  this.adminData.emailSignature,
      varLink: newUrl,
      pdfLink: this.selectionFom.value.pdfLink,
      openingMessage: this.selectionFom.value.openingMessage,
      closingMessage: this.selectionFom.value.closingMessage,
      projectName: this.projectData.projectName,
      selectionName: this.selectionFom.value.selectionName,
      subjectTitle: 'Selection Approval Request'
    }
    console.log('tempdata',tempdata);

    this.spinnerService.show();
    const callableTest = this.functions.httpsCallable('sendFBSelectionsRequest');
    callableTest(tempdata).subscribe(result => {
      console.log(result)
      this.spinnerService.hide();
      $.notify({
        icon: 'notifications',
        message: 'Email Sent to Client!'
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

      // this.router.navigate(['/variations/project/'+projectID]);
         setTimeout(function(){
              //window.location.reload();
            }, 1000);
    })

}

getAdminSettings(){
    this.data_api.getFBAdminSettings().subscribe((data) => {
        console.log(data);
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

    }); 
}

onButtonEnter(hoverName: HTMLElement) {
  hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
}

onButtonOut(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
}

getSelectionSettings(){

    this.data_api.getFBSelectionSettings().subscribe((data) => {
        console.log(data);
        this.selectionAdminData = data;
        this.getFBProjectUsers();
    }); 
}

openAddOwnerDialog(): void {
  const dialogRef = this.dialog.open(UserAddOwnerDialogEdit, {
      width: '400px',
      data: this.adminData
  });

  dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if(result == 'success'){   
          // setTimeout(function(){
          //   //window.location.reload();
          // }, 1000);  
        //  this.getProjectOwners();
      }
  });
}

openTableItemsAddDialog(groupIndex): void {

  const dialogRef = this.dialog.open(TableItemsAddDialog, {
      width: '650px',
      disableClose: true,
      data: {
        listTrades: this.listTrades,
      }
  });

  dialogRef.backdropClick().subscribe(() => {
    Swal.fire({
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
      console.log(result);
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
  console.log('edit is working');
  
  
  const dialogRef = this.dialog.open(TableItemsEditDialog, {
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
    Swal.fire({
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
      console.log(result);
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



openExternalQuotesDialog(index): void {
    const dialogRef = this.dialog.open(ExternalQuotesEditDialog, {
        width: '700px',
        data: this.selectionGroupArray().at(index).get('files').value
    });

    dialogRef.afterClosed().subscribe(result => {
  
        if(result){   

          console.log(result);
      
          this.selectionGroupArray().at(index).get('files').patchValue(result);
          console.log(this.selectionFom.value);

          this.saveStepCheckValidation('','')
        //       setTimeout(() => {

        //         this.editForm.patchValue({
        //           uom: result.toString(),
        //         });

        //         this.initializeFilterUom();
        //       }, 1000); 
        }
    });
}

openTableVarGroupNameAddDialog(groupIndex): void {
    console.log('update works');
    
    const dialogRef = this.dialog.open(TableVarGroupNameAddEditDialog, {
        width: '300px',
        data: {
          adminData: this.adminData
        }
    });

    dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        if(result){   
          this.selectionGroupArray().at(groupIndex).get("groupName").patchValue(result.groupName);
        }
    });
  
}

// enlargeImage(event){
  
//   const imgElem = event.target;
  
//   var target = event.target || event.srcElement || event.currentTarget;
//   var srcAttr = target.attributes.src;
  
//   this.imgSrc = srcAttr.nodeValue;
//   console.log(this.imgSrc);
//   // this.imgStampString = timestamp.toDate();
// }
btnFunctionCancel(){
  // routerLink="/variations/project/{{passID.id}}"
  if(this.selectionFom.dirty){

        Swal.fire({

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
            this.router.navigate(['/selections/project/'+this.passID.id]);
          } 
        
        })

  }else{
    this.router.navigate(['/selections/project/'+this.passID.id]);
  }

}

btnFunctionList(){
  if(this.selectionFom.dirty){

    Swal.fire({

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
            this.router.navigate(['/selections/project/'+this.passID.id]);
          } 
        
        })

  }else{
    this.router.navigate(['/selections/project/'+this.passID.id]);
  }

}

}

@Component({
  selector: 'tableitems-adddialog',
  templateUrl: 'tableitems-adddialog.html',
})

export class TableItemsAddDialog implements OnInit {

  selectionFom: FormGroup;
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
  items;
  imgSrc;
  
  currentWebWorker: false
  maxSizeMB: number = 1
  maxWidthOrHeight: number = 1024
  isUpdatedImage = false;
  
  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableItemsAddDialog>,
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
    return this.selectionFom.controls;
  }
  
  getFBUom(): void {
    this.data_api.getFBUom().subscribe(data => {
      console.log(data);

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

   
      if (this.selectionFom.invalid) {

        this.findInvalidControls();
        return;
    } 
    this.dialogRef.close(this.selectionFom.value);

  }

  resetImage(){

    this.selectionFom.patchValue({
      itemImage: this.placeholderImage.placeholderImage1,
      hasImage: false
    });
    this.isUpdatedImage = false;

  }

  ngOnInit() {
    this.getAdminSettings();
    this.selectionFom = this.formBuilder.group({
      itemName: '',
      supplier: '',
      description:  ['', Validators.required],
      quantity: ['', Validators.required],
      uom: ['', Validators.required],
      unitCost: ['', Validators.required],
      subTotal : '',
      buildersMargin: ['', Validators.required],
      gst: '',
      itemTotal: '',
      itemImage:'',
      hasImage: '',
      imageCaption: '',
    }, {
    });

    console.log(this.data)
    this.listTrades = this.data.listTrades;
  
    this.getFBUom();

    this.initializeFilterTrades();

    this.selectionFom.patchValue({
      itemImage: this.placeholderImage.placeholderImage1,
      hasImage: false
    });

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
      const dialogRef = this.dialog.open(UomAddDialog, {
          width: '400px',
          data: this.adminData
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
          if(result){   
                setTimeout(() => {

                  this.selectionFom.patchValue({
                    uom: result.toString(),
                  });

                  this.initializeFilterUom();
                }, 1000); 
          }
      });
      
  }

  public onComputeTotal(){

      let _quantity = this.selectionFom.value.quantity;
      let _unitCost = this.selectionFom.value.unitCost;

      let _subtotal = _quantity *  _unitCost;
      let _taxRate = 10;
      let _bmpercentage = this.selectionFom.value.buildersMargin;
      let _bmp_subtotal = (_bmpercentage * _subtotal) / 100;
      let _gst = ((_subtotal + _bmp_subtotal) * _taxRate) /  100;
      let _itemTotal = _gst + _bmp_subtotal + _subtotal;
      
      console.log(_subtotal);
      this.selectionFom.patchValue({
          subTotal: _subtotal.toFixed(2),
          gst: _gst.toFixed(2),
          itemTotal: _itemTotal.toFixed(2)
      });

  }

  public findInvalidControls() {
    const invalid = [];
    const controlsVariation = this.selectionFom.controls;

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

    console.log(controlsVariation);
    console.log(invalid);

    let htmlVal = '';

    invalid.forEach( data => {
        htmlVal += data + ' <br>'
    });

    Swal.fire({
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
  
          console.log(imageFile);
  
          // Crop Lnadscape images and convert to base64
          const imageCropped = await this.fileListToBase64(event.target.files);
  
          // Convert Base64 to File
         
          console.log(imageCropped);
  
          // Convert Base64 to File
          const compressedFiles = await  Promise.all(
            imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
          )
  
  
          // Compress File
          const compressedFiles2 = await  Promise.all(
            await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
          )
          
          console.log(compressedFiles2);
  
  
          let reader = new FileReader();
  
          reader.readAsDataURL(compressedFiles2[0]);


          reader.onload = () => {


              this.selectionFom.patchValue({
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

export class TableItemsEditDialog implements OnInit {

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

  currentWebWorker: false
  maxSizeMB: number = 1
  maxWidthOrHeight: number = 1024
  isUpdatedImage = false;

  items;
  imgSrc2;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableItemsEditDialog>,
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
      console.log(data);

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
          description: [this.items, Validators.required],
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

        console.log(this.data);

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
        
        console.log(this.editForm.value);

        this.getFBUom();

        this.listTrades = this.data.listTrades;
        this.initializeFilterTrades();
        
        // console.log(this.placeholderImage.placeholderImage1);
        // console.log(this.data.itemImage);
        // if( (this.placeholderImage.placeholderImage1 != this.data.itemImage) && (this.placeholderImage.placeholderImage2 != this.data.itemImage) ){
        //   this.isUpdatedImage = true;
        // }

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
      const dialogRef = this.dialog.open(UomAddDialog, {
          width: '400px',
          data: this.adminData
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
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
      
      console.log(_subtotal);
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

      console.log(controlsVariation);
      console.log(invalid);

      let htmlVal = '';

      invalid.forEach( data => {
          htmlVal += data + ' <br>'
      });

      Swal.fire({
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
  
          console.log(imageFile);
  
          // Crop Lnadscape images and convert to base64
          const imageCropped = await this.fileListToBase64(event.target.files);
  
          // Convert Base64 to File
         
          console.log(imageCropped);
  
          // Convert Base64 to File
          const compressedFiles = await  Promise.all(
            imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
          )
  
  
          // Compress File
          const compressedFiles2 = await  Promise.all(
            await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
          )
          
          console.log(compressedFiles2);
  
  
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
  selector: 'variations-edit-user-add-owner-dialog',
  templateUrl: 'useraddownerdialog.html',
})


export class UserAddOwnerDialogEdit implements OnInit {

  selectionFom: FormGroup;
  userDetails;
  accountFirebase;
  itemUserAccounts = [];
  
  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserAddOwnerDialogEdit>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.selectionFom.controls;
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
      this.data_api.checkFBUserExist(this.selectionFom.value.userEmail).pipe(first()).subscribe(data => {
        console.log(data);

          if(data.length > 0){

            this.spinnerService.hide();

            this.selectionFom.controls['userEmail'].reset()

            Swal.fire({
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

      if (this.selectionFom.invalid) {
        Swal.fire({
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

      if (this.selectionFom.value.password.length < 6) {
        Swal.fire({
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

      this.selectionFom.patchValue({
          userAccounts: this.itemUserAccounts,
      });

      console.log(this.selectionFom.value);

      this.spinnerService.show();
      this.data_api.createUser(this.selectionFom.value).then(() => {
            console.log('Created new Owner successfully!');

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
    this.selectionFom = this.formBuilder.group({
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

    this.selectionFom.patchValue({
      userRole: "project_owner"
    });

    this.getAdminSettings();
    this.accountFirebase = this.data_api.getCurrentProject();

  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  getAdminSettings(){
    this.data_api.getFBAdminSettings().subscribe((data) => {
        console.log(data);
        if(data){
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
          if(data.emailHeaderNewUser){
            this.selectionFom.patchValue({
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


export class UomAddDialog implements OnInit {

  selectionFom: FormGroup;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UomAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.selectionFom.controls;
  }
  
  public addNewUom() {

   
      if (this.selectionFom.invalid) {

        Swal.fire({
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

      this.data_api.createFBUomDaily(this.selectionFom.value.uom).then((result) => {
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
    this.adminData = this.data;
    this.colorBtnDefault = this.data.colourEnabledButton ? this.data.colourEnabledButton : '';

    this.selectionFom = this.formBuilder.group({
      uom: ['', Validators.required],
    }, {
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
  selector: 'external-quotesdialog',
  templateUrl: 'external-quotesdialog.html',
})


export class ExternalQuotesEditDialog implements OnInit {

  selectionFom: FormGroup;
  private pdfSrcs = [];
  private rep = [];
  private tbdPDF = [];

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ExternalQuotesEditDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private afStorage: AngularFireStorage,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.selectionFom.controls;
  }

  removePDF(i){
    // this.pdfSrcs.splice(i, 1);
    this.rep[i] = true;
  }

  cancelRemovePDF(i){
    // this.pdfSrcs.splice(i, 1);
    this.rep[i] = false;
  }
  
  public async confirmRemove() {
    // this.dialogRef.close(this.pdfSrcs);

    for (let i = 0; i < this.rep.length; i++) {
        console.log(this.rep[i]);
        if(this.rep[i] == true){
          // this.pdfSrcs.splice(i, 1);
          this.tbdPDF.push(this.data[i]);
          console.log(i)
        }
    }
    console.log(this.pdfSrcs);
    console.log(this.tbdPDF);
   
    let arrayDiff = this.pdfSrcs.filter(x => !this.tbdPDF.includes(x));

    //Delete Selected PDF
    if(this.tbdPDF){
      for (let tbdpdf of this.tbdPDF) { 
        await this.afStorage.storage.refFromURL(tbdpdf).delete();
      }
    }
    this.dialogRef.close(arrayDiff);
  }

  ngOnInit() {
    this.getAdminSettings();
    console.log(this.data)
    // this.pdfSrcs = this.data
    // this.addFestForm = this.formBuilder.group({
    //   pdfSrcs: ['']
    // }, {
    // });
    let cutData = [...this.data];
    // this.addFestForm.patchValue({
    //   pdfSrcs: cutData
    // });

    this.pdfSrcs = cutData
    

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
  selector: 'approve-admindialog',
  templateUrl: 'approve-admindialog.html',
})

export class ApproveAdminDialog implements OnInit {

  selectionFom: FormGroup;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ExternalQuotesEditDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private afStorage: AngularFireStorage,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.selectionFom.controls;
  }
  
  public async confirmApprove() {

      if (this.selectionFom.controls['comments'].invalid){
          Swal.fire({
              title: "Please leave some comments",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })

          return;
      }

      if(this.selectionFom.controls['approveSelection'].value != true){
          Swal.fire({
              title: "Please acknowledge and approve the proposed selection",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })

          return;
      }


      this.dialogRef.close(this.selectionFom.value);

  }

  ngOnInit() {
    this.getAdminSettings();
    console.log(this.data)
    // this.pdfSrcs = this.data
    this.selectionFom = this.formBuilder.group({
      comments: ['', Validators.required],
      approveSelection: ['', Validators.required],
    }, {
    });
    
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
  selector: 'approve-viewdialog',
  templateUrl: 'approve-viewdialog.html',
})

export class ApproveViewDialog implements OnInit {

  // addFestForm: FormGroup;

  adminData;
  comments;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ExternalQuotesEditDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private afStorage: AngularFireStorage,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  // get g(){
  //   return this.addFestForm.controls;
  // }
  

  ngOnInit() {
    this.getAdminSettings();
    console.log(this.data);
    this.comments = this.data
    // this.pdfSrcs = this.data
    // this.addFestForm = this.formBuilder.group({
    //   comments: ['', Validators.required],
    //   approveVariation: ['', Validators.required],
    // }, {
    // });
    
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
  selector: 'tablegroupname-adddialog',
  templateUrl: 'tablegroupname-adddialog.html',
})

export class TableVarGroupNameAddEditDialog implements OnInit {

  selectionFom: FormGroup;
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
    public dialogRef: MatDialogRef<TableVarGroupNameAddEditDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.selectionFom.controls;
  }

  
  public addNewGroupName() {

      if (this.selectionFom.invalid) {
        Swal.fire({
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
    this.dialogRef.close(this.selectionFom.value);

  }

  ngOnInit() {

    this.adminData = this.data.adminData;
    this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

    this.selectionFom = this.formBuilder.group({
      groupName: ['', Validators.required],
      // search_control_visitor: [null],
      // search_control_reason: [null],
    }, {
    });

    console.log(this.data)
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
    console.log(hoverName);
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
    const dialogRef = this.dialog.open(VarGroupNamesAddEditDialog, {
        width: '400px',
        data: this.adminData
    });

    dialogRef.afterClosed().subscribe(result => {
        console.log(result);
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
                  this.selectionFom.get("groupName").patchValue(result.toString());
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

export class VarGroupNamesAddEditDialog implements OnInit {

  selectionFom: FormGroup;

  public userDetails;

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<VarGroupNamesAddEditDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.selectionFom.controls;
  }

  public addLog(id){
      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Variation Group Name - Global List',
          method: 'create',
          subject: 'groupname',
          subjectID: id,
          data: this.selectionFom.value,
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

      if (this.selectionFom.invalid) {

        Swal.fire({
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

      console.log(this.selectionFom.value.supplierName);
      
      this.data_api.createFBVarGroupNameDaily(this.selectionFom.value.groupName).then((result) => {

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

    this.selectionFom = this.formBuilder.group({
      groupName: ['', Validators.required],
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