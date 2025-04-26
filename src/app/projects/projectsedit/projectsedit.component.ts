import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, ɵConsole} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import { DatasourceService } from '../../services/datasource.service';
import { PdfImage } from '../../services/pdf-image';
import { PreviewImage } from '../../services/preview-image';
import { Observable, Observer } from "rxjs";
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
//import { MatDialog, MatDialogRef, MatCalendarBody } from '@angular/material';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
import {MatChipInputEvent} from '@angular/material/chips';
import {ActivatedRoute, Params, Router} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { ConfirmedValidator  } from '../../services/confirm-password.validator';
// import {NgxImageCompressService} from 'ngx-image-compress';
import {countries} from '../../services/country-data-store'
import { RoleChecker } from '../../services/role-checker.service';
import imageCompression from 'browser-image-compression';
import { ReplaySubject, Subject } from 'rxjs';
import { first, take, takeUntil, finalize, startWith } from 'rxjs/operators';
import { MatSelect as MatSelect } from '@angular/material/select';
import {Location, Appearance, GermanAddress} from '@angular-material-extensions/google-maps-autocomplete';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import {MatDialog as MatDialog, MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/dialog';

import PlaceResult = google.maps.places.PlaceResult;
declare const $: any;

@Component({
  selector: 'app-projectsedit',
  templateUrl: './projectsedit.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class ProjectsEditComponent implements OnInit {

    public passID: any;
    public agentData;
    editForm: FormGroup;
    formSubmitted = false;
    visible: boolean = true;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    separatorKeysCodes = [ENTER, COMMA];
    public projectOwners:any = [];
    public projectWorkers:any = [];
    public siteSupervisors:any = [];
    public altSupervisors:any = [];
    public recipientVariation:any = [];
    public recipientSelection:any = [];
    public recipientRFI:any = [];

    public setProjectOwners = [];
    public setProjectWorkers = [];
    public setAltSupervisors = [];

    public setRecipientVariation = [];
    public setRecipientSelection = [];
    public setRecipientRFI = [];

    public projectStatus;
    public projectData;
    public imageURLRaw;
    public imageURL;
    public imageSize = 0;
    public rawTotalHrs;
    public adjustedDate;
    public totalHours;
    public rawAimedDate;
    public selectedBG;
    public projVarNo;
    public projSelNo;
    public projRFINo;

    currentWebWorker: false
    maxSizeMB: number = 1
    maxWidthOrHeight: number = 1024

    public countries:any = countries
    public prevdata;

    projectOwnerControl = new FormControl([]);
    projectWorkerControl = new FormControl([]);
    altSupervisorControl = new FormControl([]);

    recipientVariationControl = new FormControl([]);
    recipientSelectionControl = new FormControl([]);
    recipientRFIControl = new FormControl([]);

    statusOption = [
      {value: 'active', viewValue: 'Active'},
      {value: 'complete', viewValue: 'Inactive'},
    ]

    projectBackgrounds = [
      {value: 'bgpdf', viewValue: 'Default Background'},
      {value: 'bgpdf2', viewValue: 'Background 2'},
      {value: 'bgpdf3', viewValue: 'Background 3'},
      {value: 'bgpdf4', viewValue: 'Background 4'},
      {value: 'bgpdf5', viewValue: 'Background 5'},
      {value: 'bgpdf6', viewValue: 'Background 6'},
      {value: 'bgpdf7', viewValue: 'Background 7'},
      {value: 'bgpdf8', viewValue: 'Blank Background'},
    ]

    public userDetails;

    public filter_list_countries: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public filter_list_supervisors: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public filter_list_altsupervisors: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public filter_list_workers: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public filter_list_owners: ReplaySubject<[]> = new ReplaySubject<[]>(1);

    public search_control_country: FormControl = new FormControl();
    public search_control_supervisor: FormControl = new FormControl();
    public search_control_altsupervisor: FormControl = new FormControl();
    public search_control_worker: FormControl = new FormControl();
    public search_control_owner: FormControl = new FormControl();

    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
    @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

    protected _onDestroy = new Subject<void>();

    accountFirebase;
    projUploadFolder;
    downloadURL;

    adminData;

    colorBtnDefault;

    colorHlightDefault;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private data_api: DatasourceService,
        private spinnerService: NgxSpinnerService,
        public authService: AuthenticationService,
        private formBuilder: FormBuilder,
        public pdfImage: PdfImage,
        public dialog: MatDialog,
        private previewImage: PreviewImage,
        public datepipe: DatePipe,
        private rolechecker: RoleChecker,
        private afStorage: AngularFireStorage,
        // private imageCompress: NgxImageCompressService
        ) { }

        ngOnInit() {
          //this.rolechecker.check(4)
          //console.log(countries);
          this.passID = {
              id: this.route.snapshot.params['id'],
          };
          this.route.params

          .subscribe(
              (params: Params) => {
                  this.passID.id = params['id'];
              }
          );
          
          this.getAdminSettings();

          this.editForm = this.formBuilder.group({
              projectName: ['', Validators.required],
              clientName: ['', Validators.required],
              jobNumber: [''], 
              projectAddress: [''],
              latitude: [''],
              longitude: [''],
              // countryCode: ['', Validators.required],
              // zipcode: ['', Validators.required],
              projectStatus: [''],// ['', Validators.required],
              projectOwner: [''],
              projectWorker: [''],
              recipientVariation: [''],
              recipientSelection: [''],
              recipientRFI: [''],
              imageBackground: [''],
              imageSize: [''],
              imageFile: [''],
              siteSupervisor: ['', Validators.required],
              altSupervisor: [''],
              aimedComDate: ['', Validators.required],
              lostTotalDays: [''],
              lostTotalHours: [''],
              bgName: [''],
              clientEmail: ['', Validators.required],
              clientEmailCC: [''],
              clientEmailBCC: [''],
              VariationEmailCC : [''],
              VariationEmailBCC : [''],
              selectionEmailCC : [''],
              selectionEmailBCC : [''],
              rfiEmailCC : [''],
              rfiEmailBCC : [''],
              directFolderEmail: [''],
              siteContact: [''],
              contactPhone: [''],
              clientAddress: [''],
              varProjStartNumber: [''],
              selProjStartNumber : [''],
              rfiProjStartNumber : [''],
              bmLineitem : [''],
              bmTotalFigure : [''],
              bmHideAll : [''],
              qtyHideAll : [''],
              unitHideAll : [''],
              unitCostHideAll : [''],
              gstHideAll : [''],
              itemTotalHideAll : [''],
          });
          this.getFBProjectUsers();

          //this.initializeFilterCountries();
              
          // if (localStorage.getItem('currentUser')) {
          //   this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
          // }
          this.accountFirebase = this.data_api.getCurrentProject();
            
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
            this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    ngOnDestroy() {
      this._onDestroy.next();
      this._onDestroy.complete();
    }

    initializeFilterCountries() {

      this.filter_list_countries.next(this.countries.slice());

        this.search_control_country.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListCountries();
        });

    }

    initializeFilterSupervisors() {

      this.filter_list_supervisors.next(this.siteSupervisors.slice());

        this.search_control_supervisor.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListSupervisors();
        });
    }

    initializeFilterAltSupervisors() {

      this.filter_list_altsupervisors.next(this.altSupervisors.slice());

        this.search_control_altsupervisor.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListAltSupervisors();
        });
    }

    initializeFilterWorkers() {

      this.filter_list_workers.next(this.projectWorkers.slice());

        this.search_control_worker.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListWorkers();
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

    protected filterListCountries() {
        if (!this.countries) {
          return;
        }
        // get the search keyword
        let search = this.search_control_country.value;
        if (!search) {
          this.filter_list_countries.next(this.countries.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        // filter the banks
        this.filter_list_countries.next(
          this.countries.filter(country => country.name.toLowerCase().indexOf(search) > -1)
        );
    }

    protected filterListSupervisors() {
        if (!this.siteSupervisors) {
          return;
        }
        // get the search keyword
        let search = this.search_control_supervisor.value;
        if (!search) {
          this.filter_list_supervisors.next(this.siteSupervisors.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        // filter the banks
        this.filter_list_supervisors.next(
          this.siteSupervisors.filter(siteSupervisor => siteSupervisor.name.toLowerCase().indexOf(search) > -1)
        );
    }

    protected filterListAltSupervisors() {
        if (!this.altSupervisors) {
          return;
        }
        // get the search keyword
        let search = this.search_control_altsupervisor.value;
        if (!search) {
          this.filter_list_altsupervisors.next(this.altSupervisors.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        // filter the banks
        this.filter_list_altsupervisors.next(
          this.altSupervisors.filter(altSupervisor => altSupervisor.name.toLowerCase().indexOf(search) > -1)
        );
    }


    protected filterListWorkers() {
        if (!this.projectWorkers) {
          return;
        }
        // get the search keyword
        let search = this.search_control_worker.value;
        if (!search) {
          this.filter_list_workers.next(this.projectWorkers.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        // filter the banks
        this.filter_list_workers.next(
          this.projectWorkers.filter(projectWorker => projectWorker.name.toLowerCase().indexOf(search) > -1)
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

    onToppingRemoved(topping, index: number) {

      const newToppings = this.projectOwnerControl.value.filter((_, i) => i !== index);
      this.projectOwnerControl.patchValue(newToppings);

      const clientEmail = this.editForm.get('clientEmail') as FormArray;
      clientEmail.removeAt(clientEmail.value.findIndex(email => email === topping.email));
    }

    onToppingRemoved2(index: number){
      const newToppings = this.projectWorkerControl.value.filter((_, i) => i !== index);
      this.projectWorkerControl.patchValue(newToppings);
    }

    onToppingRemoved3(index: number){
      const newToppings = this.altSupervisorControl.value.filter((_, i) => i !== index);
      this.altSupervisorControl.patchValue(newToppings);
    }

    onToppingRemovedVariation(index: number){
      const newToppings = this.recipientVariationControl.value.filter((_, i) => i !== index);
      this.recipientVariationControl.patchValue(newToppings);
    }

    onToppingRemovedSelection(index: number){
      const newToppings = this.recipientSelectionControl.value.filter((_, i) => i !== index);
      this.recipientSelectionControl.patchValue(newToppings);
    }

    onToppingRemovedRFI(index: number){
      const newToppings = this.recipientRFIControl.value.filter((_, i) => i !== index);
      this.recipientRFIControl.patchValue(newToppings);
    }

    toggleBMLineitem(){

      if(this.editForm.value.bmLineitem){
          this.editForm.patchValue({
            bmHideAll: false,
          });
      }
  
    }
  
    toggleBMTotalFigure(){
  
      if(this.editForm.value.bmTotalFigure){
          this.editForm.patchValue({
            bmHideAll: false,
          });
      }
  
    }
  
    toggleBMHideAll(){
  
      if(this.editForm.value.bmHideAll){
          this.editForm.patchValue({
            bmLineitem: false,
            bmTotalFigure: false
          });
      }
  
    }
    
    ownerSelectChange(event)
    {
      if(event.isUserInput) {
        console.log(event.source.value, event.source.selected);
          if(event.source.selected == true){
                let tempArray = [event.source.value.email, ...this.editForm.value.clientEmail];
                this.editForm.patchValue({
                  clientEmail: tempArray
                });
              // const clientEmail = this.editForm.get('clientEmail') as FormArray;
              // clientEmail.push(this.formBuilder.control(event.source.value.email));
          }else{
              let tempArray = this.editForm.value.clientEmail;
              var index = tempArray.indexOf(event.source.value.email);
              if (index !== -1) {
                tempArray.splice(index, 1);
                this.editForm.patchValue({
                  clientEmail: tempArray
                });
              }
              // const clientEmail = this.editForm.get('clientEmail') as FormArray;
              // clientEmail.removeAt(clientEmail.value.findIndex(email => email === event.source.value.email));
          }

      }
    }

    public getFBProjectUsers(){
   
        this.data_api.getFBUsersOrderedFname().subscribe((data) => {
              console.log(data);
                if(data){

                  // this.projectOwners = [];
                  // this.projectWorkers = [];
                  // this.siteSupervisors = [];
                  // this.altSupervisors = [];
                  
                    data.forEach(data =>{  

                      if(!data.password){  
                          if( (data.userRole == 'project_owner') && (!this.findObjectByKey(this.projectOwners, 'id', data.id)) ){
                            this.projectOwners.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName,email: data.userEmail})
                          }

                          if( (data.userRole == 'project_worker') && (!this.findObjectByKey(this.projectWorkers, 'id', data.id)) ){
                            this.projectWorkers.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                          }

                          if( (data.userRole == 'project_supervisor') && (!this.findObjectByKey(this.siteSupervisors, 'id', data.id)) ){
                            this.siteSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                            this.altSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                          }
                      } 
                          
                    })
                }
                
                this.initializeFilterOwners();
                this.initializeFilterWorkers();
                this.initializeFilterSupervisors();
                this.initializeFilterAltSupervisors();
                
                if(!this.projectData){
                  this.getFBProject();
                }
                
          }
        );
      }

      // public getProjectWorkers(){
   
      //   this.data_api.getProjectWorkers().subscribe((data) => {
  
      //           data.forEach(data =>{      
      //               this.projectWorkers.push({id:JSON.stringify(data.id),name: data.name})  
      //           })
      //           console.log(this.projectWorkers);

      //           this.initializeFilterWorkers();

      //           this.getSupervisors();  
      //     }
      //   );
      // }

    //   public getSupervisors(){
    //     // this.spinnerService.show();

    //       this.data_api.getProjectSupervisors().subscribe((data) => {
    //           console.log(data);
    //           data.forEach(data =>{ 
    //               this.siteSupervisors.push({id:JSON.stringify(data.id),name: data.name})
    //               this.altSupervisors.push({id:JSON.stringify(data.id),name: data.name});
    //           })

    //           this.initializeFilterSupervisors();
    //           this.initializeFilterAltSupervisors();

    //           this.getProject();
    //       });
    // }
    
    //   addClientEmail(event: MatChipInputEvent): void {
    //       let input = event.input;
    //       let value = event.value;
  
    //       // Add our dcbAccThisWeek
    //       if ((value || '').trim()) {
    //           const clientEmail = this.editForm.get('clientEmail') as FormArray;
    //           clientEmail.push(this.formBuilder.control(value.trim()));
    //       }
  
    //       // Reset the input value
    //       if (input) {
    //           input.value = '';
    //       }
    //   }
  
    //   removeClientEmail(index: number): void {
    //       const clientEmail = this.editForm.get('clientEmail') as FormArray;
  
    //       if (index >= 0) {
    //         clientEmail.removeAt(index);
    //       }
    //   }
  
    //   addClientEmailCC(event: MatChipInputEvent): void {
    //       let input = event.input;
    //       let value = event.value;
  
    //       // Add our dcbAccThisWeek
    //       if ((value || '').trim()) {
    //           const clientEmailCC = this.editForm.get('clientEmailCC') as FormArray;
    //           clientEmailCC.push(this.formBuilder.control(value.trim()));
    //       }
  
    //       // Reset the input value
    //       if (input) {
    //           input.value = '';
    //       }
    //   }
  
    //   removeClientEmailCC(index: number): void {
    //       const clientEmailCC = this.editForm.get('clientEmailCC') as FormArray;
  
    //       if (index >= 0) {
    //         clientEmailCC.removeAt(index);
    //       }
    //   }
  
    //   addClientEmailBCC(event: MatChipInputEvent): void {
    //     let input = event.input;
    //     let value = event.value;
  
    //     // Add our dcbAccThisWeek
    //     if ((value || '').trim()) {
    //         const clientEmailBCC = this.editForm.get('clientEmailBCC') as FormArray;
    //         clientEmailBCC.push(this.formBuilder.control(value.trim()));
    //     }
  
    //     // Reset the input value
    //     if (input) {
    //         input.value = '';
    //     }
    //   }
  
    //   removeClientEmailBCC(index: number): void {
    //     const clientEmailBCC = this.editForm.get('clientEmailBCC') as FormArray;
  
    //     if (index >= 0) {
    //       clientEmailBCC.removeAt(index);
    //     }
    //   }

    //   addDirectFolderEmail(event: MatChipInputEvent): void {
    //     let input = event.input;
    //     let value = event.value;

    //     // Add our dcbAccThisWeek
    //     if ((value || '').trim()) {
    //         const directFolderEmail = this.editForm.get('directFolderEmail') as FormArray;
    //         directFolderEmail.push(this.formBuilder.control(value.trim()));
    //     }

    //     // Reset the input value
    //     if (input) {
    //         input.value = '';
    //     }
    // }
  
    // removeDirectFolderEmail(index: number): void {
    //   const directFolderEmail = this.editForm.get('directFolderEmail') as FormArray;

    //   if (index >= 0) {
    //     directFolderEmail.removeAt(index);
    //   }
// }
  
async onFileChange(event) {

  if(event.target.files && event.target.files.length) {

        const imageFile = event.target.files[0];
        
        var options = {
          maxSizeMB: this.maxSizeMB,
          maxWidthOrHeight: 500,
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

        this.imageSize = compressedFiles2[0].size;

        let reader = new FileReader();

        reader.readAsDataURL(compressedFiles2[0]);

        reader.onload = () => {

            this.editForm.patchValue({
              imageFile: reader.result,
              imageSize: this.imageSize
            });
            
            this.imageURL = reader.result;

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

    public formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    public addLog(){
        // let newDetails;
        // newDetails += 'Company:';

        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Updated a Project',
            method: 'update',
            subject: 'project',
            subjectID: this.passID.id,
            prevdata: this.prevdata,
            data: this.editForm.value,
            url: window.location.href
        }
        
        this.data_api.addActivityLog(this.userDetails.user_id,passData)
          .subscribe(
            (result) => {
              console.log(result);
                  setTimeout(function(){
                    window.location.reload();
                  }, 1000);  
            }
        ); 
    }

    public findInvalidControls() {
        const invalid = [];
        const controls = this.editForm.controls;
        for (const name in controls) {
            if (controls[name].invalid) {
                if(name == 'projectName'){
                  invalid.push('Project Name');
                }else if(name == 'clientName'){
                  invalid.push('Client Name/s');
                }else if(name == 'siteSupervisor'){
                  invalid.push('Site Supervisor');
                }else if(name == 'aimedComDate'){
                  invalid.push('Expected Completion Date');
                }else if(name == 'clientEmail'){
                  invalid.push('Client Email Addresses');
                }
            }
        }
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

    get clientEmail() { return this.editForm.get('clientEmail'); }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async saveStep1(){
      this.formSubmitted = true;
        if (this.editForm.invalid) {
          this.findInvalidControls();
          // swal.fire({
          //     title: "Please fill required fields!",
          //     // text: "You clicked the button!",
          //     buttonsStyling: false,
          //     customClass: {
          //       confirmButton: 'btn btn-success',
          //     },
          //     icon: "error"
          // })

          return;
      } 

      if( (this.editForm.controls.varProjStartNumber.dirty) && (this.projVarNo >=  this.editForm.value.varProjStartNumber)){
          swal.fire({
              title: "Please set the Variation Starting Number field higher than the project's current variation number to prevent duplication.",
              // text: "You clicked the button!",
              buttonsStyling: false,
              customClass: {
                  confirmButton: 'btn btn-success',
              },
              icon: "error"
          })
          return;
      } 

      if (this.editForm.controls.selProjStartNumber.dirty && this.projSelNo >= this.editForm.value.selProjStartNumber) {
        swal.fire({
          title: "Please set the Selection Starting Number field higher than the project's current selection number to prevent duplication.",
          buttonsStyling: false,
          customClass: {
            confirmButton: 'btn btn-success',
          },
          icon: "error"
        });
        return;
      }

      if (this.editForm.controls.rfiProjStartNumber.dirty && this.projRFINo >= this.editForm.value.rfiProjStartNumber) {
        swal.fire({
          title: "Please set the RFI Starting Number field higher than the project's current RFI number to prevent duplication.",
          buttonsStyling: false,
          customClass: {
            confirmButton: 'btn btn-success',
          },
          icon: "error"
        });
        return;
      }


      this.spinnerService.show();
      
      await this.delay(250);

      if( (JSON.stringify(this.imageURLRaw) != JSON.stringify(this.imageURL)) ){
          
          let id = Math.random().toString(36).substring(2);
          //let ref = this.afStorage.ref(rootFolder+'/'+this.timeForm.value.uploadFolder+'/Timesheet/'+folderName+'/'+id);
          let ref = this.afStorage.ref(this.accountFirebase+'/project-images/'+id);
          //let base64String = base64image.split(',').pop();
          let task = ref.putString(this.editForm.value.imageFile, 'data_url');
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
                  this.editForm.patchValue({
                    imageFile: this.downloadURL
                  });
                  this.updateFBProject();
                // } 
              });
          })).subscribe();

      }else{
        this.updateFBProject();
      }
    }

    updateFBProject(): void {

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

     let ownerList = this.projectOwnerControl.value;
     let ownerIDS = [];
     
     if(ownerList){

         ownerList.forEach( data => {
             ownerIDS.push(data.id);
         });

         this.editForm.patchValue({
           projectOwner: ownerIDS
         });
     }
 
     let workerList = this.projectWorkerControl.value;
     let workerIDS = [];
     
     if(workerList){

       workerList.forEach( data => {
         workerIDS.push(data.id);
         });

         this.editForm.patchValue({
           projectWorker: workerIDS
         });
     }

     let altSupervisorList = this.altSupervisorControl.value;
     let altSupervisorIDS = [];
     
     if(altSupervisorList){

       altSupervisorList.forEach( data => {
         altSupervisorIDS.push(data.id);
         });

         this.editForm.patchValue({
           altSupervisor: altSupervisorIDS
         });
     }

     let recipientVariationList = this.recipientVariationControl.value;
     let recipientVariationIDS = [];
      
     if(recipientVariationList){

        recipientVariationList.forEach( data => {
          recipientVariationIDS.push(data.id);
          });

          this.editForm.patchValue({
            recipientVariation: recipientVariationIDS
          });
      }

      let recipientSelectionList = this.recipientSelectionControl.value;
      let recipientSelectionIDS = [];
      
      if(recipientSelectionList){

        recipientSelectionList.forEach( data => {
          recipientSelectionIDS.push(data.id);
          });

          this.editForm.patchValue({
            recipientSelection: recipientSelectionIDS
          });
      }

      let recipientRFIList = this.recipientRFIControl.value;
      let recipientRFIIDS = [];
      
      if(recipientRFIList){

        recipientRFIList.forEach( data => {
          recipientRFIIDS.push(data.id);
          });

          this.editForm.patchValue({
            recipientRFI: recipientRFIIDS
          });
      }


      console.log(this.editForm.value);
      this.data_api.updateFBProject(this.passID.id, this.editForm.value).then(() => {
          if(this.imageURLRaw){
              if( (JSON.stringify(this.imageURLRaw) != JSON.stringify(this.imageURL)) ){

                this.afStorage.storage.refFromURL(this.imageURLRaw).delete();
    
              }
          }

          console.log('Updated item successfully!');
          this.spinnerService.hide();
          this.router.navigate(['/projects']);
          $.notify({
            icon: 'notifications',
            message: 'New Project Updated'
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

      public modalArchiveProject() {

          swal.fire({
              // title: 'Are you sure?',
              text: "Are you Sure you want to Archive this Project?",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, Archive it',
              cancelButtonText: 'No, Cancel it',
              customClass: {
                confirmButton: 'btn dcb-btn',
                cancelButton: "btn dcb-btn",
              },
              buttonsStyling: false
          }).then((result2) => {
            if(result2.value){
                this.archiveProject();
            }else{
          
            }
          })

      }

      public archiveProject() {
        this.spinnerService.show();
          this.data_api.archiveWeeklyReportsProjects1(this.passID.id).subscribe((data1) => {
               if(data1){
                  console.log(data1);
                  this.data_api.archiveWeeklyReportsProjects2(data1).subscribe((data2) => {
                        console.log(data2);
                        if(data2){

                            this.data_api.archiveWeeklyReportsProjects3(this.passID.id).subscribe((data3) => {
                                  if(data3){
                                    console.log(data3);

                                    swal.fire({
                                        title: "Project Archived.",
                                        // text: "You clicked the button!",
                                        buttonsStyling: false,
                                        customClass: {
                                          confirmButton: 'btn dcb-btn',
                                        },
                                        icon: "success"
                                    })
                            
                                      this.spinnerService.hide();
                                      this.router.navigate(['/projects']);
                                    }
                            });

                        }
                  }); 

               }
          }); 
          
      }
      
      public addLostDaysHrs(){

        this.totalHours = (+this.editForm.value.lostTotalDays * 8) + +this.editForm.value.lostTotalHours
    
        this.adjustedDate = this.getFinalAimedDate(this.rawAimedDate,this.totalHours)
  
      }

      checkBooleanVariationSettings(value){
          if( ((value == true) || (value == false)) && (value !== '') ){
            return true;
          }else{
            return false;
          }
      }

      getFBProject(): void {
        this.spinnerService.show();
        this.data_api.getFBProject(this.passID.id).subscribe(data => {
          console.log('project data',data);
            if(data){
                  this.projectData = data;
                  // this.editForm.reset();
                  this.setProjectOwners = [];
                  this.setProjectWorkers =[];
                  this.setAltSupervisors =[];
                  this.setRecipientVariation = [];
                  this.setRecipientSelection = [];
                  this.setRecipientRFI = [];
                  // let clientEmails;
                  // let clientEmailsCC;
                  // let clientEmailsBCC;
                  // let directFolderEmails;
                  let projectOwnerIDs;
                  let projectWorkerIDs;
                  let altSupervisorIDS;
                  let recipientVariationIDS;
                  let recipientSelectionIDS;
                  let recipientRFIIDS;

                  //this.rawTotalHrs = this.agentData[0].total_hours;
                  this.rawAimedDate = data.aimedComDate;
                  this.projectStatus = data.projectStatus;
                  this.selectedBG = this.pdfImage[data.bgName];
                  this.projVarNo = data.counterVariation ? data.counterVariation : '';
                  this.projSelNo = data.counterSelection ? data.counterSelection : '';
                  this.projRFINo = data.counterRFI ? data.counterRFI : '',
                  console.log(data.projectOwner,);
                  //this.adjustedDate = this.getFinalAimedDate(this.agentData[0].aimed_date,this.agentData[0].total_hours);

                  this.editForm.patchValue({
                    projectName: data.projectName,
                    clientName: data.clientName,
                    jobNumber:  data.jobNumber ? data.jobNumber: '',
                    // projectOwner:  this.agentData[0].project_owner_id,
                    projectAddress:  data.projectAddress,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    // countryCode:  this.agentData[0].country_code,
                    // zipcode:  this.agentData[0].zip_code,
                    projectStatus:  data.projectStatus,
                    siteSupervisor: data.siteSupervisor,
                    siteContact: data.siteContact ? data.siteContact: '',
                    contactPhone: data.contactPhone ? data.contactPhone: '',
                    clientAddress: data.clientAddress ? data.clientAddress: '',
                    altSupervisor: data.altSupervisor,
                    aimedComDate: data.aimedComDate ? data.aimedComDate.toDate() : '',
                    bgName:  data.bgName,
                    lostTotalDays: data.lostTotalDays ? data.lostTotalDays: '',
                    lostTotalHours: data.lostTotalHours ? data.lostTotalHours: '',
                    clientEmail: data.clientEmail,
                    clientEmailCC : data.clientEmailCC? data.clientEmailCC : null,
                    clientEmailBCC : data.clientEmailBCC ? data.clientEmailBCC : null,
                    VariationEmailCC : data.VariationEmailCC ? data.VariationEmailCC : null,
                    VariationEmailBCC : data.VariationEmailBCC ?  data.VariationEmailBCC : null,
                    selectionEmailCC : data.selectionEmailCC ? data.selectionEmailCC : null,
                    selectionEmailBCC : data.selectionEmailBCC ? data.selectionEmailBCC : null,
                    rfiEmailCC : data.rfiEmailCC ? data.rfiEmailCC : null,
                    rfiEmailBCC : data.rfiEmailBCC ? data.rfiEmailBCC : null,
                    directFolderEmail : data.directFolderEmail ? data.directFolderEmail : null,
                    imageFile: data.imageFile,
                    varProjStartNumber: data.varProjStartNumber ? data.varProjStartNumber : 1,
                    selProjStartNumber: data.selProjStartNumber ? data.selProjStartNumber : 1,
                    rfiProjStartNumber: data.rfiProjStartNumber ? data.rfiProjStartNumber : 1,
                    bmHideAll: this.checkBooleanVariationSettings(data.bmHideAll) ? data.bmHideAll : false,
                    bmLineitem: this.checkBooleanVariationSettings(data.bmLineitem) ? data.bmLineitem : false,
                    bmTotalFigure: this.checkBooleanVariationSettings(data.bmTotalFigure) ? data.bmTotalFigure : false,
                    qtyHideAll: this.checkBooleanVariationSettings(data.qtyHideAll) ? data.qtyHideAll : false,
                    unitHideAll: this.checkBooleanVariationSettings(data.unitHideAll) ? data.unitHideAll : false,
                    unitCostHideAll: this.checkBooleanVariationSettings(data.unitCostHideAll) ? data.unitCostHideAll : false,
                    gstHideAll: this.checkBooleanVariationSettings(data.gstHideAll) ? data.gstHideAll : false,
                    itemTotalHideAll: this.checkBooleanVariationSettings(data.itemTotalHideAll) ? data.itemTotalHideAll : false,
                  });
                  
                  // if(data.clientEmail){
                  //   clientEmails = data.clientEmail;
                    
                  //   clientEmails.forEach(value => {
                  //       console.log(value);
                  //       const ClientEmails = this.editForm.get('clientEmail') as FormArray;
                  //       ClientEmails.push(this.formBuilder.control(value));
                  //   });
                  // }

                  // if(data.clientEmailCC){
                  //   clientEmailsCC = data.clientEmailCC;

                  //   clientEmailsCC.forEach(value => {
                  //       const ClientEmailCC = this.editForm.get('clientEmailCC') as FormArray;
                  //       ClientEmailCC.push(this.formBuilder.control(value));
                  //   });

                  // }
                  
                  // if(data.clientEmailBCC){
                  //   clientEmailsBCC = data.clientEmailBCC;

                  //   clientEmailsBCC.forEach(value => {
                  //       const ClientEmailBCC = this.editForm.get('clientEmailBCC') as FormArray;
                  //       ClientEmailBCC.push(this.formBuilder.control(value));
                  //   });
                  // }

                  // if(data.directFolderEmail){
                  //   directFolderEmails = data.directFolderEmail;

                  //   directFolderEmails.forEach(value => {
                  //       const DirectFolderEmail = this.editForm.get('directFolderEmail') as FormArray;
                  //       DirectFolderEmail.push(this.formBuilder.control(value));
                  //   });
                  // }

                  if(data.projectOwner){
                    projectOwnerIDs = data.projectOwner;

                    projectOwnerIDs.forEach(value => {
                        if(this.findObjectByKey(this.projectOwners, 'id', value)){
                            var item = this.findObjectByKey(this.projectOwners, 'id', value);
                            this.setProjectOwners.push(item);
                        }
                    });

                  }

                  if(data.projectWorker){

                      projectWorkerIDs = data.projectWorker;

                      projectWorkerIDs.forEach(value => {
                        if(this.findObjectByKey(this.projectWorkers, 'id', value)){
                          var item = this.findObjectByKey(this.projectWorkers, 'id', value);
                          this.setProjectWorkers.push(item);
                        }
                        
                    });

                  }

                  if(data.altSupervisor){
                    
                    altSupervisorIDS = data.altSupervisor;

                    altSupervisorIDS.forEach(value => {
                        if(this.findObjectByKey(this.altSupervisors, 'id', value)){
                          var item = this.findObjectByKey(this.altSupervisors, 'id', value);
                          this.setAltSupervisors.push(item);
                        }
                        
                    });

                  }

                  if(data.recipientVariation){
                    
                    recipientVariationIDS = data.recipientVariation;

                    recipientVariationIDS.forEach(value => {
                        if(this.findObjectByKey(this.projectOwners, 'id', value)){
                          var item = this.findObjectByKey(this.projectOwners, 'id', value);
                          this.setRecipientVariation.push(item);
                        }
                        
                    });

                  }

                  if(data.recipientSelection){
                    
                    recipientSelectionIDS = data.recipientSelection;

                    recipientSelectionIDS.forEach(value => {
                        if(this.findObjectByKey(this.projectOwners, 'id', value)){
                          var item = this.findObjectByKey(this.projectOwners, 'id', value);
                          this.setRecipientSelection.push(item);
                        }
                        
                    });

                  }

                  if(data.recipientRFI){
                    
                    recipientRFIIDS = data.recipientRFI;

                    recipientRFIIDS.forEach(value => {
                        if(this.findObjectByKey(this.projectOwners, 'id', value)){
                          var item = this.findObjectByKey(this.projectOwners, 'id', value);
                          this.setRecipientRFI.push(item);
                        }
                        
                    });

                  }

                  
                  this.projectOwnerControl.setValue(this.setProjectOwners);
           
                  this.projectWorkerControl.setValue(this.setProjectWorkers);

                  this.altSupervisorControl.setValue(this.setAltSupervisors);

                  this.altSupervisorControl.setValue(this.setAltSupervisors);

                  this.recipientVariationControl.setValue(this.setRecipientVariation);

                  this.recipientSelectionControl.setValue(this.setRecipientSelection);

                  this.recipientRFIControl.setValue(this.setRecipientRFI);

                  // recipientVariationControl = new FormControl([]);
                  // recipientSelectionControl = new FormControl([]);
                  // recipientRFIControl = new FormControl([]);

                  // if(data.cover_file_link){

                  //     this.getBase64ImageFromURL(this.agentData[0].cover_file_link).subscribe((base64Data: string) => {   
                  //           this.imageURL = base64Data;
                  //           // this.imageURLRaw = base64Data;
                            
                  //           // this.editForm.patchValue({
                  //           //     'imageBackground': base64Data,
                  //           //     // 'imageSize': new FormControl(this.agentData[0].cover_file_size),
                  //           // });
                  //     });
                  //     this.editForm.patchValue({
                  //         'imageBackground': this.agentData[0].cover_file_link,
                  //         // 'imageSize': new FormControl(this.agentData[0].cover_file_size),
                  //     });
                  //     this.imageSize = this.agentData[0].cover_file_size;
                  // }
                  if(data.imageFile){
                    this.imageURL = data.imageFile;
                    this.imageURLRaw = data.imageFile;
                  }
                  if(data.imageSize){
                    this.imageSize = data.imageSize
                  }

                  this.prevdata = this.editForm.value;
                  this.spinnerService.hide();
            }
  
        });
      }
  
      public getFinalAimedDate(aimedDate,totalHours){
          let plusDay = totalHours / 8;
          let rawAimedDate2 = new Date(aimedDate+'T00:00');

          if(plusDay > 0){
            return this.formatDate(rawAimedDate2.setDate(rawAimedDate2.getDate() + plusDay));
          }else{
            return this.formatDate(aimedDate);
          }
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

      findObjectByKey(array, key, value) {

          for (var i = 0; i < array.length; i++) {
              if (array[i][key] === value) {
                  return array[i];
              }
          }
          return null;
      }

      getImage(imageUrl: string) {
          this.getBase64ImageFromURL(imageUrl).subscribe((base64Data: string) => {
            // this.base64TrimmedURL = base64Data;
            // this.createBlobImageFileAndShow();
            return base64Data;
          });
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
          let dataURL: string = canvas.toDataURL("image/png");
          return dataURL;
          // this.base64DefaultURL = dataURL;
          // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        }

        public bgSelect(val){
            this.selectedBG = this.pdfImage[val];
        }

        onAutocompleteSelected(result: PlaceResult) {
          console.log('onAutocompleteSelected: ', result);
    
          this.editForm.patchValue({
            projectAddress: result.formatted_address,
          });
    
        }
      
        onLocationSelected(location: Location) {
          console.log('onLocationSelected: ', location);
    
          this.editForm.patchValue({
            latitude: location.latitude,
            longitude: location.longitude,
          });
    
        }

        onAutocompleteSelectedClient(result: PlaceResult) {
          console.log('onAutocompleteSelected: ', result);
    
          this.editForm.patchValue({
            clientAddress: result.formatted_address,
          });
    
        }

        openAddOwnerDialog(): void {
          const dialogRef = this.dialog.open(UserAddOwnerEditDialog, {
              width: '400px',
              // data: this.renderValue
          });
  
          dialogRef.afterClosed().subscribe(result => {
              console.log(result);
              if(result == 'success'){   
                  // setTimeout(function(){
                  //   window.location.reload();
                  // }, 1000);  
                //  this.getProjectOwners();
              }
          });
      }

      openAddWorkerDialog(): void {
          const dialogRef = this.dialog.open(UserAddWorkerEditDialog, {
              width: '400px',
              // data: this.renderValue
          });

          dialogRef.afterClosed().subscribe(result => {
              console.log(result);
              if(result == 'success'){   
                  // setTimeout(function(){
                  //   window.location.reload();
                  // }, 1000);  
                 // this.getProjectWorkers();
              }
          });
      }

      openAddSupervisorDialog(): void {
        const dialogRef = this.dialog.open(UserAddSupervisorEditDialog, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result == 'success'){   
                // setTimeout(function(){
                //   window.location.reload();
                // }, 1000);  
               //this.getProjectSupervisors();
            }
        });
    }
      
  }

  
  @Component({
    selector: 'user-add-owner-dialog',
    templateUrl: 'useraddownerdialog.html',
  })
  
  export class UserAddOwnerEditDialog implements OnInit {
  
    addFestForm: FormGroup;
    userDetails;
    accountFirebase;
    itemUserAccounts = [];
    
    adminData;

    colorBtnDefault;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<UserAddOwnerEditDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }

    public checkFBUserExist(): void {

        this.spinnerService.show();
        this.data_api.checkFBUserExist(this.addFestForm.value.userEmail).pipe(first()).subscribe(data => {
          console.log(data);

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

        console.log(this.addFestForm.value);

        this.spinnerService.show();
        this.data_api.createUser(this.addFestForm.value).then(() => {
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

    getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
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

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

  }

  @Component({
    selector: 'user-add-worker-dialog',
    templateUrl: 'useraddworkerdialog.html',
  })
  
  export class UserAddWorkerEditDialog implements OnInit {
  
    addFestForm: FormGroup;
    userDetails;
    accountFirebase;
    itemUserAccounts = [];

    adminData;

    colorBtnDefault;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<UserAddWorkerEditDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }

    public checkFBUserExist(): void {

        this.spinnerService.show();
        this.data_api.checkFBUserExist(this.addFestForm.value.userEmail).pipe(first()).subscribe(data => {
          console.log(data);

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


    public addNewUserWorker() {

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

          console.log(this.addFestForm.value);

          this.spinnerService.show();
          this.data_api.createUser(this.addFestForm.value).then(() => {
                console.log('Created new Worker successfully!');

                  $.notify({
                    icon: 'notifications',
                    message: 'Created new Worker successfully!'
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
        userRole: "project_worker"
      });

      this.getAdminSettings();
      this.accountFirebase = this.data_api.getCurrentProject();

    }

    getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
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

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

  } 

  @Component({
    selector: 'user-add-supervisor-dialog',
    templateUrl: 'useraddsupervisordialog.html',
  })
  
  export class UserAddSupervisorEditDialog implements OnInit {
  
    addFestForm: FormGroup;
    userDetails;
    accountFirebase;
    itemUserAccounts = [];

    adminData;

    colorBtnDefault;
    
    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<UserAddSupervisorEditDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }
    
    public checkFBUserExist(): void {

        this.spinnerService.show();
        this.data_api.checkFBUserExist(this.addFestForm.value.userEmail).pipe(first()).subscribe(data => {
          console.log(data);

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


    public addNewUserSupervisor() {

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

          console.log(this.addFestForm.value);

          this.spinnerService.show();
          this.data_api.createUser(this.addFestForm.value).then(() => {
                console.log('Created new Supervisor successfully!');

                  $.notify({
                    icon: 'notifications',
                    message: 'Created new Supervisor successfully!'
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
        userRole: "project_supervisor"
      });

      this.getAdminSettings();
      this.accountFirebase = this.data_api.getCurrentProject();
    }

    getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
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

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }
    

  } 