using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System.Net;
using System.Net.Http;
using System.Text;
using TA_API.Controllers;
using TA_API.Models;
using TA_API.Services.Data;
using Xunit;

namespace TA_API.Tests
{
    public class BooksControllerTests
    {
        private AssessmentDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<AssessmentDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AssessmentDbContext(options);
        }

        private Mock<IHttpClientFactory> GetMockHttpClientFactory(HttpResponseMessage response)
        {
            var mockHttpClientFactory = new Mock<IHttpClientFactory>();
            var mockHttpClient = new Mock<HttpClient>();
            
            var httpClient = new HttpClient(new MockHttpMessageHandler(response));
            mockHttpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>())).Returns(httpClient);
            
            return mockHttpClientFactory;
        }

        [Fact]
        public async Task GetBooks_ReturnsListOfBooks()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book1 = new Book { Id = 1, Borrower = "John Doe", BookTitle = "Test Book 1", loanDate = DateOnly.FromDateTime(DateTime.Now), returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7)) };
            var book2 = new Book { Id = 2, Borrower = "Jane Smith", BookTitle = "Test Book 2", loanDate = DateOnly.FromDateTime(DateTime.Now), returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7)) };
            
            context.Books.Add(book1);
            context.Books.Add(book2);
            await context.SaveChangesAsync();

            var mockHttpClientFactory = new Mock<IHttpClientFactory>();
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.GetBooks();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Book>>>(result);
            // When returning a value directly from ActionResult<T>, Result is null and Value contains the data
            // The conversion to OkObjectResult happens in the MVC pipeline, not in unit tests
            var books = Assert.IsAssignableFrom<IEnumerable<Book>>(actionResult.Value);
            Assert.NotNull(books);
            Assert.Equal(2, books.Count());
        }

        [Fact]
        public async Task GetBooks_ReturnsEmptyList_WhenNoBooksExist()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var mockHttpClientFactory = new Mock<IHttpClientFactory>();
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.GetBooks();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Book>>>(result);
            // When returning a value directly from ActionResult<T>, Result is null and Value contains the data
            var books = Assert.IsAssignableFrom<IEnumerable<Book>>(actionResult.Value);
            Assert.NotNull(books);
            Assert.Empty(books);
        }

        [Fact]
        public async Task PostBook_ReturnsCreated_WhenValidBook()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book = new Book
            {
                Borrower = "John Doe",
                BookTitle = "The Dark Tower",
                loanDate = DateOnly.FromDateTime(DateTime.Now),
                returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7))
            };

            // Mock Open Library API response
            var openLibraryResponse = new
            {
                numFound = 1,
                docs = new[]
                {
                    new { title = "The Dark Tower" }
                }
            };
            var jsonResponse = System.Text.Json.JsonSerializer.Serialize(openLibraryResponse);
            var httpResponse = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(jsonResponse, Encoding.UTF8, "application/json")
            };

            var mockHttpClientFactory = GetMockHttpClientFactory(httpResponse);
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.PostBook(book);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Book>>(result);
            var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var returnedBook = Assert.IsType<Book>(createdResult.Value);
            Assert.Equal("John Doe", returnedBook.Borrower);
            Assert.Equal("The Dark Tower", returnedBook.BookTitle);
            Assert.True(returnedBook.Id > 0);
        }

        [Fact]
        public async Task PostBook_ReturnsBadRequest_WhenBorrowerIsEmpty()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book = new Book
            {
                Borrower = "",
                BookTitle = "Test Book",
                loanDate = DateOnly.FromDateTime(DateTime.Now),
                returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7))
            };

            var mockHttpClientFactory = new Mock<IHttpClientFactory>();
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.PostBook(book);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Book>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task PostBook_ReturnsBadRequest_WhenBookTitleIsEmpty()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book = new Book
            {
                Borrower = "John Doe",
                BookTitle = "",
                loanDate = DateOnly.FromDateTime(DateTime.Now),
                returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7))
            };

            var mockHttpClientFactory = new Mock<IHttpClientFactory>();
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.PostBook(book);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Book>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task PostBook_ReturnsBadRequest_WhenLoanDateIsInvalid()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book = new Book
            {
                Borrower = "John Doe",
                BookTitle = "Test Book",
                loanDate = DateOnly.MinValue,
                returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7))
            };

            var mockHttpClientFactory = new Mock<IHttpClientFactory>();
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.PostBook(book);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Book>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task PostBook_ReturnsBadRequest_WhenLoanDateIsAfterReturnDate()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book = new Book
            {
                Borrower = "John Doe",
                BookTitle = "Test Book",
                loanDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7)),
                returnDate = DateOnly.FromDateTime(DateTime.Now)
            };

            var mockHttpClientFactory = new Mock<IHttpClientFactory>();
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.PostBook(book);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Book>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task PostBook_ReturnsBadRequest_WhenBookNotFoundInOpenLibrary()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book = new Book
            {
                Borrower = "John Doe",
                BookTitle = "NonExistent Book 12345",
                loanDate = DateOnly.FromDateTime(DateTime.Now),
                returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7))
            };

            // Mock Open Library API response with no results
            var openLibraryResponse = new
            {
                numFound = 0,
                docs = new object[0]
            };
            var jsonResponse = System.Text.Json.JsonSerializer.Serialize(openLibraryResponse);
            var httpResponse = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(jsonResponse, Encoding.UTF8, "application/json")
            };

            var mockHttpClientFactory = GetMockHttpClientFactory(httpResponse);
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.PostBook(book);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Book>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task PostBook_ReturnsBadRequest_WhenOpenLibraryApiFails()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var book = new Book
            {
                Borrower = "John Doe",
                BookTitle = "Test Book",
                loanDate = DateOnly.FromDateTime(DateTime.Now),
                returnDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7))
            };

            // Mock Open Library API failure
            var httpResponse = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            var mockHttpClientFactory = GetMockHttpClientFactory(httpResponse);
            var controller = new BooksController(context, mockHttpClientFactory.Object);

            // Act
            var result = await controller.PostBook(book);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Book>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        // Helper class for mocking HttpClient
        private class MockHttpMessageHandler : HttpMessageHandler
        {
            private readonly HttpResponseMessage _response;

            public MockHttpMessageHandler(HttpResponseMessage response)
            {
                _response = response;
            }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                return Task.FromResult(_response);
            }
        }
    }
}

