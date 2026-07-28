# SplatDev.Reflection.Helpers

Reflection and attribute helper utilities for .NET applications.

## What it provides

- **ReflectionHelpers** — extension methods for type/property reflection:
  - `GetAllProperties(Type)` — walks interface hierarchies to include inherited properties
  - `GetAssembly(name)` — loads an assembly by name (defaults to executing assembly)
  - `GetAssemblyType<T>(Assembly)` — instantiates a type from an assembly
  - `GetInstance(Type)` / `GetInstance<T>(Type)` — creates instances via `Activator`
  - `GetProperties(Assembly)` — gets property info from assembly type
  - `GetProperty(object, string)` — gets `PropertyInfo` by name
  - `GetType<T>(Assembly)` — finds a type within an assembly
  - `GetTypeInstance<T>()` — `Activator.CreateInstance<T>()` shorthand
  - `GetTypes<T>(assemblyName)` — finds all types matching `T` in an assembly
  - `HasValue(PropertyInfo)` — checks if a property declares a non-null value
  - `Value(PropertyInfo)` / `Value<T>(PropertyInfo)` — reads property values
  - `Value<T, U>()` — generic property value getter
  - `ValueCollection<T>(PropertyInfo)` / `ValueCollection<T, U>(PropertyInfo)` — reads collection/dictionary property values

- **AttributeHelpers** — extension methods for attribute reflection:
  - `GetClassAttributes(Type)` — returns a dictionary of attribute properties for a class
  - `GetPropertyAttributes<T>(Expression)` — gets attribute values from a property via expression
  - `Value<T>(Attribute, string)` — reads a named value from an attribute instance

> **Note:** `GetCustomAttribute<T>()` and `HasAttribute<T>()` wrappers were removed in favor of BCL equivalents (`MemberInfo.GetCustomAttribute<T>()`) available in net8.0+.

## Namespace change

As of v1.1.0, the namespace changed from `System.Reflection` to `SplatDev.Reflection` to avoid IntelliSense collisions with the BCL. The generic `Helper` partial class was split into `ReflectionHelpers` and `AttributeHelpers`.

**Before:**
```csharp
using System.Reflection; // included both BCL and SplatDev extensions
type.GetAttribute<MyAttr>();
```

**After:**
```csharp
using System.Reflection; // BCL types only
using SplatDev.Reflection; // SplatDev extensions
type.GetCustomAttribute<MyAttr>(false);
```

## Install

```shell
dotnet add package SplatDev.Reflection.Helpers
```

## Target frameworks

| Framework |
|-----------|
| net8.0    |
| net10.0   |

---

**SplatDev.Reflection.Helpers** — part of the [SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins) suite. Licensed under MIT. © SplatDev Ltda.
