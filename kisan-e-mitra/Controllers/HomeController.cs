using KisanEMitra.Models;
using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System;
using System.Threading.Tasks;
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
        public async Task<ActionResult> Index(string fingerPrint)
        {
            var userSessionID = Session["userSessionID"];

            if (userSessionID == null)
            {
                if (fingerPrint == null)
                    throw new Exception("API call error. Please try again later.");

                userSessionID = await this.agrimitraService.GetUserSessionIDAsync(fingerPrint);
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
        public JsonResult ChangeLanguage(string lang)
        {
            new LanguageManager().SetLanguage(lang);
            return Json(new AjaxActionResponse()
            {
                Message = "Language Changed.",
                Success = true
            });
        }

        [HttpPost]
        public JsonResult CheckRecordingStatus(bool status)
        {
            // Return the new boolean value as JSON
            return Json(new { isRecording = !status });
        }

        [HttpPost]
        public async Task<JsonResult> IdentifyUser(string identifyID)
        {
            var userSessionID = Session["userSessionID"].ToString();

            var userQueryBody = new UserQueryBody()
            {
                Text = identifyID
            };
            var responseBody = await this.agrimitraService.IdentifyUser(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async Task<JsonResult> VerifyOTP(string otp)
        {
            var userSessionID = (string)Session["userSessionID"];
            var userQueryBody = new UserQueryBody()
            {
                Text = otp
            };
            var responseBody = await this.agrimitraService.VerifyOTP(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> AskQuestions(string querstion)
        {
            var userSessionID = (string)Session["userSessionID"];
            var userQueryBody = new UserQueryBody()
            {
                Text = querstion
            };
            var responseBody = await this.agrimitraService.AskQuestionAsync(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> AskAudioQuestions(string base64Question)
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

            var userSessionID = (string)Session["userSessionID"];
            var userQueryBody = new UserQueryBody()
            {
                Media = new MediaQuery() { Category = "base64audio", Text = base64Question },
                inputLanguage = selectedLanguage
            };
            var responseBody = await this.agrimitraService.AskQuestionAsync(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }
    }
}