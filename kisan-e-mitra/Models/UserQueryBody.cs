using Microsoft.Ajax.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

namespace kishan_bot.Models
{
    public class MediaQuery
    {
        public object Category { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }
    }

    public class LocationQuery
    {
        public int Longitude { get; set; }
        public int Latitude { get; set; }
    }

    public class ContactCardQuery
    {
        public string Address { get; set; }
        public string Name { get; set; }
    }

    public class UserQueryBody
    {
        public string Text { get; set; }
        public MediaQuery Media { get; set; }
        public LocationQuery Location { get; set; }
        public ContactCardQuery ContactCard { get; set; }
        public List<object> ButtonChoices { get; set; }
        public object StylingTag { get; set; }
        public string Flow { get; set; }
        public string MediaCaption { get; set; }
        public string inputLanguage { get; set; }
    }
}