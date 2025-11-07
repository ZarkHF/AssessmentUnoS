# Unosquare CoE .NET Technical Assessment
This repository host the project of a library meant to be for childrens book but for a librarian management. Web application built with Angular, Entity Framework Core, and SQLite for managing book loans in a library.This is going to be used for evaluation by Unosquare CoE .NET

## Assessment Description
The application allows users to view and manage book loans through a modern and functional interface.
Each loan displays the book title, the borrower’s name, the loan date, and the return date.
Users can switch between card and table views, log in, and perform full CRUD operations on loan records.

**Features:**  
- User authentication (login)
- Display of loans in card and table view
- Add new loan records
- Edit and delete existing loans
- SQLite database connection using Entity Framework Core

**Installation and Run:**  
 
1. Clone the repository. 

- Frontend

``` 
cd code/frontend/angular
npm install
npm start
```

- Backend

``` 
cd code/backend/ta-api
dotnet clean
dotnet build
dotnet run
``` 

**Database Configuration (Entity Framework Core)**  

1. Create a new migration:
    dotnet ef migrations add InitialCreate

2. Apply the migration to the database:
    dotnet ef database update

3. To add new fields or tables in the future:
    dotnet ef migrations add AddNewFieldOrTable
    dotnet ef database update

## Versions

- .NET 8
    - Microsoft.EntityFrameworkCore.Sqlite 8.0.4
    - Serilog.AspNetCore 8.0.1
- Angular 18.1.0