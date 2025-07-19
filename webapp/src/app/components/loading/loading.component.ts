import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderService } from '../../_services/loader.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-loading',
    imports: [CommonModule],
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  isLoading : Observable<boolean>;
    constructor(private loaderService: LoaderService){
      this.isLoading = this.loaderService.loading$;
    }
}
