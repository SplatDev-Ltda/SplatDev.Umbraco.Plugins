namespace SplatDev.Database.Helpers
{
    using SplatDev.Database.Attributes;

    using System;
    using System.Collections.Generic;
    using System.ComponentModel;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Reflection;

    using SplatDev.Reflection;

    public static class AttributeHelper
    {
        public static IEnumerable<PropertyInfo> NvarcharMaxProperties<Type>(this Type source)
        {
            var properties = source.GetType().GetProperties();
            List<PropertyInfo> nvarcharmaxProps = new List<PropertyInfo>();
            foreach (var property in properties)
            {
                var attributes = property.GetCustomAttributes(false).ToList();
                if (attributes.Count > 0)
                {
                    foreach (var attribute in attributes)
                    {
                        if (attribute.GetType().Equals(typeof(NvarcharMaxAttribute)))
                        {
                            nvarcharmaxProps.Add(property);
                        }
                    }
                }
            }
            return nvarcharmaxProps;
        }

        public static Type[] OrderByCreateOrderAttribute(this IEnumerable<Type> classes)
        {
            List<Type> withOrder = new List<Type>();
            foreach (var _class in classes) if (_class.GetCustomAttribute<CreateOrderAttribute>() != null) withOrder.Add(_class);
            if (withOrder.Count > 0)
            {
                Type[] ordered = new Type[withOrder.Count];
                foreach (var _class in withOrder)
                {
                    var attribute = _class.GetCustomAttribute<CreateOrderAttribute>();
                    if (attribute != null)
                    {
                        var index = attribute.Value<int>("Order");
                        ordered[index] = _class;
                    }
                }
                return ordered;
            }
            else
            {
                return classes.ToArray<Type>();
            }
        }

        public static string PrettyDisplayName(this PropertyDescriptor property)
        {
            var name = string.Empty;
            if (property.Attributes.Count > 0)
            {
                if (property.Attributes[typeof(DisplayAttribute)] is DisplayAttribute dd)
                    name = dd.Name;
                else name = property.Name;
            }
            return name;
        }
    }
}
