using kishan_bot.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KisanEMitra.Services.Contracts
{
    public interface IAgrimitraService
    {
        Task<string> GetUserSessionIDAsync(string VisitorID);
        Task<SiteResponseBody> IdentifyUser(string UserID, UserQueryBody UserQuery);
        Task<SiteResponseBody> AskQuestionAsync(string UserID, UserQueryBody UserQuery);
    }
}
