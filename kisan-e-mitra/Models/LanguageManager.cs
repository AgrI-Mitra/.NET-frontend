﻿using System;
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
                LanguageFullName = "Hindi", LanguageLabel = "हिंदी", LanguageCultureName = "hi"
            },
            new Languages {
                LanguageFullName = "English", LanguageLabel = "English",  LanguageCultureName = "en"
            },
            new Languages {
                LanguageFullName = "Bangla", LanguageLabel = "বাংলা",LanguageCultureName = "bn"
            },
            new Languages {
                LanguageFullName = "Tamil", LanguageLabel = "தமிழ்", LanguageCultureName = "ta"
            },
            new Languages {
                LanguageFullName = "Telugu", LanguageLabel = "తెలుగు", LanguageCultureName = "te"
            },
        };

        public static bool IsLanguageAvailable(string lang)
        {
            return AvailableLanguages.Where(a => a.LanguageCultureName.Equals(lang)).FirstOrDefault() != null ? true : false;
        }
        public static string GetDefaultLanguage()
        {
            return AvailableLanguages[0].LanguageCultureName;
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