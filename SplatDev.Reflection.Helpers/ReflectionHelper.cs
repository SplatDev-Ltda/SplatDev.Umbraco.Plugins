using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace SplatDev.Reflection
{
    public static class ReflectionHelpers
    {
        public static IEnumerable<PropertyInfo> GetAllProperties(this Type type)
        {
            Func<PropertyInfo, bool> func = null;
            if (!type.IsInterface)
            {
                return type.GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.FlattenHierarchy);
            }
            List<PropertyInfo> propertyInfos = new List<PropertyInfo>();
            List<Type> types = new List<Type>();
            Queue<Type> types1 = new Queue<Type>();
            types.Add(type);
            types1.Enqueue(type);
            while (types1.Count > 0)
            {
                Type type1 = types1.Dequeue();
                Type[] interfaces = type1.GetInterfaces();
                for (int i = 0; i < (int)interfaces.Length; i++)
                {
                    Type type2 = interfaces[i];
                    if (!types.Contains(type2))
                    {
                        types.Add(type2);
                        types1.Enqueue(type2);
                    }
                }
                PropertyInfo[] properties = type1.GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.FlattenHierarchy);
                Func<PropertyInfo, bool> func1 = func;
                if (func1 == null)
                {
                    bool func2(PropertyInfo x) => !propertyInfos.Contains(x);
                    Func<PropertyInfo, bool> func3 = func2;
                    func = func2;
                    func1 = func3;
                }
                IEnumerable<PropertyInfo> propertyInfos1 = ((IEnumerable<PropertyInfo>)properties).Where<PropertyInfo>(func1);
                propertyInfos.InsertRange(0, propertyInfos1);
            }
            return propertyInfos.ToArray();
        }

        public static Assembly GetAssembly(string assemblyName = "")
        {
            Assembly assembly = !string.IsNullOrEmpty(assemblyName) ? Assembly.Load(assemblyName) : Assembly.GetExecutingAssembly();
            return assembly;
        }

        public static T GetAssemblyType<T>(this Assembly assembly)
        {
            return (T)Activator.CreateInstance(assembly.GetType(typeof(T).FullName, false, true));
        }

        public static object GetInstance(this Type type)
        {
            if (type.GetType().Name != "RuntimeType")
                return Activator.CreateInstance(type.GetType());
            return Activator.CreateInstance(type);
        }

        public static T GetInstance<T>(this Type type)
        {
            if (type == null)
                return (T)Activator.CreateInstance(type.GetType());
            return (T)Activator.CreateInstance(type);
        }

        public static IEnumerable<PropertyInfo> GetProperties(this Assembly assembly)
        {
            return assembly.GetType().GetAllProperties();
        }

        public static PropertyInfo GetProperty(this object _obj, string name)
        {
            return _obj.GetType().GetProperty(name);
        }

        public static Type GetType<T>(this Assembly assembly)
        {
            return assembly.GetType(typeof(T).FullName, false, true);
        }

        public static T GetTypeInstance<T>()
        {
            return (T)Activator.CreateInstance<T>();
        }

        public static List<Type> GetTypes<T>(string assemblyName = "")
        {
            var assembly = GetAssembly(assemblyName);

            var allTypes = assembly.GetTypes();
            List<Type> types = new List<Type>();
            foreach (var type in allTypes)
                if (type.Equals(typeof(T))) types.Add(type);
            return types;
        }

        public static bool HasValue(this PropertyInfo property)
        {
            if (property == null) return false;

            var instance = Activator.CreateInstance(property.DeclaringType);
            var result = instance.GetProperty(property.Name).GetValue(instance, null);
            return result != null;
        }

        public static object Value(this PropertyInfo property)
        {
            var instance = Activator.CreateInstance(property.DeclaringType);
            return instance.GetProperty(property.Name).GetValue(instance, null);
        }

        public static U Value<T, U>() where T : PropertyInfo
        {
            var instance = Activator.CreateInstance(typeof(T));
            return (U)typeof(T).GetProperty(typeof(T).Name).GetValue(instance);
        }

        public static T Value<T>(this PropertyInfo type)
        {
            var instance = Activator.CreateInstance(type.DeclaringType);
            return (T)instance.GetType().GetProperty(type.Name).GetValue(instance, null);
        }

        public static IEnumerable<T> ValueCollection<T>(this PropertyInfo property)
        {
            IEnumerable<T> res = null;
            var instance = Activator.CreateInstance(property.DeclaringType);
            var get = property.GetGetMethod();
            if (!get.IsStatic && get.GetParameters().Length == 0)
            {
                var collection = (IEnumerable<T>)get.Invoke(instance, null);
                if (collection != null) res = collection;
            }

            return res;
        }

        public static Dictionary<T, U> ValueCollection<T, U>(this PropertyInfo type)
        {
            var instance = Activator.CreateInstance(type.DeclaringType);
            return (Dictionary<T, U>)instance.GetType().GetProperty(type.Name).GetValue(instance, null);
        }
    }
}
