import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { DatasourceService} from '../../services/datasource.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import {ActivatedRoute, Params, Router, ParamMap} from '@angular/router';
// import { HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS } from '@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';

declare var $: any;

@Component({
    selector: 'app-projectlanding-cmp',
    templateUrl: './projectlanding.component.html'
})

export class ProjectLandingComponent implements OnInit, OnDestroy {
    test: Date = new Date();
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public logoURL;
    sendProjectClientForm: FormGroup;

    constructor(
        private element: ElementRef, 
        public authService: AuthenticationService,
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        private route: ActivatedRoute,
        ) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        //this.getLogo();
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
    }
    submit(){
        this.spinnerService.show();
        console.log(this.sendProjectClientForm.value)

        this.data_api.addProjectRequest(this.sendProjectClientForm.value)
        .subscribe(
          (result) => {
            if(result){
  
                swal.fire({
                    title: "New Project Submitted!",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "success"
                })
  
                this.spinnerService.hide();
  
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
            }
            
        }); 
    }
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
