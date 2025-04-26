import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DatasourceService } from 'src/app/services/datasource.service';


@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html'
})
export class GraphsComponent {
    Highcharts: typeof Highcharts = Highcharts;
    userCountsByDate:any
    projectNameCountsSelection:any
    projectNameCountsVariation:any
    projectNameCountsRfi:any
    productCountsByDate:any
    projects:any
    treeSize: string = '35%';
    taskColumns: Array<object> =[
      {
          label: 'Tasks',
          value: 'label',
          size: '35%',
      },
      {
          label: 'Start Date',
          value: 'dateStart',
          size: '35%',
      },
  ];
    dataSource:Array<object> = [
      {
          label: 'June 17, 2021',
          dateStart: '2021-06-17T00:00:00',
          duration: 3, // Representing 3 users logged in on this date
          type: 'task'
      },
  ];
    chartOptions = { 
      title: { 
      text: 'Users Login Over Time' 
      }, 
      chart: { 
      type: 'line', 
      }, 
      xAxis: { 
      categories:[], 
      title: { 
      text: 'Date' 
      } 
      }, 
      yAxis: { 
      title: { 
      text: 'Number of Users' 
      }, 
      min: 0 
      }, 
      series: [{ 
      data: [], 
      type: 'line' 
      }],
      tooltip: {
        formatter: function () {
            return 'Date: <b>' + this.x + '</b><br>' + 
                  'Users: <b>' + this.y + '</b>';
        }
    } 
      }; 

    chartOptionsProject = { 
      title: { 
        text: 'Project Over Time' 
      }, 
      chart: { 
        type: 'line', 
      }, 
      xAxis: { 
        categories: [], 
        title: { 
          text: 'Date' 
        } 
      }, 
      yAxis: { 
        title: { 
          text: 'Number of Projects' 
        }, 
        min: 0 
      }, 
      series: [{ 
        data: [], 
        type: 'line' 
      }],
      tooltip: {
        formatter: function () {
          return 'Date: <b>' + this.x + '</b><br>' + 
                 'Projects: <b>' + this.y + '</b>';
        }
      } 
    // };
  }

  pieChartOption : any = { 
    title: { 
      text: 'Project Over Time' 
    }, 
    chart: { 
      type: 'pie', 
    }, 
    xAxis: { 
      categories: [], 
      title: { 
        text: 'Project Names' 
      } 
    }, 
    yAxis: { 
      title: { 
        text: 'Number of Projects' 
      }, 
      min: 0 
    }, 
    series: [{ 
      data: [], 
      type: 'pie' 
    }],
    tooltip: {
      formatter: function () {
        return 'Project: <b>' + this.key + '</b><br>' + 
               'Projects: <b>' + this.y + '</b>';
      }
    }
  };


  constructor(private data_api : DatasourceService){}

  ngOnInit(){
    this.getUsers();
    this.getProject();
    this.getVariationAndProjectCount();
    this.getSelectionAndProjectCount();
    this.getRfiAndProjectCount();
  }

  async getUsers() { 
    this.data_api.getFBUsersOrdered().subscribe((res: any) => { 
    // const res = await this.data_api.getFBUsersOrdered().toPromise();
    const userCountsByDate: { [key: string]: number } = {}; 
    res.forEach((user: any) => { 
    if (user.createdAt && user.createdAt.seconds !== undefined) { 
    const timestamp = user.createdAt; 
    const seconds = timestamp.seconds; 
    const nanoseconds = timestamp.nanoseconds; 
    const date = new Date(seconds * 1000 + nanoseconds / 1000000); 
    const formattedDate = date.toISOString().split('T')[0];  
    if (userCountsByDate[formattedDate]) { 
    userCountsByDate[formattedDate]++; 
    } else { 
    userCountsByDate[formattedDate] = 1; 
    } 
    } else { 
    console.log(`User: ${user.userFirstName}, Created At is undefined or invalid`); 
    } 
    }); 
    this.userCountsByDate = userCountsByDate; 
    this.setHighChartData(this.userCountsByDate)
    this.setGanntData(this.userCountsByDate)
    }); 
  }

  getProject(){
    this.data_api.getFBProjects().subscribe((res:any)=>{
      this.projects = res;
      const productCountsByDate: { [key: string]: number } = {}; 
      res.forEach((product: any) => { 
        if (product.createdAt && product.createdAt.seconds !== undefined) { 
        const timestamp = product.createdAt; 
        const seconds = timestamp.seconds; 
        const nanoseconds = timestamp.nanoseconds; 
        const date = new Date(seconds * 1000 + nanoseconds / 1000000); // Convert to milliseconds 
        const formattedDate = date.toISOString().split('T')[0]; // Example: '2024-01-01' 
        if (productCountsByDate[formattedDate]) { 
          productCountsByDate[formattedDate]++; 
        } else { 
          productCountsByDate[formattedDate] = 1; 
        } 
        } else { 
        console.log(`User: ${productCountsByDate.userFirstName}, Created At is undefined or invalid`); 
        } 
        }); 
        this.productCountsByDate = productCountsByDate; 
        this.setHighChartProjectData(this.productCountsByDate)
    })
  }

  getVariationAndProjectCount(){
    this.data_api.getFBVariation().subscribe((res:any)=>{
      const variationProjectIds = res.map((variation)=> variation.projectId);
      const projectNames = variationProjectIds.map((projectId: string) => {
        const project = this.projects.find((project: any) => project.id === projectId);
        return project ? project.projectName : null; 
      });
      this.projectNameCountsVariation = projectNames.reduce((acc: any, projectName: string) => {
        if (projectName) {
          acc[projectName] = (acc[projectName] || 0) + 1;
        }
        return acc;
      }, {});
      this.setVariationPieChartData(this.projectNameCountsVariation)
    })
  }
  getSelectionAndProjectCount(){
    this.data_api.getFBSelection().subscribe((res:any)=>{
      const selectionProjectIds = res.map((selection)=> selection.projectId);
      const projectNames = selectionProjectIds.map((projectId: string) => {
        const project = this.projects.find((project: any) => project.id === projectId);
        return project ? project.projectName : null; 
      });
      this.projectNameCountsSelection = projectNames.reduce((acc: any, projectName: string) => {
        if (projectName) {
          acc[projectName] = (acc[projectName] || 0) + 1;
        }
        return acc;
      }, {});
      this.setSelectionPieChartData(this.projectNameCountsSelection)
    })
  }

  
  getRfiAndProjectCount(){
    this.data_api.getFBAFI().subscribe((res: any) => {
      console.log('res', res);
      const variationProjectIds = res.map((rfi) => rfi.projectId);
      
      const projectNames = variationProjectIds.map((projectId: string) => {
        const project = this.projects.find((project: any) => project.id === projectId);
        return project ? project.projectName : null;
      });  
      this.projectNameCountsRfi = projectNames.reduce((acc: any, projectName: string) => {
        if (projectName) {
          acc[projectName] = (acc[projectName] || 0) + 1;
        }
        return acc;
      }, {});
      this.setRfiPieChartDate(this.projectNameCountsRfi)
        console.log("projectNameCountsRfi", this.projectNameCountsRfi);
    });
  }
  

  
   setHighChartData(userCountsByDate) {
        // setTimeout(() => {    
          const categories = Object.keys(userCountsByDate);
          const data = Object.values(userCountsByDate);
    
          const chart = Highcharts.charts.find((c:any) => c?.renderTo?.id ==='loginChart'); 
    
          if (chart) {
            chart.xAxis[0].update({
              categories: categories
            });
    
            chart.series[0].setData(data);
          }
            // }, 3000); 
      }

     setHighChartProjectData(productCountsByDate:any) {
        //  setTimeout(() => {     
           const categories = Object.keys(productCountsByDate); 
           const data = Object.values(productCountsByDate); 
     
           const chart = Highcharts.charts.find((c:any) => c?.renderTo?.id === 'projectChart'); 
     
           if (chart) {
             chart.xAxis[0].update({
               categories: categories
             });
     
             chart.series[0].setData(data);
           }
     
        //  }, 3000);  
       }

       setGanntData(userCountsByDate:any){
        let label
        let duration;
        // setTimeout(()=>{
          label = Object.keys(userCountsByDate);
          duration = Object.values(userCountsByDate);
          // this.dataSource = label.map((item, index) => ({
          //   label: item,         // Date
          //   dateStart: '2021-06-18T09:00:00',
          //   duration: duration[index], // User count for that date
          //   type: 'task'         // Assuming 'task' is the type for all rows
          // }));
          this.dataSource = [
          { id: 1, label: "2025-01-01", dateStart: "2025-01-01", end: "2025-01-01", users: 10 },
          { id: 2, label: "2025-01-02", dateStart: "2025-01-02", end: "2025-01-02", users: 15 },
          { id: 3, label: "2025-01-03", dateStart: "2025-01-03", end: "2025-01-03", users: 8 },
          ];
          
    
          // this.taskColumns = label.map((item, index) => ({
          //   label: item,         // Corrected spelling from 'lable' to 'label'
          //   value: duration[index],
          //   size: '35%'          // '35%' should be a string
          // }));  
        // },3000)
    
    
      }
   

      setSelectionPieChartData(projectNameCountsSelection:any) {
        // setTimeout(() => {
          this.pieChartOption.title.text = 'Selection Over Project'
          this.pieChartOption.xAxis.categories = Object.keys(projectNameCountsSelection);
      
          this.pieChartOption.series[0].data = Object.keys(projectNameCountsSelection).map((projectName) => {
            return { name: projectName, y: projectNameCountsSelection[projectName] };
          });
      
          const chart = Highcharts.charts.find((c: any) => c?.renderTo?.id === 'selectionPieChart');
          if (chart) {
            chart.update(this.pieChartOption, true, true);
          }
      
        // }, 3000); 
      }

      setVariationPieChartData(projectNameCountsVariation:any){
        // setTimeout(() => {
          this.pieChartOption.title.text = 'Variation Over Project'
          this.pieChartOption.xAxis.categories = Object.keys(this.projectNameCountsVariation);
      
          this.pieChartOption.series[0].data = Object.keys(this.projectNameCountsVariation).map((projectName) => {
            return { name: projectName, y: this.projectNameCountsVariation[projectName] };
          });
      
          const chart = Highcharts.charts.find((c: any) => c?.renderTo?.id === 'variationPieChart');
          if (chart) {
            chart.update(this.pieChartOption, true, true);
          }
      
        // }, 3000); 
      }

      setRfiPieChartDate(projectNameCountsRfi:any){
        // setTimeout(() => {
          this.pieChartOption.title.text = 'RFI Over Project'
          this.pieChartOption.xAxis.categories = Object.keys(projectNameCountsRfi);
      
          this.pieChartOption.series[0].data = Object.keys(projectNameCountsRfi).map((projectName) => {
            return { name: projectName, y: projectNameCountsRfi[projectName] };
          });
      
          const chart = Highcharts.charts.find((c: any) => c?.renderTo?.id === 'rfiPieChart');
          if (chart) {
            chart.update(this.pieChartOption, true, true);
          }
      
        // }, 5000); 
      }
}
