using KisanEMitra.Models;
using System;
using System.Linq;
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
                Languages = new SelectList(LanguageManager.GetLanguagesOrderedByPosition(), "LanguageCultureName", "LanguageLabel"),
                SelectedLanguage = selectedLanguage
            };
            ViewBag.languageModel = languageModel;
        }
    }
}