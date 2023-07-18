using KisanEMitra.Models;
using KisanEMitra.Services;
using KisanEMitra.Services.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public class HomeController : LanguageController
    {
        public IAgrimitraService agrimitraService { get; set; }

        public HomeController(IAgrimitraService _agrimitraService)
        {
            this.agrimitraService = _agrimitraService;
        }

        public ActionResult Splash()
        {
            return View();
        }
        public ActionResult Index(string fingerPrint)
        {
            var userSessionID = Session["userSessionID"];

            if (userSessionID == null)
            {
                if (fingerPrint == null)
                    throw new Exception("API call error. Please try again later.");

                userSessionID = this.agrimitraService.GetUserSessionIDAsync(fingerPrint);
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

        [HttpPost]
        public ActionResult CheckRecordingStatus(bool status)
        {
            // Return the new boolean value as JSON
            return Json(new { isRecording = !status });
        }
    }

    public class AjaxActionResult
    {
        public string Message { get; set; }
        public bool Success { get; set; }
        public object Data { get; set; }
    }
}