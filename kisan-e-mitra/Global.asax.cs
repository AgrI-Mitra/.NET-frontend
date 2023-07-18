using kishan_bot.Services;
using kishan_bot.Services.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Services.Description;
using Unity;
using Unity.AspNet.Mvc;

namespace KisanEMitra
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            RegisterComponents();
        }

        private static IUnityContainer BuildUnityContainer()
        {
            var container = new UnityContainer();

            container.RegisterType<IAgrimitraService, AgrimitraService>();

            return container;
        }

        public static void RegisterComponents()
        {
            var container = new UnityContainer();
            container.RegisterType<IAgrimitraService, AgrimitraService>();
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}
