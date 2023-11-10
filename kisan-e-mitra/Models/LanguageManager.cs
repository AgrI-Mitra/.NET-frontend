using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Models
{
    public class LanguageInfo
    {
        public string LanguageEnglishLabel { get; set; }

        public string LanguageCultureLabel { get; set; }
        public string LanguageCultureCode { get; set; }
        public int Position { get; set; }
        public string LanguageFirstAlphabet { get; set; }
    }

    public class LanguageModel
    {
        public LanguageInfo SelectedLanguage { get; set; }
        public List<LanguageInfo> AvailableLanguages { get; set; }
    }

    public class LanguageManager
    {
        public static List<LanguageInfo> AvailableLanguages = new List<LanguageInfo> {
            new LanguageInfo {
                LanguageEnglishLabel = "Hindi", LanguageCultureLabel = "हिंदी", LanguageCultureCode = "hi", Position = 1, LanguageFirstAlphabet = "क"
            },
            new LanguageInfo {
                LanguageEnglishLabel = "English", LanguageCultureLabel = "English",  LanguageCultureCode = "en", Position = 7, LanguageFirstAlphabet = "A"
            },
            new LanguageInfo {
                LanguageEnglishLabel = "Marathi", LanguageCultureLabel = "मराठी", LanguageCultureCode = "mr", Position= 5, LanguageFirstAlphabet = "क"
            },
            new LanguageInfo {
                LanguageEnglishLabel = "Bangla", LanguageCultureLabel = "বাংলা",LanguageCultureCode = "bn", Position = 6, LanguageFirstAlphabet = "ক"
            },
            new LanguageInfo {
                LanguageEnglishLabel = "Tamil", LanguageCultureLabel = "தமிழ்", LanguageCultureCode = "ta", Position= 2, LanguageFirstAlphabet = "க்"
            },
            new LanguageInfo {
                LanguageEnglishLabel = "Telugu", LanguageCultureLabel = "తెలుగు", LanguageCultureCode = "te", Position = 4, LanguageFirstAlphabet = "అ"
            },
            new LanguageInfo {
                LanguageEnglishLabel = "Odia", LanguageCultureLabel = "ଓଡ଼ିଆ", LanguageCultureCode = "or", Position = 3, LanguageFirstAlphabet = "ଅ"
            },
            new LanguageInfo {
                LanguageEnglishLabel = "Malayalam", LanguageCultureLabel = "മലയാളം", LanguageCultureCode = "ml", Position = 8, LanguageFirstAlphabet = "അ"
            },
            //new LanguageInfo {
            //    LanguageEnglishLabel = "Kannada", LanguageCultureLabel = "ಕನ್ನಡ", LanguageCultureCode = "kn", Position = 10, LanguageFirstAlphabet = "ಕ"
            //},
            //new LanguageInfo {
            //    LanguageEnglishLabel = "Gujarati", LanguageCultureLabel = "ગુજરાતી", LanguageCultureCode = "gu", Position = 8, LanguageFirstAlphabet = "ગ"
            //},
            //new LanguageInfo {
            //    LanguageEnglishLabel = "Punjabi", LanguageCultureLabel = "ਪੰਜਾਬੀ", LanguageCultureCode = "pa", Position = 9, LanguageFirstAlphabet = "ਪੰ"
            //},
        };

        public static bool IsLanguageAvailable(string lang)
        {
            return AvailableLanguages.FirstOrDefault(a => a.LanguageCultureCode.Equals(lang)) != null;
        }
        public static string GetDefaultLanguage()
        {
            return AvailableLanguages.Single(f => f.Position == 1).LanguageCultureCode;
        }

        public static List<LanguageInfo> GetLanguagesOrderedByPosition()
        {
            return AvailableLanguages.OrderBy(o => o.Position).ToList();
        }

        public static LanguageInfo GetLanguageDetailsByCode(string languageCode)
        {
            return AvailableLanguages.Single(f => f.LanguageCultureCode == languageCode);
        }

        public void SetLanguage(string lang)
        {
            try
            {
                if (!IsLanguageAvailable(lang)) lang = GetDefaultLanguage();
                var cultureInfo = new CultureInfo(lang);
                Thread.CurrentThread.CurrentUICulture = cultureInfo;
                Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(cultureInfo.Name);
                HttpCookie langCookie = new HttpCookie("culture", lang);
                langCookie.Expires = DateTime.Now.AddYears(1);
                HttpContext.Current.Response.Cookies.Add(langCookie);
            }
            catch (Exception) { }
        }
    }
}