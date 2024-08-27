using KisanEMitra.Services;
using KisanEMitra.Services.Contracts;
using kishan_bot.Services;
using kishan_bot.Services.Contracts;
using System;
using System.Diagnostics;
using System.IO;
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
            Trace.Listeners.Add(new TimestampedTextWriterTraceListener(Server.MapPath("~/Logs/myapp.log")));

            RegisterComponents();
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
