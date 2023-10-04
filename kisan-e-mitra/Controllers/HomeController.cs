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
            AgrimitraService = _agrimitraService;
            BhashiniService = bhashiniService;


        }

        public ActionResult Splash()
        {
            return View();
        }

        public ActionResult Index()
        {
            var languageModel = GetSelectedLanguage();
            TempData["LanguageModel"] = languageModel;
            TempData["PopularQuestions"] = GetPopularQuestions();

            // Check if site is in maintenence mode or not
            bool isMaintenanceModeOn = bool.Parse(ConfigurationManager.AppSettings["isMaintenanceModeOn"]);
            TempData["isMaintenanceModeOn"] = isMaintenanceModeOn;
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
                },
                new CommonKeyValue
                {
                    Key = "error_default_message",
                    Value = Resources.Resource.error_default_message.ToString()
                },
                new CommonKeyValue
                {
                    Key = "message_ask_ur_question",
                    Value = Resources.Resource.message_ask_ur_question.ToString()
                },
                new CommonKeyValue
                {
                    Key = "message_confirmation",
                    Value = Resources.Resource.message_confirmation.ToString()
                },
                new CommonKeyValue
                {
                    Key = "message_session_restart_confirmation_message",
                    Value = Resources.Resource.message_session_restart_confirmation_message.ToString()
                },
                new CommonKeyValue
                {
                    Key = "label_yes",
                    Value = Resources.Resource.label_yes.ToString()
                },new CommonKeyValue
                {
                    Key = "label_no",
                    Value = Resources.Resource.label_no.ToString()
                }
            };

            return translations;
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

            var greetingMessagesAudioStrings = await TextToSpeach(GetSelectedLanguage().SelectedLanguage.LanguageCultureCode, strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<CommonKeyValue> audioBase64Strings = new List<CommonKeyValue>();

            var selectedLanguage = GetSelectedLanguage().SelectedLanguage;

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

            var translationsToUpdateInUI = GetTranslations();
            return Json(new AjaxActionResponse()
            {
                Message = Resources.Resource.message_language_changed_greeting.ToString(),
                Data = new { Translations = translationsToUpdateInUI, PopularQuestions = GetPopularQuestions() },
                Success = true
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

            var languageModel = GetSelectedLanguage();
            TempData["LanguageModel"] = languageModel;
            TempData["PopularQuestions"] = GetPopularQuestions();

            return responseBody.audio;
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