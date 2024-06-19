using System.Web;
using System.Web.Optimization;

namespace KisanEMitra
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            //bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
            //            "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            //bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
            //            "~/Scripts/modernizr-*"));

            bundles.Add(new Bundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.bundle.min.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
            //"~/Content/bootstrap.min.css",
            //          "~/Content/style.css",
            //          "~/Content/responsive.css",
            //          "~/Content/chatbot.css",
            //          "~/Content/shepherd.css",
            //          "~/Content/ham-menu.css"
                      "~/Content/bundle-prod-css.min.css"
                      ));

            //bundles.Add(new StyleBundle("~/Content/css").Include(
            //    "~/Content/bundle-prod-css.css"
            //    ));

            bundles.Add(new StyleBundle("~/Content/staging/css").Include(
                      //"~/Content/bootstrap.min.css",
                      //"~/Content/style-staging.css",
                      //"~/Content/responsive-staging.css",
                      //"~/Content/shepherd.css",
                      //"~/Content/chatbot-staging.css"
                      "~/Content/bundle-staging.min.css"
                      ));
            //bundles.Add(new StyleBundle("~/Content/staging/css").Include(
            //    "~/Content/bundle-staging.css"
            //    ));

            bundles.Add(new Bundle("~/bundles/pre-init-js").Include(
                //"~/Content/js/app-config.js",
                //"~/Content/js/commonService.js",
                //"~/Content/js/schemesDropdown.js",
                //"~/Content/js/recorder.js",
                //"~/Content/js/languageDropDown.js",
                //"~/Content/js/typed.umd.js"
                "~/Content/js/bundle-pre-body.min.js"
                ));

            //bundles.Add(new Bundle("~/bundles/pre-init-js").Include(
            //    "~/Content/js/bunle-pre-body.js"
            //    ));

            //bundles.Add(new Bundle("~/bundles/post-init-js").Include(
            //    "~/Content/js/bunle-post-body.js"
            //    ));

            //bundles.Add(new Bundle("~/bundles/post-init-staging-js").Include(
            //    "~/Content/js/bunle-post-body-staging.js"
            //    ));

            bundles.Add(new Bundle("~/bundles/post-init-js").Include(
                //"~/Content/js/autosize.js",
                //"~/Content/js/wavBlobUtil.js",
                //"~/Content/js/WavRecorder.js",
                //"~/Content/js/popularQueriesService.js",
                //"~/Content/js/shepherd.js"
                "~/Content/js/bundle-post-body.min.js"
                ));

            bundles.Add(new Bundle("~/bundles/chatbot-js").Include(
                "~/Content/js/chatbot.js"));

            BundleTable.EnableOptimizations = true;
        }
    }
}
