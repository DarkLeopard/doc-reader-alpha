import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-404',
  imports: [ButtonModule, RouterLink],
  templateUrl: './page-404.html',
  styleUrl: './page-404.scss',
})
export class Page404 {}
