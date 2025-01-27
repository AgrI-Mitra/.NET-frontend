using KisanEMitra.Services;
using KisanEMitra.Services.Contracts;
using kishan_bot.Services;
using kishan_bot.Services.Contracts;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Unity;
using Unity.AspNet.Mvc;

namespace KisanEMitra
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            MvcHandler.DisableMvcResponseHeader = true;
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Ensure the Logs directory exists
            var logDirectory = Server.MapPath("~/Logs");
            if (!Directory.Exists(logDirectory))
            {
                Directory.CreateDirectory(logDirectory);
            }

            Trace.Listeners.Clear();
            Trace.Listeners.Add(new TimestampedTextWriterTraceListener(Server.MapPath("~/Logs/myapp.txt")));

            RegisterComponents();

            
        }

        protected void Application_BeginRequest()
        {

            // Check if the request is for a static file
            string[] staticFileExtensions = { ".css", ".js", ".png", ".jpg", ".gif", ".ico", ".svg", ".pdf", ".json", ".txt", ".map" };
            string requestPath = Request.Path.ToLower();

            if (!staticFileExtensions.Any(ext => requestPath.EndsWith(ext)))
            {
                // Check if the culture cookie exists
                HttpCookie cultureCookie = Request.Cookies["culture"];
                if (cultureCookie == null)
                {
                    // Set the culture cookie if it doesn't exist
                    cultureCookie = new HttpCookie("culture", "hi")
                    {
                        Expires = DateTime.Now.AddYears(1),
                        HttpOnly = true,
                        Secure = Request.IsSecureConnection
                    };
                    Response.Cookies.Add(cultureCookie);
                }
                // Get IP address and log it
                string userIP = Request.UserHostAddress;
                string userAgent = Request.UserAgent ?? "Unknown User Agent";

                string logEntry = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} | IP: {userIP} | User Agent: {userAgent}";

                // Log to locationlogs.txt
                string logFilePath = Server.MapPath("~/Logs/locationlogs.txt");
                File.AppendAllText(logFilePath, logEntry + Environment.NewLine);
            }
        }

        public static void RegisterComponents()
        {
            var container = new UnityContainer();
            container.RegisterType<IAgrimitraService, AgrimitraService>();
            container.RegisterType<IBhashiniService, BhashiniService>();
            container.RegisterType<IChatbotService, ChatbotService>();
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }

        void Application_Error(object sender, EventArgs e)
        {
            Exception ex = Server.GetLastError();

            var requestInfo = sender.GetPropertyValue("Request");
            bool isStaticContent = false;

            if (requestInfo != null)
            {
                var fileInfo = requestInfo.GetPropertyValue("FilePath");

                if (fileInfo != null && fileInfo.ToString().Contains("Content/"))
                {
                    isStaticContent = true;
                }
            }

            if (ex is HttpException && ((HttpException)ex).GetHttpCode() == 404 && !isStaticContent)
            {
                Response.Redirect("~/Home/Index");
            }
            else
            {
                // your global error handling here!
            }
        }

        
    }
}
