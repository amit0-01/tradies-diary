import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatasourceService } from 'src/app/services/datasource.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchQuery: string = '';
  @Output() searchResults = new EventEmitter<any[]>();
  @Output() sendSearch = new EventEmitter<any>();
  @Input() Data? : any;
  constructor(private data_api: DatasourceService) {}

  onSearch() {
    if (this.searchQuery.trim().length >= 2) {
      console.log('this.data', this.Data)
      this.sendSearch.emit(this.searchQuery);
      this.data_api.searchCollection(this.Data?.collectionName, this.searchQuery,this.Data?.id).subscribe(data => {
        this.searchResults.emit(data); 
      });
    } else if(this.searchQuery.trim().length < 2){
      this.searchResults.emit(null)
      this.sendSearch.emit(null);
    }
  }
}
