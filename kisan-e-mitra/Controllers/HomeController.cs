using kishan_bot.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace kishan_bot.Controllers
{
    public class HomeController : LanguageController
    {
        public ActionResult Splash()
        {
            return View();
        }
        public ActionResult Index()
        {
            ViewBag.Languages = new SelectList(LanguageManager.AvailableLanguages, "LanguageFullName", "LanguageCultureName");
            return View();
        }

        public void ChangeLanguage(string lang)
        {
            Console.WriteLine(lang);
            new LanguageManager().SetLanguage(lang);
            //return RedirectToAction("Index", "Home");
        }
    }
}