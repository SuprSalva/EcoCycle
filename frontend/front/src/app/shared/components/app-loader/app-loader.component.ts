import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './app-loader.component.html',
  styleUrl: './app-loader.component.scss'
})
export class AppLoaderComponent {
  isLoading$: Observable<boolean>;
  message$: Observable<string>;

  constructor(private loaderService: LoaderService) {
    this.isLoading$ = this.loaderService.isLoading$;
    this.message$ = this.loaderService.message$;
  }
}
