using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Models
{
    public class Languages
    {
        public string LanguageFullName
        {
            get;
            set;
        }

        public string LanguageLabel { get; set; }
        public string LanguageCultureName
        {
            get;
            set;
        }
        public int Position { get; set; }
    }

    public class LanguageModel
    {
        public SelectList Languages { get; set; }
        public string SelectedLanguage { get; set; }
    }

    public class LanguageManager
    {
        public static List<Languages> AvailableLanguages = new List<Languages> {
            new Languages {
                LanguageFullName = "Hindi", LanguageLabel = "हिंदी", LanguageCultureName = "hi", Position = 1
            },
            new Languages {
                LanguageFullName = "English", LanguageLabel = "English",  LanguageCultureName = "en", Position = 7
            },
            new Languages {
                LanguageFullName = "Marathi", LanguageLabel = "मराठी", LanguageCultureName = "mr", Position= 5
            },
            new Languages {
                LanguageFullName = "Bangla", LanguageLabel = "বাংলা",LanguageCultureName = "bn", Position = 6
            },
            new Languages {
                LanguageFullName = "Tamil", LanguageLabel = "தமிழ்", LanguageCultureName = "ta", Position= 2
            },
            new Languages {
                LanguageFullName = "Telugu", LanguageLabel = "తెలుగు", LanguageCultureName = "te", Position = 4
            },
            new Languages {
                LanguageFullName = "Odia", LanguageLabel = "ଓଡ଼ିଆ", LanguageCultureName = "or", Position = 3
            },
        };

        public static bool IsLanguageAvailable(string lang)
        {
            return AvailableLanguages.FirstOrDefault(a => a.LanguageCultureName.Equals(lang)) != null;
        }
        public static string GetDefaultLanguage()
        {
            return AvailableLanguages.Single(f => f.Position == 1).LanguageCultureName;
        }

        public static List<Languages> GetLanguagesOrderedByPosition()
        {
            return AvailableLanguages.OrderBy(o => o.Position).ToList();
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