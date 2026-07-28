using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SplatDev.DigitalBookCurator.Core.Models;
using SplatDev.DigitalBookCurator.Core.Repositories;
using SplatDev.DigitalBookCurator.Core.ViewModels;
using SplatDev.Umbraco.Plugins.PdfCurator.Models;

using Umbraco.Cms.Web.Common.Controllers;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Controllers
{
    [Authorize]
    public class ManagerApiController : ControllerBase
    {
        private readonly IBookRepository _bookRepository;

        public ManagerApiController(IBookRepository bookRepository)
        {
            _bookRepository = bookRepository;
        }

        [HttpGet]
        public async Task<IEnumerable<Book>> GetAllAsync()
        {
            return await _bookRepository.GetAllBooksAsync();
        }

        [HttpPost]
        public async Task<PagedResults<BookViewModel>> GetFilteredBooksAsync([FromBody] PagedFilter filter)
        {
            var results = await _bookRepository.GetFilteredBooksAsync(filter);
            return results;
        }

        [HttpGet]
        public async Task<Book?> GetBookAsync(int id)
        {
            return await _bookRepository.GetBookByIdAsync(id);
        }

        [HttpPost]
        public async Task<Book?> UpdateBookAsync(Book book)
        {
            return await _bookRepository.UpdateBookAsync(book);
        }

        [HttpDelete]
        public async Task DeleteBookAsync(int id)
        {
            await _bookRepository.DeleteBookAsync(id);
        }
    }
}
