import { Component } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';

@Component({
  selector: 'app-auth-error',
  imports: [],
  templateUrl: './auth-error.component.html',
  styleUrl: './auth-error.component.scss',
})
export class AuthErrorComponent {
  constructor(private utilsService: UtilsService) {
    this.utilsService.sidebarLayout.next(false);
  }
}
