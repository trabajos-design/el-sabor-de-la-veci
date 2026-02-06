<?php
include 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $correo = mysqli_real_escape_string($conexion, $_POST['correo']);
    $password = $_POST['password']; // En producción usar password_verify
    $rol = $_POST['rol'];

    $query = "SELECT * FROM usuarios WHERE correo = '$correo' AND rol = '$rol'";
    $resultado = mysqli_query($conexion, $query);

    if (mysqli_num_rows($resultado) > 0) {
        $usuario = mysqli_fetch_assoc($resultado);
        
        // Verificación de contraseña simple para este ejemplo
        if ($password == $usuario['password']) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['rol'] = $usuario['rol'];

            // Redirección por rol [cite: 2025-12-10]
            if ($rol == 'admin') {
                header("Location: ../frontend/admin.html");
            } else {
                header("Location: ../frontend/index.html");
            }
        } else {
            echo "Contraseña incorrecta";
        }
    } else {
        echo "Usuario no encontrado";
    }
}
?>