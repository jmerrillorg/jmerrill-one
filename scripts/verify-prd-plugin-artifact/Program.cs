using System.IO.Compression;
using System.Reflection;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using System.Security.Cryptography;
using System.Xml.Linq;

if (args.Length != 3)
{
    Console.Error.WriteLine("Usage: verify-prd-plugin-artifact <solution.zip> <release-build.dll> <tracked-solution.dll>");
    return 2;
}

var packagePath = Path.GetFullPath(args[0]);
var buildPath = Path.GetFullPath(args[1]);
var trackedPath = Path.GetFullPath(args[2]);
using var archive = ZipFile.OpenRead(packagePath);

var customizations = archive.GetEntry("customizations.xml") ?? throw new InvalidDataException("Packed solution has no customizations.xml.");
using var manifestStream = customizations.Open();
var manifest = XDocument.Load(manifestStream);
var assemblyElements = manifest.Root?.Element("SolutionPluginAssemblies")?.Elements("PluginAssembly").ToArray()
    ?? throw new InvalidDataException("Solution has no SolutionPluginAssemblies section.");
if (assemblyElements.Length != 1) throw new InvalidDataException($"Expected one solution plug-in assembly, found {assemblyElements.Length}.");
var assemblyElement = assemblyElements[0];
var assemblyName = RequiredAttribute(assemblyElement, "FullName");
var fileName = RequiredElement(assemblyElement, "FileName").TrimStart('/');
var packageAssembly = archive.GetEntry(fileName) ?? throw new InvalidDataException($"Package does not contain declared assembly '{fileName}'.");
var declaredTypes = assemblyElement.Element("PluginTypes")?.Elements("PluginType")
    .Select(element => RequiredAttribute(element, "AssemblyQualifiedName").Split(',')[0].Trim())
    .Distinct(StringComparer.Ordinal)
    .ToArray() ?? throw new InvalidDataException("Plug-in manifest has no PluginTypes.");

var requiredCheckpointTypes = new[]
{
    "Jm1.Productions.Bp09.ListProductionsReviewCheckpointCandidates",
    "Jm1.Productions.Bp09.GetProductionsReviewCheckpoint",
    "Jm1.Productions.Bp09.SaveProductionsReviewCheckpoint",
};
foreach (var type in requiredCheckpointTypes)
    if (!declaredTypes.Contains(type, StringComparer.Ordinal)) throw new InvalidDataException($"Solution does not declare checkpoint plug-in type '{type}'.");

using var packagedStream = packageAssembly.Open();
using var packageBytes = new MemoryStream();
packagedStream.CopyTo(packageBytes);
var packagedAssembly = packageBytes.ToArray();
var buildAssembly = File.ReadAllBytes(buildPath);
var trackedAssembly = File.ReadAllBytes(trackedPath);

RequireSameBytes("Release build and packed solution DLL", buildAssembly, packagedAssembly);
ValidateAssembly("Tracked solution DLL", trackedAssembly, assemblyName, declaredTypes);
ValidateAssembly("Packed solution DLL", packagedAssembly, assemblyName, declaredTypes);

var buildHash = Convert.ToHexString(SHA256.HashData(buildAssembly)).ToLowerInvariant();
var trackedHash = Convert.ToHexString(SHA256.HashData(trackedAssembly)).ToLowerInvariant();
var packageHash = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(packagePath))).ToLowerInvariant();
Console.WriteLine($"Assembly identity: {assemblyName}");
Console.WriteLine($"CI Release assembly SHA-256: {buildHash}");
Console.WriteLine($"Tracked solution assembly SHA-256: {trackedHash}");
Console.WriteLine($"Solution SHA-256: {packageHash}");
Console.WriteLine($"Verified solution-registered plug-in types: {string.Join(", ", declaredTypes.Order(StringComparer.Ordinal))}");
Console.WriteLine("PRD plug-in source/build/solution-package provenance PASS");
return 0;

static void ValidateAssembly(string description, byte[] bytes, string expectedName, string[] declaredTypes)
{
    using var pe = new PEReader(new MemoryStream(bytes, writable: false));
    if (!pe.HasMetadata) throw new BadImageFormatException($"{description} has no CLR metadata.");
    var corHeader = pe.PEHeaders.CorHeader ?? throw new BadImageFormatException($"{description} has no CLR header.");
    if (corHeader.StrongNameSignatureDirectory.Size == 0) throw new BadImageFormatException($"{description} has no strong-name signature.");
    var metadata = pe.GetMetadataReader();
    var definition = metadata.GetAssemblyDefinition();
    var token = GetPublicKeyToken(metadata.GetBlobBytes(definition.PublicKey));
    var actualName = $"{metadata.GetString(definition.Name)}, Version={definition.Version}, Culture=neutral, PublicKeyToken={token}";
    if (!string.Equals(actualName, expectedName, StringComparison.OrdinalIgnoreCase))
        throw new InvalidDataException($"{description} identity '{actualName}' does not match solution manifest '{expectedName}'.");
    var exportedTypes = metadata.TypeDefinitions
        .Select(handle => metadata.GetTypeDefinition(handle))
        .Where(type => (type.Attributes & TypeAttributes.VisibilityMask) == TypeAttributes.Public)
        .Select(type =>
        {
            var name = metadata.GetString(type.Name);
            var ns = metadata.GetString(type.Namespace);
            return string.IsNullOrEmpty(ns) ? name : $"{ns}.{name}";
        })
        .ToHashSet(StringComparer.Ordinal);
    foreach (var type in declaredTypes)
        if (!exportedTypes.Contains(type)) throw new InvalidDataException($"{description} does not export solution-registered type '{type}'.");
}

static string RequiredAttribute(XElement element, string name) =>
    (string?)element.Attribute(name) ?? throw new InvalidDataException($"Missing required attribute '{name}'.");

static string RequiredElement(XElement element, string name) =>
    element.Element(name)?.Value.Trim() ?? throw new InvalidDataException($"Missing required element '{name}'.");

static string GetPublicKeyToken(byte[] publicKey)
{
    if (publicKey.Length == 0) throw new BadImageFormatException("Packed assembly has no strong-name public key.");
    var digest = SHA1.HashData(publicKey);
    return Convert.ToHexString(digest[^8..].Reverse().ToArray()).ToLowerInvariant();
}

static void RequireSameBytes(string description, byte[] expected, byte[] actual)
{
    if (!expected.AsSpan().SequenceEqual(actual)) throw new InvalidDataException($"{description} are not byte-identical.");
}
