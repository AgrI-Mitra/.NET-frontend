using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace kishan_bot.Controllers
{
    public class ErrorController : Controller
    {
        // GET: Error
        public ActionResult Index()
        {
            ViewBag.ErrorTitle = "404";
            ViewBag.ErrorMessage = "Page not found.";
            return View();
        }
    }
}