using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System;
using System.IO;
using System.Linq;

namespace kishan_bot.Services
{
    public static class CoreHelper
    {
        public static object GetPropertyValue(this object obj, string propertyName)
        {
            return obj.GetType().GetProperty(propertyName)?.GetValue(obj, null);
        }

        public static string GetValueFromJson(string filePath, string keyName, string[] ignoreValues = null)
        {
            // Read the JSON file content
            var jsonContent = File.ReadAllText(filePath);

            // Parse the JSON content
            var jsonObj = JObject.Parse(jsonContent);

            // Split the keyName to get the MainObject and Key
            var keys = keyName.Split('.');
            if (keys.Length != 2)
            {
                throw new ArgumentException("Key name must be in the format 'MainObject.Key'.");
            }

            // Retrieve the value
            var mainObject = keys[0];
            var key = keys[1];

            // Check if the JSON contains the main object
            if (!jsonObj.ContainsKey(mainObject))
            {
                throw new KeyNotFoundException($"The key '{mainObject}' was not found in the JSON file.");
            }

            // Check if the main object contains the key
            if (!jsonObj[mainObject].ToObject<JObject>().ContainsKey(key))
            {
                throw new KeyNotFoundException($"The key '{key}' was not found in the JSON object '{mainObject}'.");
            }

            // Get the value associated with the key
            var value = jsonObj[mainObject][key].ToString();

            // If ignoreValues is provided, remove the ignored values from the value
            if (ignoreValues != null)
            {
                foreach (var ignoreValue in ignoreValues)
                {
                    value = value.Replace(ignoreValue, "");
                }
            }

            // Return the value associated with the key
            return value;
        }

        public static void UpdateJsonValue(string filePath, string keyName, JToken newValue)
        {
            // Read the JSON file content
            var jsonContent = File.ReadAllText(filePath);

            // Parse the JSON content
            var jsonObj = JObject.Parse(jsonContent);

            // Split the keyName to get the MainObject and Key
            var keys = keyName.Split('.');
            if (keys.Length != 2)
            {
                throw new ArgumentException("Key name must be in the format 'MainObject.Key'.");
            }

            // Retrieve the main object and key
            var mainObject = keys[0];
            var key = keys[1];

            // Check if the JSON contains the main object and the key
            if (!jsonObj.ContainsKey(mainObject) || !jsonObj[mainObject].ToObject<JObject>().ContainsKey(key))
            {
                throw new KeyNotFoundException($"The specified key '{keyName}' was not found in the JSON file.");
            }

            // Update the value
            jsonObj[mainObject][key] = newValue;

            // Convert the updated JSON object back to a string
            string updatedJsonContent = jsonObj.ToString();

            // Write the updated JSON content back to the file
            File.WriteAllText(filePath, updatedJsonContent);
        }

        public static void UpdateTextFileContent(string filePath, string newContent)
        {
            // Write the new content to the file, overwriting existing content
            File.WriteAllText(filePath, newContent);
        }
    }
}