﻿using KisanEMitra.Models;
using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using kishan_bot.Services.Contracts;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public class TestController : LanguageController
    {
        public IAgrimitraService AgrimitraService { get; set; }
        private IBhashiniService BhashiniService { get; set; }

        private IChatbotService ChatbotService { get; set; }

        private readonly string[] languageCodesToEnable = new string[] { "hi", "ta", "or", "bn", "en", "mr", "ta", "ml", "gu", "pa" };

        public TestController(IAgrimitraService _agrimitraService, IBhashiniService bhashiniService, IChatbotService chatbotService)
        {
            AgrimitraService = _agrimitraService;
            BhashiniService = bhashiniService;
            ChatbotService = chatbotService;
        }

        public ActionResult Splash()
        {
            return View();
        }

        public ActionResult Index()
        {
            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            TempData["LanguageModel"] = languageModel;
            TempData["PopularQuestions"] = ChatbotService.GetPopularQuestions();

            // Check if site is in maintenence mode or not
            bool isMaintenanceModeOn = bool.Parse(ConfigurationManager.AppSettings["isMaintenanceModeOn"]);
            TempData["isMaintenanceModeOn"] = isMaintenanceModeOn;
            return View();
        }

        [HttpPost]
        public async Task<JsonResult> GetTextToSpeechFromBhashini()
        {

            List<string> strings = new List<string>();

            var availableLanguages = LanguageManager.GetLanguagesOrderedByPosition(languageCodesToEnable);

            foreach (var availableLanguage in availableLanguages)
            {
                strings.Add(availableLanguage.LanguageEnglishLabel);
            }

            var greetingMessagesAudioStrings = await TextToSpeach("hi", strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<CommonKeyValue> audioBase64Strings = new List<CommonKeyValue>();

            for (int i = 0; i < availableLanguages.Count; i++)
            {
                var availableLanguage = availableLanguages[i];

                audioBase64Strings.Add(new CommonKeyValue
                {
                    Key = "language-labels-" + availableLanguage.LanguageEnglishLabel,
                    Value = greetingMessagesAudioStrings[i].audioContent.ToString()
                });
            }

            return Json(new AjaxActionResponse()
            {
                Message = "Success",
                Data = audioBase64Strings,
                Success = true
            });
        }

        [HttpPost]
        public async Task<JsonResult> GetWelcomeGreetingsTextToSpeech()
        {

            List<string> strings = new List<string>
            {
                Resources.Resource.message_welcome_greeting.ToString(),
                Resources.Resource.message_language_changed_greeting.ToString()
            };

            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            var greetingMessagesAudioStrings = await TextToSpeach(languageModel.SelectedLanguage.LanguageCultureCode, strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<CommonKeyValue> audioBase64Strings = new List<CommonKeyValue>();

            var selectedLanguage = languageModel.SelectedLanguage;

            if (greetingMessagesAudioStrings.Count > 0)
            {

                audioBase64Strings.Add(new CommonKeyValue
                {
                    Key = "welcome-greeting-message-base64-" + selectedLanguage.LanguageCultureCode,
                    Value = greetingMessagesAudioStrings[0].audioContent.ToString()
                });

                audioBase64Strings.Add(new CommonKeyValue
                {
                    Key = "language-change-greeting-message-base64-" + selectedLanguage.LanguageCultureCode,
                    Value = greetingMessagesAudioStrings[1].audioContent.ToString()
                });
            }

            return Json(new AjaxActionResponse()
            {
                Message = "Success",
                Data = audioBase64Strings,
                Success = true
            });
        }

        [HttpPost]
        public JsonResult ChangeLanguage(string lang)
        {
            new LanguageManager().SetLanguage(lang);

            var translationsToUpdateInUI = ChatbotService.GetTranslations();
            return Json(new AjaxActionResponse()
            {
                Message = Resources.Resource.message_language_changed_greeting.ToString(),
                Data = new
                {
                    Translations = translationsToUpdateInUI,
                    PopularQuestions = ChatbotService.GetPopularQuestions()
                },
                Success = true
            });
        }

        [HttpPost]
        public JsonResult GetUITranslations()
        {
            var translations = ChatbotService.GetTranslations();
            return Json(new AjaxActionResponse()
            {
                Success = true,
                Data = new { Translations = translations }
            });
        }

        [HttpPost]
        public async Task<JsonResult> AddMatricsCount(string matricsType)
        {
            await AgrimitraService.AddMatricsCount(matricsType);

            return Json("", JsonRequestBehavior.AllowGet);
        }

        public async Task<List<BhashiniApiResponseAudioInfo>> TextToSpeach(string languageCode, List<string> texts)
        {
            var bhashiniApiInput = new List<BhashiniApiRequestBodyInput>();

            foreach (var text in texts)
            {
                bhashiniApiInput.Add(new BhashiniApiRequestBodyInput
                {
                    source = text
                });
            }

            var responseBody = await BhashiniService.GetTextToSpeech(languageCode, bhashiniApiInput);

            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            TempData["LanguageModel"] = languageModel;
            TempData["PopularQuestions"] = ChatbotService.GetPopularQuestions();

            return responseBody.audio;
        }

        public ActionResult ChatHistory()
        {
            List<ChatHistory> chatHistories = new List<ChatHistory>();

            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            ViewBag.LanguageModel = languageModel;
            return View(chatHistories);
        }

        public ActionResult More()
        {
            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;

            return View();
        }

        public ActionResult ProfileView()
        {
            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;
            return View();
        }

        public ActionResult FAQs()
        {
            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;
            return View();
        }

        public ActionResult Feedback()
        {
            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;
            return View();
        }

        [HttpPost]
        public ActionResult SubmitRating(int rating)
        {
            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            //var languageModel = ChatbotService.GetSelectedLanguage(langCookie, userLanguage, languageCodesToEnable);
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;

            return View("Feedback");
        }

        [HttpPost]
        public ActionResult SubmitReview(string review)
        {
            HttpCookie langCookie = Request.Cookies["culture"];
            var userLanguage = Request.UserLanguages;

            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;

            return View("Feedback");
        }

        public FileResult DownloadFile(string filename)
        {
            string fullName = Server.MapPath("~" + "/Content/Files/" + filename);

            return File(fullName, "application/pdf", filename);
        }
    }
}