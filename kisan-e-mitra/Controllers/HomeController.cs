﻿using KisanEMitra.Models;
using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public class HomeController : LanguageController
    {
        public IAgrimitraService AgrimitraService { get; set; }
        private IBhashiniService BhashiniService { get; set; }

        public HomeController(IAgrimitraService _agrimitraService, IBhashiniService bhashiniService)
        {
            AgrimitraService = _agrimitraService;
            BhashiniService = bhashiniService;


        }

        public ActionResult Splash()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Logout()
        {
            KillSession();

            return Json(new AjaxActionResponse()
            {
                Message = "Session refreshed",
                Success = true
            });
        }

        private void KillSession()
        {
            HttpContext context = System.Web.HttpContext.Current;
            System.Web.SessionState.SessionIDManager Manager = new System.Web.SessionState.SessionIDManager();

            Manager.RemoveSessionID(context);

            Session.RemoveAll();
        }

        private async Task CreateSession()
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
                    RedirectToAction("Index", "Error", errorMessage);
                }

                userSessionID = await AgrimitraService.GetUserSessionIDAsync(fingerPrint);
                if (userSessionID == null)
                {
                    var errorMessage = "Session is not created. Please try again later.";
                    RedirectToAction("Index", "Error", errorMessage);
                }

                Session["userSessionID"] = userSessionID;
            }
        }

        public async Task<ActionResult> Index()
        {
            await CreateSession();

            var languageModel = GetSelectedLanguage();
            TempData["LanguageModel"] = languageModel;
            TempData["PopularQuestions"] = GetPopularQuestions();

            //await SetAudioBase64StringToViewBagAsync();
            return View();
        }

        private List<CommonKeyValue> GetTranslations()
        {

            List<CommonKeyValue> translations = new List<CommonKeyValue>
            {
                new CommonKeyValue {
                    Key = "message_welcome_greeting",
                    Value = Resources.Resource.message_welcome_greeting.ToString()
                },
                new CommonKeyValue
                {
                    Key = "message_ask_ur_question",
                    Value = Resources.Resource.message_ask_ur_question.ToString()
                },
                new CommonKeyValue
                {
                    Key = "label_title",
                    Value = Resources.Resource.label_title.ToString()
                },
                new CommonKeyValue
                {
                    Key = "message_language_changed_greeting",
                    Value = Resources.Resource.message_language_changed_greeting.ToString()
                },
                new CommonKeyValue
                {
                    Key = "message_resend_otp",
                    Value = Resources.Resource.message_resend_otp.ToString()
                }
            };

            return translations;
            //return Json(new AjaxActionResponse()
            //{
            //    Message = "Success",
            //    Data = translations,
            //    Success = true
            //});
        }

        [HttpPost]
        public async Task<JsonResult> GetTextToSpeechFromBhashini()
        {

            List<string> strings = new List<string>();

            var availableLanguages = LanguageManager.AvailableLanguages;

            foreach (var availableLanguage in availableLanguages)
            {
                strings.Add(availableLanguage.LanguageEnglishLabel);
            }

            var greetingMessagesAudioStrings = await TextToSpeach("en", strings);

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

            var greetingMessagesAudioStrings = await TextToSpeach(GetSelectedLanguage().SelectedLanguage.LanguageCultureCode, strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<CommonKeyValue> audioBase64Strings = new List<CommonKeyValue>();
            //foreach (var item in greetingMessagesAudioStrings)
            //{
            //    audioBase64Strings.Add(new CommonKeyValue
            //    {
            //        Key = "message_welcome_greeting",
            //        Value = item.audioContent.ToString()
            //    });
            //}


            var selectedLanguage = GetSelectedLanguage().SelectedLanguage;

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

            return Json(new AjaxActionResponse()
            {
                Message = "Success",
                Data = audioBase64Strings,
                Success = true
            });
        }

        private async Task SetAudioBase64StringToViewBagAsync()
        {
            // Get current language audio for welcome note
            List<string> strings = new List<string>
            {
                Resources.Resource.message_welcome_greeting.ToString(),
                Resources.Resource.message_language_changed_greeting.ToString()
            };

            var greetingMessagesAudioStrings = await TextToSpeach(GetSelectedLanguage().SelectedLanguage.LanguageCultureCode, strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<string> audioBase64Strings = new List<string>();
            foreach (var item in greetingMessagesAudioStrings)
            {
                audioBase64Strings.Add(item.audioContent);
            }

            TempData["AudioBase64Strings"] = audioBase64Strings;
        }
        [HttpPost]
        public JsonResult ChangeLanguage(string lang)
        {
            new LanguageManager().SetLanguage(lang);

            var translationsToUpdateInUI = GetTranslations();
            return Json(new AjaxActionResponse()
            {
                Message = Resources.Resource.message_language_changed_greeting.ToString(),
                Data = new { Translations = translationsToUpdateInUI, PopularQuestions = GetPopularQuestions() },
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
                inputLanguage = GetSelectedLanguage().SelectedLanguage.LanguageCultureCode
            };

            var responseBody = await AgrimitraService.IdentifyUser(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> AskQuestions(string querstion, bool finalResponse)
        {
            // Check if response is the final answer by bot, then we need to refresh the session
            if (finalResponse)
            {
                KillSession();
                await CreateSession();
            }

            var userSessionID = (string)Session["userSessionID"];
            var userQueryBody = new UserQueryBody()
            {
                Text = querstion,
                inputLanguage = GetSelectedLanguage().SelectedLanguage.LanguageCultureCode
            };
            var responseBody = await AgrimitraService.AskQuestionAsync(userSessionID, userQueryBody);



            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> LikeMessage(string messageId)
        {
            var userSessionID = (string)Session["userSessionID"];

            var responseBody = await AgrimitraService.LikeDislikeUnlikeMessage(userSessionID, messageId, "like");
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> AddMatricsCount(string matricsType)
        {
            await AgrimitraService.AddMatricsCount(matricsType);

            return Json("", JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> DislikeMessage(string messageId)
        {
            var userSessionID = (string)Session["userSessionID"];

            var responseBody = await AgrimitraService.LikeDislikeUnlikeMessage(userSessionID, messageId, "dislike");
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> UnlikeMessage(string messageId)
        {
            var userSessionID = (string)Session["userSessionID"];

            var responseBody = await AgrimitraService.LikeDislikeUnlikeMessage(userSessionID, messageId, "removelike");
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
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

            var languageModel = GetSelectedLanguage();
            TempData["LanguageModel"] = languageModel;
            TempData["PopularQuestions"] = GetPopularQuestions();

            return responseBody.audio;
        }

        [HttpPost]
        public async Task<JsonResult> AskAudioQuestions(string base64Question)
        {

            var userSessionID = (string)Session["userSessionID"];
            var userQueryBody = new UserQueryBody()
            {
                Media = new MediaQuery() { Category = "base64audio", Text = base64Question },
                inputLanguage = GetSelectedLanguage().SelectedLanguage.LanguageCultureCode
            };
            var responseBody = await AgrimitraService.AskQuestionAsync(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ChatHistory()
        {
            List<ChatHistory> chatHistories = new List<ChatHistory>();

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

        private LanguageModel GetSelectedLanguage()
        {
            string selectedLanguageCode;
            HttpCookie langCookie = Request.Cookies["culture"];
            if (langCookie != null)
            {
                selectedLanguageCode = langCookie.Value;
            }
            else
            {
                var userLanguage = Request.UserLanguages;
                var userLang = userLanguage != null ? userLanguage[0] : "";
                if (userLang != "")
                {
                    selectedLanguageCode = userLang;
                }
                else
                {
                    selectedLanguageCode = LanguageManager.GetDefaultLanguage();
                }
            }

            var languaggesOrderedByPosition = LanguageManager.GetLanguagesOrderedByPosition();

            var languageModel = new LanguageModel
            {
                SelectedLanguage = LanguageManager.GetLanguageDetailsByCode(selectedLanguageCode),
                AvailableLanguages = languaggesOrderedByPosition

            };
            return languageModel;
        }

        private List<PopularQuestion> GetPopularQuestions()
        {
            var popularQuestions = new List<PopularQuestion>();

            for (int i = 1; i < 5; i++)
            {

                popularQuestions.Add(new PopularQuestion
                {
                    PopularQuestionKey = "message.popular_question_" + i.ToString(),
                    PopularQuestionValue = Resources.Resource.ResourceManager.GetString("message.popular_question_" + i.ToString()),
                });
            }

            return popularQuestions;
        }
    }
}