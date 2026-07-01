import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cliente-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-panel.component.html',
  styleUrls: ['./cliente-panel.component.scss']
})
export class ClientePanelComponent {}
