import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Book } from '../../models/book.model';
import { LoanFormComponent } from '../../components/loan-form/loan-form.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let bookService: jasmine.SpyObj<BookService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockBooks: Book[] = [
    {
      id: 1,
      bookTitle: 'Test Book 1',
      borrower: 'John Doe',
      loanDate: '2025-11-01',
      returnDate: '2025-11-15',
      isReturned: false,
      coverImageUrl: 'http://example.com/cover1.jpg'
    },
    {
      id: 2,
      bookTitle: 'Test Book 2',
      borrower: 'Jane Smith',
      loanDate: '2025-11-02',
      returnDate: '2025-11-16',
      isReturned: true,
      coverImageUrl: undefined
    }
  ];

  beforeEach(async () => {
    const bookServiceSpy = jasmine.createSpyObj('BookService', ['getBooks', 'deleteBook']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login', 
      'logout', 
      'isLoggedIn', 
      'getUsername'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HomeComponent,
        LoanFormComponent,
        ConfirmDialogComponent
      ],
      providers: [
        { provide: BookService, useValue: bookServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    bookService = TestBed.inject(BookService) as jasmine.SpyObj<BookService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    // Default mock implementations
    authService.isLoggedIn.and.returnValue(true);
    authService.getUsername.and.returnValue('testUser');
    bookService.getBooks.and.returnValue(of(mockBooks));

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Authentication', () => {
    it('should show login form when not logged in', () => {
      authService.isLoggedIn.and.returnValue(false);
      fixture = TestBed.createComponent(HomeComponent);
      fixture.detectChanges();
      
      const loginForm = fixture.nativeElement.querySelector('.login-prompt');
      expect(loginForm).toBeTruthy();
    });

    it('should handle successful login', fakeAsync(() => {
      authService.isLoggedIn.and.returnValue(false);
      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      authService.login.and.returnValue(of({ username: 'testUser', token: 'test-token', message: 'Login successful' }));
      
      component.loginForm.setValue({
        username: 'testUser',
        password: 'password123'
      });

      component.onLogin();
      tick();

      expect(component.username).toBe('testUser');
      expect(component.loggedIn).toBeTrue();
      expect(bookService.getBooks).toHaveBeenCalled();
    }));

    it('should handle logout', () => {
      component.onLogout();
      expect(authService.logout).toHaveBeenCalled();
      expect(component.username).toBe('Guest');
      expect(component.loggedIn).toBeFalse();
    });
  });

  describe('Book Management', () => {
    it('should load books on init', () => {
      expect(bookService.getBooks).toHaveBeenCalled();
      expect(component.books.length).toBe(2);
    });

    it('should handle load books error', fakeAsync(() => {
      bookService.getBooks.and.returnValue(throwError(() => new Error('Test error')));
      component.loadBooks();
      tick();

      expect(component.error).toBeTruthy();
      expect(component.loading).toBeFalse();
    }));

    it('should handle book deletion', fakeAsync(() => {
      bookService.deleteBook.and.returnValue(of(void 0));
      component.bookToDelete = mockBooks[0];
      
      component.onDeleteConfirm();
      tick();

      expect(bookService.deleteBook).toHaveBeenCalledWith(mockBooks[0].id);
      expect(bookService.getBooks).toHaveBeenCalled();
      expect(component.showDeleteConfirm).toBeFalse();
      expect(component.bookToDelete).toBeUndefined();
    }));

    it('should handle delete error', fakeAsync(() => {
      bookService.deleteBook.and.returnValue(throwError(() => new Error('Delete failed')));
      component.bookToDelete = mockBooks[0];
      
      component.onDeleteConfirm();
      tick();

      expect(component.error).toBeTruthy();
      expect(component.showDeleteConfirm).toBeFalse();
    }));
  });

  describe('View Management', () => {
    it('should toggle between table and card view', () => {
      expect(component.isTableView).toBeFalse();
      
      component.toggleView();
      expect(component.isTableView).toBeTrue();
      
      component.toggleView();
      expect(component.isTableView).toBeFalse();
    });

    it('should persist view preference', () => {
      const localStorageSpy = spyOn(localStorage, 'setItem');
      
      component.toggleView();
      expect(localStorageSpy).toHaveBeenCalledWith('preferredView', 'table');
      
      component.toggleView();
      expect(localStorageSpy).toHaveBeenCalledWith('preferredView', 'cards');
    });
  });

  describe('Loan Form', () => {
    it('should open loan form', () => {
      const book = mockBooks[0];
      component.openLoanForm(book);
      
      expect(component.selectedBook).toBe(book);
      expect(component.showLoanForm).toBeTrue();
    });

    it('should close loan form', () => {
      component.showLoanForm = true;
      component.selectedBook = mockBooks[0];
      
      component.closeLoanForm();
      
      expect(component.showLoanForm).toBeFalse();
      expect(component.selectedBook).toBeUndefined();
    });
  });

  describe('Sorting and Filtering', () => {
    it('should sort books by title', () => {
      component.sort('bookTitle');
      expect(component.sortColumn).toBe('bookTitle');
      expect(component.sortDirection).toBe('asc');
      
      // Test reverse sort
      component.sort('bookTitle');
      expect(component.sortDirection).toBe('desc');
    });

    it('should filter books by title', () => {
      component.filters.title = 'Book 1';
      component.applyFilters();
      
      expect(component.filteredBooks.length).toBe(1);
      expect(component.filteredBooks[0].bookTitle).toContain('Book 1');
    });

    it('should filter books by status', () => {
      component.filters.status = 'returned';
      component.applyFilters();
      
      expect(component.filteredBooks.length).toBe(1);
      expect(component.filteredBooks[0].isReturned).toBeTrue();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const date = '2025-11-06';
      const formatted = component.formatDate(date);
      expect(formatted).toBe('11/06/2025');
    });

    it('should format dates with time when specified', () => {
      const date = '2025-11-06T14:30:00';
      const formatted = component.formatDate(date, true);
      expect(formatted).toMatch(/11-06-2025 14:30/);
    });
  });
});
