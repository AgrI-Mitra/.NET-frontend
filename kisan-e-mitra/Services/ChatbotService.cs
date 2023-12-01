using KisanEMitra.Models;
using kishan_bot.Models;
using kishan_bot.Services.Contracts;
using System.Collections.Generic;
using System.Web;

namespace KisanEMitra.Services
{
    public class ChatbotService : IChatbotService
    {
        public ChatbotService()
        {
        }

        public List<PopularQuestion> GetPopularQuestions()
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

        public LanguageModel GetSelectedLanguage(HttpRequestBase httpRequest, string[] languageCodesToEnable)
        {

            HttpCookie langCookie = httpRequest.Cookies["culture"];
            var userLanguages = httpRequest.UserLanguages;

            string selectedLanguageCode;
            if (langCookie != null)
            {
                selectedLanguageCode = langCookie.Value;
            }
            else
            {
                var userLanguage = userLanguages;
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

            var languaggesOrderedByPosition = LanguageManager.GetLanguagesOrderedByPosition(languageCodesToEnable);

            var languageModel = new LanguageModel
            {
                SelectedLanguage = LanguageManager.GetLanguageDetailsByCode(selectedLanguageCode),
                AvailableLanguages = languaggesOrderedByPosition

            };
            return languageModel;
        }

        public LanguageModel GetSelectedLanguage(HttpCookie langCookie, string[] userLanguages, string[] languageCodesToEnable)
        {
            string selectedLanguageCode;
            if (langCookie != null)
            {
                selectedLanguageCode = langCookie.Value;
            }
            else
            {
                var userLanguage = userLanguages;
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

            var languaggesOrderedByPosition = LanguageManager.GetLanguagesOrderedByPosition(languageCodesToEnable);

            var languageModel = new LanguageModel
            {
                SelectedLanguage = LanguageManager.GetLanguageDetailsByCode(selectedLanguageCode),
                AvailableLanguages = languaggesOrderedByPosition

            };
            return languageModel;
        }

        public List<CommonKeyValue> GetTranslations()
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
                }
            };

            return translations;
        }
    }
}