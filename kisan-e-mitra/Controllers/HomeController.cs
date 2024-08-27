using KisanEMitra.Models;
using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using kishan_bot.Services;
using kishan_bot.Services.Contracts;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public class HomeController : LanguageController
    {
        public IAgrimitraService AgrimitraService { get; set; }
        private IBhashiniService BhashiniService { get; set; }

        private IChatbotService ChatbotService { get; set; }

        private string[] languageCodesToEnable = new string[] { "hi", "te", "or", "bn", "en", "mr", "ta", "ml", "gu", "pa", "kn" };

        public HomeController(IAgrimitraService _agrimitraService, IBhashiniService bhashiniService, IChatbotService chatbotService)
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
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            TempData["LanguageModel"] = languageModel;

            // Check if site is in maintenence mode or not
            bool isMaintenanceModeOn = bool.Parse(ConfigurationManager.AppSettings["isMaintenanceModeOn"]);
            TempData["isMaintenanceModeOn"] = isMaintenanceModeOn;
            string apiUrl = ConfigurationManager.AppSettings["apiUrl"].ToString();
            TempData["apiUrl"] = apiUrl;
            return View();
        }

        public ActionResult IndexPartial()
        {
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            TempData["LanguageModel"] = languageModel;

            bool isMaintenanceModeOn = bool.Parse(ConfigurationManager.AppSettings["isMaintenanceModeOn"]);
            TempData["isMaintenanceModeOn"] = isMaintenanceModeOn;
            string apiUrl = ConfigurationManager.AppSettings["apiUrl"].ToString();
            TempData["apiUrl"] = apiUrl;
            return PartialView("_IndexPartial");
        }

        public ActionResult Test()
        {
            languageCodesToEnable = new string[] { "hi", "te", "or", "bn", "en", "mr", "ta", "ml", "gu", "pa", "kn" };

            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            TempData["LanguageModel"] = languageModel;

            // Check if site is in maintenence mode or not
            bool isMaintenanceModeOn = bool.Parse(ConfigurationManager.AppSettings["isMaintenanceModeOn"]);
            TempData["isMaintenanceModeOn"] = isMaintenanceModeOn;
            string apiUrl = ConfigurationManager.AppSettings["apiUrl"].ToString();
            TempData["apiUrl"] = apiUrl;

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
                },
                new CommonKeyValue
                {
                    Key = "app_tour_welcome_header",
                    Value = Resources.Resource.message_app_tour_welcome_header
                },
                new CommonKeyValue
                {
                    Key = "app_tour_welcome_description",
                    Value = Resources.Resource.message_app_tour_welcome_description
                },
                new CommonKeyValue
                {
                    Key = "app_tour_language_selection_description",
                    Value = Resources.Resource.message_app_tour_language_selection_description
                },
                new CommonKeyValue
                {
                    Key = "app_tour_alternate_language_selection_description",
                    Value = Resources.Resource.message_app_tour_alternate_language_selection_description
                },
                new CommonKeyValue
                {
                    Key = "app_tour_audio_button_description",
                    Value = Resources.Resource.message_app_tour_audio_button_description
                },new CommonKeyValue
                {
                    Key = "app_tour_sample_questions_description",
                    Value = Resources.Resource.message_app_tour_sample_questions_description
                },new CommonKeyValue
                {
                    Key = "app_tour_typebox_description",
                    Value = Resources.Resource.message_app_tour_typebox_description
                },new CommonKeyValue
                {
                    Key = "app_tour_mic_button_description",
                    Value = Resources.Resource.message_app_tour_mic_button_description
                },new CommonKeyValue
                {
                    Key = "app_tour_send_button_description",
                    Value = Resources.Resource.message_app_tour_send_button_description
                },new CommonKeyValue
                {
                    Key = "app_tour_refresh_button_description",
                    Value = Resources.Resource.message_app_tour_refresh_button_description
                },new CommonKeyValue
                {
                    Key = "previous",
                    Value = Resources.Resource.label_previous
                },new CommonKeyValue
                {
                    Key = "next",
                    Value = Resources.Resource.label_next
                },new CommonKeyValue
                {
                    Key = "app_tour_exit",
                    Value = Resources.Resource.message_app_tour_exit
                },
                new CommonKeyValue
                {
                    Key = "label_submit",
                    Value = Resources.Resource.label_submit
                },
                new CommonKeyValue
                {
                    Key = "message_feedback_description",
                    Value = Resources.Resource.message_feedback_description
                },
                new CommonKeyValue
                {
                    Key = "message_chatbot_functionality_feedback",
                    Value = Resources.Resource.message_chatbot_functionality_feedback
                },
                new CommonKeyValue
                {
                    Key = "message_information_feedback",
                    Value = Resources.Resource.message_information_feedback
                },
                new CommonKeyValue
                {
                    Key = "message_translation_feedback",
                    Value = Resources.Resource.message_translation_feedback
                },
                new CommonKeyValue
                {
                    Key = "label_close",
                    Value = Resources.Resource.label_close
                },
                new CommonKeyValue
                {
                    Key = "message_feedback_title",
                    Value = Resources.Resource.message_feedback_title
                },
                new CommonKeyValue
                {
                    Key = "message_thank_you_for_feedback",
                    Value = Resources.Resource.message_thank_you_for_feedback
                },
                new CommonKeyValue
                {
                    Key = "message_pm_kisan_scheme",
                    Value = Resources.Resource.message_pm_kisan_scheme
                }
            };

            return translations;
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
        private async Task<JsonResult> GetTextToSpeechForAllLanguages(string[] languagesCodes = null)
        {
            var ignoreValues = new string[]
            {
                "(PM KISAN)",
                "(PMFBY)",
                "(KCC)"
            };

            // We need to get speech to text for Welcome and Language change greeting messages for all the languages
            // Get all the enabled languages
            var languages = LanguageManager.GetLanguagesOrderedByPosition(languageCodesToEnable);

            try
            {
                for (int i = 0; i < languages.Count; i++)
                {
                    var currentLanguage = languages[i];

                    // Proceed ahead only if languagesCodes value is null or if languagesCodes value is available and current language code is matching with it
                    if (languagesCodes != null && languagesCodes.Length > 0 && !languagesCodes.Contains(currentLanguage.LanguageCultureCode))
                    {
                        continue;
                    }

                    // Ge tthe translation file path
                    string fileName = Server.MapPath("~" + "/Content/translations/" + currentLanguage.LanguageEnglishLabel.ToLower() + ".json");

                    // Get Welcome message from Content/translations/language specific json file
                    string welcomeMessage = CoreHelper.GetValueFromJson(fileName, "messages.welcome_greeting", ignoreValues);
                    //string welcomeMessageOne = CoreHelper.GetValueFromJson(fileName, "messages.welcome_greeting_1", ignoreValues);

                    //// If welcomeMessageOne is not empty then we need to combine it with the welcomeMessage
                    //// As Welcome message will be displayed in two separate parts in UI but will be read as whole in the same speech
                    //if (string.IsNullOrEmpty(welcomeMessageOne) == false)
                    //{
                    //    welcomeMessage = welcomeMessage + " " + welcomeMessageOne;
                    //}

                    // Get Language Change message from Content/translations/language specific json file
                    string languageChangeMessage = CoreHelper.GetValueFromJson(fileName, "messages.language_changed_greeting", ignoreValues);

                    //Get text to speech for Welcome message and Language Change message
                    var greetingMessagesAudioStrings = await GetWelcomeGreetingsTextToSpeech(currentLanguage.LanguageCultureCode, welcomeMessage, languageChangeMessage);

                    // Get welcome message and language change message file path
                    string welcomeMessageFilePath = Server.MapPath("~" + "/Content/audio/welcome-" + currentLanguage.LanguageCultureCode.ToLower() + ".txt");
                    string languageChangeMessageFilePath = Server.MapPath("~" + "/Content/audio/language-change-" + currentLanguage.LanguageCultureCode.ToLower() + ".txt");

                    // Update welcome message and language change message file content
                    CoreHelper.UpdateTextFileContent(welcomeMessageFilePath, greetingMessagesAudioStrings[0].Value);
                    CoreHelper.UpdateTextFileContent(languageChangeMessageFilePath, greetingMessagesAudioStrings[1].Value);
                }

                return Json(new AjaxActionResponse()
                {
                    Success = true,
                    Data = "Success",
                });
            }
            catch (Exception ex)
            {
                return Json(new AjaxActionResponse()
                {
                    Success = false,
                    Data = ex.Message
                });
            }
        }

        public async Task<List<CommonKeyValue>> GetWelcomeGreetingsTextToSpeech(string languageCode, string welcomeMessage, string languageChangeMessage)
        {

            List<string> strings = new List<string>
            {
                welcomeMessage,
                languageChangeMessage
            };

            var greetingMessagesAudioStrings = await TextToSpeach(languageCode, strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<CommonKeyValue> audioBase64Strings = new List<CommonKeyValue>();

            if (greetingMessagesAudioStrings.Count > 0)
            {

                audioBase64Strings.Add(new CommonKeyValue
                {
                    Key = "welcome-greeting-message-base64-" + languageCode,
                    Value = greetingMessagesAudioStrings[0].audioContent.ToString()
                });

                audioBase64Strings.Add(new CommonKeyValue
                {
                    Key = "language-change-greeting-message-base64-" + languageCode,
                    Value = greetingMessagesAudioStrings[1].audioContent.ToString()
                });
            }

            return audioBase64Strings;
        }

        [HttpPost]
        public async Task<JsonResult> GetWelcomeGreetingsTextToSpeech(string languageCode, string welcomeMessage)
        {

            List<string> strings = new List<string>
            {
                welcomeMessage
            };

            var greetingMessagesAudioStrings = await TextToSpeach(languageCode, strings);

            // Load audio base64 strings to view bag so we can play audio using it
            List<CommonKeyValue> audioBase64Strings = new List<CommonKeyValue>();

            if (greetingMessagesAudioStrings.Count > 0)
            {

                audioBase64Strings.Add(new CommonKeyValue
                {
                    Key = "welcome-greeting-message-base64-" + languageCode,
                    Value = greetingMessagesAudioStrings[0].audioContent.ToString()
                });

                //audioBase64Strings.Add(new CommonKeyValue
                //{
                //    Key = "language-change-greeting-message-base64-" + languageCode,
                //    Value = greetingMessagesAudioStrings[1].audioContent.ToString()
                //});
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

        public async Task<List<BhashiniAudioInfo>> TextToSpeach(string languageCode, List<string> texts)
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

            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            TempData["LanguageModel"] = languageModel;

            return responseBody.audio;
        }

        public async Task<JsonResult> DetectAudioLanguage(string base64Audio)
        {
            try
            {
                var apiResponse = await BhashiniService.DetectAudioLanguage(base64Audio);

                var languageCode = "";
                bool isSuccess;

                // Check if language prediction is available or not
                if (string.IsNullOrEmpty(apiResponse.errorText))
                {
                    // Get language code from api response
                    if (apiResponse.output.Count > 0 && apiResponse.output[0].langPrediction.Count > 0)
                    {
                        languageCode = apiResponse.output[0].langPrediction[0].langCode;
                        isSuccess = true;
                    }
                    else
                    {
                        languageCode = "";
                        isSuccess = false;
                    }
                }
                else
                {
                    isSuccess = false;
                }

                LanguageInfo languageInfo = new LanguageInfo();

                if (isSuccess)
                {
                    languageInfo = LanguageManager.GetLanguageDetailsByCode(languageCode);
                }

                return Json(new AjaxActionResponse()
                {
                    Success = isSuccess,
                    Data = languageInfo,
                    Message = apiResponse.errorText,
                });
            }
            catch (Exception ex)
            {
                Trace.TraceError($"HTTP request to DetectAudioLanguage failed: {ex.Message}");

                return Json(new AjaxActionResponse()
                {
                    Success = false,
                    Data = "",
                    Message = ex.Message,
                });
            }
        }

        public ActionResult ChatHistory()
        {
            List<ChatHistory> chatHistories = new List<ChatHistory>();

            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);

            ViewBag.LanguageModel = languageModel;
            return View(chatHistories);
        }

        public ActionResult More()
        {
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;

            return View();
        }

        public ActionResult ProfileView()
        {
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;
            return View();
        }

        public ActionResult FAQs()
        {
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;
            return View();
        }

        public ActionResult Feedback()
        {
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;
            return View();
        }

        [HttpPost]
        public ActionResult SubmitRating(int rating)
        {
            var languageModel = ChatbotService.GetSelectedLanguage(Request, languageCodesToEnable);
            ViewBag.LanguageModel = languageModel;

            return View("Feedback");
        }

        [HttpPost]
        public ActionResult SubmitReview(string review)
        {
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