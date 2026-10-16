import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawer } from './shared/cart-drawer';
import { Header } from './shared/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, CartDrawer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly year = new Date().getFullYear();
}
