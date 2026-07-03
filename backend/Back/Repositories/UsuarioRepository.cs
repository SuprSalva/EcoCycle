using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        if (string.IsNullOrWhiteSpace(id)) 
        {
            return null;
        }

        var docRef = _collection.Document(id);
        var snapshot = await docRef.GetSnapshotAsync();
        private readonly FirestoreDb _firestoreDb;
        private const string COLLECTION_NAME = "usuarios";

        public UsuarioRepository(FirestoreDb firestoreDb)
        {
            _firestoreDb = firestoreDb;
        }

        public async Task<Usuario?> ObtenerPorIdAsync(string id)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(id);
                DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

                if (snapshot.Exists)
                {
                    return snapshot.ConvertTo<Usuario>();
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener usuario por ID: {ex.Message}");
                return null;
            }
        }

        public async Task<Usuario?> ObtenerPorEmailAsync(string email)
        {
            try
            {
                Console.WriteLine($"🔍 Buscando en Firestore: '{email}'");
                
                // ✅ SOLUCIÓN: Buscar manualmente sin importar mayúsculas/minúsculas
                var todos = await ObtenerTodosAsync();
                
                foreach (var usuario in todos)
                {
                    if (usuario?.Email?.ToLower() == email?.ToLower())
                    {
                        Console.WriteLine($"✅ Encontrado: {usuario.Email}");
                        return usuario;
                    }
                }
                
                Console.WriteLine($"❌ No encontrado: '{email}'");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return null;
            }
        }

        public async Task<IEnumerable<Usuario>> ObtenerTodosAsync()
        {
            try
            {
                Query query = _firestoreDb.Collection(COLLECTION_NAME);
                QuerySnapshot snapshot = await query.GetSnapshotAsync();

                var usuarios = new List<Usuario>();
                foreach (var document in snapshot.Documents)
                {
                    try
                    {
                        var usuario = document.ConvertTo<Usuario>();
                        if (usuario != null)
                        {
                            usuarios.Add(usuario);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"⚠️ Error convertiendo documento {document.Id}: {ex.Message}");
                    }
                }
                return usuarios;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener todos los usuarios: {ex.Message}");
                return new List<Usuario>();
            }
        }

        public async Task<IEnumerable<Usuario>> ObtenerPorRolAsync(string rol)
        {
            try
            {
                Query query = _firestoreDb.Collection(COLLECTION_NAME)
                    .WhereEqualTo("rol", rol);
                
                QuerySnapshot snapshot = await query.GetSnapshotAsync();

                var usuarios = new List<Usuario>();
                foreach (var document in snapshot.Documents)
                {
                    var usuario = document.ConvertTo<Usuario>();
                    if (usuario != null)
                    {
                        usuarios.Add(usuario);
                    }
                }
                return usuarios;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener usuarios por rol: {ex.Message}");
                return new List<Usuario>();
            }
        }

        public async Task GuardarAsync(Usuario usuario)
        {
            try
            {
                if (usuario.CreadoEn == default)
                {
                    usuario.CreadoEn = DateTime.UtcNow;
                }

                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(usuario.Id);
                await docRef.SetAsync(usuario, SetOptions.Overwrite);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al guardar usuario: {ex.Message}");
                throw;
            }
        }

        public async Task ActualizarAsync(Usuario usuario)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(usuario.Id);
                await docRef.SetAsync(usuario, SetOptions.Overwrite);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al actualizar usuario: {ex.Message}");
                throw;
            }
        }

        public async Task EliminarAsync(string id)
        {
            try
            {
                DocumentReference docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(id);
                await docRef.DeleteAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar usuario: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> ExisteEmailAsync(string email)
        {
            try
            {
                var todos = await ObtenerTodosAsync();
                foreach (var usuario in todos)
                {
                    if (usuario?.Email?.ToLower() == email?.ToLower())
                    {
                        return true;
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al verificar email: {ex.Message}");
                return false;
            }
        }
    }

    public async Task<Usuario?> ObtenerPorEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;

        var query = _collection.WhereEqualTo("email", email).WhereEqualTo("activo", true).Limit(1);
        var snapshot = await query.GetSnapshotAsync();

        if (snapshot.Documents.Count == 0) return null;

        return snapshot.Documents[0].ConvertTo<Usuario>();
    }

    public async Task GuardarAsync(Usuario usuario)
    {
        if (usuario == null || string.IsNullOrWhiteSpace(usuario.Id))
        {
            throw new ArgumentException("El usuario o su ID no pueden estar vacíos para guardar.");
        }

        var docRef = _collection.Document(usuario.Id);
        await docRef.SetAsync(usuario, SetOptions.MergeAll);
    }

    public async Task<List<Usuario>> ObtenerTodosAsync()
    {
        var query = _collection.WhereEqualTo("activo", true);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Usuario>()).ToList();
    }

    public async Task EliminarAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) return;

        var docRef = _collection.Document(id);
        await docRef.UpdateAsync("activo", false);
    }
}