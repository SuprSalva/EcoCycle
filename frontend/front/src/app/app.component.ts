import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLoaderComponent } from './shared/components/app-loader/app-loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'front';

  ngOnInit(): void {
    const cfg = localStorage.getItem('ecocycle_config');
    if (cfg) {
      const parsed = JSON.parse(cfg);
      document.documentElement.setAttribute('data-theme', parsed.darkMode ? 'dark' : 'light');
    }
  }
}
