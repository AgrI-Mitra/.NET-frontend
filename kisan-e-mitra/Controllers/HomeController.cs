﻿using KisanEMitra.Models;
using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebGrease.Activities;

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
        public async Task<ActionResult> Index()
        {

            HttpContext context = System.Web.HttpContext.Current;
            System.Web.SessionState.SessionIDManager Manager = new System.Web.SessionState.SessionIDManager();

            string fingerPrint = Manager.CreateSessionID(context);

            var userSessionID = Session["userSessionID"];

            if (userSessionID == null)
            {
                if (fingerPrint == null)
                {
                    var errorMessage = "API call error. Please try again later.";
                    return RedirectToAction("Index", "Error", errorMessage);
                }

                userSessionID = await this.agrimitraService.GetUserSessionIDAsync(fingerPrint);
                if (userSessionID == null)
                {
                    var errorMessage = "Session is not created. Please try again later.";
                    return RedirectToAction("Index", "Error", errorMessage);
                }

                Session["userSessionID"] = userSessionID;
            }

            var languageModel = GetSelectedLanguage();
            ViewBag.LanguageModel = languageModel;
            return View();
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
                Text = identifyID,
                inputLanguage = GetSelectedLanguage().SelectedLanguage
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
                Text = otp,
                inputLanguage = GetSelectedLanguage().SelectedLanguage
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
                Text = querstion,
                inputLanguage = GetSelectedLanguage().SelectedLanguage
            };
            var responseBody = await this.agrimitraService.AskQuestionAsync(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> AskAudioQuestions(string base64Question)
        {

            var userSessionID = (string)Session["userSessionID"];
            var userQueryBody = new UserQueryBody()
            {
                Media = new MediaQuery() { Category = "base64audio", Text = base64Question },
                inputLanguage = GetSelectedLanguage().SelectedLanguage
            };
            var responseBody = await this.agrimitraService.AskQuestionAsync(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ChatHistory()
        {

            List<ChatHistory> chatHistories = new List<ChatHistory>();

            //for (int i = 0; i < 20; i++)
            //{
            //    chatHistories.Add(new ChatHistory
            //    {
            //        Message = i.ToString(),
            //        Alignment = i % 2 == 0 ? "left" : "right",
            //    });
            //}
            ViewBag.LanguageModel = GetSelectedLanguage();
            return View(chatHistories);
        }

        public ActionResult More()
        {
            ViewBag.LanguageModel = GetSelectedLanguage();
            return View();
        }

        public ActionResult ProfileView()
        {
            ViewBag.LanguageModel = GetSelectedLanguage();
            return View();
        }

        public ActionResult FAQs()
        {
            ViewBag.LanguageModel = GetSelectedLanguage();
            return View();
        }

        public ActionResult Feedback()
        {
            ViewBag.LanguageModel = GetSelectedLanguage();
            return View();
        }

        [HttpPost]
        public ActionResult SubmitRating(int rating)
        {
            ViewBag.LanguageModel = GetSelectedLanguage();
            return View("Feedback");
        }

        [HttpPost]
        public ActionResult SubmitReview(string review)
        {
            ViewBag.LanguageModel = GetSelectedLanguage();
            return View("Feedback");
        }

        public FileResult DownloadFile(string filename)
        {
            string fullName = Server.MapPath("~" + "/Content/Files/" + filename);

            return File(fullName, "application/pdf", filename);
        }

        public FileResult download(string filename)
        {
            string fullName = Server.MapPath("~" + "/Content/Files/" + filename);

            return File(fullName, "application/pdf", filename);
        }

        private LanguageModel GetSelectedLanguage()
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

            var languageModel = new LanguageModel
            {
                Languages = new SelectList(LanguageManager.AvailableLanguages, "LanguageCultureName", "LanguageFullName"),
                SelectedLanguage = selectedLanguage
            };
            return languageModel;
        }
    }
}