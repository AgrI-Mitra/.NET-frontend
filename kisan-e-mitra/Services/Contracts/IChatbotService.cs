using KisanEMitra.Models;
using kishan_bot.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace kishan_bot.Services.Contracts
{
    public interface IChatbotService
    {
        List<PopularQuestion> GetPopularQuestions();
        LanguageModel GetSelectedLanguage(HttpCookie langCookie, string[] userLanguages, string[] languageCodesToEnable);

        LanguageModel GetSelectedLanguage(HttpRequestBase httpRequest, string[] languageCodesToEnable);

        List<CommonKeyValue> GetTranslations();
    }
}
