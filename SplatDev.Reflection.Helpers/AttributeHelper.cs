using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;

namespace SplatDev.Reflection
{
    public static class AttributeHelpers
    {
        public static Dictionary<string, object> GetClassAttributes(this Type source)
        {
            Dictionary<string, object> _dict = new Dictionary<string, object>();
            object[] classAttributes = source.GetCustomAttributes(true);

            foreach (var attribute in classAttributes)
            {
                var attributeAttributes = attribute.GetType().GetProperties();
                foreach (var attributeAttribute in attributeAttributes)
                {
                    var propName = $"{attribute.GetType().Name}.{attributeAttribute.Name}";
                    if (!_dict.ContainsKey(propName) && attributeAttribute.Name != "TypeId")
                        _dict.Add(propName, attributeAttribute.GetValue(attribute, null));
                }
            }
            return _dict;
        }

        public static Dictionary<string, object> GetPropertyAttributes<T>(Expression<Func<object>> field) where T : class
        {
            MemberExpression member = (MemberExpression)field.Body;
            if (member == null) { return null; }

            Dictionary<string, object> _dict = new Dictionary<string, object>();
            object[] propertyAttributes = typeof(T).GetProperty(member.Member.Name).GetCustomAttributes(true);

            foreach (var propertyAttribute in propertyAttributes)
            {
                var attributeAttributes = propertyAttribute.GetType().GetProperties();
                foreach (var attributeAttribute in attributeAttributes)
                {
                    var propName = $"{propertyAttribute.GetType().Name}.{attributeAttribute.Name}";
                    if (!_dict.ContainsKey(propName) && attributeAttribute.Name != "TypeId")
                        _dict.Add(propName, attributeAttribute.GetValue(propertyAttribute, null));
                }
            }
            return _dict;
        }

        public static T Value<T>(this Attribute attribute, string name = "")
        {
            return (T)attribute.GetType().GetProperty(name).GetValue(attribute, null);
        }
    }
}
