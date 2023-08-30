using KisanEMitra.Models;
using System;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public abstract class BaseController : Controller
    {
        public BaseController()
        {
        }
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);

            var userSessionID = Session["userSessionID"];

            if (userSessionID == null)
            {
                Session["userSessionID"] = userSessionID ?? throw new Exception("Session is not created. Please try again later.");
            }

            string selectedLanguageCode;
            HttpCookie langCookie = Request.Cookies["culture"];
            if (langCookie != null)
            {
                selectedLanguageCode = langCookie.Value;
            }
            else
            {
                var userLanguage = Request.UserLanguages;
                var userLang = userLanguage != null ? userLanguage[0] : "";
                if (userLang != "")
                {
                    selectedLanguageCode = userLang;
                }
                else
                {
                    selectedLanguageCode = LanguageManager.GetDefaultLanguage();
                }
            }

            var languaggesOrderedByPosition = LanguageManager.GetLanguagesOrderedByPosition();

            var languageModel = new LanguageModel
            {
                SelectedLanguage = LanguageManager.GetLanguageDetailsByCode(selectedLanguageCode),
                AvailableLanguages = languaggesOrderedByPosition
            };

            ViewBag.languageModel = languageModel;
        }
    }
}