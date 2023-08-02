using KisanEMitra.Models;
using KisanEMitra.Services.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public abstract class BaseController : Controller
    {
        public IAgrimitraService agrimitraService { get; set; }

        public BaseController(IAgrimitraService _agrimitraService)
        {
            this.agrimitraService = _agrimitraService;
        }
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);

            
            var userSessionID = Session["userSessionID"];

            if (userSessionID == null)
            {
                //if (fingerPrint == null)
                //    throw new Exception("API call error. Please try again later.");

                //userSessionID = await this.agrimitraService.GetUserSessionIDAsync(fingerPrint);
                if (userSessionID == null)
                    throw new Exception("Session is not created. Please try again later.");

                Session["userSessionID"] = userSessionID;
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
                Languages = new SelectList(LanguageManager.AvailableLanguages, "LanguageCultureName", "LanguageLabel"),
                SelectedLanguage = selectedLanguage
            };
            ViewBag.languageModel = languageModel;
        }
    }
}