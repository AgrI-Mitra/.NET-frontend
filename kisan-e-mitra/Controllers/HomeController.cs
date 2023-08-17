using KisanEMitra.Models;
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
            this.AgrimitraService = _agrimitraService;
            this.BhashiniService = bhashiniService;
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

            var defaultLanguage = LanguageManager.GetDefaultLanguage();
            new LanguageManager().SetLanguage(defaultLanguage);
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

                userSessionID = await AgrimitraService.GetUserSessionIDAsync(fingerPrint);
                if (userSessionID == null)
                {
                    var errorMessage = "Session is not created. Please try again later.";
                    return RedirectToAction("Index", "Error", errorMessage);
                }

                Session["userSessionID"] = userSessionID;
            }

            var languageModel = GetSelectedLanguage();
            ViewBag.LanguageModel = languageModel;

            //// Get current language audio for welcome note
            //List<string> strings = new List<string>
            //{
            //    Resources.Resource.message_welcome_greeting.ToString(),
            //    Resources.Resource.message_language_changed_greeting.ToString()
            //};

            //var greetingMessagesAudioStrings = await TextToSpeach(strings);

            //// Load audio base64 strings to view bag so we can play audio using it
            //List<string> audioBase64Strings = new List<string>();
            //foreach (var item in greetingMessagesAudioStrings)
            //{
            //    audioBase64Strings.Add(item.audioContent);
            //}

            //ViewBag.AudioBase64Strings = audioBase64Strings;
            await SetAudioBase64StringToViewBagAsync();
            return View();
        }

        private async Task SetAudioBase64StringToViewBagAsync()
        {
            // Get current language audio for welcome note
            List<string> strings = new List<string>
            {
                Resources.Resource.message_welcome_greeting.ToString(),
                Resources.Resource.message_language_changed_greeting.ToString()
            };

            var greetingMessagesAudioStrings = await TextToSpeach(strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<string> audioBase64Strings = new List<string>();
            foreach (var item in greetingMessagesAudioStrings)
            {
                audioBase64Strings.Add(item.audioContent);
            }

            ViewBag.AudioBase64Strings = audioBase64Strings;
        }
        [HttpPost]
        public async Task<JsonResult> ChangeLanguage(string lang)
        {
            new LanguageManager().SetLanguage(lang);

            //await SetAudioBase64StringToViewBagAsync();

            return Json(new AjaxActionResponse()
            {
                Message = Resources.Resource.message_language_changed_greeting.ToString(),
                Success = true,
                //Data = ViewBag.AudioBase64Strings
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

            var responseBody = await AgrimitraService.IdentifyUser(userSessionID, userQueryBody);
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
            var responseBody = await AgrimitraService.AskQuestionAsync(userSessionID, userQueryBody);
            if (responseBody == null)
                return Json(null);

            return Json(responseBody, JsonRequestBehavior.AllowGet);
        }

        public async Task<List<BhashiniApiResponseAudioInfo>> TextToSpeach(List<string> texts)
        {
            var bhashiniApiInput = new List<BhashiniApiRequestBodyInput>();

            foreach (var text in texts)
            {
                bhashiniApiInput.Add(new BhashiniApiRequestBodyInput
                {
                    source = text
                });
            }

            var responseBody = await BhashiniService.GetTextToSpeech(GetSelectedLanguage().SelectedLanguage, bhashiniApiInput);

            var languageModel = GetSelectedLanguage();
            ViewBag.LanguageModel = languageModel;

            //if (responseBody == null)
            //    return Json(null);

            return responseBody.audio;
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
            var responseBody = await AgrimitraService.AskQuestionAsync(userSessionID, userQueryBody);
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
                Languages = new SelectList(LanguageManager.AvailableLanguages, "LanguageCultureName", "LanguageLabel"),
                SelectedLanguage = selectedLanguage
            };
            return languageModel;
        }
    }
}