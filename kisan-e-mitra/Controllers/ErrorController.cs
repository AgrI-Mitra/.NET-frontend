using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public class ErrorController : Controller
    {
        // GET: Error
        public ActionResult Index(string errorMessage)
        {
            if(errorMessage == null)
            {
                errorMessage = Resources.Resource.error_disconnected; //"There was a problem loading the site.";
            }
            ViewBag.ErrorTitle = "Error";
            ViewBag.ErrorMessage = errorMessage;
            return View();
        }

        public ActionResult NotFound()
        {
            ViewBag.ErrorTitle = "404";
            ViewBag.ErrorMessage = "Page not found.";
            return View();
        }
    }
}