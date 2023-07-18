using KisanEMitra.Models;
using System;
using System.Collections.Generic;
using System.Linq;
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