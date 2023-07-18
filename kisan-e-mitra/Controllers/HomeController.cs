using KisanEMitra.Models;
using kishan_bot.Services;
using kishan_bot.Services.Contracts;
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
            
            ViewBag.Languages = new SelectList(LanguageManager.AvailableLanguages, "LanguageCultureName", "LanguageFullName");
            return View();
        }

        [HttpPost]
        public ActionResult ChangeLanguage(string lang)
        {
            Console.WriteLine(lang);
            new LanguageManager().SetLanguage(lang);
            return RedirectToAction("Index", "Home");
        }
    }
}