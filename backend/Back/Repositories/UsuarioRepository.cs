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
                var docRef = _firestoreDb.Collection(COLLECTION_NAME).Document(id);
                var snapshot = await docRef.GetSnapshotAsync();

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
                Console.WriteLine($"🔍 Buscando usuario por email: {email}");

                var usuarios = await ObtenerTodosAsync();

                foreach (var usuario in usuarios)
                {
                    if (usuario?.Email?.Equals(email, StringComparison.OrdinalIgnoreCase) == true)
                    {
                        Console.WriteLine($"✅ Usuario encontrado: {usuario.Email}");
                        return usuario;
                    }
                }

                Console.WriteLine("❌ Usuario no encontrado.");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener usuario por email: {ex.Message}");
                return null;
            }
        }

        public async Task<IEnumerable<Usuario>> ObtenerTodosAsync()
        {
            try
            {
                var snapshot = await _firestoreDb
                    .Collection(COLLECTION_NAME)
                    .GetSnapshotAsync();

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
                        Console.WriteLine($"Error convirtiendo documento {document.Id}: {ex.Message}");
                    }
                }

                return usuarios;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener usuarios: {ex.Message}");
                return new List<Usuario>();
            }
        }

        public async Task<IEnumerable<Usuario>> ObtenerPorRolAsync(string rol)
        {
            try
            {
                var query = _firestoreDb
                    .Collection(COLLECTION_NAME)
                    .WhereEqualTo("rol", rol);

                var snapshot = await query.GetSnapshotAsync();

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

                var docRef = _firestoreDb
                    .Collection(COLLECTION_NAME)
                    .Document(usuario.Id);

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
                var docRef = _firestoreDb
                    .Collection(COLLECTION_NAME)
                    .Document(usuario.Id);

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
                var docRef = _firestoreDb
                    .Collection(COLLECTION_NAME)
                    .Document(id);

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
                var usuarios = await ObtenerTodosAsync();

                foreach (var usuario in usuarios)
                {
                    if (usuario?.Email?.Equals(email, StringComparison.OrdinalIgnoreCase) == true)
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
}