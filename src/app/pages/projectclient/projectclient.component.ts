import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { DatasourceService} from '../../services/datasource.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import {ActivatedRoute, Params, Router, ParamMap} from '@angular/router';
// import { HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS } from '@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import {Location, Appearance, GermanAddress} from '@angular-material-extensions/google-maps-autocomplete';
import PlaceResult = google.maps.places.PlaceResult;
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';

declare var $: any;

@Component({
    selector: 'app-projectclient-cmp',
    templateUrl: './projectclient.component.html'
})

export class ProjectClientComponent implements OnInit, OnDestroy, AfterViewInit {
    test: Date = new Date();
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public logoURL;
    sendProjectClientForm: FormGroup;
    sendProjectAdminNotifyForm: FormGroup;
    public emailData;

    @ViewChild('signature')
    
    signaturePad: SignaturePadComponent;

    private signaturePadOptions: NgSignaturePadOptions = { // passed through to szimek/signature_pad constructor
      minWidth: 5,
      canvasWidth: 400,
      canvasHeight: 100
    };
    urgencyChoices= [
        {value: 'Low', viewValue: 'Low'},
        {value: 'Medium', viewValue: 'Medium'},
        {value: 'High', viewValue: 'High'},
      ]

    constructor(
        private element: ElementRef, 
        public authService: AuthenticationService,
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        private route: ActivatedRoute,
        private router: Router,
        private functions: AngularFireFunctions
        ) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        // this.getLogo();
        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);

        this.sendProjectClientForm = this.formBuilder.group({
            clientName: ['', Validators.required],
            company: [''],
            individual: [''],
            abn: [''],
            siteAddress: [''],
            siteName: [''],
            contactNumber: [''],
            contactEmail: [''],
            sendInvoicesTo: [''],
            urgency: [''],
            descriptionWorks: [''],
            rates: [''],
            agree: [''],
            latitude: [''],
            longitude: [''],
            approve: [''],
            // signature: [''],
        }, {
        });

        this.sendProjectAdminNotifyForm = this.formBuilder.group({
            clientName: [''],
            company: [''],
            individual: [''],
            abn: [''],
            siteAddress: [''],
            siteName: [''],
            contactNumber: [''],
            contactEmail: [''],
            sendInvoicesTo: [''],
            urgency: [''],
            descriptionWorks: [''],
            rates: [''],
            agree: [''],
            adminEmail: [''],
            emailHeaderNewUser2: [''],
            varLink: [''],
            textSignature: [''],
            emailSignature: [''],
        }, {
        });

        this.route.queryParams
        .filter(params => params.name)
        .subscribe(params => {
            console.log(params.name);

            this.sendProjectClientForm.patchValue({
                clientName: params.name,
                contactEmail:params.email,
                rates: params.rates
            });

        });
        this.getAdminSettings();
       // this.getProjectRequestEmailSettings();
    }

    ngAfterViewInit() {
      // this.signaturePad is now available
      this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
      this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
    }

    createProjectRequest(): void {

        if (this.sendProjectClientForm.invalid) {

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

        this.sendProjectClientForm.patchValue({
            approve: false
        });

        this.spinnerService.show();

        console.log(this.sendProjectClientForm.value);
        this.data_api.createProjectRequest(this.sendProjectClientForm.value).then(() => {
                console.log('Created new item successfully!');

                this.sendProjectAdminNotifyForm.patchValue({
                    clientName: this.sendProjectClientForm.value.clientName,
                    company: this.sendProjectClientForm.value.company,
                    individual: this.sendProjectClientForm.value.individual,
                    abn: this.sendProjectClientForm.value.abn,
                    siteAddress: this.sendProjectClientForm.value.siteAddress,
                    siteName: this.sendProjectClientForm.value.siteName,
                    contactNumber: this.sendProjectClientForm.value.contactNumber,
                    contactEmail: this.sendProjectClientForm.value.contactEmail,
                    sendInvoicesTo: this.sendProjectClientForm.value.sendInvoicesTo,
                    urgency: this.sendProjectClientForm.value.urgency,
                    descriptionWorks: this.sendProjectClientForm.value.descriptionWorks,
                    rates: this.sendProjectClientForm.value.rates,
                    agree: this.sendProjectClientForm.value.agree                 
                });

                let myURL = window.location.href;
                let rep1 = "pages/project-client"
                let rep2 = "project-approval"
                let newUrl = myURL.replace(rep1, rep2)
                this.sendProjectAdminNotifyForm.patchValue({
                    varLink: newUrl
                });
                console.log(this.sendProjectAdminNotifyForm.value);

                const callableTest = this.functions.httpsCallable('sendFBAdminProjectRequest');
                callableTest(this.sendProjectAdminNotifyForm.value).subscribe(result => {
                  console.log(result)
                  this.spinnerService.hide();
                  this.router.navigate(['/pages/thank-you']);

                  $.notify({
                    icon: 'notifications',
                    message: 'New Project Submitted!'
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

                })
              
            
          });
       
    }


    submit(){
        this.spinnerService.show();
        console.log(this.sendProjectClientForm.value)

        this.data_api.addProjectRequest(this.sendProjectClientForm.value)
        .subscribe(
          (result) => {
            if(result){
                console.log(result);
               
  
            }else{
              swal.fire({
                  title: "Error in Submitted New Project",
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
            this.spinnerService.hide();
        }
        
      );  

    }
    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            if(data){
                this.logoURL = data.logo;
                if(data.adminEmail){
                  this.sendProjectAdminNotifyForm.patchValue({
                      adminEmail: data.adminEmail
                  });
                }
                if(data.logo){
                  this.sendProjectAdminNotifyForm.patchValue({
                      emailHeaderNewUser2: data.logo
                  });
                }

                if(data.textSignature){
                  this.sendProjectAdminNotifyForm.patchValue({
                    textSignature: data.textSignature
                  });
                }

                if(data.emailSignature){
                  this.sendProjectAdminNotifyForm.patchValue({
                    emailSignature: data.emailSignature
                  });
                }

                
            }
            
        }); 
    }
    onAutocompleteSelected(result: PlaceResult) {
        console.log('onAutocompleteSelected: ', result);
  
        this.sendProjectClientForm.patchValue({
            siteAddress: result.formatted_address,
        });
  
      }
    
      onLocationSelected(location: Location) {
        console.log('onLocationSelected: ', location);
  
        this.sendProjectClientForm.patchValue({
          latitude: location.latitude,
          longitude: location.longitude,
        });
  
      }
    // public getProjectRequestEmailSettings(){

    //     this.data_api.getProjectRequestEmailSettings().subscribe((data) => {
    //           console.log(data);
    //           this.emailData = data[0];
    //           this.sendProjectClientForm.patchValue({
    //             notifyEmail: this.emailData.project_request_email
    //         });
    //       }
    //     );
  
    // }

    // getLogo(){
    //     this.logoURL = this.data_api.getLogoURL();
    // }
    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function() {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('login-page');
      body.classList.remove('off-canvas-sidebar');
    }
}
