<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Escapado de datos para seguridad
    $nombre = mysqli_real_escape_string($conexion, $_POST['nombre']);
    $correo = mysqli_real_escape_string($conexion, $_POST['correo']);
    $password = $_POST['password']; // Se recomienda usar password_hash en producción
    $entrega = $_POST['entrega_preferida'];

    // [2026-01-02] Verificación de seguridad adicional
    if (strlen($nombre) > 40) {
        die("Error: Nombre demasiado largo.");
    }

    // Insertar con rol 'cliente' por defecto
    $sql = "INSERT INTO usuarios (nombre, correo, password, rol, entrega_defecto) 
            VALUES ('$nombre', '$correo', '$password', 'cliente', '$entrega')";

    if (mysqli_query($conexion, $sql)) {
        // [2025-12-10] Redirigir al login tras éxito para evitar procesos colgados
        header("Location: ../frontend/login.html?reg=success");
    } else {
        echo "Error al registrar: " . mysqli_error($conexion);
    }
}
?>