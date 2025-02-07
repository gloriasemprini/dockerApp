import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    RouterLink
  ],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      void this.router.navigate(['/login']);
    }
  }

}
