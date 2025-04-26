import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalDataSource } from 'ng2-smart-table';
import { Subject } from 'rxjs';
import { DatasourceService } from 'src/app/services/datasource.service';
import { changeTableLimit, getTableLimit } from 'src/app/utils/shared-function';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  filter_list_clients :any
  selectedClientId:any
  selectedClientName:any
  // source: LocalDataSource = new LocalDataSource;
  source : any
  currentProject : string
  Data:any
  dtOptions: any = {
    data:[],
    columns:[],
    destroy: true
  };
  dtTrigger: Subject<any> = new Subject();
  currentUser
  moduleName = 'client'


  constructor(private afs: AngularFirestore, private datasourceService: DatasourceService, private sanitizer: DomSanitizer, private spinnerService : NgxSpinnerService){}

  ngOnInit(){
  let currentUser = JSON.parse((localStorage.getItem('currentUser')));
  this.currentUser = currentUser;
   this.currentProject = this.datasourceService.getCurrentProject();
   this.getClient()
   this.sendData();
  }

    ngAfterViewInit(): void {
    $('#DataTables_Table_0').on('length.dt', (e, settings, len) => {
      console.log('len', len)
      // this.changeTableLimit(len)
      changeTableLimit(this.datasourceService, this.currentUser.email, len,this.spinnerService,this.moduleName)
    });
    }

  sendData(){
    this.Data = {
      collectionName : 'users'
    }
  }

  
  // FILTER CLIENT
  filterByClient(event:any){
   this.getClient(event)
  }

 getClient(filter?:string) {
  this.spinnerService.show();
  let query;
  if(!filter){
   query = this.afs.collection('/users', ref => ref.where('userRole', '==', 'project_owner'))}
   else{
   query = this.afs.collection('/users', ref => ref.where('userRole', '==', 'project_owner').where('userFirstName', '==',filter).where("userAccounts", 'array-contains', this.currentProject))  
   }  
      query.get()
      .subscribe(snapshot => {
        this.filter_list_clients = []; 
        
        snapshot.docs.forEach(doc => {
          const userData :any = doc.data();
          // console.log('userData',userData)
          if (userData.userAccounts.includes(this.currentProject)) {
            this.filter_list_clients.push({
              userData  
              // id: userData.id, 
              // name: userData.userFirstName + " " + userData.userLastName
            });
          }
          // this.source = new LocalDataSource(this.filter_list_clients)
          // this.source.load(this.filter_list_clients)
          this.source = this.filter_list_clients
        });
        console.log('this.source', this.source)
        this.setTableData(this.source)
        this.spinnerService.hide();
        // Log the updated array
      }); 
  }

    // SET TABLE DATA FOR DATATABLE JS
    setTableData(source: any) {
      console.log('source', source);
    
      // Destroy existing DataTable instance if it exists
      if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
        $('#DataTables_Table_0').DataTable().destroy();
      }
    
      // Update DataTable options
      this.dtOptions.data = source;
    
      this.dtOptions.columns = [
        // {
        //   title: 'Actions',
        //   data: null,
        //   createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
        //     // Inject dynamic values into the HTML string
        //     cell.innerHTML =`<a matTooltip="See client info" href="#/client-view/${rowData.userData.id}">
        //           <i  class="material-icons">preview</i>
        //         </a>`;
        //   }
        // },
        {
          title: 'Actions',
          data: null,
          createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {        
            const button = document.createElement('button');
            button.textContent = 'See as Client View';
            // Apply custom styles
            button.style.backgroundColor = '#070707'; 
            button.style.color = '#fff'; 
            button.style.border = 'none';
            button.style.padding = '8px 12px';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.fontWeight = 'bold';
            button.style.transition = '0.3s ease-in-out';

        
            button.addEventListener('click', () => {
              if (rowData.userData && rowData.userData.id) {
                console.log('Viewing as client:', rowData.userData.id);
                this.toggleClientView(rowData.userData.id);
              } else {
                console.error('Error: userData.id not found in rowData', rowData);
              }
            });
        
            cell.innerHTML = ''; // Clear existing content
            cell.appendChild(button);
          }
        },
        {
          title: 'Client Name',
          data: null, // Use null because we will process the row data
          render: (data: any, type: string, row: any) => {
            // Concatenate first name and last name
            return `${row.userData.userFirstName || ''} ${row.userData.userLastName || ''}`.trim();
          },
        },
        {
          title: 'User Email',
          data: 'userData.userEmail', // Direct property access
        },
        {
          title: 'User Accounts',
          data: 'userData.userAccounts[0]', // Access the first element in the userAccounts array
        },
        {
          title: 'User Role',
          data: 'userData.userRole', // Direct property access
        },
      ];
    
      // Trigger the DataTable initialization
      this.dtTrigger.next();

      getTableLimit(this.datasourceService,this.currentUser.email,this.moduleName).then(res =>{
              if(res){
              this.dtOptions.pageLength = res;
              this.dtTrigger.next();
              }
        })
    }


  // GO TO CLIENT DASHBOARD
  toggleClientView(clientId: any) {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
    if (!userData.originalRole) {
      userData.originalRole = userData.userRole;
    }
    if (!userData.original_user_id) {
      userData.original_user_id = userData.user_id;
    }
  
    // Toggle role and user_id
    if (userData.userRole === 'app_admin') {
      userData.userRole = 'project_owner';
      userData.user_id = clientId; // Set to client ID when switching to client view
    } else {
      userData.userRole = userData.originalRole;
      userData.user_id = userData.original_user_id; // Restore original user_id
    }
  
    userData.isClientView = userData.userRole === 'project_owner';
  
    // Store updated data
    localStorage.setItem('currentUser', JSON.stringify(userData));
  
    // Reload the page to apply changes
    window.location.reload();
  }
  
    
  
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
      class: 'table'
    },
    hideSubHeader: true,
    mode: 'external',
    selectedRowIndex: -1,
    columns: {
      customactions: {
        width: '30px',
        title: '',
        type : 'html',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {          
          const link = `<a href="#/client-view/${row.userData.id}">
                  <i class="material-icons">preview</i>
                </a>`;
        return this.sanitizer.bypassSecurityTrustHtml(link);
        }
      },
      client_name: {
        title: 'Client Name',
        width: '150px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.userData.userFirstName + " " + row.userData.userLastName;
        }
      },
      // Client_Id: {
      //   title: 'Client Id ',
      //   width: '100px',
      //   filter: false,
      //   sort: false,
      //   valuePrepareFunction: (cell,row) => {
      //     console.log('check row id', row)
      //     return row.userData.id;
      //   }
      // },
     
      userEmail: {
        title: 'userEmail',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.userData.userEmail
        }
      },
      userAccounts: {
        title: 'userAccounts',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
                    return row.userData.userAccounts;
        }
      },
      userRole: {
        title: 'userRole',
        width: '150px',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.userData.userRole;
        }
      }
    }
  };

  showClientDataById() {
    if (!this.selectedClientId) {
      console.log('No client selected');
      return;
    }

    const getClientById = this.afs.collection('/accounts')
      .doc('diarystaging')
      .collection('/variations', ref => 
        ref.where("projectOwner", 'array-contains', this.selectedClientId)
      );

    getClientById.get().subscribe(snapshot => {
      if (snapshot.empty) {
        console.log('No matching client data found.');
      } else {
        const clientData = []; // Initialize an empty array to store the client data

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('Client Data:', data);
          clientData.push(data);  // Push the data into the array
        });

        // After collecting all the data, bind it to the LocalDataSource
        this.source.load(clientData); // Load the data into the LocalDataSource
        console.log('Data loaded into LocalDataSource:', this.source);
      }
    });
  }


  // public Settings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   selectedRowIndex: -1,
  //   columns: {
  //     // customactions: {
  //     //   width: '30px',
  //     //   title: '',
  //     //   type : 'html',
  //     //   filter: false,
  //     //   sort: false,
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     console.log('row',row);
          
  //     //     return `<a target="_blank" href="#/dashboard-variants/${row.id}"><i class="material-icons">preview</i></a>
  //     //             `;
  //     //   } 
  //     // },
  //     variations_num: {
  //       title: 'Variations No.',
  //       width: '100px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.variantsNumber;
  //       }
  //     },
  //     variations_name: {
  //       title: 'Variations Name',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.variationsName;
  //       }
  //     },
  //     // project_name: {
  //     //   title: 'Project Name',
  //     //   filter: false,
  //     //   sort: false,
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //     //   }
  //     // },
  //     due_date: {
  //       title: 'Due Date',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.dueDate ? row.dueDate.toDate().toDateString(): '';
  //       }
  //     },
  //     status: {
  //       title: 'Status',
  //       width: '150px',
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.status;
  //       }
  //     },
  //     created_at: {
  //       title: 'Created At',
  //       width: '500px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.createdAt ? row.createdAt.toDate().toString(): '';
  //       }
  //     }   
  //   }
  // };
}
