using KisanEMitra.Models;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public class HomeController : LanguageController
    {
        public ActionResult Splash()
        {
            return View();
        }
        public ActionResult Index()
        {

            string selectedLanguage;
            HttpCookie langCookie = Request.Cookies["culture"];
            if (langCookie != null)
            {
                selectedLanguage = langCookie.Value;
            }
            else
            {
                var userLanguage = Request.UserLanguages;
                var userLang = userLanguage != null ? userLanguage[0] : "";
                if (userLang != "")
                {
                    selectedLanguage = userLang;
                }
                else
                {
                    selectedLanguage = LanguageManager.GetDefaultLanguage();
                }
            }

            var languageModel = new LanguageModel
            {
                Languages = new SelectList(LanguageManager.AvailableLanguages, "LanguageCultureName", "LanguageFullName"),
                SelectedLanguage = selectedLanguage
            };

            return View(languageModel);
        }

        [HttpPost]
        public ActionResult ChangeLanguage(string lang)
        {
            new LanguageManager().SetLanguage(lang);
            return Json(new AjaxActionResult()
            {
                Message = "Language Changed.",
                Success = true
            });
        }
    }

    public class AjaxActionResult
    {
        public string Message { get; set; }
        public bool Success { get; set; }
        public object Data { get; set; }
    }
}