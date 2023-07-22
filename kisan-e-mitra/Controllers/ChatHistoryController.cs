using KisanEMitra.Models;
using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;

namespace KisanEMitra.Controllers
{
    public class ChatHistoryController : Controller
    {
        // GET: ChatHistory
        public ActionResult Index()
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

            return View(chatHistories);
        }
    }
}