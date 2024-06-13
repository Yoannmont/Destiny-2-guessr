import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UtilsService } from './_services/utils.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './components/loading/loading.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, HomeComponent,SidebarComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  title = 'destiny-2-guessr';
  isLoading! : Observable<boolean>;

  constructor(public utilsService: UtilsService){
  }
  
  ngOnInit(){
  }

}
