namespace kishan_bot.Services
{
    public static class CoreHelper
    {
        public static object GetPropertyValue(this object obj, string propertyName)
        {
            return obj.GetType().GetProperty(propertyName)?.GetValue(obj, null);
        }
    }
}