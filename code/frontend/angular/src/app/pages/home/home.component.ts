import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { LoanFormComponent } from '../../components/loan-form/loan-form.component';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class HomeModule {}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoanFormComponent, ConfirmDialogComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading: boolean = false;
  error: string | null = null;
  username: string = this.authService.getUsername();
  loggedIn: boolean = this.authService.isLoggedIn();
  showLoanForm: boolean = false;
  showDeleteConfirm: boolean = false;
  isTableView: boolean = false;
  selectedBook?: Book;
  bookToDelete?: Book;
  
  // Filtering
  filters = {
    title: '',
    borrower: '',
    status: ''
  };

  // Sorting
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  fb = inject(FormBuilder);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  constructor(private bookService: BookService, private authService: AuthService) {}
// private datePipe: DatePipe

  ngOnInit(): void {
    // Load preferred view from localStorage
    const preferredView = localStorage.getItem('preferredView');
    this.isTableView = preferredView === 'table';
    
    this.loadBooks();
  }

  applyFilters(): void {
    this.filteredBooks = this.books.filter(book => {
      const matchesTitle = !this.filters.title || 
        book.bookTitle.toLowerCase().includes(this.filters.title.toLowerCase());
      
      const matchesBorrower = !this.filters.borrower || 
        book.borrower.toLowerCase().includes(this.filters.borrower.toLowerCase());
      
      const matchesStatus = !this.filters.status || 
        (this.filters.status === 'returned' ? book.isReturned : !book.isReturned);

      return matchesTitle && matchesBorrower && matchesStatus;
    });

    if (this.sortColumn) {
      this.applySorting();
    }
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    this.filteredBooks.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortColumn) {
        case 'bookTitle':
          comparison = a.bookTitle.localeCompare(b.bookTitle);
          break;
        case 'borrower':
          comparison = a.borrower.localeCompare(b.borrower);
          break;
        case 'isReturned':
          comparison = (a.isReturned === b.isReturned) ? 0 : a.isReturned ? 1 : -1;
          break;
        case 'loanDate':
          comparison = this.compareDates(a.loanDate, b.loanDate);
          break;
        case 'returnDate':
          comparison = this.compareDates(a.returnDate, b.returnDate);
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private compareDates(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getTime() - d2.getTime();
  }

  loadBooks(): void {
    this.loading = true;
    this.error = null;
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        this.filteredBooks = [...this.books];
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Failed to load books. Please try again later.';
        this.loading = false;
        console.error('Error loading books:', err);
      }
    });
  }

  loginError: string | null = null;
  isLoggingIn: boolean = false;

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoggingIn = true;
      this.loginError = null;
      const username = this.loginForm.get('username')?.value || '';
      const password = this.loginForm.get('password')?.value || '';
      
      this.authService.login({ username, password }).subscribe({
        next: (response) => {
          this.username = response.username;
          this.loggedIn = true;
          this.loadBooks();
          this.isLoggingIn = false;
          this.loginError = null;
        },
        error: (error) => {
          this.isLoggingIn = false;
          this.loginError = error.error?.error || 'Invalid username or password';
          setTimeout(() => {
            this.loginError = null;
          }, 5000); // Clear error after 5 seconds
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onLogout() {
    this.authService.logout();
    this.username = 'Guest';
    this.loggedIn = false;
  }

  goToRegister() {
    window.location.href = '/register';
  }

  toggleView() {
    this.isTableView = !this.isTableView;
    localStorage.setItem('preferredView', this.isTableView ? 'table' : 'cards');
  }

  onDeleteClick(book: Book) {
    this.bookToDelete = book;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirm() {
    if (this.bookToDelete) {
      this.bookService.deleteBook(this.bookToDelete.id).subscribe({
        next: () => {
          this.loadBooks(); // Refresh the list
          this.showDeleteConfirm = false;
          this.bookToDelete = undefined;
        },
        error: (err) => {
          console.error('Error deleting book:', err);
          this.error = 'Failed to delete book. Please try again later.';
          this.showDeleteConfirm = false;
          this.bookToDelete = undefined;
        }
      });
    }
  }

  onDeleteCancel() {
    this.showDeleteConfirm = false;
    this.bookToDelete = undefined;
  }

  formatDate(dateString: string, includeTime: boolean = false): string {
    const date = new Date(dateString);
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}-${day}-${year} ${hours}:${minutes}`;
    }
    
    return `${month}/${day}/${year}`;
  }

  openLoanForm(book?: Book): void {
    this.selectedBook = book;
    this.showLoanForm = true;
  }

  closeLoanForm(): void {
    this.showLoanForm = false;
    this.selectedBook = undefined;
  }
}
